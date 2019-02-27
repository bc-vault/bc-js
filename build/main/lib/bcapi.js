"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const types_1 = require("./types");
const sha3_1 = require("sha3");
const es6_promise_1 = require("es6-promise");
es6_promise_1.polyfill();
//import { Buffer } from 'buffer';
exports.Host = "https://localhost.bc-vault.com:1991/";
function getResponsePromised(endpoint, data) {
    return new Promise((res, rej) => {
        const options = {
            baseURL: exports.Host,
            data: JSON.stringify((data === undefined ? {} : data)),
            method: "POST",
            url: endpoint
        };
        axios_1.default(options).then((response) => {
            const htpr = { status: response.status, body: response.data };
            if (response.status !== 200)
                return rej(new types_1.DaemonError(htpr));
            res(htpr);
        }).catch((e) => {
            rej(e);
        });
    });
}
function assertIsBCHttpResponse(httpr) {
    if (httpr.body.errorCode !== 0x9000)
        throw new types_1.DaemonError(httpr.body);
}
//** Is BCData object polling already taking place? */
exports.isPolling = false;
/**
  Starts polling daemon for changes and updates BCData object
  ### Example (es3)
  ```js
    var bc = _bcvault;
    bc.startObjectPolling(150);
    //=> bc.BCData will now be updated if the getDevices array changes
  ```

  ### Example (promise browser)
  ```js
    var bc = _bcvault;
    bc.startObjectPolling(150);
    //=> bc.BCData will now be updated if the getDevices array changes
  ```

  ### Example (nodejs)
  ```js
    var bc = require('bc-js');
    bc.startObjectPolling(150);
    //=> bc.BCData will now be updated if the getDevices array changes
  ```
@param deviceInterval how many milliseconds to wait between getDevices pings to daemon
@throws        Will throw "Already polling" if polling is already taking place.
 */
function startObjectPolling(deviceInterval = 150) {
    if (exports.isPolling)
        throw "Already polling!";
    exports.isPolling = true;
    //pollBCObject(fullInterval);
    pollDevicesChanged(deviceInterval);
}
exports.startObjectPolling = startObjectPolling;
function getWallets(deviceID, activeTypes) {
    return __awaiter(this, void 0, void 0, function* () {
        let ret = [];
        for (const x of activeTypes) {
            const walletsOfXType = yield getWalletsOfType(deviceID, x);
            for (const wallet of walletsOfXType) {
                ret.push({ publicKey: wallet, walletType: x });
            }
        }
        return ret;
    });
}
function arraysEqual(a, b) {
    let equal = a.length === b.length;
    for (let i = 0; i < a.length && equal; i++) {
        equal = a[i] === b[i];
    }
    return equal;
}
let lastSeenDevices = [];
/**
  Triggers a manual update to BCData.
  ### Example (es3)
  ```js
  var bc = _bcvault;
  console.log(JSON.stringify(bc.BCData));//Old
  bc.triggerManualUpdate().then(function(){
    console.log(JSON.stringify(bc.BCData));//Updated
  });
  ```

  ### Example (promise browser)
  ```js
    var bc = _bcvault;
    console.log(JSON.stringify(bc.BCData));//Old
    await bc.triggerManualUpdate();
    console.log(JSON.stringify(bc.BCData));//Updated
  ```

  ### Example (nodejs)
  ```js
    var bc = require('bc-js');
    console.log(JSON.stringify(bc.BCData));//Old
    await bc.triggerManualUpdate();
    console.log(JSON.stringify(bc.BCData));//Updated
  ```
@param fullUpdate Force an update or only update data if a new device connects or disconnects.
@throws        Will throw a DaemonError if the status code of the request was rejected by the server for any reason
@throws        Will throw an AxiosError if the request itself failed or if status code != 200
 */
