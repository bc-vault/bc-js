import axios, { AxiosRequestConfig } from 'axios';
/**
 * Multiplies a value by 2. (Also a full example of Typedoc's functionality.)
 *
 * ### Example (es module)
 * ```js
 * import { double } from 'typescript-starter'
 * console.log(double(4))
 * // => 8
 * ```
 *
 * ### Example (commonjs)
 * ```js
 * var double = require('typescript-starter').double;
 * console.log(double(4))
 * // => 8
 * ```
 *
 * @param value   Comment describing the `value` parameter.
 * @returns       Comment describing the return type.
 * @anotherNote   Some other value.
 */
// export function double(value: number): number {
//  return value * 2;
// }

/**
 * Raise the value of the first parameter to the power of the second using the es7 `**` operator.
 *
 * ### Example (es module)
 * ```js
 * import { power } from 'typescript-starter'
 * console.log(power(2,3))
 * // => 8
 * ```
 *
 * ### Example (commonjs)
 * ```js
 * var power = require('typescript-starter').power;
 * console.log(power(2,3))
 * // => 8
 * ```
 */
// export function power(base: number, exponent: number): number {
  // This is a proposed es7 operator, which should be transpiled by Typescript
//  return base ** exponent;
// }
export interface HttpResponse{
  readonly status:number;
  readonly body:BCHttpResponse|string|object;

}
export interface BCHttpResponse{
  readonly errorCode:number;
  readonly data:any;
}
export enum Endpoint{
  Devices             ="Devices",
  FirmwareVersion     ="FirmwareVersion",
  AvailableSpace      ="AvailableSpace",
  WalletTypes         ="WalletTypes",
  SavedWalletTypes    ="SavedWalletTypes",
  WalletsOfType       ="WalletsOfType",
  GenerateWallet      ="GenerateWallet",
  WalletUserData      ="WalletUserData",
  GenerateTransaction ="GenerateTransaction",
  SignTransactionData ="SignTransactionData",
  CopyWalletToType    ="CopyWalletToType",
  IsAddressValid      ="IsAddressValid",
  EnterGlobalPin      ="EnterGlobalPin",
  DisplayAddress      ="DisplayAddress",
}
function getResponsePromised(endpoint:Endpoint,data:object):Promise<HttpResponse|any>{
  return new Promise((res,rej)=>{
    const options:AxiosRequestConfig = {
      baseURL:"http://localhost:1991",
      data:JSON.stringify(data),
      method:"POST",
      url:endpoint
      
    }
    axios(options).then((response)=>{
      const htpr = {status:response.status,body:response.data};
      res(htpr as HttpResponse);

    }).catch((e)=>{
      rej(e)
    });
    
  });
}
function assertHttpFine(httpr:HttpResponse):void{
  if(httpr.status !== 200) throw httpr;
  
  if((httpr.body as BCHttpResponse).errorCode !== 0x9000) throw httpr.body;
}
export async function getDevices(): Promise<ReadonlyArray<number>>{
  let httpr;
  httpr = await getResponsePromised(Endpoint.Devices,{});
  assertHttpFine(httpr);

  return httpr.body.data as ReadonlyArray<number>;
}

export async function getFirmwareVersion(device:number): Promise<object>{
  let httpr;
  httpr = await getResponsePromised(Endpoint.FirmwareVersion,{device});
  assertHttpFine(httpr);

  return httpr.body.data as object;
}
export interface SpaceObject{
  readonly available:number;
  readonly complete:number;
}

export async function getAvailableSpace(device:number): Promise<SpaceObject>{
  let httpr;
  httpr = await getResponsePromised(Endpoint.AvailableSpace,{device});
  assertHttpFine(httpr);
  return httpr.body.data as SpaceObject;
}
const WalletTypeConstants = {
  BTC:0,
  ERC20:0x02000000,
  ETH:0x01000000,
  TESTNET:0x40000000
}
export enum WalletType{
  bitCoin     =WalletTypeConstants.BTC,
  bitCoinCash =WalletTypeConstants.BTC+1,
  liteCoin    =WalletTypeConstants.BTC+2,
  dash        =WalletTypeConstants.BTC+3,
  dogeCoin    =WalletTypeConstants.BTC+4,
  ripple      =WalletTypeConstants.BTC+5,
  ethereum    =WalletTypeConstants.ETH,
  erc20Bokky  =WalletTypeConstants.ETH|WalletTypeConstants.ERC20,

  bitCoinTest     =(WalletTypeConstants.BTC) | WalletTypeConstants.TESTNET,
  bitCoinCashTest =(WalletTypeConstants.BTC+1)| WalletTypeConstants.TESTNET,
  liteCoinTest    =(WalletTypeConstants.BTC+2)| WalletTypeConstants.TESTNET,
  dashTest        =(WalletTypeConstants.BTC+3)| WalletTypeConstants.TESTNET,
  dogeCoinTest    =(WalletTypeConstants.BTC+4)| WalletTypeConstants.TESTNET,
  rippleTest      =(WalletTypeConstants.BTC+5)| WalletTypeConstants.TESTNET,
  ethereumTest    =(WalletTypeConstants.ETH)  | WalletTypeConstants.TESTNET,
  erc20BokkyTest  =(WalletTypeConstants.ETH|WalletTypeConstants.ERC20)| WalletTypeConstants.TESTNET
}
export async function getSupportedWalletTypes(device:number): Promise<ReadonlyArray<WalletType>>{
  let httpr;
  httpr = await getResponsePromised(Endpoint.WalletTypes,{device});
  assertHttpFine(httpr);
  return httpr.body.data as ReadonlyArray<WalletType>;
}
export async function getActiveWalletTypes(device:number): Promise<ReadonlyArray<WalletType>>{
  let httpr;
  httpr = await getResponsePromised(Endpoint.SavedWalletTypes,{device});
  assertHttpFine(httpr);
  return httpr.body.data as ReadonlyArray<WalletType>;
}
export async function getWalletsOfType(device:number,type:WalletType): Promise<ReadonlyArray<string>>{
  let httpr;
  httpr = await getResponsePromised(Endpoint.WalletsOfType,{device,walletType:type});
  assertHttpFine(httpr);

  return httpr.body.data as ReadonlyArray<string>;
}
export async function getWalletUserData(device:number,type:WalletType,publicAddress:string):Promise<String>{
  let httpr;
  httpr = await getResponsePromised(Endpoint.WalletsOfType,{device,walletType:type,sourcePublicID:publicAddress});
  assertHttpFine(httpr);

  return httpr.body.data as string;

}
export async function CopyWalletToType(device:number,oldType:WalletType,newType:WalletType,publicAddress:string):Promise<boolean>{
  let httpr;
  httpr = await getResponsePromised(Endpoint.WalletsOfType,{device,walletType:oldType,newWalletType:newType,sourcePublicID:publicAddress});
  assertHttpFine(httpr);

  return true;

}
export async function IsAddressValid(device:number,type:WalletType,publicAddress:string):Promise<boolean>{
  let httpr;
  httpr = await getResponsePromised(Endpoint.WalletsOfType,{device,walletType:type,address:publicAddress});
  assertHttpFine(httpr);

  return true;

}