import axios from 'axios';
import { Endpoint, PasswordType, WalletType, DaemonError, typeInfoMap, LogLevel } from './types';
import { Keccak } from 'sha3';
import { polyfill } from 'es6-promise';
polyfill();
//import { Buffer } from 'buffer';
export const Host = "https://localhost.bc-vault.com:1991/";
function getResponsePromised(endpoint, data) {
    return new Promise((res, rej) => {
        const options = {
            baseURL: Host,
            data: JSON.stringify((data === undefined ? {} : data)),
            method: "POST",
            url: endpoint
        };
        axios(options).then((response) => {
            const htpr = { status: response.status, body: response.data };
            if (response.status !== 200)
                return rej(new DaemonError(htpr));
            res(htpr);
        }).catch((e) => {
            rej(e);
        });
    });
}
function assertIsBCHttpResponse(httpr) {
    if (httpr.body.errorCode !== 0x9000)
        throw new DaemonError(httpr.body);
}
function log(msg, level = LogLevel.verbose) {
    if (logLevel <= level) {
        console.log('[' + new Date(Date.now()).toLocaleTimeString() + ']: ' + msg);
    }
}
//** Is BCData object polling already taking place? */
export var isPolling = false;
/** Set Logging verbosity */
export var logLevel = LogLevel.warning;
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
export function startObjectPolling(deviceInterval = 150) {
    if (isPolling)
        throw "Already polling!";
    isPolling = true;
    //pollBCObject(fullInterval);
    pollDevicesChanged(deviceInterval);
}
async function getWallets(deviceID, activeTypes) {
    let ret = [];
    for (const x of activeTypes) {
        const walletsOfXType = await getWalletsOfType(deviceID, x);
        for (const wallet of walletsOfXType) {
            ret.push({ publicKey: wallet, walletType: x });
        }
    }
    return ret;
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
export async function triggerManualUpdate(fullUpdate = true) {
    if (fullUpdate) {
        const devArray = await getDevices();
        let devs = [];
        FireAllListeners(1);
        for (const deviceID of devArray) {
            let activeTypes;
            try {
                activeTypes = await getActiveWalletTypes(deviceID);
            }
            catch (e) {
                if (e.BCHttpResponse !== undefined) {
                    devs.push({
                        id: deviceID,
                        space: { available: 1, complete: 1 },
                        firmware: await getFirmwareVersion(deviceID),
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
                space: await getAvailableSpace(deviceID),
                firmware: await getFirmwareVersion(deviceID),
                supportedTypes: await getSupportedWalletTypes(deviceID),
                activeTypes,
                activeWallets: await getWallets(deviceID, activeTypes),
                locked: false
            });
        }
        BCData = { devices: devs };
        FireAllListeners(0);
    }
    else {
        let devices;
        devices = await getDevices();
        if (!arraysEqual(devices, lastSeenDevices)) {
            lastSeenDevices = devices;
            await triggerManualUpdate(true);
        }
    }
}
//async function pollBCObject(interval:number){ Todo fix this
//await triggerManualUpdate();
//setTimeout(()=>pollBCObject(interval),interval);
//}
async function pollDevicesChanged(interval) {
    try {
        await triggerManualUpdate(false);
    }
    catch (e) {
        FireAllListeners(-1);
        console.error(e);
    }
    setTimeout(() => pollDevicesChanged(interval), interval);
}
function FireAllListeners(...args) {
    for (const listener of listeners) {
        listener.call(null, ...args);
    }
}
/** The current state of the daemon, updated either manually or on device connect/disconnect after calling startObjectPolling  */
export var BCData = { devices: [] };
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
export function AddBCDataChangedListener(func) {
    listeners.push(func);
}
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
export function getWalletTypeInfo(id) {
    return typeInfoMap.find(x => x.type == id);
}
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
export async function getDevices() {
    let httpr;
    httpr = await getResponsePromised(Endpoint.Devices);
    assertIsBCHttpResponse(httpr);
    return httpr.body.data;
}
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
export async function getFirmwareVersion(device) {
    let httpr;
    httpr = await getResponsePromised(Endpoint.FirmwareVersion, { device });
    assertIsBCHttpResponse(httpr);
    return httpr.body.data;
}
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
export async function getWalletBalance(walletType, sourcePublicID) {
    let httpr;
    httpr = await getResponsePromised(Endpoint.GetWalletBalance, { walletType, sourcePublicID });
    assertIsBCHttpResponse(httpr);
    return httpr.body.data;
}
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
export async function getAvailableSpace(device) {
    let httpr;
    httpr = await getResponsePromised(Endpoint.AvailableSpace, { device });
    assertIsBCHttpResponse(httpr);
    return httpr.body.data;
}
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
export async function getSupportedWalletTypes(device) {
    let httpr;
    httpr = await getResponsePromised(Endpoint.WalletTypes, { device });
    assertIsBCHttpResponse(httpr);
    return httpr.body.data;
}
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
export async function getActiveWalletTypes(device) {
    let httpr;
    httpr = await getResponsePromised(Endpoint.SavedWalletTypes, { device });
    assertIsBCHttpResponse(httpr);
    return httpr.body.data;
}
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
export async function getWalletsOfType(device, type) {
    let httpr;
    httpr = await getResponsePromised(Endpoint.WalletsOfType, { device, walletType: type });
    assertIsBCHttpResponse(httpr);
    return httpr.body.data;
}
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
export async function getWalletUserData(device, type, publicAddress) {
    let httpr;
    httpr = await getResponsePromised(Endpoint.WalletUserData, { device, walletType: type, sourcePublicID: publicAddress });
    assertIsBCHttpResponse(httpr);
    return httpr.body.data;
}
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
export async function CopyWalletToType(device, oldType, newType, publicAddress) {
    let httpr;
    const id = await getSecureWindowResponse(PasswordType.WalletPassword);
    httpr = await getResponsePromised(Endpoint.CopyWalletToType, { device, walletType: oldType, newWalletType: newType, sourcePublicID: publicAddress, password: id });
    assertIsBCHttpResponse(httpr);
    return true;
}
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
export async function getIsAddressValid(device, type, publicAddress) {
    let httpr;
    httpr = await getResponsePromised(Endpoint.IsAddressValid, { device, walletType: type, address: publicAddress });
    return httpr.body.errorCode === 0x9000;
}
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
export async function DisplayAddressOnDevice(device, type, publicAddress) {
    let httpr;
    httpr = await getResponsePromised(Endpoint.DisplayAddress, { device, walletType: type, publicID: publicAddress });
    assertIsBCHttpResponse(httpr);
    return true;
}
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
    return new Promise(async (res) => {
        const x = await getResponsePromised(Endpoint.GetAuthID);
        const id = x.body;
        await showAuthPopup(id, passwordType);
        res(id);
    });
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
export async function GenerateWallet(device, type) {
    const id = await getSecureWindowResponse(PasswordType.WalletPassword);
    const httpr = await getResponsePromised(Endpoint.GenerateWallet, { device, walletType: type, password: id });
    assertIsBCHttpResponse(httpr);
    return httpr.body.data;
}
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
export async function EnterGlobalPin(device, passwordType = PasswordType.GlobalPassword) {
    const id = await getSecureWindowResponse(passwordType);
    log("Got pin popup:" + id);
    const httpr = await getResponsePromised(Endpoint.EnterGlobalPin, { device, password: id });
    assertIsBCHttpResponse(httpr);
    triggerManualUpdate();
}
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
export async function GenerateTransaction(device, type, data, broadcast) {
    const id = await getSecureWindowResponse(PasswordType.WalletPassword);
    log("Got auth id:" + id, LogLevel.debug);
    log("Sending object:" + JSON.stringify({ device, walletType: type, transaction: data, password: id }), LogLevel.debug);
    const httpr = await getResponsePromised(Endpoint.GenerateTransaction, { device, walletType: type, transaction: data, password: id, broadcast });
    log(httpr.body, LogLevel.debug);
    assertIsBCHttpResponse(httpr);
    return httpr.body["data"];
}
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
export async function SignData(device, type, publicAddress, data) {
    const id = await getSecureWindowResponse(PasswordType.WalletPassword);
    log("Got auth id:" + id, LogLevel.debug);
    log("Sending object:" + JSON.stringify({ device, walletType: type, sourcePublicID: publicAddress, srcData: data, password: id }), LogLevel.debug);
    const httpr = await getResponsePromised(Endpoint.SignData, { device, walletType: type, sourcePublicID: publicAddress, srcData: data, password: id });
    log("Response body:" + httpr.body, LogLevel.debug);
    assertIsBCHttpResponse(httpr);
    return httpr.body["data"];
}
export async function web3_GetAccounts(cb) {
    try {
        const devices = await getDevices();
        if (devices.length === 0) {
            cb("No BC Vault connected");
            return;
        }
        try {
            const wallets = await getWalletsOfType(devices[0], WalletType.ethereum);
            cb(null, wallets.map((x) => "0x" + x));
        }
        catch (e) {
            if (e.BCHttpResponse !== undefined) {
                //unlock BC Vault!
                await EnterGlobalPin(devices[0], PasswordType.GlobalPassword);
                const wallets = await getWalletsOfType(devices[0], WalletType.ethereum);
                return cb(null, wallets.map((x) => "0x" + x));
            }
        }
    }
    catch (e) {
        cb(e, null);
    }
}
function strip0x(str) {
    if (str.startsWith('0x')) {
        return str.substr(2);
    }
    return str;
}
function toEtherCase(inputString) {
    var kec = new Keccak(256);
    kec.update(inputString.toLowerCase());
    let keccakArray = kec.digest('hex').split('');
    let upperCase = '89abcdef';
    return inputString.toLowerCase().split('').map((x, idx) => {
        if (upperCase.indexOf(keccakArray[idx]) !== -1)
            return x.toUpperCase();
        return x;
    }).join('');
}
export async function web3_signTransaction(txParams, cb) {
    try {
        const devices = await getDevices();
        if (devices.length === 0) {
            cb("No BC Vault connected");
            return;
        }
        txParams.feePrice = txParams.gasPrice;
        txParams.feeCount = txParams.gas;
        txParams.amount = txParams.value;
        txParams.from = toEtherCase(strip0x(txParams.from));
        let txHex = await GenerateTransaction(devices[devices.length - 1], WalletType.ethereum, txParams);
        cb(null, txHex);
    }
    catch (e) {
        cb(e, null);
    }
}
export async function web3_signPersonalMessage(msgParams, cb) {
    try {
        const devices = await getDevices();
        if (devices.length === 0) {
            cb("No BC Vault connected");
            return;
        }
        msgParams.from = toEtherCase(strip0x(msgParams.from));
        let signedMessage = await SignData(devices[devices.length - 1], WalletType.ethereum, msgParams.from, msgParams.data);
        cb(null, signedMessage);
    }
    catch (e) {
        cb(e, null);
    }
}
export function web3_Inject(web3Instance) {
    web3Instance.eth.signTransaction = web3_signTransaction;
    web3Instance.eth.getAccounts = web3_GetAccounts;
    web3Instance.personal.sign = web3_signPersonalMessage;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmNhcGkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGliL2JjYXBpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sS0FBeUMsTUFBTSxPQUFPLENBQUM7QUFDOUQsT0FBTyxFQUFnQixRQUFRLEVBQTBCLFlBQVksRUFBQyxVQUFVLEVBQUMsV0FBVyxFQUE0RSxXQUFXLEVBQThCLFFBQVEsRUFBQyxNQUFNLFNBQVMsQ0FBQTtBQUN6TyxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQzlCLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFBQyxRQUFRLEVBQUUsQ0FBQztBQUNuRCxrQ0FBa0M7QUFDbEMsTUFBTSxDQUFDLE1BQU0sSUFBSSxHQUFRLHNDQUFzQyxDQUFBO0FBQy9ELDZCQUE2QixRQUFpQixFQUFDLElBQVk7SUFDekQsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsRUFBRTtRQUM1QixNQUFNLE9BQU8sR0FBc0I7WUFDakMsT0FBTyxFQUFDLElBQUk7WUFDWixJQUFJLEVBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksS0FBSyxTQUFTLENBQUEsQ0FBQyxDQUFBLEVBQUUsQ0FBQSxDQUFDLENBQUEsSUFBSSxDQUFDLENBQUM7WUFDakQsTUFBTSxFQUFDLE1BQU07WUFDYixHQUFHLEVBQUMsUUFBUTtTQUViLENBQUE7UUFDRCxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxFQUFDLEVBQUU7WUFDOUIsTUFBTSxJQUFJLEdBQUcsRUFBQyxNQUFNLEVBQUMsUUFBUSxDQUFDLE1BQU0sRUFBQyxJQUFJLEVBQUMsUUFBUSxDQUFDLElBQUksRUFBQyxDQUFDO1lBQ3pELElBQUcsUUFBUSxDQUFDLE1BQU0sS0FBSyxHQUFHO2dCQUFFLE9BQU8sR0FBRyxDQUFDLElBQUksV0FBVyxDQUFD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