function triggerManualUpdate(fullUpdate = true) {
    return __awaiter(this, void 0, void 0, function* () {
        if (fullUpdate) {
            const devArray = yield getDevices();
            let devs = [];
            FireAllListeners(1);
            for (const deviceID of devArray) {
                let activeTypes;
                try {
                    activeTypes = yield getActiveWalletTypes(deviceID);
                }
                catch (e) {
                    if (e.BCHttpResponse !== undefined) {
                        devs.push({
                            id: deviceID,
                            space: { available: 1, complete: 1 },
                            firmware: yield getFirmwareVersion(deviceID),
                            supportedTypes: [],
                            activeTypes: [],
                            activeWallets: [],
                            locked: true
                        });
                        continue;
                    }
                    throw e;
                }
                devs.push({
                    id: deviceID,
                    space: yield getAvailableSpace(deviceID),
                    firmware: yield getFirmwareVersion(deviceID),
                    supportedTypes: yield getSupportedWalletTypes(deviceID),
                    activeTypes,
                    activeWallets: yield getWallets(deviceID, activeTypes),
                    locked: false
                });
            }
            exports.BCData = { devices: devs };
            FireAllListeners(0);
        }
        else {
            let devices;
            devices = yield getDevices();
            if (!arraysEqual(devices, lastSeenDevices)) {
                lastSeenDevices = devices;
                yield triggerManualUpdate(true);
            }
        }
    });
}
exports.triggerManualUpdate = triggerManualUpdate;
//async function pollBCObject(interval:number){ Todo fix this
//await triggerManualUpdate();
//setTimeout(()=>pollBCObject(interval),interval);
//}
function pollDevicesChanged(interval) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield triggerManualUpdate(false);
        }
        catch (e) {
            FireAllListeners(-1);
            console.error(e);
        }
        setTimeout(() => pollDevicesChanged(interval), interval);
    });
}
function FireAllListeners(...args) {
    for (const listener of listeners) {
        listener.call(null, ...args);
    }
}
/** The current state of the daemon, updated either manually or on device connect/disconnect after calling startObjectPolling  */
exports.BCData = { devices: [] };
let listeners = [];
/**
  Adds a status changed listener for updates to the BCData object
  ### Example (es3)
  ```js
    var bc = _bcvault;
    bc.AddBCDataChangedListener(console.log);
    bc.triggerManualUpdate();
    // => 1
    // => 0
  ```

  ### Example (promise browser)
  ```js
    var bc = _bcvault;
    bc.AddBCDataChangedListener(console.log);
    bc.triggerManualUpdate();
    // => 1
    // => 0
  ```

  ### Example (nodejs)
  ```js
    var bc = require('bc-js');
    bc.AddBCDataChangedListener(console.log);
    bc.triggerManualUpdate();
    // => 1
    // => 0
  ```
 */
function AddBCDataChangedListener(func) {
    listeners.push(func);
}
exports.AddBCDataChangedListener = AddBCDataChangedListener;
/**
  Returns WalletTypeInfo(name, ticker, etc...) for a specified WalletType if it exists
  ### Example (es3)
  ```js
    var bc = _bcvault;
    console.log(JSON.stringify(bc.getWalletTypeInfo(1)));
    // => {"type":1,"name":"Bitcoin Cash","ticker":"BCH"}
  ```

  ### Example (promise browser)
  ```js
    var bc = _bcvault;
    console.log(JSON.stringify(bc.getWalletTypeInfo(1)));
    // => {"type":1,"name":"Bitcoin Cash","ticker":"BCH"}
  ```

  ### Example (nodejs)
  ```js
    var bc = require('bc-js');
    console.log(JSON.stringify(bc.getWalletTypeInfo(1)));
    // => {"type":1,"name":"Bitcoin Cash","ticker":"BCH"}
  ```
 */
function getWalletTypeInfo(id) {
    return types_1.typeInfoMap.find(x => x.type == id);
}
exports.getWalletTypeInfo = getWalletTypeInfo;
/**
  Gets the currently connected devices.
  ### Example (es3)
  ```js
  var bc = _bcvault;
  bc.getDevices().then(console.log)
  // => [1,2]
  ```

  ### Example (promise browser)
  ```js
  var bc = _bcvault;
  console.log(await bc.getDevices())
  // => [1,2]
  ```

  ### Example (nodejs)
  ```js
  var bc = require('bc-js');
  console.log(await bc.getDevices())
  // => [1,2]
```
@throws        Will throw a DaemonError if the status code of the request was rejected by the server for any reason
@throws        Will throw an AxiosError if the request itself failed or if status code != 200
@returns       An array of Device IDs of currently connected devices
 */
function getDevices() {
    return __awaiter(this, void 0, void 0, function* () {
        let httpr;
        httpr = yield getResponsePromised(types_1.Endpoint.Devices);
        assertIsBCHttpResponse(httpr);
        return httpr.body.data;
    });
}
exports.getDevices = getDevices;
/**
  Gets the firmware version of a specific device.
  ### Example (es3)
  ```js
  var bc = _bcvault;
  bc.getFirmwareVersion(1).then(console.log)
  // => {"major":1,"minor":0,"revision":1,"date":{"day":17,"month":10,"year":2017},"apiVersion":{"major":1,"minor":0}}
  ```

  ### Example (promise browser)
  ```js
  var bc = _bcvault;
  console.log(await bc.getFirmwareVersion(1))
  // => {"major":1,"minor":0,"revision":1,"date":{"day":17,"month":10,"year":2017},"apiVersion":{"major":1,"minor":0}}
  ```

  ### Example (nodejs)
  ```js
  var bc = require('bc-js');
  console.log(await bc.getFirmwareVersion(1))
  // => {"major":1,"minor":0,"revision":1,"date":{"day":17,"month":10,"year":2017},"apiVersion":{"major":1,"minor":0}}
  ```
  @param device  DeviceID obtained from getDevices
  @throws        Will throw a DaemonError if the status code of the request was rejected by the server for any reason
  @throws        Will throw an AxiosError if the request itself failed or if status code != 200
  @returns       An object containing requested data
 */
