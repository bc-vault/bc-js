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
            let txHex = yield GenerateTransaction(devices[1], types_1.WalletType.ethereum, txParams);
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
            let signedMessage = yield SignData(devices[1], types_1.WalletType.ethereum, msgParams.from, msgParams.data);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmNhcGkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGliL2JjYXBpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFBQSxrREFBOEQ7QUFDOUQsbUNBQStOO0FBQy9OLCtCQUE4QjtBQUM5Qiw2Q0FBdUM7QUFBQyxzQkFBUSxFQUFFLENBQUM7QUFDdEMsUUFBQSxJQUFJLEdBQVEsc0NBQXNDLENBQUE7QUFDL0QsNkJBQTZCLFFBQWlCLEVBQUMsSUFBWTtJQUN6RCxPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxFQUFFO1FBQzVCLE1BQU0sT0FBTyxHQUFzQjtZQUNqQyxPQUFPLEVBQUMsWUFBSTtZQUNaLElBQUksRUFBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxLQUFLLFNBQVMsQ0FBQSxDQUFDLENBQUEsRUFBRSxDQUFBLENBQUMsQ0FBQSxJQUFJLENBQUMsQ0FBQztZQUNqRCxNQUFNLEVBQUMsTUFBTTtZQUNiLEdBQUcsRUFBQyxRQUFRO1NBRWIsQ0FBQTtRQUNELGVBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxRQUFRLEVBQUMsRUFBRTtZQUM5QixNQUFNLElBQUksR0FBRyxFQUFDLE1BQU0sRUFBQyxRQUFRLENBQUMsTUFBTSxFQUFDLElBQUksRUFBQyxRQUFRLENBQUMsSUFBSSxFQUFDLENBQUM7WUFDekQsSUFBRyxRQUFRLENBQUMsTUFBTSxLQUFLLEdBQUc7Z0JBQUUsT0FBTyxHQUFHLENBQUMsSUFBSSxtQkFBVyxDQUFDLElBQW9CLENBQUMsQ0FBQyxDQUFDO1lBQzlFLEdBQUcsQ0FBQyxJQUFvQixDQUFDLENBQUM7UUFFNUIsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBWSxFQUFDLEVBQUU7WUFDdkIsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ1IsQ0FBQyxDQUFDLENBQUM7SUFFTCxDQUFD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