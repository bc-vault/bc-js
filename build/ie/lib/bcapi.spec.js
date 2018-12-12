"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
var _this = this;
exports.__esModule = true;
// tslint:disable:no-expression-statement
var ava_1 = require("ava");
var es6_promise_1 = require("es6-promise");
es6_promise_1.polyfill();
var bc = require("./bcapi");
/* tslint:disable:prefer-const */
var testStruct;
/* tslint:enable:prefer-const */
function getDeviceObjectAsync(t, deviceID) {
    return __awaiter(this, void 0, void 0, function () {
        var e_1, _a, DeviceObject, wallets, active, active_1, active_1_1, activeWallet, signature, e_1_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    DeviceObject = { deviceID: deviceID, supportedWallets: [], activeWallets: [] };
                    return [4 /*yield*/, bc.getSupportedWalletTypes(deviceID)];
                case 1:
                    wallets = _b.sent();
                    t["true"](wallets.length > 0);
                    DeviceObject.supportedWallets = wallets;
                    return [4 /*yield*/, bc.getActiveWalletTypes(deviceID)];
                case 2:
                    active = _b.sent();
                    t["true"](active.length !== undefined);
                    _b.label = 3;
                case 3:
                    _b.trys.push([3, 8, 9, 10]);
                    active_1 = __values(active), active_1_1 = active_1.next();
                    _b.label = 4;
                case 4:
                    if (!!active_1_1.done) return [3 /*break*/, 7];
                    activeWallet = active_1_1.value;
                    return [4 /*yield*/, bc.getWalletsOfType(deviceID, activeWallet)];
                case 5:
                    signature = _b.sent();
                    t["true"](signature.length !== undefined);
                    DeviceObject.activeWallets.push({ type: activeWallet, signature: signature.length > 0 ? signature[0] : undefined });
                    _b.label = 6;
                case 6:
                    active_1_1 = active_1.next();
                    return [3 /*break*/, 4];
                case 7: return [3 /*break*/, 10];
                case 8:
                    e_1_1 = _b.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 10];
                case 9:
                    try {
                        if (active_1_1 && !active_1_1.done && (_a = active_1["return"])) _a.call(active_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                    return [7 /*endfinally*/];
                case 10: return [2 /*return*/, DeviceObject];
            }
        });
    });
}
ava_1.test.before(function (t) { return __awaiter(_this, void 0, void 0, function () {
    var e_2, _a, dev, struct, dev_1, dev_1_1, currentDevice, _b, _c, e_2_1;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0: return [4 /*yield*/, bc.getDevices()];
            case 1:
                dev = _d.sent();
                t["true"](dev.length > 0);
                struct = { devices: [] };
                _d.label = 2;
            case 2:
                _d.trys.push([2, 7, 8, 9]);
                dev_1 = __values(dev), dev_1_1 = dev_1.next();
                _d.label = 3;
            case 3:
                if (!!dev_1_1.done) return [3 /*break*/, 6];
                currentDevice = dev_1_1.value;
                _c = (_b = struct.devices).push;
                return [4 /*yield*/, getDeviceObjectAsync(t, currentDevice)];
            case 4:
                _c.apply(_b, [_d.sent()]);
                _d.label = 5;
            case 5:
                dev_1_1 = dev_1.next();
                return [3 /*break*/, 3];
            case 6: return [3 /*break*/, 9];
            case 7:
                e_2_1 = _d.sent();
                e_2 = { error: e_2_1 };
                return [3 /*break*/, 9];
            case 8:
                try {
                    if (dev_1_1 && !dev_1_1.done && (_a = dev_1["return"])) _a.call(dev_1);
                }
                finally { if (e_2) throw e_2.error; }
                return [7 /*endfinally*/];
            case 9:
                ;
                testStruct = struct;
                return [2 /*return*/];
        }
    });
}); });
function generateTestForAllDevices(t, func) {
    return __awaiter(this, void 0, void 0, function () {
        var e_3, _a, _b, _c, dev, e_3_1;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 5, 6, 7]);
                    _b = __values(testStruct.devices), _c = _b.next();
                    _d.label = 1;
                case 1:
                    if (!!_c.done) return [3 /*break*/, 4];
                    dev = _c.value;
                    return [4 /*yield*/, func(dev.deviceID, t)];
                case 2:
                    _d.sent();
                    _d.label = 3;
                case 3:
                    _c = _b.next();
                    return [3 /*break*/, 1];
                case 4: return [3 /*break*/, 7];
                case 5:
                    e_3_1 = _d.sent();
                    e_3 = { error: e_3_1 };
                    return [3 /*break*/, 7];
                case 6:
                    try {
                        if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
                    }
                    finally { if (e_3) throw e_3.error; }
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    });
}
function generateTestForAllWalletTypes(t, currentDevice, func) {
    return __awaiter(this, void 0, void 0, function () {
        var e_4, _a, _b, _c, wt, e_4_1;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 5, 6, 7]);
                    _b = __values(testStruct.devices.find(function (x) { return x.deviceID === currentDevice; }).activeWallets), _c = _b.next();
                    _d.label = 1;
                case 1:
                    if (!!_c.done) return [3 /*break*/, 4];
                    wt = _c.value;
                    if (wt.signature === undefined)
                        return [3 /*break*/, 3];
                    return [4 /*yield*/, func(wt, currentDevice, t)];
                case 2:
                    _d.sent();
                    _d.label = 3;
                case 3:
                    _c = _b.next();
                    return [3 /*break*/, 1];
                case 4: return [3 /*break*/, 7];
                case 5:
                    e_4_1 = _d.sent();
                    e_4 = { error: e_4_1 };
                    return [3 /*break*/, 7];
                case 6:
                    try {
                        if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
                    }
                    finally { if (e_4) throw e_4.error; }
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    });
}
ava_1.test("FirmwareVersion", function (t) { return __awaiter(_this, void 0, void 0, function () {
    var _this = this;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, generateTestForAllDevices(t, function (currentDevice) { return __awaiter(_this, void 0, void 0, function () {
                    var response;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, bc.getFirmwareVersion(currentDevice)];
                            case 1:
                                response = _a.sent();
                                /* tslint:disable:no-string-literal */
                                t.not(response['major'], undefined);
                                return [2 /*return*/];
                        }
                    });
                }); })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
