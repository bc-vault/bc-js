import axios, { AxiosRequestConfig } from 'axios';
import {BCHttpResponse,Endpoint,HttpResponse,SpaceObject} from './types'

import { polyfill } from 'es6-promise'; polyfill();
export const Host:string="http://localhost:1991/"
function getResponsePromised(endpoint:Endpoint,data?:object):Promise<HttpResponse>{
  return new Promise((res,rej)=>{
    const options:AxiosRequestConfig = {
      baseURL:Host,
      data:JSON.stringify((data === undefined?{}:data)),
      method:"POST",
      url:endpoint
      
    }
    axios(options).then((response)=>{
      if(response.status !== 200) rej(response);
      const htpr = {status:response.status,body:response.data};
      res(htpr as HttpResponse);

    }).catch((e)=>{
      rej(e)
    });
    
  });
}
function assertIsBCHttpResponse(httpr:HttpResponse):void{
  
  if((httpr.body as BCHttpResponse).errorCode !== 0x9000) throw httpr.body;
}
export async function getDevices(): Promise<ReadonlyArray<number>>{
  let httpr;
  httpr = await getResponsePromised(Endpoint.Devices);
  assertIsBCHttpResponse(httpr);

  return httpr.body.data as ReadonlyArray<number>;
}

export async function getFirmwareVersion(device:number): Promise<object>{
  let httpr;
  httpr = await getResponsePromised(Endpoint.FirmwareVersion,{device});
  assertIsBCHttpResponse(httpr);

  return httpr.body.data as object;
}
export interface SpaceObject{
  readonly available:number;
  readonly complete:number;
}

export async function getAvailableSpace(device:number): Promise<SpaceObject>{
  let httpr;
  httpr = await getResponsePromised(Endpoint.AvailableSpace,{device});
  assertIsBCHttpResponse(httpr);
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
  assertIsBCHttpResponse(httpr);
  return httpr.body.data as ReadonlyArray<WalletType>;
}
export async function getActiveWalletTypes(device:number): Promise<ReadonlyArray<WalletType>>{
  let httpr;
  httpr = await getResponsePromised(Endpoint.SavedWalletTypes,{device});
  assertIsBCHttpResponse(httpr);
  return httpr.body.data as ReadonlyArray<WalletType>;
}
export async function getWalletsOfType(device:number,type:WalletType): Promise<ReadonlyArray<string>>{
  let httpr;
  httpr = await getResponsePromised(Endpoint.WalletsOfType,{device,walletType:type});
  assertIsBCHttpResponse(httpr);

  return httpr.body.data as ReadonlyArray<string>;
}
export async function getWalletUserData(device:number,type:WalletType,publicAddress:string):Promise<string>{
  let httpr;
  httpr = await getResponsePromised(Endpoint.WalletUserData,{device,walletType:type,sourcePublicID:publicAddress});
  assertIsBCHttpResponse(httpr);

  return httpr.body.data as string;

}
export async function CopyWalletToType(device:number,oldType:WalletType,newType:WalletType,publicAddress:string):Promise<boolean>{
  let httpr;
  httpr = await getResponsePromised(Endpoint.CopyWalletToType,{device,walletType:oldType,newWalletType:newType,sourcePublicID:publicAddress});
  assertIsBCHttpResponse(httpr);

  return true;

}
export async function IsAddressValid(device:number,type:WalletType,publicAddress:string):Promise<boolean>{
  let httpr;
  httpr = await getResponsePromised(Endpoint.IsAddressValid,{device,walletType:type,address:publicAddress});
  assertIsBCHttpResponse(httpr);

  return true;

}
export async function DisplayAddressOnDevice(device:number,type:WalletType,publicAddress:string):Promise<boolean>{
  let httpr;
  httpr = await getResponsePromised(Endpoint.DisplayAddress,{device,walletType:type,publicID:publicAddress});
  assertIsBCHttpResponse(httpr);

  return true;

}
function showAuthPopup(id:number):Promise<void>{
  return new Promise<void>((res)=>{
    const isIE = (window as any).ActiveXObject || "ActiveXObject" in window;
    let target:Window|null;
    if(isIE){
      (window as any).showModalDialog("http://localhost:1991/PasswordInput?channelID="+id);
      parent.postMessage("OKAY","*");
      res();
    }else{
      target=window.open("http://localhost:1991/PasswordInput?channelID="+id,"_blank","location=no,menubar=no,resizable=no,scrollbars=no,status=no,toolbar=no,centerscreen=yes,width=750,height:500");
      if(target === null) throw TypeError("Could not create popup!");
      // target.onbeforeunload = ()=>{res();};
      target=target as Window
      const timer = setInterval(()=>{
        if((target as Window).closed){
          clearInterval(timer);
          res();
        }
      },500);
    }
  });
}

function getSecureWindowResponse():Promise<number>{
  return new Promise<number>(async (res)=>{
      const x = await getResponsePromised(Endpoint.GetAuthID);
      const id = parseInt(x.body as string,10);
      await showAuthPopup(id);
      res(id);
      // const destination = `${Host}${Endpoint.PasswordInput}?actionID=${encodeURIComponent(actionID)}&actionParams=${encodeURIComponent(JSON.stringify(actionParams))}&channelID=${id}`;
      // let target:Window|null;
      /*
      if(iexplorerWorkaround){
        target = iexplorerWorkaround.contentWindow;
        (target as Window).postMessage(JSON.stringify({channelID:id}),"*",[mp.port2]);
      }else{
        target=window.open(destination,"_blank","location=no,menubar=no,resizable=no,scrollbars=no,status=no,toolbar=no,centerscreen=yes,width=750,height:500");
      }
      if(!target) throw TypeError("Window failed to create.");
      addAnEventListener('message',(e:any)=> {
        
        if(e.data === "OKAY")res(id);
        else rej();
        // let WindowResponse = await getResponsePromised(Endpoint.FetchSecureWindow,{id});
        // assertIsBCHttpResponse(WindowResponse);
        // let body = WindowResponse.body;
        // if(typeof body === typeof("")) body=JSON.parse(body as string);
        // alert("GOT RESPONSE FROM POPUP:"+body);
        // res(body as BCHttpResponse);
      
      });*/
  });
}

export async function GenerateWallet():Promise<string>{
  const resp = await getSecureWindowResponse();
  console.log("Authenticated with guid:"+resp);
  return "";
}
