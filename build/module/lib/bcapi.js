import axios from 'axios';
import { Endpoint, PasswordType, WalletType, DaemonError, typeInfoMap } from './types';
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
    console.log("Got auth id:" + id);
    console.log("Sending object:" + JSON.stringify({ device, walletType: type, transaction: data, password: id }));
    const httpr = await getResponsePromised(Endpoint.GenerateTransaction, { device, walletType: type, transaction: data, password: id, broadcast });
    console.log(httpr.body);
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
        let txHex = await GenerateTransaction(devices[0], WalletType.ethereum, txParams);
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
    web3Instance.personal.sign = web3_signPersonalMessage;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmNhcGkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGliL2JjYXBpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sS0FBeUMsTUFBTSxPQUFPLENBQUM7QUFDOUQsT0FBTyxFQUFnQixRQUFRLEVBQTBCLFlBQVksRUFBQyxVQUFVLEVBQUMsV0FBVyxFQUE0RSxXQUFXLEVBQTZCLE1BQU0sU0FBUyxDQUFBO0FBRS9OLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFBQyxRQUFRLEVBQUUsQ0FBQztBQUNuRCxNQUFNLENBQUMsTUFBTSxJQUFJLEdBQVEsc0NBQXNDLENBQUE7QUFDL0QsNkJBQTZCLFFBQWlCLEVBQUMsSUFBWTtJQUN6RCxPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxFQUFFO1FBQzVCLE1BQU0sT0FBTyxHQUFzQjtZQUNqQyxPQUFPLEVBQUMsSUFBSTtZQUNaLElBQUksRUFBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxLQUFLLFNBQVMsQ0FBQSxDQUFDLENBQUEsRUFBRSxDQUFBLENBQUMsQ0FBQSxJQUFJLENBQUMsQ0FBQztZQUNqRCxNQUFNLEVBQUMsTUFBTTtZQUNiLEdBQUcsRUFBQyxRQUFRO1NBRWIsQ0FBQTtRQUNELEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxRQUFRLEVBQUMsRUFBRTtZQUM5QixNQUFNLElBQUksR0FBRyxFQUFDLE1BQU0sRUFBQyxRQUFRLENBQUMsTUFBTSxFQUFDLElBQUksRUFBQyxRQUFRLENBQUMsSUFBSSxFQUFDLENBQUM7WUFDekQsSUFBRyxRQUFRLENBQUMsTUFBTSxLQUFLLEdBQUc7Z0JBQUUsT0FBTyxHQUFHLENBQUMsSUFBSSxXQUFXLENBQUMsSUFBb0IsQ0FBQyxDQUFDLENBQUM7WUFDOUUsR0FBRyxDQUFDLElBQW9CLENBQUMsQ0FBQztRQUU1QixDQUFD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