ava_1.test("AvailableSpace", function (t) { return __awaiter(_this, void 0, void 0, function () {
    var _this = this;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, generateTestForAllDevices(t, function (currentDevice) { return __awaiter(_this, void 0, void 0, function () {
                    var response;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, bc.getAvailableSpace(currentDevice)];
                            case 1:
                                response = _a.sent();
                                t.truthy(response.available);
                                return [2 /*return*/];
                        }
                    });
                }); })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
ava_1.test("WalletTypes", function (t) { return __awaiter(_this, void 0, void 0, function () {
    var _this = this;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, generateTestForAllDevices(t, function (currentDevice) { return __awaiter(_this, void 0, void 0, function () {
                    var response;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, bc.getActiveWalletTypes(currentDevice)];
                            case 1:
                                response = _a.sent();
                                t.truthy(response.length);
                                return [2 /*return*/];
                        }
                    });
                }); })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
ava_1.test("IsAddressValid - Correct", function (t) { return __awaiter(_this, void 0, void 0, function () {
    var _this = this;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, generateTestForAllDevices(t, function (currentDevice) { return __awaiter(_this, void 0, void 0, function () {
                    var _this = this;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, generateTestForAllWalletTypes(t, currentDevice, function (currentWallet) { return __awaiter(_this, void 0, void 0, function () {
                                    var response;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4 /*yield*/, bc.getIsAddressValid(currentDevice, currentWallet.type, currentWallet.signature)];
                                            case 1:
                                                response = _a.sent();
                                                t["true"](response);
                                                return [2 /*return*/];
                                        }
                                    });
                                }); })];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
ava_1.test("IsAddressValid - Incorrect", function (t) { return __awaiter(_this, void 0, void 0, function () {
    var _this = this;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, generateTestForAllDevices(t, function (currentDevice) { return __awaiter(_this, void 0, void 0, function () {
                    var _this = this;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, generateTestForAllWalletTypes(t, currentDevice, function (currentWallet) { return __awaiter(_this, void 0, void 0, function () {
                                    var e_5;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                _a.trys.push([0, 2, , 3]);
                                                return [4 /*yield*/, bc.getIsAddressValid(currentDevice, currentWallet.type, currentWallet.signature + "BAD")];
                                            case 1:
                                                _a.sent();
                                                return [3 /*break*/, 3];
                                            case 2:
                                                e_5 = _a.sent();
                                                t["true"](e_5.errorCode !== undefined);
                                                return [3 /*break*/, 3];
                                            case 3: return [2 /*return*/];
                                        }
                                    });
                                }); })];
                            case 1:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                }); })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
