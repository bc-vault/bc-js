"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable:no-expression-statement
const ava_1 = require("ava");
const es6_promise_1 = require("es6-promise");
es6_promise_1.polyfill();
const bc = __importStar(require("./bcapi"));
/* tslint:disable:prefer-const */
let testStruct;
/* tslint:enable:prefer-const */
function getDeviceObjectAsync(t, deviceID) {
    return __awaiter(this, void 0, void 0, function* () {
        const DeviceObject = { deviceID, supportedWallets: [], activeWallets: [] };
        const wallets = yield bc.getSupportedWalletTypes(deviceID);
        t.true(wallets.length > 0);
        DeviceObject.supportedWallets = wallets;
        const active = yield bc.getActiveWalletTypes(deviceID);
        t.true(active.length !== undefined);
        for (const activeWallet of active) {
            const signature = yield bc.getWalletsOfType(deviceID, activeWallet);
            t.true(signature.length !== undefined);
            DeviceObject.activeWallets.push({ type: activeWallet, signature: signature.length > 0 ? signature[0] : undefined });
        }
        return DeviceObject;
    });
}
ava_1.test.before((t) => __awaiter(this, void 0, void 0, function* () {
    const dev = yield bc.getDevices();
    t.true(dev.length > 0);
    const struct = { devices: [] };
    for (const currentDevice of dev) {
        struct.devices.push(yield getDeviceObjectAsync(t, currentDevice));
    }
    ;
    testStruct = struct;
}));
function generateTestForAllDevices(t, func) {
    return __awaiter(this, void 0, void 0, function* () {
        for (const dev of testStruct.devices) {
            yield func(dev.deviceID, t);
        }
    });
}
function generateTestForAllWalletTypes(t, currentDevice, func) {
    return __awaiter(this, void 0, void 0, function* () {
        for (const wt of testStruct.devices.find((x) => x.deviceID === currentDevice).activeWallets) {
            if (wt.signature === undefined)
                continue;
            yield func(wt, currentDevice, t);
        }
    });
}
ava_1.test("FirmwareVersion", (t) => __awaiter(this, void 0, void 0, function* () {
    yield generateTestForAllDevices(t, (currentDevice) => __awaiter(this, void 0, void 0, function* () {
        const response = yield bc.getFirmwareVersion(currentDevice);
        /* tslint:disable:no-string-literal */
        t.not(response['major'], undefined);
        /* tslint:enable:no-string-literal */
    }));
}));
ava_1.test("AvailableSpace", (t) => __awaiter(this, void 0, void 0, function* () {
    yield generateTestForAllDevices(t, (currentDevice) => __awaiter(this, void 0, void 0, function* () {
        const response = yield bc.getAvailableSpace(currentDevice);
        t.truthy(response.available);
    }));
}));
ava_1.test("WalletTypes", (t) => __awaiter(this, void 0, void 0, function* () {
    yield generateTestForAllDevices(t, (currentDevice) => __awaiter(this, void 0, void 0, function* () {
        const response = yield bc.getActiveWalletTypes(currentDevice);
        t.truthy(response.length);
    }));
}));
ava_1.test("IsAddressValid - Correct", (t) => __awaiter(this, void 0, void 0, function* () {
    yield generateTestForAllDevices(t, (currentDevice) => __awaiter(this, void 0, void 0, function* () {
        yield generateTestForAllWalletTypes(t, currentDevice, (currentWallet) => __awaiter(this, void 0, void 0, function* () {
            const response = yield bc.getIsAddressValid(currentDevice, currentWallet.type, currentWallet.signature);
            t.true(response);
        }));
    }));
}));
ava_1.test("IsAddressValid - Incorrect", (t) => __awaiter(this, void 0, void 0, function* () {
    yield generateTestForAllDevices(t, (currentDevice) => __awaiter(this, void 0, void 0, function* () {
        yield generateTestForAllWalletTypes(t, currentDevice, (currentWallet) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield bc.getIsAddressValid(currentDevice, currentWallet.type, currentWallet.signature + "BAD");
            }
            catch (e) {
                t.true(e.errorCode !== undefined);
            }
        }));
    }));
}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmNhcGkuc3BlYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9saWIvYmNhcGkuc3BlYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHlDQUF5QztBQUN6Qyw2QkFBNEM7QUFDNUMsNkNBQXVDO0FBQUMsc0JBQVEsRUFBRSxDQUFDO0FBQ25ELDRDQUE4QjtBQWMxQixpQ0FBaUM7QUFDakMsSUFBSSxVQUFxQixDQUFBO0FBQ3pCLGdDQUFnQztBQUNwQyw4QkFBb0MsQ0FBa0IsRUFBQyxRQUFlOztRQUVwRSxNQUFNLFlBQVksR0FBVSxFQUFDLFFBQVEsRUFBQyxnQkFBZ0IsRUFBQyxFQUFFLEVBQUMsYUFBYSxFQUFDLEVBQUUsRUFBQyxDQUFDO1FBQzVFLE1BQU0sT0FBTyxHQUFHLE1BQU0sRUFBRSxDQUFDLHVCQUF1QixDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzNELENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztRQUMzQixZQUFZLENBQUMsZ0JBQWdCLEdBQUMsT0FBdUIsQ0FBQztRQUV0RCxNQUFNLE1BQU0sR0FBRyxNQUFNLEVBQUUsQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUN2RCxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEtBQUssU0FBUyxDQUFDLENBQUM7UUFFcEMsS0FBSSxNQUFNLFlBQVksSUFBSSxNQUFNLEVBQUM7WUFDL0IsTUFBTSxTQUFTLEdBQUcsTUFBTSxFQUFFLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxFQUFDLFlBQVksQ0FBQyxDQUFDO1lBQ25FLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sS0FBSyxTQUFTLENBQUMsQ0FBQztZQUN2QyxZQUFZLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxFQUFDLElBQUksRUFBQyxZQUFZLEVBQUMsU0FBUyxFQUFDLFNB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