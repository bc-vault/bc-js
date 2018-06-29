// tslint:disable:no-expression-statement
import { ExecutionContext,test } from 'ava';
import * as bc from './bcapi';
import {WalletType, BCHttpResponse} from './types';
import { polyfill } from 'es6-promise'; polyfill();
interface TestStruct{
  devices:Device[];
}
interface Device{
  deviceID:number
  supportedWallets:WalletType[]
  activeWallets:TestWalletType[]
}
interface TestWalletType{
  type:WalletType
  signature:string|undefined
}
    /* tslint:disable:prefer-const */
    let testStruct:TestStruct
    /* tslint:enable:prefer-const */
async function getDeviceObjectAsync(t:ExecutionContext,deviceID:number):Promise<Device>{

  const DeviceObject:Device = {deviceID,supportedWallets:[],activeWallets:[]};
  const wallets = await bc.getSupportedWalletTypes(deviceID);
  t.true(wallets.length > 0);
  DeviceObject.supportedWallets=wallets as WalletType[];
  
  const active = await bc.getActiveWalletTypes(deviceID);
  t.true(active.length !== undefined);

  for(const activeWallet of active){
    const signature = await bc.getWalletsOfType(deviceID,activeWallet);
    t.true(signature.length !== undefined);
    DeviceObject.activeWallets.push({type:activeWallet,signature:signature.length>0?signature[0]:undefined});

  }
  return DeviceObject;
}
test.before(async t => {
  const dev = await bc.getDevices();
  t.true(dev.length>0);
  const struct:TestStruct = {devices:[]};
  for(const currentDevice of dev){
    struct.devices.push(await getDeviceObjectAsync(t,currentDevice));
    
    
  };
  testStruct = struct;
});
async function generateTestForAllDevices(t:ExecutionContext,func:(currentDevice:number,t:ExecutionContext)=>Promise<void>):Promise<void>{
  for(const dev of testStruct.devices){
    await func(dev.deviceID,t);
  }
}

async function generateTestForAllWalletTypes(t:ExecutionContext,currentDevice:number,func:(currentWT:TestWalletType,currentDevice:number,t:ExecutionContext)=>Promise<void>):Promise<void>{
  for(const wt of (testStruct.devices.find((x)=>x.deviceID===currentDevice) as Device).activeWallets){
    if(wt.signature === undefined) continue;
    await func(wt,currentDevice,t);
  }
}

test("FirmwareVersion",async t=>{
  await generateTestForAllDevices(t,async (currentDevice)=>{
    const response = await bc.getFirmwareVersion(currentDevice);
    /* tslint:disable:no-string-literal */
    t.not(response['major'],undefined);
    /* tslint:enable:no-string-literal */
  })
});
test("AvailableSpace",async t=>{
  await generateTestForAllDevices(t,async (currentDevice)=>{
    const response = await bc.getAvailableSpace(currentDevice);

    t.truthy(response.available);
  })
});
test("WalletTypes",async t=>{
  await generateTestForAllDevices(t,async (currentDevice)=>{
    const response = await bc.getActiveWalletTypes(currentDevice);
    
    t.truthy(response.length);
  });
});
test("IsAddressValid - Correct",async t=>{
  await generateTestForAllDevices(t,async (currentDevice)=>{
    await generateTestForAllWalletTypes(t,currentDevice,async (currentWallet)=>{

      const response = await bc.IsAddressValid(currentDevice,currentWallet.type,currentWallet.signature as string);
    
      t.true(response);
    });
  });
});
test("IsAddressValid - Incorrect",async t=>{
  await generateTestForAllDevices(t,async (currentDevice)=>{
    await generateTestForAllWalletTypes(t,currentDevice,async (currentWallet)=>{
      try{
        await bc.IsAddressValid(currentDevice,currentWallet.type,currentWallet.signature+"BAD" as string);
      }catch(e){
        t.true((e as BCHttpResponse).errorCode !== undefined)
      }
    });
  });
});