import axios from 'axios';
import { Endpoint, WalletType, DaemonError, typeInfoMap } from './types';
import { polyfill } from 'es6-promise';
polyfill();
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
//** Is BCData object polling already taking place? */
export var isPolling = false;
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
    httpr = await getResponsePromised(Endpoint.CopyWalletToType, { device, walletType: oldType, newWalletType: newType, sourcePublicID: publicAddress });
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
    return new Promise(async (res) => {
        const x = await getResponsePromised(Endpoint.GetAuthID);
        const id = x.body;
        await showAuthPopup(id);
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
    const id = await getSecureWindowResponse();
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
export async function EnterGlobalPin(device) {
    const id = await getSecureWindowResponse();
    console.log("Got pin popup:" + id);
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
  @param device  DeviceID obtained from getDevices
  @param type    WalletType obtained from getActiveWalletTypes or getSupportedWalletTypes
  @param data    Transaction data object
  @throws        Will throw a DaemonError if the status code of the request was rejected by the server for any reason
  @throws        Will throw an AxiosError if the request itself failed or if status code != 200
  @returns       The raw transaction hex prefixed with '0x' if operation was successful, otherwise will throw
 */
export async function GenerateTransaction(device, type, data) {
    const id = await getSecureWindowResponse();
    console.log("Got auth id:" + id);
    console.log("Sending object:" + JSON.stringify({ device, walletType: type, transaction: data, password: id }));
    const httpr = await getResponsePromised(Endpoint.GenerateTransaction, { device, walletType: type, transaction: data, password: id });
    console.log(httpr.body);
    assertIsBCHttpResponse(httpr);
    return httpr.body["data"];
}
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
export async function SignData(device, type, publicAddress, data) {
    const id = await getSecureWindowResponse();
    console.log("Got auth id:" + id);
    console.log("Sending object:" + JSON.stringify({ device, walletType: type, sourcePublicID: publicAddress, srcData: data, password: id }));
    const httpr = await getResponsePromised(Endpoint.SignData, { device, walletType: type, sourcePublicID: publicAddress, srcData: data, password: id });
    console.log(httpr.body);
    assertIsBCHttpResponse(httpr);
    return httpr.body["data"];
}
export async function web3_GetAccounts(cb) {
    try {
        const devices = await getDevices();
        if (devices.length === 0)
            return cb("No BC Vault connected");
        try {
            const wallets = await getWalletsOfType(devices[0], WalletType.ethereum);
            cb(null, wallets.map((x) => "0x" + x));
        }
        catch (e) {
            if (e.BCHttpResponse !== undefined) {
                //unlock BC Vault!
                await EnterGlobalPin(devices[0]);
                const wallets = await getWalletsOfType(devices[0], WalletType.ethereum);
                return cb(null, wallets.map((x) => "0x" + x));
            }
        }
    }
    catch (e) {
        cb(e, null);
    }
}
export async function web3_signTransaction(txParams, cb) {
    try {
        const devices = await getDevices();
        if (devices.length === 0)
            return cb("No BC Vault connected");
        txParams.feePrice = txParams.gasPrice;
        txParams.feeCount = txParams.gas;
        txParams.amount = txParams.value;
        let txHex = await GenerateTransaction(devices[0], WalletType.ethereum, txParams);
        cb(null, txHex);
    }
    catch (e) {
        cb(e, null);
    }
}
export async function web3_processPersonalMessage(msgParams, cb) {
    try {
        const devices = await getDevices();
        if (devices.length === 0)
            return cb("No BC Vault connected");
        let signedMessage = await SignData(devices[0], WalletType.ethereum, msgParams.from, msgParams.data);
        cb(null, signedMessage);
    }
    catch (e) {
        cb(e, null);
    }
}
export function web3_Inject(web3Instance) {
    web3Instance.eth.signTransaction = web3_signTransaction;
    web3Instance.eth.getAccounts = web3_GetAccounts;
    web3Instance.personal.sign = web3_signTransaction;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmNhcGkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGliL2JjYXBpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sS0FBeUMsTUFBTSxPQUFPLENBQUM7QUFDOUQsT0FBTyxFQUFnQixRQUFRLEVBQTBCLFVBQVUsRUFBQyxXQUFXLEVBQTRFLFdBQVcsRUFBNkIsTUFBTSxTQUFTLENBQUE7QUFFbE4sT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUFDLFFBQVEsRUFBRSxDQUFDO0FBQ25ELE1BQU0sQ0FBQyxNQUFNLElBQUksR0FBUSxzQ0FBc0MsQ0FBQTtBQUMvRCw2QkFBNkIsUUFBaUIsRUFBQyxJQUFZO0lBQ3pELE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEVBQUU7UUFDNUIsTUFBTSxPQUFPLEdBQXNCO1lBQ2pDLE9BQU8sRUFBQyxJQUFJO1lBQ1osSUFBSSxFQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLEtBQUssU0FBUyxDQUFBLENBQUMsQ0FBQSxFQUFFLENBQUEsQ0FBQyxDQUFBLElBQUksQ0FBQyxDQUFDO1lBQ2pELE1BQU0sRUFBQyxNQUFNO1lBQ2IsR0FBRyxFQUFDLFFBQVE7U0FFYixDQUFBO1FBQ0QsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVEsRUFBQyxFQUFFO1lBQzlCLE1BQU0sSUFBSSxHQUFHLEVBQUMsTUFBTSxFQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUMsSUFBSSxFQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUMsQ0FBQztZQUN6RCxJQUFHLFFBQVEsQ0FBQyxNQUFNLEtBQUssR0FBRztnQkFBRSxPQUFPLEdBQUcsQ0FBQyxJQUFJLFdBQVcsQ0FBQyxJQUFvQixDQUFDLENBQUMsQ0FBQztZQUM5RSxHQUFHLENBQUMsSUFBb0IsQ0FBQyxDQUFDO1FBRTVCLENBQUMsQ0FBQyxDQUFD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