function getFirmwareVersion(device) {
    return __awaiter(this, void 0, void 0, function* () {
        let httpr;
        httpr = yield getResponsePromised(types_1.Endpoint.FirmwareVersion, { device });
        assertIsBCHttpResponse(httpr);
        return httpr.body.data;
    });
}
exports.getFirmwareVersion = getFirmwareVersion;
/**
  Gets the balance in currency-specific minimum units for the specified wallet from a web-service.
  ### Example (es3)
  ```js
  var bc = _bcvault;
  bc.getWalletBalance(0,"1PekCrsopzENYBa82YpmmBtJcsNgu4PqEV").then(console.log)
  // => {"errorCode": 36864,"data": "0"}
  ```

  ### Example (promise browser)
  ```js
  var bc = _bcvault;
  console.log(await bc.getWalletBalance(0,"1PekCrsopzENYBa82YpmmBtJcsNgu4PqEV"))
  // => {"errorCode": 36864,"data": "0"}
  ```

  ### Example (nodejs)
  ```js
  var bc = require('bc-js');
  console.log(await bc.getWalletBalance(0,"1PekCrsopzENYBa82YpmmBtJcsNgu4PqEV"))
  // => {"errorCode": 36864,"data": "0"}
  ```
  @param device  DeviceID obtained from getDevices
  @throws        Will throw a DaemonError if the status code of the request was rejected by the server for any reason
  @throws        Will throw an AxiosError if the request itself failed or if status code != 200
  @returns       An object containing requested data
 */
function getWalletBalance(walletType, sourcePublicID) {
    return __awaiter(this, void 0, void 0, function* () {
        let httpr;
        httpr = yield getResponsePromised(types_1.Endpoint.GetWalletBalance, { walletType, sourcePublicID });
        assertIsBCHttpResponse(httpr);
        return httpr.body.data;
    });
}
exports.getWalletBalance = getWalletBalance;
/**
  Gets the available space on a specific device
  ### Example (es3)
  ```js
  var bc = _bcvault;
  bc.getAvailableSpace(1).then(console.log)
  // => {"available":4294967295,"complete":4294967295}
  ```

  ### Example (promise browser)
  ```js
  var bc = _bcvault;
  console.log(await bc.getAvailableSpace(1))
  // => {"available":4294967295,"complete":4294967295}
  ```

  ### Example (nodejs)
  ```js
  var bc = require('bc-js');
  console.log(await bc.getAvailableSpace(1))
  // => {"available":4294967295,"complete":4294967295}
  ```
  @param device  DeviceID obtained from getDevices
  @throws        Will throw a DaemonError if the status code of the request was rejected by the server for any reason
  @throws        Will throw an AxiosError if the request itself failed or if status code != 200
  @returns       An object containing requested data, all numbers are in BYTES
 */
function getAvailableSpace(device) {
    return __awaiter(this, void 0, void 0, function* () {
        let httpr;
        httpr = yield getResponsePromised(types_1.Endpoint.AvailableSpace, { device });
        assertIsBCHttpResponse(httpr);
        return httpr.body.data;
    });
}
exports.getAvailableSpace = getAvailableSpace;
/**
  Gets the supported WalletTypes on a specific device
  ### Example (es3)
  ```js
  var bc = _bcvault;
  bc.getSupportedWalletTypes(1).then(console.log)
  // => [0,1,16777216,2,3,4,50331648,1073741824,1090519040,1073741826,1073741827,1073741828,1124073472]
  ```

  ### Example (promise browser)
  ```js
  var bc = _bcvault;
  console.log(await bc.getSupportedWalletTypes(1))
  // => [0,1,16777216,2,3,4,50331648,1073741824,1090519040,1073741826,1073741827,1073741828,1124073472]
  ```

  ### Example (nodejs)
  ```js
  var bc = require('bc-js');
  console.log(await bc.getSupportedWalletTypes(1))
  // => [0,1,16777216,2,3,4,50331648,1073741824,1090519040,1073741826,1073741827,1073741828,1124073472]
  ```
  @param device  DeviceID obtained from getDevices
  @throws        Will throw a DaemonError if the status code of the request was rejected by the server for any reason
  @throws        Will throw an AxiosError if the request itself failed or if status code != 200
  @returns       An array containing requested data
 */
