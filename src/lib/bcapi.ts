import axios, { AxiosRequestConfig, AxiosError } from 'axios';
import {BCHttpResponse,Endpoint,HttpResponse,SpaceObject,PasswordType,WalletType,DaemonError, VersionObject, TransactionData,BCDataRefreshStatusCode, BCObject,BCDevice,typeInfoMap, WalletTypeInfo, WalletData, LogLevel, SessionCreateParameters, SessionAuthType, DaemonErrorCodes, WalletType_Legacy, WalletDetailsQuery, WalletBatchDataResponse, hexString} from './types'
import { Keccak } from 'sha3';
import { polyfill } from 'es6-promise'; polyfill();




const API_VERSION = 1;


export const Host:string="https://localhost.bc-vault.com:1991/"


let endpointAllowsCredentials:boolean;
function parseHex(str:string): string{
  let out = str;
  if(out.length %2 === 0) {
    out = out.substr(2);// remove 0x
    const responseStringArray = [...out];
    const byteArrayStr:number[] = [];
    for(let i =0;i<responseStringArray.length;i+=2){
      byteArrayStr.push(parseInt(responseStringArray[i]+responseStringArray[i+1],16));
    }
    out = String.fromCharCode(...byteArrayStr)
  }
  return out;
}
async function getNewSession(): Promise<string> {
  const scp: SessionCreateParameters = {
    sessionType: authTokenUseCookies ? SessionAuthType.any : SessionAuthType.token,
    expireSeconds: authTokenExpireSeconds,
    matchPath: authTokenMatchPath,
    versionNumber: API_VERSION
  }
  const response = await axios({
    baseURL:Host,
    method:"POST",
    url:'SetBCSessionParams',
    withCredentials:true,
    data:scp,
    headers:{"Api-Version":API_VERSION}
  })
  return response.data.d_token;
}
function getResponsePromised(endpoint:Endpoint,data?:object):Promise<HttpResponse>{
  const dataWithToken = {...(data||{}),d_token:authToken}
  return new Promise(async(res,rej)=>{
    if(endpointAllowsCredentials === undefined){
      try{
        const methodCheck = await axios({baseURL:Host,data:"{}",method:"POST",url:"/Devices"});
        endpointAllowsCredentials = methodCheck.data.daemonError === DaemonErrorCodes.sessionError;
      }catch(e){
        log("Daemon offline during initialization.",LogLevel.debug)
      }
    }
    const options:AxiosRequestConfig = {
      baseURL:Host,
      data:JSON.stringify(dataWithToken),
      method:"POST",
      url:endpoint
    }
    if(endpointAllowsCredentials && authTokenUseCookies){
      options.withCredentials=true;
      options.headers={"Api-Version":API_VERSION}
    }
    const responseFunction = async (response)=>{
      const htpr = {status:response.status,body:response.data};
      if(response.data.daemonError === DaemonErrorCodes.sessionError) {
        log(`Creating new session.`,LogLevel.debug);
        authToken = await getNewSession();
        log(`New session created: ${authToken}`,LogLevel.debug);
        options.data = JSON.stringify({...dataWithToken,d_token:authToken});
        axios(options).then((authenticatedResponse)=>{
          if(authenticatedResponse.data.daemonError) {
            return rej(new DaemonError({status:authenticatedResponse.status,body:authenticatedResponse.data}))
          }else{
            return res({status:authenticatedResponse.status,body:authenticatedResponse.data})
          }
        }).catch((e:AxiosError) => {
          log(`Daemon request failed: ${JSON.stringify(e)}`,LogLevel.warning);
          rej(e)
        })
        return;
      }
      if(response.status !== 200) return rej(new DaemonError(htpr as HttpResponse));
      res(htpr as HttpResponse);

    }
    axios(options).then(responseFunction).catch((e:AxiosError)=>{
      log(`Daemon request failed: ${JSON.stringify(e)}`,LogLevel.warning);
      rej(e)
    });
    
  });
}
function assertIsBCHttpResponse(httpr:HttpResponse):void{
  
  if((httpr.body as BCHttpResponse).errorCode !== 0x9000) throw new DaemonError(httpr.body as BCHttpResponse);
}
function log(msg:any,level=LogLevel.verbose):void{
  if(logLevel <= level){
    console.log('['+new Date(Date.now()).toLocaleTimeString()+']: '+msg);
  }
}
/** Is BCData object polling already taking place? */
export let isPolling = false;
/** Set Logging verbosity */
export let logLevel:LogLevel=LogLevel.debug;
/** Get/Set token to be used for device actions */
export let authToken: string;
/** Use cookies for session management. If set to false no cookies will be set and the session will be lost when 'authToken' is unloaded. It will need to be manually specified. It will be automatically refreshed if a request fails due to a token error. */
export let authTokenUseCookies: boolean = true;
/** How long each auth grant will last in seconds since the last request. */
export let authTokenExpireSeconds: number = 3600;
/** The path to match the auth-token against. This is a security feature and allows you to fine tune access. Default is: '/' (web root) */
export let authTokenMatchPath: string = '/';
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
  if(isPolling) throw Error("Already polling!");
  isPolling = true;
  // pollBCObject(fullInterval);
  pollDevicesChanged(deviceInterval);


}
async function getWallets(deviceID:number,activeTypes:WalletType[]):Promise<WalletData[]>{
  const ret:WalletData[] = [];
  const response = await getBatchWalletDetails(deviceID, activeTypes);
  for(const detailItem of response) {
    ret.push({
      publicKey:detailItem.address,
      userData:detailItem.userData,
      extraData: detailItem.extraData,
      walletType:detailItem.type
    })
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
    const devs:BCDevice[] = [];
    FireAllListeners(1);
    for (const deviceID of devArray) {
      let activeTypes;
      try{
        activeTypes = await getActiveWalletTypes(deviceID);
      }catch(e){
        if(e.BCHttpResponse !== undefined){
          const userData = await getWalletUserData(deviceID,WalletType.none,"",false);
          devs.push({
            id:deviceID,
            space:{available:1,complete:1},
            firmware:await getFirmwareVersion(deviceID),
            userData: parseHex(userData),
            userDataRaw:userData,
            supportedTypes:[],
            activeTypes:[],
            activeWallets:[],
            locked:true
          });
          continue;
        }
        throw e;
      }
      const usrDataHex = await getWalletUserData(deviceID,WalletType.none,"",false);
      devs.push(
        {
          id:deviceID,
          UID: await getDeviceUID(deviceID),
          space:await getAvailableSpace(deviceID),
          firmware:await getFirmwareVersion(deviceID),
          supportedTypes:await getSupportedWalletTypes(deviceID),
          userData: parseHex(usrDataHex),
          userDataRaw:usrDataHex,
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
// async function pollBCObject(interval:number){ Todo fix this
  // await triggerManualUpdate();
  // setTimeout(()=>pollBCObject(interval),interval);
// }
async function pollDevicesChanged(interval:number):Promise<void>{
  try{
    await triggerManualUpdate(false);
  }catch(e){
    FireAllListeners(-1);
    console.error(e);
  }
  setTimeout(()=>pollDevicesChanged(interval),interval);
}
function FireAllListeners(...args:any[]):void{
  for(const listener of listeners){
    listener.call(null,...args);
  }
}
function toLegacyWalletType(t:WalletType):number{
  let stringId: string|undefined;
  for(const typeProperty in WalletType){
    if(WalletType[typeProperty] === t){
      stringId = typeProperty;
    }
  }
  if(stringId === undefined){
    return 2147483646;
  }
  for(const legacyTypeProperty in WalletType_Legacy){
    if(legacyTypeProperty === stringId){
      return WalletType_Legacy[legacyTypeProperty] as any as number;
    }
  }
  return 2147483646;
}
function fromLegacyWalletType(t:number):WalletType{
  let stringId: string|undefined;
  for(const legacyTypeProperty in WalletType_Legacy){
    if((WalletType_Legacy[legacyTypeProperty] as any as number) === t){
      stringId = legacyTypeProperty;
    }
  }
  if(stringId === undefined){
    return "Unknown:"+t as any as WalletType;
  }
  for(const typeProperty in WalletType){
    if(typeProperty === stringId){
      return WalletType[typeProperty] as WalletType;
    }
  }
  return "Unknown:"+t as any as WalletType;
}
/** The current state of the daemon, updated either manually or on device connect/disconnect after calling startObjectPolling  */
export let BCData:BCObject = {devices:[]};
const listeners:Array<(status:BCDataRefreshStatusCode)=>void>=[]
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
    // => {"type":"BcCash01","name":"Bitcoin Cash","ticker":"BCH"}
  ```

  ### Example (promise browser)
  ```js
    var bc = _bcvault;
    console.log(JSON.stringify(bc.getWalletTypeInfo(1)));
    // => {"type":"BcCash01","name":"Bitcoin Cash","ticker":"BCH"}
  ```

  ### Example (nodejs)
  ```js
    var bc = require('bc-js');
    console.log(JSON.stringify(bc.getWalletTypeInfo(1)));
    // => {"type":"BcCash01","name":"Bitcoin Cash","ticker":"BCH"}
  ```
 */
export function getWalletTypeInfo(id:string):WalletTypeInfo|undefined{
  return typeInfoMap.find(x=>x.type === id);
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
export async function getDevices(): Promise<number[]>{
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
  bc.getWalletBalance("BitCoin1","1PekCrsopzENYBa82YpmmBtJcsNgu4PqEV").then(console.log)
  // => {"errorCode": 36864,"data": "0"}
  ```

  ### Example (promise browser)
  ```js
  var bc = _bcvault;
  console.log(await bc.getWalletBalance("BitCoin1","1PekCrsopzENYBa82YpmmBtJcsNgu4PqEV"))
  // => {"errorCode": 36864,"data": "0"}
  ```

  ### Example (nodejs)
  ```js
  var bc = require('bc-js');
  console.log(await bc.getWalletBalance("BitCoin1","1PekCrsopzENYBa82YpmmBtJcsNgu4PqEV"))
  // => {"errorCode": 36864,"data": "0"}
  ```
  @param device  DeviceID obtained from getDevices
  @throws        Will throw a DaemonError if the status code of the request was rejected by the server for any reason
  @throws        Will throw an AxiosError if the request itself failed or if status code != 200
  @returns       An object containing requested data
 */
export async function getWalletBalance(type:WalletType,sourcePublicID:string): Promise<string>{
  let httpr;
  httpr = await getResponsePromised(Endpoint.GetWalletBalance,{walletType:toLegacyWalletType(type),walletTypeString:type,sourcePublicID});
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
  Gets an ID unique to each device. Will not persist device wipes and will change according to the HTTP Origin. This ID will persist reboots and requires global-pin authorization.
  ### Example (es3)
  ```js
  var bc = _bcvault;
  bc.getDeviceUID(1).then(console.log)
  // => "0x9d8e1b33b93d7c27fb4fc17857e22fb529937947152ca7af441095949b20ba02"
  ```

  ### Example (promise browser)
  ```js
  var bc = _bcvault;
  console.log(await bc.getDeviceUID(1))
  // => "0x9d8e1b33b93d7c27fb4fc17857e22fb529937947152ca7af441095949b20ba02"
  ```

  ### Example (nodejs)
  ```js
  var bc = require('bc-js');
  console.log(await bc.getDeviceUID(1))
  // => "0x9d8e1b33b93d7c27fb4fc17857e22fb529937947152ca7af441095949b20ba02"
  ```
  @param device  DeviceID obtained from getDevices
  @throws        Will throw a DaemonError if the status code of the request was rejected by the server for any reason
  @throws        Will throw an AxiosError if the request itself failed or if status code != 200
  @returns       The unique ID
 */
export async function getDeviceUID(device:number): Promise<hexString>{
  let httpr;
  httpr = await getResponsePromised(Endpoint.DeviceUID,{device});
  assertIsBCHttpResponse(httpr);
  return httpr.body.data;
}
/**
  Gets the supported WalletTypes on a specific device
  ### Example (es3)
  ```js
  var bc = _bcvault;
  bc.getSupportedWalletTypes("BitCoin1").then(console.log)
  // => [  "BitCoin1",  "BcCash01",  "Ethereum",  "LiteCoi1",  "Dash0001", ...]
  ```

  ### Example (promise browser)
  ```js
  var bc = _bcvault;
  console.log(await bc.getSupportedWalletTypes(1))
  // => [  "BitCoin1",  "BcCash01",  "Ethereum",  "LiteCoi1",  "Dash0001", ...]
  ```

  ### Example (nodejs)
  ```js
  var bc = require('bc-js');
  console.log(await bc.getSupportedWalletTypes(1))
  // => [  "BitCoin1",  "BcCash01",  "Ethereum",  "LiteCoi1",  "Dash0001", ...]
  ```
  @param device  DeviceID obtained from getDevices
  @throws        Will throw a DaemonError if the status code of the request was rejected by the server for any reason
  @throws        Will throw an AxiosError if the request itself failed or if status code != 200
  @returns       An array containing requested data
 */
export async function getSupportedWalletTypes(device:number): Promise<WalletType[]>{
  let httpr;
  httpr = await getResponsePromised(Endpoint.WalletTypes,{device});
  assertIsBCHttpResponse(httpr);
  let newFormat:number[]|WalletType[] = httpr.body.data;
  if (typeof (newFormat[0]) === typeof(1)) {
    newFormat = (newFormat as number[]).map( x => fromLegacyWalletType(x) )
  }
  return newFormat as WalletType[];
}
/**
  Gets a list of WalletTypes that are actually used on a specific device(have at least one wallet)
  ### Example (es3)
  ```js
  var bc = _bcvault;
  bc.getActiveWalletTypes(1).then(console.log)
  // => ["BitCoin1","Ethereum"]
  ```

  ### Example (promise browser)
  ```js
  var bc = _bcvault;
  console.log(await bc.getActiveWalletTypes(1))
  // => ["BitCoin1","Ethereum"]
  ```

  ### Example (nodejs)
  ```js
  var bc = require('bc-js');
  console.log(await bc.getActiveWalletTypes(1))
  // => ["BitCoin1","Ethereum"]
  ```
  @param device  DeviceID obtained from getDevices
  @throws        Will throw a DaemonError if the status code of the request was rejected by the server for any reason
  @throws        Will throw an AxiosError if the request itself failed or if status code != 200
  @returns       An array containing requested data
 */
export async function getActiveWalletTypes(device:number): Promise<WalletType[]>{
  let httpr;
  httpr = await getResponsePromised(Endpoint.SavedWalletTypes,{device});
  assertIsBCHttpResponse(httpr);
  let newFormat:number[]|WalletType[] = httpr.body.data;
  if (typeof (newFormat[0]) === typeof(1)) {
    newFormat = (newFormat as number[]).map( x => fromLegacyWalletType(x) )
  }
  return newFormat as WalletType[];
}

/**
 * @deprecated since 1.3.2, use getBatchWalletDetails instead
  Gets an array(string) of public keys of a specific WalletTypes on a device
  ### Example (es3)
  ```js
  var bc = _bcvault;
  bc.getWalletsOfType(1,"BitCoin1").then(console.log)
  // => ["1271DpdZ7iM6sXRasvjAQ6Hg2zw8bS3ADc"]
  ```

  ### Example (promise browser)
  ```js
  var bc = _bcvault;
  console.log(await bc.getWalletsOfType(1,"BitCoin1"))
  // => ["1271DpdZ7iM6sXRasvjAQ6Hg2zw8bS3ADc"]
  ```

  ### Example (nodejs)
  ```js
  var bc = require('bc-js');
  console.log(await bc.getWalletsOfType(1,"BitCoin1"))
  // => ["1271DpdZ7iM6sXRasvjAQ6Hg2zw8bS3ADc"]
  ```
  @param device  DeviceID obtained from getDevices
  @param type    WalletType obtained from getActiveWalletTypes or getSupportedWalletTypes
  @throws        Will throw a DaemonError if the status code of the request was rejected by the server for any reason
  @throws        Will throw an AxiosError if the request itself failed or if status code != 200
  @returns       An array containing requested data
 */
export async function getWalletsOfType(device:number,type:WalletType): Promise<string[]>{
  let httpr;
  httpr = await getResponsePromised(Endpoint.WalletsOfType,{device,walletType:toLegacyWalletType(type),walletTypeString:type});
  assertIsBCHttpResponse(httpr);

  return httpr.body.data as string[];
}
/**
  Gets the requested data about wallets stored on the device. Details to query can be specified through the final parameter, which is set to query all details by default.
  ### Example (es3)
  ```js
  var bc = _bcvault;
  bc.getBatchWalletDetails(1,"BitCoin1").then(console.log)
  // => an array of type WalletBatchDataResponse
  ```

  ### Example (promise browser)
  ```js
  var bc = _bcvault;
  console.log(await bc.getBatchWalletDetails(1,"BitCoin1"))
  // => an array of type WalletBatchDataResponse
  ```

  ### Example (nodejs)
  ```js
  var bc = require('bc-js');
  console.log(await bc.getBatchWalletDetails(1,"BitCoin1"))
  // => an array of type WalletBatchDataResponse
  ```
  @param device           DeviceID obtained from getDevices
  @param walletTypes      WalletTypes obtained from getActiveWalletTypes or getSupportedWalletTypes
  @param walletDetails    Query details flags, can be combined with binary OR
  @throws                 Will throw a DaemonError if the status code of the request was rejected by the server for any reason
  @throws                 Will throw an AxiosError if the request itself failed or if status code != 200
  @returns                An array containing requested data
 */
export async function getBatchWalletDetails(device:number,walletTypes:WalletType[],walletDetails:WalletDetailsQuery=WalletDetailsQuery.all): Promise<WalletBatchDataResponse[]>{
  let httpr;
  try{
    httpr = await getResponsePromised(Endpoint.WalletsOfTypes,{device,walletTypes,walletDetails});
    assertIsBCHttpResponse(httpr);

    return httpr.body.data;
  } catch(e) {
    // legacy daemon
    const outArray:WalletBatchDataResponse[] = [];
    for(const wt of walletTypes) {
      
      const wallets = await getWalletsOfType(device,wt);
      for(const wallet of wallets){
        const walletUserData = await getWalletUserData(device,wt,wallet,false);

        outArray.push({
          address: wallet,
          type: wt,
          userData: walletUserData
        })
      }
    }
    return outArray;
  }
}

/**
 * @deprecated since 1.3.2, use getBatchWalletDetails instead
  Gets the user data associated with a publicAddress on this device
  ### Example (es3)
  ```js
  var bc = _bcvault;
  bc.getWalletUserData(1,"BitCoin1","1271DpdZ7iM6sXRasvjAQ6Hg2zw8bS3ADc",true).then(console.log)
  // => "This is my mining wallet!"
  ```

  ### Example (promise browser)
  ```js
  var bc = _bcvault;
  console.log(await bc.getWalletUserData(1,"BitCoin1","1271DpdZ7iM6sXRasvjAQ6Hg2zw8bS3ADc",true))
  // => "This is my mining wallet!"
  ```

  ### Example (nodejs)
  ```js
  var bc = require('bc-js');
  console.log(await bc.getWalletUserData(1,"BitCoin1","1271DpdZ7iM6sXRasvjAQ6Hg2zw8bS3ADc",true))
  // => "This is my mining wallet!"
  ```
  @param device  DeviceID obtained from getDevices
  @param type    WalletType obtained from getActiveWalletTypes or getSupportedWalletTypes
  @param publicAddress publicAddress obtained from getWalletsOfType
  @throws        Will throw a DaemonError if the status code of the request was rejected by the server for any reason
  @throws        Will throw an AxiosError if the request itself failed or if status code != 200
  @returns       The UserData
 */
export async function getWalletUserData(device:number,type:WalletType,publicAddress:string,shouldParseHex=true):Promise<string>{
  let httpr;
  httpr = await getResponsePromised(Endpoint.WalletUserData,{device,walletType:toLegacyWalletType(type),walletTypeString:type,sourcePublicID:publicAddress});
  assertIsBCHttpResponse(httpr);
  let responseString = httpr.body.data as string;
  if(shouldParseHex){
    responseString = parseHex(responseString);
  }
  
  
  return responseString;
}
/**
  Copies a wallet private key to another walletType (in case of a fork etc.)
  ### Example (es3)
  ```js
  var bc = _bcvault;
  bc.CopyWalletToType(1,"BitCoin1","BcCash01","1271DpdZ7iM6sXRasvjAQ6Hg2zw8bS3ADc").then(console.log)
  // => "true"
  ```

  ### Example (promise browser)
  ```js
  var bc = _bcvault;
  await bc.CopyWalletToType(1,"BitCoin1","BcCash01","1271DpdZ7iM6sXRasvjAQ6Hg2zw8bS3ADc")
  // => true
  ```

  ### Example (nodejs)
  ```js
  var bc = require('bc-js');
  await bc.CopyWalletToType(1,"BitCoin1","BcCash01","1271DpdZ7iM6sXRasvjAQ6Hg2zw8bS3ADc")
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
  const id = await getSecureWindowResponse(PasswordType.WalletPassword);
  httpr = await getResponsePromised(Endpoint.CopyWalletToType,{device,walletType:toLegacyWalletType(oldType),walletTypeString:newType,newWalletType:toLegacyWalletType(newType),newWalletTypeString:newType,sourcePublicID:publicAddress,password:id});
  assertIsBCHttpResponse(httpr);

  return true;

}
/**
  Check if address is valid for a specific WalletType
  ### Example (es3)
  ```js
  var bc = _bcvault;
  bc.getIsAddressValid(1,"BitCoin1","1271DpdZ7iM6sXRasvjAQ6Hg2zw8bS3ADc").then(console.log)
  // => "true"
  ```

  ### Example (promise browser)
  ```js
  var bc = _bcvault;
  await bc.getIsAddressValid(1,"BitCoin1","1271DpdZ7iM6sXRasvjAQ6Hg2zw8bS3ADc")
  // => true
  ```

  ### Example (nodejs)
  ```js
  var bc = require('bc-js');
  await bc.getIsAddressValid(1,"BitCoin1","1271DpdZ7iM6sXRasvjAQ6Hg2zw8bS3ADc")
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
  httpr = await getResponsePromised(Endpoint.IsAddressValid,{device,walletType:toLegacyWalletType(type),walletTypeString:type,address:publicAddress});
  
  return (httpr.body as BCHttpResponse).errorCode === 0x9000;

}

/**
  Displays address on device for verification
  ### Example (es3)
  ```js
  var bc = _bcvault;
  bc.DisplayAddressOnDevice(1,"BitCoin1","1271DpdZ7iM6sXRasvjAQ6Hg2zw8bS3ADc").then(console.log)
  // => "true"
  ```

  ### Example (promise browser)
  ```js
  var bc = _bcvault;
  await bc.DisplayAddressOnDevice(1,"BitCoin1","1271DpdZ7iM6sXRasvjAQ6Hg2zw8bS3ADc")
  // => true
  ```

  ### Example (nodejs)
  ```js
  var bc = require('bc-js');
  await bc.DisplayAddressOnDevice(1,"BitCoin1","1271DpdZ7iM6sXRasvjAQ6Hg2zw8bS3ADc")
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
  httpr = await getResponsePromised(Endpoint.DisplayAddress,{device,walletType:toLegacyWalletType(type),walletTypeString:type,publicID:publicAddress});
  assertIsBCHttpResponse(httpr);

  return true;

}
function showAuthPopup(id:string,passwordType:PasswordType):Promise<void>{
  return new Promise<void>((res)=>{
    const isIE = (window as any).ActiveXObject || "ActiveXObject" in window;
    let target:Window|null;
    if(isIE){
      (window as any).showModalDialog("https://localhost.bc-vault.com:1991/PasswordInput?channelID="+id+"&channelPasswordType="+passwordType);
      parent.postMessage("OKAY","*");
      res();
    }else{
      target=window.open("https://localhost.bc-vault.com:1991/PasswordInput?channelID="+id+"&channelPasswordType="+passwordType,"_blank","location=no,menubar=no,resizable=no,scrollbars=no,status=no,toolbar=no,centerscreen=yes,width=750,height:500");
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

function getSecureWindowResponse(passwordType:PasswordType):Promise<string>{
  return new Promise<string>(async (res)=>{
      const x = await getResponsePromised(Endpoint.GetAuthID);
      const id = x.body as string;
      await showAuthPopup(id,passwordType);
      res(id);
  });
}

/**
  Generates a new wallet on the device
  ### Example (es3)
  ```js
  var bc = _bcvault;
  bc.GenerateWallet(1,"BitCoin1").then(console.log)
  // => "true"
  ```

  ### Example (promise browser)
  ```js
  var bc = _bcvault;
  await bc.GenerateWallet(1,"BitCoin1")
  // => true
  ```

  ### Example (nodejs)
  ```js
  var bc = require('bc-js');
  await bc.GenerateWallet(1,"BitCoin1")
  // => true
  ```
  @param device  DeviceID obtained from getDevices
  @param type    WalletType obtained from getActiveWalletTypes or getSupportedWalletTypes
  @throws        Will throw a DaemonError if the status code of the request was rejected by the server for any reason
  @throws        Will throw an AxiosError if the request itself failed or if status code != 200
  @returns       the public key of the new wallet
 */
export async function GenerateWallet(device:number,type:WalletType):Promise<string>{
  const id = await getSecureWindowResponse(PasswordType.WalletPassword);
  const httpr = await getResponsePromised(Endpoint.GenerateWallet,{device,walletType:toLegacyWalletType(type),walletTypeString:type,password:id});
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
export async function EnterGlobalPin(device:number,passwordType:PasswordType=PasswordType.GlobalPassword):Promise<void>{
  const id = await getSecureWindowResponse(passwordType);
  log("Got pin popup:"+id);
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
  bc.GenerateTransaction(1,"BitCoin1",trxOptions).then(console.log)
  // generates a transaction of type bitCoinCash which uses 0.00050000 BCH as fee and sends 5 BCH back to the same address
  ```

  ### Example (promise browser)
  ```js
  var bc = _bcvault;
  var trxOptions = {from:"1271DpdZ7iM6sXRasvjAQ6Hg2zw8bS3ADc",to:"1271DpdZ7iM6sXRasvjAQ6Hg2zw8bS3ADc",feeCount:0,feePrice:"50000",amount:"500000000"};
  await bc.GenerateTransaction(1,"BitCoin1",trxOptions)
  // generates a transaction of type bitCoinCash which uses 0.00050000 BCH as fee and sends 5 BCH back to the same address
  ```

  ### Example (nodejs)
  ```js
  var bc = require('bc-js');
  var trxOptions = {from:"1271DpdZ7iM6sXRasvjAQ6Hg2zw8bS3ADc",to:"1271DpdZ7iM6sXRasvjAQ6Hg2zw8bS3ADc",feeCount:0,feePrice:"50000",amount:"500000000"};
  await bc.GenerateTransaction(1,"BitCoin1",trxOptions)
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
export async function GenerateTransaction(device:number, type:WalletType,data:TransactionData,broadcast?:boolean):Promise<string>{
  const id = await getSecureWindowResponse(PasswordType.WalletPassword);
  log("Got auth id:"+id,LogLevel.debug);
  log("Sending object:"+JSON.stringify({device,walletType:toLegacyWalletType(type),walletTypeString:type,transaction:data,password:id}),LogLevel.debug);
  const httpr = await getResponsePromised(Endpoint.GenerateTransaction,{device,walletType:toLegacyWalletType(type),walletTypeString:type,transaction:data,password:id,broadcast});

  log(httpr.body,LogLevel.debug);
  assertIsBCHttpResponse(httpr);
  // i know.
  // tslint:disable-next-line: no-string-literal
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
  const id = await getSecureWindowResponse(PasswordType.WalletPassword);
  log("Got auth id:"+id,LogLevel.debug);
  log("Sending object:"+JSON.stringify({device,walletType:toLegacyWalletType(type),walletTypeString:type,sourcePublicID:publicAddress,srcData:data,password:id}),LogLevel.debug);
  
  const httpr = await getResponsePromised(Endpoint.SignData,{device,walletType:toLegacyWalletType(type),walletTypeString:type,sourcePublicID:publicAddress,srcData:data,password:id});

  log("Response body:"+httpr.body,LogLevel.debug);
  assertIsBCHttpResponse(httpr);
  // i know.
  // tslint:disable-next-line: no-string-literal
  return httpr.body["data"] as string;
}




export async function web3_GetAccounts(cb:((err?:any,res?:any)=>void)):Promise<void>{
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
        // unlock BC Vault!
        await EnterGlobalPin(devices[0],PasswordType.GlobalPassword);
        const wallets = await getWalletsOfType(devices[0],WalletType.ethereum);
        return cb( null,wallets.map((x)=>"0x"+x) );
      }
    }
  }catch(e){
    cb(e,null)
  }
}
function strip0x(str:string):string{
  if(str.startsWith('0x')){
    return str.substr(2);
  }
  return str;
}
function toEtherCase(inputString:string):string{
  const kec = new Keccak(256);
  kec.update(inputString.toLowerCase());
  const keccakArray = kec.digest('hex').split('');
  const upperCase = '89abcdef';
  return inputString.toLowerCase().split('').map((x,idx)=>{
    if(upperCase.indexOf(keccakArray[idx]) !== -1) {
      return x.toUpperCase();
    }
    return x;
  }).join('');
}
export async function web3_signTransaction(txParams:any,cb:((err?:any,res?:any)=>void)):Promise<void>{
  try{
    const devices = await getDevices();
    if(devices.length === 0){
      cb("No BC Vault connected");
      return;
    }
    txParams.feePrice=txParams.gasPrice;
    txParams.feeCount=txParams.gas;
    txParams.amount=txParams.value;
    txParams.from=toEtherCase(strip0x(txParams.from))
    
    const txHex = await GenerateTransaction(devices[devices.length-1],WalletType.ethereum,txParams)
    cb(null,txHex);
  }catch(e){
    cb(e,null)
  }
}

export async function web3_signPersonalMessage(msgParams:any,cb:((err?:any,res?:any)=>void)):Promise<void>{
  try{
    const devices = await getDevices();
    if(devices.length === 0){
      cb("No BC Vault connected");
      return;
    }
    msgParams.from=toEtherCase(strip0x(msgParams.from))
    
    
    const signedMessage = await SignData(devices[devices.length-1],WalletType.ethereum,msgParams.from,msgParams.data);
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