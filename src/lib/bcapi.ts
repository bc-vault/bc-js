import axios, { AxiosRequestConfig, AxiosError } from 'axios';
import {BCHttpResponse,Endpoint,HttpResponse,SpaceObject,WalletType,DaemonError, VersionObject, TransactionData,BCDataRefreshStatusCode, BCObject,BCDevice,typeInfoMap, WalletTypeInfo, WalletData} from './types'

import { polyfill } from 'es6-promise'; polyfill();
export const Host:string="https://localhost.bc-vault.com:1991/"
function getResponsePromised(endpoint:Endpoint,data?:object):Promise<HttpResponse>{
  return new Promise((res,rej)=>{
    const options:AxiosRequestConfig = {
      baseURL:Host,
      data:JSON.stringify((data === undefined?{}:data)),
      method:"POST",
      url:endpoint
      
    }
    axios(options).then((response)=>{
      const htpr = {status:response.status,body:response.data};
      if(response.status !== 200) return rej(new DaemonError(htpr as HttpResponse));
      res(htpr as HttpResponse);

    }).catch((e:AxiosError)=>{
      rej(e)
    });
    
  });
}
function assertIsBCHttpResponse(httpr:HttpResponse):void{
  
  if((httpr.body as BCHttpResponse).errorCode !== 0x9000) throw new DaemonError(httpr.body as BCHttpResponse);
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
export function startObjectPolling(deviceInterval:number=150):void{
  if(isPolling) throw "Already polling!";
  isPolling = true;
  //pollBCObject(fullInterval);
  pollDevicesChanged(deviceInterval);


}
async function getWallets(deviceID:number,activeTypes:ReadonlyArray<WalletType>):Promise<WalletData[]>{
  let ret:WalletData[] = [];
  for(const x of activeTypes){
    const walletsOfXType = await getWalletsOfType(deviceID,x) as string[];
    for(const wallet of walletsOfXType){
      ret.push({publicKey:wallet,walletType:x});
    }
  }
  return ret;
}
function arraysEqual<T>(a:ReadonlyArray<T>,b:ReadonlyArray<T>):boolean{
  let equal = a.length === b.length;
  for(let i =0;i<a.length && equal;i++){
    equal = a[i] === b[i];
  }
  return equal;
}
let lastSeenDevices:ReadonlyArray<number>=[];
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
export async function triggerManualUpdate(fullUpdate:boolean=true):Promise<void>{
  if(fullUpdate){
    const devArray = await getDevices();
    let devs:BCDevice[] = [];
    FireAllListeners(1);
    for (const deviceID of devArray) {
      let activeTypes;
      try{
        activeTypes = await getActiveWalletTypes(deviceID);
      }catch(e){
        if(e.BCHttpResponse !== undefined){
          devs.push({
            id:deviceID,
            space:{available:1,complete:1},
            firmware:await getFirmwareVersion(deviceID),
            supportedTypes:[],
            activeTypes:[],
            activeWallets:[],
            locked:true
          });
          continue;
        }
        throw e;
      }
      devs.push(
        {
          id:deviceID,
          space:await getAvailableSpace(deviceID),
          firmware:await getFirmwareVersion(deviceID),
          supportedTypes:await getSupportedWalletTypes(deviceID),
          activeTypes,
          activeWallets: await getWallets(deviceID,activeTypes),
          locked:false
        });
    }
    BCData = {devices:devs};
    FireAllListeners(0);
  }else{
    let devices;
    devices = await getDevices();
    if(!arraysEqual(devices,lastSeenDevices)){
      lastSeenDevices = devices;
      await triggerManualUpdate(true);
    }
  }
}
//async function pollBCObject(interval:number){ Todo fix this
  //await triggerManualUpdate();
  //setTimeout(()=>pollBCObject(interval),interval);
//}
async function pollDevicesChanged(interval:number){
  try{
    await triggerManualUpdate(false);
  }catch(e){
    FireAllListeners(-1);
    console.error(e);
  }
  setTimeout(()=>pollDevicesChanged(interval),interval);
}
function FireAllListeners(...args:any[]){
  for(const listener of listeners){
    listener.call(null,...args);
  }
}
/** The current state of the daemon, updated either manually or on device connect/disconnect after calling startObjectPolling  */
export var BCData:BCObject = {devices:[]};
let listeners:Function[]=[]
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
export function AddBCDataChangedListener(func:(status:BCDataRefreshStatusCode)=>void):void{
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
export function getWalletTypeInfo(id:number):WalletTypeInfo|undefined{
  return typeInfoMap.find(x=>x.type == id);
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
export async function getDevices(): Promise<ReadonlyArray<number>>{
  let httpr;
  httpr = await getResponsePromised(Endpoint.Devices);
  assertIsBCHttpResponse(httpr);

  return httpr.body.data as ReadonlyArray<number>;
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
export async function getFirmwareVersion(device:number): Promise<VersionObject>{
  let httpr;
  httpr = await getResponsePromised(Endpoint.FirmwareVersion,{device});
  assertIsBCHttpResponse(httpr);

  return httpr.body.data as VersionObject;
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
export async function getWalletBalance(walletType:WalletType,sourcePublicID:string): Promise<string>{
  let httpr;
  httpr = await getResponsePromised(Endpoint.GetWalletBalance,{walletType,sourcePublicID});
  assertIsBCHttpResponse(httpr);

  return httpr.body.data as string;
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
export async function getAvailableSpace(device:number): Promise<SpaceObject>{
  let httpr;
  httpr = await getResponsePromised(Endpoint.AvailableSpace,{device});
  assertIsBCHttpResponse(httpr);
  return httpr.body.data as SpaceObject;
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
export async function getSupportedWalletTypes(device:number): Promise<ReadonlyArray<WalletType>>{
  let httpr;
  httpr = await getResponsePromised(Endpoint.WalletTypes,{device});
  assertIsBCHttpResponse(httpr);
  return httpr.body.data as ReadonlyArray<WalletType>;
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
export async function getActiveWalletTypes(device:number): Promise<ReadonlyArray<WalletType>>{
  let httpr;
  httpr = await getResponsePromised(Endpoint.SavedWalletTypes,{device});
  assertIsBCHttpResponse(httpr);
  return httpr.body.data as ReadonlyArray<WalletType>;
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
export async function getWalletsOfType(device:number,type:WalletType): Promise<ReadonlyArray<string>>{
  let httpr;
  httpr = await getResponsePromised(Endpoint.WalletsOfType,{device,walletType:type});
  assertIsBCHttpResponse(httpr);

  return httpr.body.data as ReadonlyArray<string>;
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
export async function getWalletUserData(device:number,type:WalletType,publicAddress:string):Promise<string>{
  let httpr;
  httpr = await getResponsePromised(Endpoint.WalletUserData,{device,walletType:type,sourcePublicID:publicAddress});
  assertIsBCHttpResponse(httpr);

  return httpr.body.data as string;

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
export async function CopyWalletToType(device:number,oldType:WalletType,newType:WalletType,publicAddress:string):Promise<boolean>{
  let httpr;
  const id = await getSecureWindowResponse();
  httpr = await getResponsePromised(Endpoint.CopyWalletToType,{device,walletType:oldType,newWalletType:newType,sourcePublicID:publicAddress,password:id});
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
export async function getIsAddressValid(device:number,type:WalletType,publicAddress:string):Promise<boolean>{
  let httpr;
  httpr = await getResponsePromised(Endpoint.IsAddressValid,{device,walletType:type,address:publicAddress});
  
  return (httpr.body as BCHttpResponse).errorCode === 0x9000;

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
export async function DisplayAddressOnDevice(device:number,type:WalletType,publicAddress:string):Promise<boolean>{
  let httpr;
  httpr = await getResponsePromised(Endpoint.DisplayAddress,{device,walletType:type,publicID:publicAddress});
  assertIsBCHttpResponse(httpr);

  return true;

}
function showAuthPopup(id:string):Promise<void>{
  return new Promise<void>((res)=>{
    const isIE = (window as any).ActiveXObject || "ActiveXObject" in window;
    let target:Window|null;
    if(isIE){
      (window as any).showModalDialog("https://localhost.bc-vault.com:1991/PasswordInput?channelID="+id);
      parent.postMessage("OKAY","*");
      res();
    }else{
      target=window.open("https://localhost.bc-vault.com:1991/PasswordInput?channelID="+id,"_blank","location=no,menubar=no,resizable=no,scrollbars=no,status=no,toolbar=no,centerscreen=yes,width=750,height:500");
      if(target === null) throw TypeError("Could not create popup!");
      const timer = setInterval(()=>{
        if((target as Window).closed){
          clearInterval(timer);
          res();
        }
      },500);
    }
  });
}

function getSecureWindowResponse():Promise<string>{
  return new Promise<string>(async (res)=>{
      const x = await getResponsePromised(Endpoint.GetAuthID);
      const id = x.body as string;
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
export async function GenerateWallet(device:number,type:WalletType):Promise<string>{
  const id = await getSecureWindowResponse();
  const httpr = await getResponsePromised(Endpoint.GenerateWallet,{device,walletType:type,password:id});
  assertIsBCHttpResponse(httpr);
  return (httpr.body as BCHttpResponse).data;
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
export async function EnterGlobalPin(device:number):Promise<void>{
  const id = await getSecureWindowResponse();
  console.log("Got pin popup:"+id);
  const httpr = await getResponsePromised(Endpoint.EnterGlobalPin,{device,password:id});
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
export async function GenerateTransaction(device:number, type:WalletType,data:TransactionData):Promise<string>{
  const id = await getSecureWindowResponse();
  console.log("Got auth id:"+id);
  console.log("Sending object:"+JSON.stringify({device,walletType:type,transaction:data,password:id}));
  const httpr = await getResponsePromised(Endpoint.GenerateTransaction,{device,walletType:type,transaction:data,password:id});

  console.log(httpr.body);
  assertIsBCHttpResponse(httpr);
  return httpr.body["data"] as string;
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
export async function SignData(device:number, type:WalletType,publicAddress:string,data:string):Promise<string>{
  const id = await getSecureWindowResponse();
  console.log("Got auth id:"+id);
  console.log("Sending object:"+JSON.stringify({device,walletType:type,sourcePublicID:publicAddress,srcData:data,password:id}));
  const httpr = await getResponsePromised(Endpoint.SignData,{device,walletType:type,sourcePublicID:publicAddress,srcData:data,password:id});

  console.log(httpr.body);
  assertIsBCHttpResponse(httpr);
  return httpr.body["data"] as string;
}




export async function web3_GetAccounts(cb:Function):Promise<void>{
  try{
    const devices = await getDevices();
    if(devices.length === 0){
      cb("No BC Vault connected");
      return;
    }
    try{
      const wallets = await getWalletsOfType(devices[0],WalletType.ethereum);
      cb( null,wallets.map((x)=>"0x"+x) );
    }catch(e){
      if(e.BCHttpResponse !== undefined){
        //unlock BC Vault!
        await EnterGlobalPin(devices[0]);
        const wallets = await getWalletsOfType(devices[0],WalletType.ethereum);
        return cb( null,wallets.map((x)=>"0x"+x) );
      }
    }
  }catch(e){
    cb(e,null)
  }
}

export async function web3_signTransaction(txParams:any,cb:Function):Promise<void>{
  try{
    const devices = await getDevices();
    if(devices.length === 0){
      cb("No BC Vault connected");
      return;
    }
    txParams.feePrice=txParams.gasPrice;
    txParams.feeCount=txParams.gas;
    txParams.amount=txParams.value;
    
    let txHex = await GenerateTransaction(devices[0],WalletType.ethereum,txParams)
    cb(null,txHex);
  }catch(e){
    cb(e,null)
  }
}

export async function web3_signPersonalMessage(msgParams:any,cb:Function):Promise<void>{
  try{
    const devices = await getDevices();
    if(devices.length === 0){
      cb("No BC Vault connected");
      return;
    }
    
    let signedMessage = await SignData(devices[0],WalletType.ethereum,msgParams.from,msgParams.data);
    cb(null,signedMessage);
  }catch(e){
    cb(e,null)
  }
}

export function web3_Inject(web3Instance:any):void{
  web3Instance.eth.signTransaction = web3_signTransaction;
  web3Instance.eth.getAccounts = web3_GetAccounts;
  web3Instance.personal.sign = web3_signPersonalMessage;
}