function getSupportedWalletTypes(device) {
    return __awaiter(this, void 0, void 0, function* () {
        let httpr;
        httpr = yield getResponsePromised(types_1.Endpoint.WalletTypes, { device });
        assertIsBCHttpResponse(httpr);
        return httpr.body.data;
    });
}
exports.getSupportedWalletTypes = getSupportedWalletTypes;
/**
  Gets a list of WalletTypes that are actually used on a specific device(have at least one wallet)
  ### Example (es3)
  ```js
  var bc = _bcvault;
  bc.getActiveWalletTypes(1).then(console.log)
  // => [1,16777216]
  ```

  ### Example (promise browser)
  ```js
  var bc = _bcvault;
  console.log(await bc.getActiveWalletTypes(1))
  // => [1,16777216]
  ```

  ### Example (nodejs)
  ```js
  var bc = require('bc-js');
  console.log(await bc.getActiveWalletTypes(1))
  // => [1,16777216]
  ```
  @param device  DeviceID obtained from getDevices
  @throws        Will throw a DaemonError if the status code of the request was rejected by the server for any reason
  @throws        Will throw an AxiosError if the request itself failed or if status code != 200
  @returns       An array containing requested data
 */
function getActiveWalletTypes(device) {
    return __awaiter(this, void 0, void 0, function* () {
        let httpr;
        httpr = yield getResponsePromised(types_1.Endpoint.SavedWalletTypes, { device });
        assertIsBCHttpResponse(httpr);
        return httpr.body.data;
    });
}
exports.getActiveWalletTypes = getActiveWalletTypes;
/**
  Gets a array(string) of public keys of a specific WalletTypes on a device
  ### Example (es3)
  ```js
  var bc = _bcvault;
  bc.getWalletsOfType(1,1).then(console.log)
  // => ["1271DpdZ7iM6sXRasvjAQ6Hg2zw8bS3ADc"]
  ```

  ### Example (promise browser)
  ```js
  var bc = _bcvault;
  console.log(await bc.getWalletsOfType(1,1))
  // => ["1271DpdZ7iM6sXRasvjAQ6Hg2zw8bS3ADc"]
  ```

  ### Example (nodejs)
  ```js
  var bc = require('bc-js');
  console.log(await bc.getWalletsOfType(1,1))
  // => ["1271DpdZ7iM6sXRasvjAQ6Hg2zw8bS3ADc"]
  ```
  @param device  DeviceID obtained from getDevices
  @param type    WalletType obtained from getActiveWalletTypes or getSupportedWalletTypes
  @throws        Will throw a DaemonError if the status code of the request was rejected by the server for any reason
  @throws        Will throw an AxiosError if the request itself failed or if status code != 200
  @returns       An array containing requested data
 */
function getWalletsOfType(device, type) {
    return __awaiter(this, void 0, void 0, function* () {
        let httpr;
        httpr = yield getResponsePromised(types_1.Endpoint.WalletsOfType, { device, walletType: type });
        assertIsBCHttpResponse(httpr);
        return httpr.body.data;
    });
}
exports.getWalletsOfType = getWalletsOfType;
/**
  Gets the user data associated with a publicAddress on this device
  ### Example (es3)
  ```js
  var bc = _bcvault;
  bc.getWalletUserData(1,1,"1271DpdZ7iM6sXRasvjAQ6Hg2zw8bS3ADc").then(console.log)
  // => "This is my mining wallet!"
  ```

  ### Example (promise browser)
  ```js
  var bc = _bcvault;
  console.log(await bc.getWalletUserData(1,1,"1271DpdZ7iM6sXRasvjAQ6Hg2zw8bS3ADc"))
  // => "This is my mining wallet!"
  ```

  ### Example (nodejs)
  ```js
  var bc = require('bc-js');
  console.log(await bc.getWalletUserData(1,1,"1271DpdZ7iM6sXRasvjAQ6Hg2zw8bS3ADc"))
  // => "This is my mining wallet!"
  ```
  @param device  DeviceID obtained from getDevices
  @param type    WalletType obtained from getActiveWalletTypes or getSupportedWalletTypes
  @param publicAddress publicAddress obtained from getWalletsOfType
  @throws        Will throw a DaemonError if the status code of the request was rejected by the server for any reason
  @throws        Will throw an AxiosError if the request itself failed or if status code != 200
  @returns       The UserData
 */
