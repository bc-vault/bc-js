// tslint:disable:no-expression-statement
import { ExecutionContext,test } from 'ava';
import * as bc from './number';

    /* tslint:disable:prefer-const */
let Devices:ReadonlyArray<number>=[];
let SupportedWallets:Array<ReadonlyArray<bc.WalletType>>=[];
    /* tslint:enable:prefer-const */
test.before(async t => {
  const dev = await bc.getDevices();
  t.true(dev.length>0);
  Devices = dev;
  for(let i=0;i<dev.length;i++){

    const wallets = await bc.getSupportedWalletTypes(dev[i]);
    t.true(wallets.length > 0);
    SupportedWallets[i]=wallets;
  };
});
async function generateTestForAllDevices(t:ExecutionContext,func:(currentDevice:number,t:ExecutionContext)=>Promise<void>):Promise<void>{
  for(const Device of Devices){
    await func(Device,t);
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