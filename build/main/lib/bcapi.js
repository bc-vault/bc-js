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
        httpr = yield getResponsePromised(types_1.Endpoint.CopyWalletToType, { device, walletType: oldType, newWalletType: newType, sourcePublicID: publicAddress });
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
function showAuthPopup(id) {
    return new Promise((res) => {
        const isIE = window.ActiveXObject || "ActiveXObject" in window;
        let target;
        if (isIE) {
            window.showModalDialog("https://localhost.bc-vault.com:1991/PasswordInput?channelID=" + id);
            parent.postMessage("OKAY", "*");
            res();
        }
        else {
            target = window.open("https://localhost.bc-vault.com:1991/PasswordInput?channelID=" + id, "_blank", "location=no,menubar=no,resizable=no,scrollbars=no,status=no,toolbar=no,centerscreen=yes,width=750,height:500");
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
function getSecureWindowResponse() {
    return new Promise((res) => __awaiter(this, void 0, void 0, function* () {
        const x = yield getResponsePromised(types_1.Endpoint.GetAuthID);
        const id = x.body;
        yield showAuthPopup(id);
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
        const id = yield getSecureWindowResponse();
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
function EnterGlobalPin(device) {
    return __awaiter(this, void 0, void 0, function* () {
        const id = yield getSecureWindowResponse();
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
  @param device  DeviceID obtained from getDevices
  @param type    WalletType obtained from getActiveWalletTypes or getSupportedWalletTypes
  @param data    Transaction data object
  @throws        Will throw a DaemonError if the status code of the request was rejected by the server for any reason
  @throws        Will throw an AxiosError if the request itself failed or if status code != 200
  @returns       The raw transaction hex prefixed with '0x' if operation was successful, otherwise will throw
 */
function GenerateTransaction(device, type, data) {
    return __awaiter(this, void 0, void 0, function* () {
        const id = yield getSecureWindowResponse();
        console.log("Got auth id:" + id);
        console.log("Sending object:" + JSON.stringify({ device, walletType: type, transaction: data, password: id }));
        const httpr = yield getResponsePromised(types_1.Endpoint.GenerateTransaction, { device, walletType: type, transaction: data, password: id });
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
  @param device  DeviceID obtained from getDevices
  @param type    WalletType obtained from getActiveWalletTypes or getSupportedWalletTypes
  @param publicAddress publicAddress obtained from getWalletsOfType
  @param data    Transaction data as a hex string prefixed with 0x
  @throws        Will throw a DaemonError if the status code of the request was rejected by the server for any reason
  @throws        Will throw an AxiosError if the request itself failed or if status code != 200
  @returns       The raw transaction hex prefixed with '0x' if operation was successful, otherwise will throw
 */
function SignData(device, type, publicAddress, data) {
    return __awaiter(this, void 0, void 0, function* () {
        const id = yield getSecureWindowResponse();
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
            if (devices.length === 0)
                return cb("No BC Vault connected");
            try {
                const wallets = yield getWalletsOfType(devices[0], types_1.WalletType.ethereum);
                cb(null, wallets.map((x) => "0x" + x));
            }
            catch (e) {
                if (e.BCHttpResponse !== undefined) {
                    //unlock BC Vault!
                    yield EnterGlobalPin(devices[0]);
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
function web3_signTransaction(txParams, cb) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const devices = yield getDevices();
            if (devices.length === 0)
                return cb("No BC Vault connected");
            txParams.feePrice = txParams.gasPrice;
            txParams.feeCount = txParams.gas;
            txParams.amount = txParams.value;
            let txHex = yield GenerateTransaction(devices[0], types_1.WalletType.ethereum, txParams);
            cb(null, txHex);
        }
        catch (e) {
            cb(e, null);
        }
    });
}
exports.web3_signTransaction = web3_signTransaction;
function web3_processPersonalMessage(msgParams, cb) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const devices = yield getDevices();
            if (devices.length === 0)
                return cb("No BC Vault connected");
            let signedMessage = yield SignData(devices[0], types_1.WalletType.ethereum, msgParams.from, msgParams.data);
            cb(null, signedMessage);
        }
        catch (e) {
            cb(e, null);
        }
    });
}
exports.web3_processPersonalMessage = web3_processPersonalMessage;
function web3_Inject(web3Instance) {
    web3Instance.eth.signTransaction = web3_signTransaction;
    web3Instance.eth.getAccounts = web3_GetAccounts;
    web3Instance.personal.sign = web3_signTransaction;
}
exports.web3_Inject = web3_Inject;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmNhcGkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGliL2JjYXBpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFBQSxrREFBOEQ7QUFDOUQsbUNBQWtOO0FBRWxOLDZDQUF1QztBQUFDLHNCQUFRLEVBQUUsQ0FBQztBQUN0QyxRQUFBLElBQUksR0FBUSxzQ0FBc0MsQ0FBQTtBQUMvRCw2QkFBNkIsUUFBaUIsRUFBQyxJQUFZO0lBQ3pELE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEVBQUU7UUFDNUIsTUFBTSxPQUFPLEdBQXNCO1lBQ2pDLE9BQU8sRUFBQyxZQUFJO1lBQ1osSUFBSSxFQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLEtBQUssU0FBUyxDQUFBLENBQUMsQ0FBQSxFQUFFLENBQUEsQ0FBQyxDQUFBLElBQUksQ0FBQyxDQUFDO1lBQ2pELE1BQU0sRUFBQyxNQUFNO1lBQ2IsR0FBRyxFQUFDLFFBQVE7U0FFYixDQUFBO1FBQ0QsZUFBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVEsRUFBQyxFQUFFO1lBQzlCLE1BQU0sSUFBSSxHQUFHLEVBQUMsTUFBTSxFQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUMsSUFBSSxFQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUMsQ0FBQztZQUN6RCxJQUFHLFFBQVEsQ0FBQyxNQUFNLEtBQUssR0FBRztnQkFBRSxPQUFPLEdBQUcsQ0FBQyxJQUFJLG1CQUFXLENBQUMsSUFBb0IsQ0FBQyxDQUFDLENBQUM7WUFDOUUsR0FBRyxDQUFDLElBQW9CLENBQUMsQ0FBQztRQUU1QixDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFZLEVBQUMsRUFBRTtZQUN2QixHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDUixDQUFDLENBQUMsQ0FBQztJQUVMLENBQUMsQ0FBQyxDQUFDO0FB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