function getWalletUserData(device, type, publicAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        let httpr;
        httpr = yield getResponsePromised(types_1.Endpoint.WalletUserData, { device, walletType: type, sourcePublicID: publicAddress });
        assertIsBCHttpResponse(httpr);
        return httpr.body.data;
    });
}
exports.getWalletUserData = getWalletUserData;
/**
  Copies a wallet private key to another walletType (in case of a fork etc.)
  ### Example (es3)
  ```js
  var bc = _bcvault;
  bc.CopyWalletToType(1,1,0,"1271DpdZ7iM6sXRasvjAQ6Hg2zw8bS3ADc").then(console.log)
  // => "true"
  ```

  ### Example (promise browser)
  ```js
  var bc = _bcvault;
  await bc.CopyWalletToType(1,1,0,"1271DpdZ7iM6sXRasvjAQ6Hg2zw8bS3ADc")
  // => true
  ```

  ### Example (nodejs)
  ```js
  var bc = require('bc-js');
  await bc.CopyWalletToType(1,1,0,"1271DpdZ7iM6sXRasvjAQ6Hg2zw8bS3ADc")
  // => true
  ```
  @param device  DeviceID obtained from getDevices
  @param type    WalletType obtained from getActiveWalletTypes or getSupportedWalletTypes
  @param newType WalletType obtained from getActiveWalletTypes or getSupportedWalletTypes
  @param publicAddress publicAddress obtained from getWalletsOfType
  @throws        Will throw a DaemonError if the status code of the request was rejected by the server for any reason
  @throws        Will throw an AxiosError if the request itself failed or if status code != 200
  @returns       true if operation was successful, otherwise will throw
 */
function CopyWalletToType(device, oldType, newType, publicAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        let httpr;
        const id = yield getSecureWindowResponse(types_1.PasswordType.WalletPassword);
        httpr = yield getResponsePromised(types_1.Endpoint.CopyWalletToType, { device, walletType: oldType, newWalletType: newType, sourcePublicID: publicAddress, password: id });
        assertIsBCHttpResponse(httpr);
        return true;
    });
}
exports.CopyWalletToType = CopyWalletToType;
/**
  Check if address is valid for a specific WalletType
  ### Example (es3)
  ```js
  var bc = _bcvault;
  bc.getIsAddressValid(1,1,"1271DpdZ7iM6sXRasvjAQ6Hg2zw8bS3ADc").then(console.log)
  // => "true"
  ```

  ### Example (promise browser)
  ```js
  var bc = _bcvault;
  await bc.getIsAddressValid(1,1,"1271DpdZ7iM6sXRasvjAQ6Hg2zw8bS3ADc")
  // => true
  ```

  ### Example (nodejs)
  ```js
  var bc = require('bc-js');
  await bc.getIsAddressValid(1,1,"1271DpdZ7iM6sXRasvjAQ6Hg2zw8bS3ADc")
  // => true
  ```
  @param device  DeviceID obtained from getDevices
  @param type    WalletType obtained from getActiveWalletTypes or getSupportedWalletTypes
  @param publicAddress publicAddress obtained from getWalletsOfType
  @throws        Will throw a DaemonError if the status code of the request was rejected by the server for any reason
  @throws        Will throw an AxiosError if the request itself failed or if status code != 200
  @returns       true if address is valid
 */
function getIsAddressValid(device, type, publicAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        let httpr;
        httpr = yield getResponsePromised(types_1.Endpoint.IsAddressValid, { device, walletType: type, address: publicAddress });
        return httpr.body.errorCode === 0x9000;
    });
}
exports.getIsAddressValid = getIsAddressValid;
/**
  Displays address on device for verification
  ### Example (es3)
  ```js
  var bc = _bcvault;
  bc.DisplayAddressOnDevice(1,1,"1271DpdZ7iM6sXRasvjAQ6Hg2zw8bS3ADc").then(console.log)
  // => "true"
  ```

  ### Example (promise browser)
  ```js
  var bc = _bcvault;
  await bc.DisplayAddressOnDevice(1,1,"1271DpdZ7iM6sXRasvjAQ6Hg2zw8bS3ADc")
  // => true
  ```

  ### Example (nodejs)
  ```js
  var bc = require('bc-js');
  await bc.DisplayAddressOnDevice(1,1,"1271DpdZ7iM6sXRasvjAQ6Hg2zw8bS3ADc")
  // => true
  ```
  @param device  DeviceID obtained from getDevices
  @param type    WalletType obtained from getActiveWalletTypes or getSupportedWalletTypes
  @param publicAddress publicAddress obtained from getWalletsOfType
  @throws        Will throw a DaemonError if the status code of the request was rejected by the server for any reason
  @throws        Will throw an AxiosError if the request itself failed or if status code != 200
  @returns       true if display was successful, otherwise will throw
 */
