// tslint:disable:no-expression-statement
import { test } from 'ava';
import { polyfill } from 'es6-promise';
polyfill();
import * as bc from './bcapi';
/* tslint:disable:prefer-const */
let testStruct;
/* tslint:enable:prefer-const */
async function getDeviceObjectAsync(t, deviceID) {
    const DeviceObject = { deviceID, supportedWallets: [], activeWallets: [] };
    const wallets = await bc.getSupportedWalletTypes(deviceID);
    t.true(wallets.length > 0);
    DeviceObject.supportedWallets = wallets;
    const active = await bc.getActiveWalletTypes(deviceID);
    t.true(active.length !== undefined);
    for (const activeWallet of active) {
        const signature = await bc.getWalletsOfType(deviceID, activeWallet);
        t.true(signature.length !== undefined);
        DeviceObject.activeWallets.push({ type: activeWallet, signature: signature.length > 0 ? signature[0] : undefined });
    }
    return DeviceObject;
}
test.before(async (t) => {
    const dev = await bc.getDevices();
    t.true(dev.length > 0);
    const struct = { devices: [] };
    for (const currentDevice of dev) {
        struct.devices.push(await getDeviceObjectAsync(t, currentDevice));
    }
    ;
    testStruct = struct;
});
async function generateTestForAllDevices(t, func) {
    for (const dev of testStruct.devices) {
        await func(dev.deviceID, t);
    }
}
async function generateTestForAllWalletTypes(t, currentDevice, func) {
    for (const wt of testStruct.devices.find((x) => x.deviceID === currentDevice).activeWallets) {
        if (wt.signature === undefined)
            continue;
        await func(wt, currentDevice, t);
    }
}
test("FirmwareVersion", async (t) => {
    await generateTestForAllDevices(t, async (currentDevice) => {
        const response = await bc.getFirmwareVersion(currentDevice);
        /* tslint:disable:no-string-literal */
        t.not(response['major'], undefined);
        /* tslint:enable:no-string-literal */
    });
});
test("AvailableSpace", async (t) => {
    await generateTestForAllDevices(t, async (currentDevice) => {
        const response = await bc.getAvailableSpace(currentDevice);
        t.truthy(response.available);
    });
});
test("WalletTypes", async (t) => {
    await generateTestForAllDevices(t, async (currentDevice) => {
        const response = await bc.getActiveWalletTypes(currentDevice);
        t.truthy(response.length);
    });
});
test("IsAddressValid - Correct", async (t) => {
    await generateTestForAllDevices(t, async (currentDevice) => {
        await generateTestForAllWalletTypes(t, currentDevice, async (currentWallet) => {
            const response = await bc.getIsAddressValid(currentDevice, currentWallet.type, currentWallet.signature);
            t.true(response);
        });
    });
});
test("IsAddressValid - Incorrect", async (t) => {
    await generateTestForAllDevices(t, async (currentDevice) => {
        await generateTestForAllWalletTypes(t, currentDevice, async (currentWallet) => {
            try {
                await bc.getIsAddressValid(currentDevice, currentWallet.type, currentWallet.signature + "BAD");
            }
            catch (e) {
                t.true(e.errorCode !== undefined);
            }
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmNhcGkuc3BlYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9saWIvYmNhcGkuc3BlYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSx5Q0FBeUM7QUFDekMsT0FBTyxFQUFtQixJQUFJLEVBQUUsTUFBTSxLQUFLLENBQUM7QUFDNUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUFDLFFBQVEsRUFBRSxDQUFDO0FBQ25ELE9BQU8sS0FBSyxFQUFFLE1BQU0sU0FBUyxDQUFDO0FBYzFCLGlDQUFpQztBQUNqQyxJQUFJLFVBQXFCLENBQUE7QUFDekIsZ0NBQWdDO0FBQ3BDLEtBQUssK0JBQStCLENBQWtCLEVBQUMsUUFBZTtJQUVwRSxNQUFNLFlBQVksR0FBVSxFQUFDLFFBQVEsRUFBQyxnQkFBZ0IsRUFBQyxFQUFFLEVBQUMsYUFBYSxFQUFDLEVBQUUsRUFBQyxDQUFDO0lBQzVFLE1BQU0sT0FBTyxHQUFHLE1BQU0sRUFBRSxDQUFDLHVCQUF1QixDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzNELENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztJQUMzQixZQUFZLENBQUMsZ0JBQWdCLEdBQUMsT0FBdUIsQ0FBQztJQUV0RCxNQUFNLE1BQU0sR0FBRyxNQUFNLEVBQUUsQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUN2RCxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEtBQUssU0FBUyxDQUFDLENBQUM7SUFFcEMsS0FBSSxNQUFNLFlBQVksSUFBSSxNQUFNLEVBQUM7UUFDL0IsTUFBTSxTQUFTLEdBQUcsTUFBTSxFQUFFLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxFQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ25FLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sS0FBSyxTQUFTLENBQUMsQ0FBQztRQUN2QyxZ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