import axios, { AxiosRequestConfig } from 'axios';
import {Endpoint,HttpResponse,SpaceObject,BCHttpResponse} from './types'

import { polyfill } from 'es6-promise'; polyfill();
export const Host:string="http://localhost:1991/"
function getResponsePromised(endpoint:Endpoint,data:object):Promise<HttpResponse|any>{
  return new Promise((res,rej)=>{
    const options:AxiosRequestConfig = {
      baseURL:Host,
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
export async function getWalletUserData(device:number,type:WalletType,publicAddress:string):Promise<string>{
  let httpr;
  httpr = await getResponsePromised(Endpoint.WalletUserData,{device,walletType:type,sourcePublicID:publicAddress});
  assertHttpFine(httpr);

  return httpr.body.data as string;

}
export async function CopyWalletToType(device:number,oldType:WalletType,newType:WalletType,publicAddress:string):Promise<boolean>{
  let httpr;
  httpr = await getResponsePromised(Endpoint.CopyWalletToType,{device,walletType:oldType,newWalletType:newType,sourcePublicID:publicAddress});
  assertHttpFine(httpr);

  return true;

}
export async function IsAddressValid(device:number,type:WalletType,publicAddress:string):Promise<boolean>{
  let httpr;
  httpr = await getResponsePromised(Endpoint.IsAddressValid,{device,walletType:type,address:publicAddress});
  assertHttpFine(httpr);

  return true;

}
export async function DisplayAddressOnDevice(device:number,type:WalletType,publicAddress:string):Promise<boolean>{
  let httpr;
  httpr = await getResponsePromised(Endpoint.DisplayAddress,{device,walletType:type,publicID:publicAddress});
  assertHttpFine(httpr);

  return true;

}

function getSecureWindowResponse(actionID:Endpoint,actionParams:any,IEWorkaroundFrame?:HTMLIFrameElement):Promise<BCHttpResponse>{
  return new Promise<BCHttpResponse>((res,rej)=>{
      const destination = `${Host}${Endpoint.PasswordInput}?actionID=${encodeURIComponent(actionID)}&actionParams=${encodeURIComponent(JSON.stringify(actionParams))}`;
      let target;
      if(IEWorkaroundFrame){
        target=IEWorkaroundFrame.contentWindow
        target.postMessage(JSON.stringify({actionID,actionParams}),"*")
      }else{
        target=window.open(destination,"_blank","location=no,menubar=no,resizable=no,scrollbars=no,status=no,toolbar=no,centerscreen=yes,width=750,height:500");
      }
      if(!target) throw TypeError("Window failed to create.");
      //target.postMessage(JSON.stringify({actionID,actionParams}),"*",[channel.port2]);
        window.addEventListener("message",(x)=> {
          var response = JSON.parse(x.data);
          if(!IEWorkaroundFrame)target.close();
          if(response.status === 200) res(JSON.parse(response.body) as BCHttpResponse);
          else rej(response);
        
        });
  });
}

export async function GenerateWallet(device:number,type:WalletType,iframe?:HTMLIFrameElement):Promise<string>{
  const resp = await getSecureWindowResponse(Endpoint.GenerateWallet,{device,walletType:type},iframe);
  if(resp.errorCode !== 0x9000) throw resp;
  console.log("Made new wallet:"+resp.data);
  return resp.data;
}