function DisplayAddressOnDevice(device, type, publicAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        let httpr;
        httpr = yield getResponsePromised(types_1.Endpoint.DisplayAddress, { device, walletType: type, publicID: publicAddress });
        assertIsBCHttpResponse(httpr);
        return true;
    });
}
exports.DisplayAddressOnDevice = DisplayAddressOnDevice;
function showAuthPopup(id, passwordType) {
    return new Promise((res) => {
        const isIE = window.ActiveXObject || "ActiveXObject" in window;
        let target;
        if (isIE) {
            window.showModalDialog("https://localhost.bc-vault.com:1991/PasswordInput?channelID=" + id + "&channelPasswordType=" + passwordType);
            parent.postMessage("OKAY", "*");
            res();
        }
        else {
            target = window.open("https://localhost.bc-vault.com:1991/PasswordInput?channelID=" + id + "&channelPasswordType=" + passwordType, "_blank", "location=no,menubar=no,resizable=no,scrollbars=no,status=no,toolbar=no,centerscreen=yes,width=750,height:500");
            if (target === null)
                throw TypeError("Could not create popup!");
            const timer = setInterval(() => {
                if (target.closed) {
                    clearInterval(timer);
                    res();
                }
            }, 500);
        }
    });
}
function getSecureWindowResponse(passwordType) {
    return new Promise((res) => __awaiter(this, void 0, void 0, function* () {
        const x = yield getResponsePromised(types_1.Endpoint.GetAuthID);
        const id = x.body;
        yield showAuthPopup(id, passwordType);
        res(id);
    }));
}
/**
  Generates a new wallet on the device
  ### Example (es3)
  ```js
  var bc = _bcvault;
  bc.GenerateWallet(1,1).then(console.log)
  // => "true"
  ```

  ### Example (promise browser)
  ```js
  var bc = _bcvault;
  await bc.GenerateWallet(1,1)
  // => true
  ```

  ### Example (nodejs)
  ```js
  var bc = require('bc-js');
  await bc.GenerateWallet(1,1)
  // => true
  ```
  @param device  DeviceID obtained from getDevices
  @param type    WalletType obtained from getActiveWalletTypes or getSupportedWalletTypes
  @throws        Will throw a DaemonError if the status code of the request was rejected by the server for any reason
  @throws        Will throw an AxiosError if the request itself failed or if status code != 200
  @returns       the public key of the new wallet
 */
function GenerateWallet(device, type) {
    return __awaiter(this, void 0, void 0, function* () {
        const id = yield getSecureWindowResponse(types_1.PasswordType.WalletPassword);
        const httpr = yield getResponsePromised(types_1.Endpoint.GenerateWallet, { device, walletType: type, password: id });
        assertIsBCHttpResponse(httpr);
        return httpr.body.data;
    });
}
exports.GenerateWallet = GenerateWallet;
/**
  Prompt the user to unlock the device
  ### Example (es3)
  ```js
  var bc = _bcvault;
  bc.EnterGlobalPin(1).then(console.log)
  ```

  ### Example (promise browser)
  ```js
  var bc = _bcvault;
  await bc.EnterGlobalPin(1)
  ```

  ### Example (nodejs)
  ```js
  var bc = require('bc-js');
  await bc.EnterGlobalPin(1)
  ```
  @param device  DeviceID obtained from getDevices
  @throws        Will throw a DaemonError if the status code of the request was rejected by the server for any reason
  @throws        Will throw an AxiosError if the request itself failed or if status code != 200
 */
