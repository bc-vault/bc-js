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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
exports.__esModule = true;
var axios_1 = require("axios");
var types_1 = require("./types");
var es6_promise_1 = require("es6-promise");
es6_promise_1.polyfill();
exports.Host = "https://localhost.bc-vault.com:1991/";
function getResponsePromised(endpoint, data) {
    return new Promise(function (res, rej) {
        var options = {
            baseURL: exports.Host,
            data: JSON.stringify((data === undefined ? {} : data)),
            method: "POST",
            url: endpoint
        };
        axios_1["default"](options).then(function (response) {
            var htpr = { status: response.status, body: response.data };
            if (response.status !== 200)
                return rej(new types_1.DaemonError(htpr));
            res(htpr);
        })["catch"](function (e) {
            rej(e);
        });
    });
}
function assertIsBCHttpResponse(httpr) {
    if (httpr.body.errorCode !== 0x9000)
        throw new types_1.DaemonError(httpr.body);
}
//** Is BCData object polling already taking place? */
exports.isPolling = false;
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
function startObjectPolling(deviceInterval) {
    if (deviceInterval === void 0) { deviceInterval = 150; }
    if (exports.isPolling)
        throw "Already polling!";
    exports.isPolling = true;
    //pollBCObject(fullInterval);
    pollDevicesChanged(deviceInterval);
}
exports.startObjectPolling = startObjectPolling;
function getWallets(deviceID, activeTypes) {
    return __awaiter(this, void 0, void 0, function () {
        var e_1, _a, e_2, _b, ret, activeTypes_1, activeTypes_1_1, x, walletsOfXType, walletsOfXType_1, walletsOfXType_1_1, wallet, e_1_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    ret = [];
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 6, 7, 8]);
                    activeTypes_1 = __values(activeTypes), activeTypes_1_1 = activeTypes_1.next();
                    _c.label = 2;
                case 2:
                    if (!!activeTypes_1_1.done) return [3 /*break*/, 5];
                    x = activeTypes_1_1.value;
                    return [4 /*yield*/, getWalletsOfType(deviceID, x)];
                case 3:
                    walletsOfXType = _c.sent();
                    try {
                        for (walletsOfXType_1 = __values(walletsOfXType), walletsOfXType_1_1 = walletsOfXType_1.next(); !walletsOfXType_1_1.done; walletsOfXType_1_1 = walletsOfXType_1.next()) {
                            wallet = walletsOfXType_1_1.value;
                            ret.push({ publicKey: wallet, walletType: x });
                        }
                    }
                    catch (e_2_1) { e_2 = { error: e_2_1 }; }
                    finally {
                        try {
                            if (walletsOfXType_1_1 && !walletsOfXType_1_1.done && (_b = walletsOfXType_1["return"])) _b.call(walletsOfXType_1);
                        }
                        finally { if (e_2) throw e_2.error; }
                    }
                    _c.label = 4;
                case 4:
                    activeTypes_1_1 = activeTypes_1.next();
                    return [3 /*break*/, 2];
                case 5: return [3 /*break*/, 8];
                case 6:
                    e_1_1 = _c.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 8];
                case 7:
                    try {
                        if (activeTypes_1_1 && !activeTypes_1_1.done && (_a = activeTypes_1["return"])) _a.call(activeTypes_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/, ret];
            }
        });
    });
}
function arraysEqual(a, b) {
    var equal = a.length === b.length;
    for (var i = 0; i < a.length && equal; i++) {
        equal = a[i] === b[i];
    }
    return equal;
}
var lastSeenDevices = [];
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
function triggerManualUpdate(fullUpdate) {
    if (fullUpdate === void 0) { fullUpdate = true; }
    return __awaiter(this, void 0, void 0, function () {
        var e_3, _a, devArray, devs, devArray_1, devArray_1_1, deviceID, activeTypes, e_4, _b, _c, _d, _e, _f, _g, e_3_1, devices;
        return __generator(this, function (_h) {
            switch (_h.label) {
                case 0:
                    if (!fullUpdate) return [3 /*break*/, 19];
                    return [4 /*yield*/, getDevices()];
                case 1:
                    devArray = _h.sent();
                    devs = [];
                    FireAllListeners(1);
                    _h.label = 2;
                case 2:
                    _h.trys.push([2, 16, 17, 18]);
                    devArray_1 = __values(devArray), devArray_1_1 = devArray_1.next();
                    _h.label = 3;
                case 3:
                    if (!!devArray_1_1.done) return [3 /*break*/, 15];
                    deviceID = devArray_1_1.value;
                    activeTypes = void 0;
                    _h.label = 4;
                case 4:
                    _h.trys.push([4, 6, , 9]);
                    return [4 /*yield*/, getActiveWalletTypes(deviceID)];
                case 5:
                    activeTypes = _h.sent();
                    return [3 /*break*/, 9];
                case 6:
                    e_4 = _h.sent();
                    if (!(e_4.BCHttpResponse !== undefined)) return [3 /*break*/, 8];
                    _c = (_b = devs).push;
                    _d = {
                        id: deviceID,
                        space: { available: 1, complete: 1 }
                    };
                    return [4 /*yield*/, getFirmwareVersion(deviceID)];
                case 7:
                    _c.apply(_b, [(_d.firmware = _h.sent(),
                            _d.supportedTypes = [],
                            _d.activeTypes = [],
                            _d.activeWallets = [],
                            _d.locked = true,
                            _d)]);
                    return [3 /*break*/, 14];
                case 8: throw e_4;
                case 9:
                    _f = (_e = devs).push;
                    _g = {
                        id: deviceID
                    };
                    return [4 /*yield*/, getAvailableSpace(deviceID)];
                case 10:
                    _g.space = _h.sent();
                    return [4 /*yield*/, getFirmwareVersion(deviceID)];
                case 11:
                    _g.firmware = _h.sent();
                    return [4 /*yield*/, getSupportedWalletTypes(deviceID)];
                case 12:
                    _g.supportedTypes = _h.sent(),
                        _g.activeTypes = activeTypes;
                    return [4 /*yield*/, getWallets(deviceID, activeTypes)];
                case 13:
                    _f.apply(_e, [(_g.activeWallets = _h.sent(),
                            _g.locked = false,
                            _g)]);
                    _h.label = 14;
                case 14:
                    devArray_1_1 = devArray_1.next();
                    return [3 /*break*/, 3];
                case 15: return [3 /*break*/, 18];
                case 16:
                    e_3_1 = _h.sent();
                    e_3 = { error: e_3_1 };
                    return [3 /*break*/, 18];
                case 17:
                    try {
                        if (devArray_1_1 && !devArray_1_1.done && (_a = devArray_1["return"])) _a.call(devArray_1);
                    }
                    finally { if (e_3) throw e_3.error; }
                    return [7 /*endfinally*/];
                case 18:
                    exports.BCData = { devices: devs };
                    FireAllListeners(0);
                    return [3 /*break*/, 22];
                case 19:
                    devices = void 0;
                    return [4 /*yield*/, getDevices()];
                case 20:
                    devices = _h.sent();
                    if (!!arraysEqual(devices, lastSeenDevices)) return [3 /*break*/, 22];
                    lastSeenDevices = devices;
                    return [4 /*yield*/, triggerManualUpdate(true)];
                case 21:
                    _h.sent();
                    _h.label = 22;
                case 22: return [2 /*return*/];
            }
        });
    });
}
exports.triggerManualUpdate = triggerManualUpdate;
//async function pollBCObject(interval:number){ Todo fix this
//await triggerManualUpdate();
//setTimeout(()=>pollBCObject(interval),interval);
//}
function pollDevicesChanged(interval) {
    return __awaiter(this, void 0, void 0, function () {
        var e_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, triggerManualUpdate(false)];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    e_5 = _a.sent();
                    FireAllListeners(-1);
                    console.error(e_5);
                    return [3 /*break*/, 3];
                case 3:
                    setTimeout(function () { return pollDevicesChanged(interval); }, interval);
                    return [2 /*return*/];
            }
        });
    });
}
function FireAllListeners() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var e_6, _a;
    try {
        for (var listeners_1 = __values(listeners), listeners_1_1 = listeners_1.next(); !listeners_1_1.done; listeners_1_1 = listeners_1.next()) {
            var listener = listeners_1_1.value;
            listener.call.apply(listener, __spread([null], args));
        }
    }
    catch (e_6_1) { e_6 = { error: e_6_1 }; }
    finally {
        try {
            if (listeners_1_1 && !listeners_1_1.done && (_a = listeners_1["return"])) _a.call(listeners_1);
        }
        finally { if (e_6) throw e_6.error; }
    }
}
/** The current state of the daemon, updated either manually or on device connect/disconnect after calling startObjectPolling  */
exports.BCData = { devices: [] };
var listeners = [];
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
function AddBCDataChangedListener(func) {
    listeners.push(func);
}
exports.AddBCDataChangedListener = AddBCDataChangedListener;
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
function getWalletTypeInfo(id) {
    return types_1.typeInfoMap.find(function (x) { return x.type == id; });
}
exports.getWalletTypeInfo = getWalletTypeInfo;
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
function getDevices() {
    return __awaiter(this, void 0, void 0, function () {
        var httpr;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getResponsePromised(types_1.Endpoint.Devices)];
                case 1:
                    httpr = _a.sent();
                    assertIsBCHttpResponse(httpr);
                    return [2 /*return*/, httpr.body.data];
            }
        });
    });
}
exports.getDevices = getDevices;
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
function getFirmwareVersion(device) {
    return __awaiter(this, void 0, void 0, function () {
        var httpr;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getResponsePromised(types_1.Endpoint.FirmwareVersion, { device: device })];
                case 1:
                    httpr = _a.sent();
                    assertIsBCHttpResponse(httpr);
                    return [2 /*return*/, httpr.body.data];
            }
        });
    });
}
exports.getFirmwareVersion = getFirmwareVersion;
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
function getWalletBalance(walletType, sourcePublicID) {
    return __awaiter(this, void 0, void 0, function () {
        var httpr;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getResponsePromised(types_1.Endpoint.GetWalletBalance, { walletType: walletType, sourcePublicID: sourcePublicID })];
                case 1:
                    httpr = _a.sent();
                    assertIsBCHttpResponse(httpr);
                    return [2 /*return*/, httpr.body.data];
            }
        });
    });
}
exports.getWalletBalance = getWalletBalance;
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
function getAvailableSpace(device) {
    return __awaiter(this, void 0, void 0, function () {
        var httpr;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getResponsePromised(types_1.Endpoint.AvailableSpace, { device: device })];
                case 1:
                    httpr = _a.sent();
                    assertIsBCHttpResponse(httpr);
                    return [2 /*return*/, httpr.body.data];
            }
        });
    });
}
exports.getAvailableSpace = getAvailableSpace;
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
function getSupportedWalletTypes(device) {
    return __awaiter(this, void 0, void 0, function () {
        var httpr;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getResponsePromised(types_1.Endpoint.WalletTypes, { device: device })];
                case 1:
                    httpr = _a.sent();
                    assertIsBCHttpResponse(httpr);
                    return [2 /*return*/, httpr.body.data];
            }
        });
    });
}
exports.getSupportedWalletTypes = getSupportedWalletTypes;
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
function getActiveWalletTypes(device) {
    return __awaiter(this, void 0, void 0, function () {
        var httpr;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getResponsePromised(types_1.Endpoint.SavedWalletTypes, { device: device })];
                case 1:
                    httpr = _a.sent();
                    assertIsBCHttpResponse(httpr);
                    return [2 /*return*/, httpr.body.data];
            }
        });
    });
}
exports.getActiveWalletTypes = getActiveWalletTypes;
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
function getWalletsOfType(device, type) {
    return __awaiter(this, void 0, void 0, function () {
        var httpr;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getResponsePromised(types_1.Endpoint.WalletsOfType, { device: device, walletType: type })];
                case 1:
                    httpr = _a.sent();
                    assertIsBCHttpResponse(httpr);
                    return [2 /*return*/, httpr.body.data];
            }
        });
    });
}
exports.getWalletsOfType = getWalletsOfType;
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
function getWalletUserData(device, type, publicAddress) {
    return __awaiter(this, void 0, void 0, function () {
        var httpr;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getResponsePromised(types_1.Endpoint.WalletUserData, { device: device, walletType: type, sourcePublicID: publicAddress })];
                case 1:
                    httpr = _a.sent();
                    assertIsBCHttpResponse(httpr);
                    return [2 /*return*/, httpr.body.data];
            }
        });
    });
}
exports.getWalletUserData = getWalletUserData;
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
function CopyWalletToType(device, oldType, newType, publicAddress) {
    return __awaiter(this, void 0, void 0, function () {
        var httpr;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getResponsePromised(types_1.Endpoint.CopyWalletToType, { device: device, walletType: oldType, newWalletType: newType, sourcePublicID: publicAddress })];
                case 1:
                    httpr = _a.sent();
                    assertIsBCHttpResponse(httpr);
                    return [2 /*return*/, true];
            }
        });
    });
}
exports.CopyWalletToType = CopyWalletToType;
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
function getIsAddressValid(device, type, publicAddress) {
    return __awaiter(this, void 0, void 0, function () {
        var httpr;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getResponsePromised(types_1.Endpoint.IsAddressValid, { device: device, walletType: type, address: publicAddress })];
                case 1:
                    httpr = _a.sent();
                    return [2 /*return*/, httpr.body.errorCode === 0x9000];
            }
        });
    });
}
exports.getIsAddressValid = getIsAddressValid;
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
function DisplayAddressOnDevice(device, type, publicAddress) {
    return __awaiter(this, void 0, void 0, function () {
        var httpr;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getResponsePromised(types_1.Endpoint.DisplayAddress, { device: device, walletType: type, publicID: publicAddress })];
                case 1:
                    httpr = _a.sent();
                    assertIsBCHttpResponse(httpr);
                    return [2 /*return*/, true];
            }
        });
    });
}
exports.DisplayAddressOnDevice = DisplayAddressOnDevice;
function showAuthPopup(id) {
    return new Promise(function (res) {
        var isIE = window.ActiveXObject || "ActiveXObject" in window;
        var target;
        if (isIE) {
            window.showModalDialog("https://localhost.bc-vault.com:1991/PasswordInput?channelID=" + id);
            parent.postMessage("OKAY", "*");
            res();
        }
        else {
            target = window.open("https://localhost.bc-vault.com:1991/PasswordInput?channelID=" + id, "_blank", "location=no,menubar=no,resizable=no,scrollbars=no,status=no,toolbar=no,centerscreen=yes,width=750,height:500");
            if (target === null)
                throw TypeError("Could not create popup!");
            var timer_1 = setInterval(function () {
                if (target.closed) {
                    clearInterval(timer_1);
                    res();
                }
            }, 500);
        }
    });
}
function getSecureWindowResponse() {
    var _this = this;
    return new Promise(function (res) { return __awaiter(_this, void 0, void 0, function () {
        var x, id;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getResponsePromised(types_1.Endpoint.GetAuthID)];
                case 1:
                    x = _a.sent();
                    id = x.body;
                    return [4 /*yield*/, showAuthPopup(id)];
                case 2:
                    _a.sent();
                    res(id);
                    return [2 /*return*/];
            }
        });
    }); });
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
function GenerateWallet(device, type) {
    return __awaiter(this, void 0, void 0, function () {
        var id, httpr;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getSecureWindowResponse()];
                case 1:
                    id = _a.sent();
                    return [4 /*yield*/, getResponsePromised(types_1.Endpoint.GenerateWallet, { device: device, walletType: type, password: id })];
                case 2:
                    httpr = _a.sent();
                    assertIsBCHttpResponse(httpr);
                    return [2 /*return*/, httpr.body.data];
            }
        });
    });
}
exports.GenerateWallet = GenerateWallet;
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
function EnterGlobalPin(device) {
    return __awaiter(this, void 0, void 0, function () {
        var id, httpr;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getSecureWindowResponse()];
                case 1:
                    id = _a.sent();
                    console.log("Got pin popup:" + id);
                    return [4 /*yield*/, getResponsePromised(types_1.Endpoint.EnterGlobalPin, { device: device, password: id })];
                case 2:
                    httpr = _a.sent();
                    assertIsBCHttpResponse(httpr);
                    triggerManualUpdate();
                    return [2 /*return*/];
            }
        });
    });
}
exports.EnterGlobalPin = EnterGlobalPin;
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
function GenerateTransaction(device, type, data) {
    return __awaiter(this, void 0, void 0, function () {
        var id, httpr;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getSecureWindowResponse()];
                case 1:
                    id = _a.sent();
                    console.log("Got auth id:" + id);
                    console.log("Sending object:" + JSON.stringify({ device: device, walletType: type, transaction: data, password: id }));
                    return [4 /*yield*/, getResponsePromised(types_1.Endpoint.GenerateTransaction, { device: device, walletType: type, transaction: data, password: id })];
                case 2:
                    httpr = _a.sent();
                    console.log(httpr.body);
                    assertIsBCHttpResponse(httpr);
                    return [2 /*return*/, httpr.body["data"]];
            }
        });
    });
}
exports.GenerateTransaction = GenerateTransaction;
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
function SignData(device, type, publicAddress, data) {
    return __awaiter(this, void 0, void 0, function () {
        var id, httpr;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getSecureWindowResponse()];
                case 1:
                    id = _a.sent();
                    console.log("Got auth id:" + id);
                    console.log("Sending object:" + JSON.stringify({ device: device, walletType: type, sourcePublicID: publicAddress, srcData: data, password: id }));
                    return [4 /*yield*/, getResponsePromised(types_1.Endpoint.SignData, { device: device, walletType: type, sourcePublicID: publicAddress, srcData: data, password: id })];
                case 2:
                    httpr = _a.sent();
                    console.log(httpr.body);
                    assertIsBCHttpResponse(httpr);
                    return [2 /*return*/, httpr.body["data"]];
            }
        });
    });
}
exports.SignData = SignData;
function web3_GetAccounts(cb) {
    return __awaiter(this, void 0, void 0, function () {
        var devices, wallets, e_7, wallets, e_8;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 9, , 10]);
                    return [4 /*yield*/, getDevices()];
                case 1:
                    devices = _a.sent();
                    if (devices.length === 0)
                        return [2 /*return*/, cb("No BC Vault connected")];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 8]);
                    return [4 /*yield*/, getWalletsOfType(devices[0], types_1.WalletType.ethereum)];
                case 3:
                    wallets = _a.sent();
                    cb(null, wallets.map(function (x) { return "0x" + x; }));
                    return [3 /*break*/, 8];
                case 4:
                    e_7 = _a.sent();
                    if (!(e_7.BCHttpResponse !== undefined)) return [3 /*break*/, 7];
                    //unlock BC Vault!
                    return [4 /*yield*/, EnterGlobalPin(devices[0])];
                case 5:
                    //unlock BC Vault!
                    _a.sent();
                    return [4 /*yield*/, getWalletsOfType(devices[0], types_1.WalletType.ethereum)];
                case 6:
                    wallets = _a.sent();
                    return [2 /*return*/, cb(null, wallets.map(function (x) { return "0x" + x; }))];
                case 7: return [3 /*break*/, 8];
                case 8: return [3 /*break*/, 10];
                case 9:
                    e_8 = _a.sent();
                    cb(e_8, null);
                    return [3 /*break*/, 10];
                case 10: return [2 /*return*/];
            }
        });
    });
}
exports.web3_GetAccounts = web3_GetAccounts;
function web3_signTransaction(txParams, cb) {
    return __awaiter(this, void 0, void 0, function () {
        var devices, txHex, e_9;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, getDevices()];
                case 1:
                    devices = _a.sent();
                    if (devices.length === 0)
                        return [2 /*return*/, cb("No BC Vault connected")];
                    txParams.feePrice = txParams.gasPrice;
                    txParams.feeCount = txParams.gas;
                    txParams.amount = txParams.value;
                    return [4 /*yield*/, GenerateTransaction(devices[0], types_1.WalletType.ethereum, txParams)];
                case 2:
                    txHex = _a.sent();
                    cb(null, txHex);
                    return [3 /*break*/, 4];
                case 3:
                    e_9 = _a.sent();
                    cb(e_9, null);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.web3_signTransaction = web3_signTransaction;
function web3_signPersonalMessage(msgParams, cb) {
    return __awaiter(this, void 0, void 0, function () {
        var devices, signedMessage, e_10;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, getDevices()];
                case 1:
                    devices = _a.sent();
                    if (devices.length === 0)
                        return [2 /*return*/, cb("No BC Vault connected")];
                    return [4 /*yield*/, SignData(devices[0], types_1.WalletType.ethereum, msgParams.from, msgParams.data)];
                case 2:
                    signedMessage = _a.sent();
                    cb(null, signedMessage);
                    return [3 /*break*/, 4];
                case 3:
                    e_10 = _a.sent();
                    cb(e_10, null);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.web3_signPersonalMessage = web3_signPersonalMessage;
function web3_Inject(web3Instance) {
    web3Instance.eth.signTransaction = web3_signTransaction;
    web3Instance.eth.getAccounts = web3_GetAccounts;
    web3Instance.personal.sign = web3_signPersonalMessage;
}
exports.web3_Inject = web3_Inject;