function EnterGlobalPin(device, passwordType = types_1.PasswordType.GlobalPassword) {
    return __awaiter(this, void 0, void 0, function* () {
        const id = yield getSecureWindowResponse(passwordType);
        console.log("Got pin popup:" + id);
        const httpr = yield getResponsePromised(types_1.Endpoint.EnterGlobalPin, { device, password: id });
        assertIsBCHttpResponse(httpr);
        triggerManualUpdate();
    });
}
exports.EnterGlobalPin = EnterGlobalPin;
/**
  Generates a new transaction on the device
  ### Example (es3)
  ```js
  var bc = _bcvault;
  var trxOptions = {from:"1271DpdZ7iM6sXRasvjAQ6Hg2zw8bS3ADc",to:"1271DpdZ7iM6sXRasvjAQ6Hg2zw8bS3ADc",feeCount:0,feePrice:"50000",amount:"500000000"};
  bc.GenerateTransaction(1,1,trxOptions).then(console.log)
  // generates a transaction of type bitCoinCash which uses 0.00050000 BCH as fee and sends 5 BCH back to the same address
  ```

  ### Example (promise browser)
  ```js
  var bc = _bcvault;
  var trxOptions = {from:"1271DpdZ7iM6sXRasvjAQ6Hg2zw8bS3ADc",to:"1271DpdZ7iM6sXRasvjAQ6Hg2zw8bS3ADc",feeCount:0,feePrice:"50000",amount:"500000000"};
  await bc.GenerateTransaction(1,1,trxOptions)
  // generates a transaction of type bitCoinCash which uses 0.00050000 BCH as fee and sends 5 BCH back to the same address
  ```

  ### Example (nodejs)
  ```js
  var bc = require('bc-js');
  var trxOptions = {from:"1271DpdZ7iM6sXRasvjAQ6Hg2zw8bS3ADc",to:"1271DpdZ7iM6sXRasvjAQ6Hg2zw8bS3ADc",feeCount:0,feePrice:"50000",amount:"500000000"};
  await bc.GenerateTransaction(1,1,trxOptions)
  // generates a transaction of type bitCoinCash which uses 0.00050000 BCH as fee and sends 5 BCH back to the same address
  ```
  @param device    DeviceID obtained from getDevices
  @param type      WalletType obtained from getActiveWalletTypes or getSupportedWalletTypes
  @param data      Transaction data object
  @param broadcast Whether to broadcast the transaction to the blockchain automatically
  @throws          Will throw a DaemonError if the status code of the request was rejected by the server for any reason
  @throws          Will throw an AxiosError if the request itself failed or if status code != 200
  @returns         The raw transaction hex prefixed with '0x' if operation was successful, otherwise will throw
 */
function GenerateTransaction(device, type, data, broadcast) {
    return __awaiter(this, void 0, void 0, function* () {
        const id = yield getSecureWindowResponse(types_1.PasswordType.WalletPassword);
        console.log("Got auth id:" + id);
        console.log("Sending object:" + JSON.stringify({ device, walletType: type, transaction: data, password: id }));
        const httpr = yield getResponsePromised(types_1.Endpoint.GenerateTransaction, { device, walletType: type, transaction: data, password: id, broadcast });
        console.log(httpr.body);
        assertIsBCHttpResponse(httpr);
        return httpr.body["data"];
    });
}
exports.GenerateTransaction = GenerateTransaction;
/**
  Signs data on the device
  ### Example (es3)
  ```js
  var bc = _bcvault;
  bc.SignData(1,bc.WalletType.ethereum,"0x9283099a29556fcf8fff5b2cea2d4f67cb7a7a8b","0x4920616d20627574206120737461636b2065786368616e676520706f7374").then(console.log)
  // => "0x..."
  ```

  ### Example (promise browser)
  ```js
  var bc = _bcvault;
  await bc.SignData(1,bc.WalletType.ethereum,"0x9283099a29556fcf8fff5b2cea2d4f67cb7a7a8b","0x4920616d20627574206120737461636b2065786368616e676520706f7374")
  // => "0x..."
  ```

  ### Example (nodejs)
  ```js
  var bc = require('bc-js');
  await bc.SignData(1,bc.WalletType.ethereum,"0x9283099a29556fcf8fff5b2cea2d4f67cb7a7a8b","0x4920616d20627574206120737461636b2065786368616e676520706f7374")
  // => "0x..."
  ```
  @param device  DeviceID obtained from getDevices
  @param type    WalletType obtained from getActiveWalletTypes or getSupportedWalletTypes
  @param publicAddress publicAddress obtained from getWalletsOfType
  @param data    Message data as a hex string prefixed with 0x
  @throws        Will throw a DaemonError if the status code of the request was rejected by the server for any reason
  @throws        Will throw an AxiosError if the request itself failed or if status code != 200
  @returns       The raw signed message hex prefixed with '0x' if operation was successful, otherwise will throw
 */
function SignData(device, type, publicAddress, data) {
    return __awaiter(this, void 0, void 0, function* () {
        const id = yield getSecureWindowResponse(types_1.PasswordType.WalletPassword);
        console.log("Got auth id:" + id);
        console.log("Sending object:" + JSON.stringify({ device, walletType: type, sourcePublicID: publicAddress, srcData: data, password: id }));
        const httpr = yield getResponsePromised(types_1.Endpoint.SignData, { device, walletType: type, sourcePublicID: publicAddress, srcData: data, password: id });
        console.log(httpr.body);
        assertIsBCHttpResponse(httpr);
        return httpr.body["data"];
    });
}
exports.SignData = SignData;
function web3_GetAccounts(cb) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const devices = yield getDevices();
            if (devices.length === 0) {
                cb("No BC Vault connected");
                return;
            }
            try {
                const wallets = yield getWalletsOfType(devices[0], types_1.WalletType.ethereum);
                cb(null, wallets.map((x) => "0x" + x));
            }
            catch (e) {
                if (e.BCHttpResponse !== undefined) {
                    //unlock BC Vault!
                    yield EnterGlobalPin(devices[0], types_1.PasswordType.GlobalPassword);
                    const wallets = yield getWalletsOfType(devices[0], types_1.WalletType.ethereum);
                    return cb(null, wallets.map((x) => "0x" + x));
                }
            }
        }
        catch (e) {
            cb(e, null);
        }
    });
}
exports.web3_GetAccounts = web3_GetAccounts;
function strip0x(str) {
    if (str.startsWith('0x')) {
        return str.substr(2);
    }
    return str;
}
function toEtherCase(inputString) {
    var kec = new sha3_1.Keccak(256);
    kec.update(inputString.toLowerCase());
    let keccakArray = kec.digest('hex').split('');
    let upperCase = '89abcdef';
    return inputString.toLowerCase().split('').map((x, idx) => {
        if (upperCase.indexOf(keccakArray[idx]) !== -1)
            return x.toUpperCase();
        return x;
    }).join('');
}
function web3_signTransaction(txParams, cb) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const devices = yield getDevices();
            if (devices.length === 0) {
                cb("No BC Vault connected");
                return;
            }
            txParams.feePrice = txParams.gasPrice;
            txParams.feeCount = txParams.gas;
            txParams.amount = txParams.value;
            txParams.from = toEtherCase(strip0x(txParams.from));
            let txHex = yield GenerateTransaction(devices[devices.length - 1], types_1.WalletType.ethereum, txParams);
            cb(null, txHex);
        }
        catch (e) {
            cb(e, null);
        }
    });
}
exports.web3_signTransaction = web3_signTransaction;
function web3_signPersonalMessage(msgParams, cb) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const devices = yield getDevices();
            if (devices.length === 0) {
                cb("No BC Vault connected");
                return;
            }
            msgParams.from = toEtherCase(strip0x(msgParams.from));
            let signedMessage = yield SignData(devices[devices.length - 1], types_1.WalletType.ethereum, msgParams.from, msgParams.data);
            cb(null, signedMessage);
        }
        catch (e) {
            cb(e, null);
        }
    });
}
exports.web3_signPersonalMessage = web3_signPersonalMessage;
function web3_Inject(web3Instance) {
    web3Instance.eth.signTransaction = web3_signTransaction;
    web3Instance.eth.getAccounts = web3_GetAccounts;
    web3Instance.personal.sign = web3_signPersonalMessage;
}
exports.web3_Inject = web3_Inject;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmNhcGkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGliL2JjYXBpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFBQSxrREFBOEQ7QUFDOUQsbUNBQStOO0FBQy9OLCtCQUE4QjtBQUM5Qiw2Q0FBdUM7QUFBQyxzQkFBUSxFQUFFLENBQUM7QUFDbkQsa0NBQWtDO0FBQ3JCLFFBQUEsSUFBSSxHQUFRLHNDQUFzQyxDQUFBO0FBQy9ELDZCQUE2QixRQUFpQixFQUFDLElBQVk7SUFDekQsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsRUFBRTtRQUM1QixNQUFNLE9BQU8sR0FBc0I7WUFDakMsT0FBTyxFQUFDLFlBQUk7WUFDWixJQUFJLEVBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksS0FBSyxTQUFTLENBQUEsQ0FBQyxDQUFBLEVBQUUsQ0FBQSxDQUFDLENBQUEsSUFBSSxDQUFDLENBQUM7WUFDakQsTUFBTSxFQUFDLE1BQU07WUFDYixHQUFHLEVBQUMsUUFBUTtTQUViLENBQUE7UUFDRCxlQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxFQUFDLEVBQUU7WUFDOUIsTUFBTSxJQUFJLEdBQUcsRUFBQyxNQUFNLEVBQUMsUUFBUSxDQUFDLE1BQU0sRUFBQyxJQUFJLEVBQUMsUUFBUSxDQUFDLElBQUksRUFBQyxDQUFDO1lBQ3pELElBQUcsUUFBUSxDQUFDLE1BQU0sS0FBSyxHQUFHO2dCQUFFLE9BQU8sR0FBRyxDQUFDLElBQUksbUJBQVcsQ0FBQyxJQUFvQixDQUFDLENBQUMsQ0FBQztZQUM5RSxHQUFHLENBQUMsSUFBb0IsQ0FBQyxDQUFDO1FBRTVCLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQVksRUFBQyxFQUFFO1lBQ3ZCLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNSLENBQUMsQ0FBQyxD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