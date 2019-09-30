"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
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
var sha3_1 = require("sha3");
var es6_promise_1 = require("es6-promise");
es6_promise_1.polyfill();
var API_VERSION = 1;
exports.Host = "https://localhost.bc-vault.com:1991/";
var endpointAllowsCredentials;
function getNewSession() {
    return __awaiter(this, void 0, void 0, function () {
        var scp, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    scp = {
                        sessionType: exports.authTokenUseCookies ? types_1.SessionAuthType.any : types_1.SessionAuthType.token,
                        expireSeconds: exports.authTokenExpireSeconds,
                        matchPath: exports.authTokenMatchPath,
                        versionNumber: API_VERSION
                    };
                    return [4 /*yield*/, axios_1["default"]({
                            baseURL: exports.Host,
                            method: "POST",
                            url: 'SetBCSessionParams',
                            withCredentials: true,
                            data: scp,
                            headers: { "Api-Version": API_VERSION }
                        })];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data.d_token];
            }
        });
    });
}
function getResponsePromised(endpoint, data) {
    var _this = this;
    var dataWithToken = __assign({}, (data || {}), { d_token: exports.authToken });
    return new Promise(function (res, rej) { return __awaiter(_this, void 0, void 0, function () {
        var methodCheck, e_1, options, responseFunction;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(endpointAllowsCredentials === undefined)) return [3 /*break*/, 4];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, axios_1["default"]({ baseURL: exports.Host, data: "{}", method: "POST", url: "/Devices" })];
                case 2:
                    methodCheck = _a.sent();
                    endpointAllowsCredentials = methodCheck.data.daemonError === types_1.DaemonErrorCodes.sessionError;
                    return [3 /*break*/, 4];
                case 3:
                    e_1 = _a.sent();
                    log("Daemon offline during initialization.", types_1.LogLevel.debug);
                    return [3 /*break*/, 4];
                case 4:
                    options = {
                        baseURL: exports.Host,
                        data: JSON.stringify(dataWithToken),
                        method: "POST",
                        url: endpoint
                    };
                    if (endpointAllowsCredentials && exports.authTokenUseCookies) {
                        options.withCredentials = true;
                        options.headers = { "Api-Version": API_VERSION };
                    }
                    responseFunction = function (response) { return __awaiter(_this, void 0, void 0, function () {
                        var htpr;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    htpr = { status: response.status, body: response.data };
                                    if (!(response.data.daemonError === types_1.DaemonErrorCodes.sessionError)) return [3 /*break*/, 2];
                                    log("Creating new session.", types_1.LogLevel.debug);
                                    return [4 /*yield*/, getNewSession()];
                                case 1:
                                    exports.authToken = _a.sent();
                                    log("New session created: " + exports.authToken, types_1.LogLevel.debug);
                                    options.data = JSON.stringify(__assign({}, dataWithToken, { d_token: exports.authToken }));
                                    axios_1["default"](options).then(function (authenticatedResponse) {
                                        if (authenticatedResponse.data.daemonError) {
                                            return rej(new types_1.DaemonError({ status: authenticatedResponse.status, body: authenticatedResponse.data }));
                                        }
                                        else {
                                            return res({ status: authenticatedResponse.status, body: authenticatedResponse.data });
                                        }
                                    })["catch"](function (e) {
                                        log("Daemon request failed: " + JSON.stringify(e), types_1.LogLevel.warning);
                                        rej(e);
                                    });
                                    return [2 /*return*/];
                                case 2:
                                    if (response.status !== 200)
                                        return [2 /*return*/, rej(new types_1.DaemonError(htpr))];
                                    res(htpr);
                                    return [2 /*return*/];
                            }
                        });
                    }); };
                    axios_1["default"](options).then(responseFunction)["catch"](function (e) {
                        log("Daemon request failed: " + JSON.stringify(e), types_1.LogLevel.warning);
                        rej(e);
                    });
                    return [2 /*return*/];
            }
        });
    }); });
}
function assertIsBCHttpResponse(httpr) {
    if (httpr.body.errorCode !== 0x9000)
        throw new types_1.DaemonError(httpr.body);
}
function log(msg, level) {
    if (level === void 0) { level = types_1.LogLevel.verbose; }
    if (exports.logLevel <= level) {
        console.log('[' + new Date(Date.now()).toLocaleTimeString() + ']: ' + msg);
    }
}
/** Is BCData object polling already taking place? */
exports.isPolling = false;
/** Set Logging verbosity */
exports.logLevel = types_1.LogLevel.debug;
/** Use cookies for session management. If set to false no cookies will be set and the session will be lost when 'authToken' is unloaded. It will need to be manually specified. It will be automatically refreshed if a request fails due to a token error. */
exports.authTokenUseCookies = true;
/** How long each auth grant will last in seconds since the last request. */
exports.authTokenExpireSeconds = 3600;
/** The path to match the auth-token against. This is a security feature and allows you to fine tune access. Default is: '/' (web root) */
exports.authTokenMatchPath = '/';
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
        throw Error("Already polling!");
    exports.isPolling = true;
    // pollBCObject(fullInterval);
    pollDevicesChanged(deviceInterval);
}
exports.startObjectPolling = startObjectPolling;
function getWallets(deviceID, activeTypes) {
    return __awaiter(this, void 0, void 0, function () {
        var e_2, _a, e_3, _b, ret, activeTypes_1, activeTypes_1_1, x, walletsOfXType, walletsOfXType_1, walletsOfXType_1_1, wallet, e_2_1;
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
                    catch (e_3_1) { e_3 = { error: e_3_1 }; }
                    finally {
                        try {
                            if (walletsOfXType_1_1 && !walletsOfXType_1_1.done && (_b = walletsOfXType_1["return"])) _b.call(walletsOfXType_1);
                        }
                        finally { if (e_3) throw e_3.error; }
                    }
                    _c.label = 4;
                case 4:
                    activeTypes_1_1 = activeTypes_1.next();
                    return [3 /*break*/, 2];
                case 5: return [3 /*break*/, 8];
                case 6:
                    e_2_1 = _c.sent();
                    e_2 = { error: e_2_1 };
                    return [3 /*break*/, 8];
                case 7:
                    try {
                        if (activeTypes_1_1 && !activeTypes_1_1.done && (_a = activeTypes_1["return"])) _a.call(activeTypes_1);
                    }
                    finally { if (e_2) throw e_2.error; }
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
        var e_4, _a, devArray, devs, devArray_1, devArray_1_1, deviceID, activeTypes, e_5, _b, _c, _d, _e, _f, _g, e_4_1, devices;
        return __generator(this, function (_h) {
            switch (_h.label) {
                case 0:
                    if (!fullUpdate) return [3 /*break*/, 21];
                    return [4 /*yield*/, getDevices()];
                case 1:
                    devArray = _h.sent();
                    devs = [];
                    FireAllListeners(1);
                    _h.label = 2;
                case 2:
                    _h.trys.push([2, 18, 19, 20]);
                    devArray_1 = __values(devArray), devArray_1_1 = devArray_1.next();
                    _h.label = 3;
                case 3:
                    if (!!devArray_1_1.done) return [3 /*break*/, 17];
                    deviceID = devArray_1_1.value;
                    activeTypes = void 0;
                    _h.label = 4;
                case 4:
                    _h.trys.push([4, 6, , 10]);
                    return [4 /*yield*/, getActiveWalletTypes(deviceID)];
                case 5:
                    activeTypes = _h.sent();
                    return [3 /*break*/, 10];
                case 6:
                    e_5 = _h.sent();
                    if (!(e_5.BCHttpResponse !== undefined)) return [3 /*break*/, 9];
                    _c = (_b = devs).push;
                    _d = {
                        id: deviceID,
                        space: { available: 1, complete: 1 }
                    };
                    return [4 /*yield*/, getFirmwareVersion(deviceID)];
                case 7:
                    _d.firmware = _h.sent();
                    return [4 /*yield*/, getWalletUserData(deviceID, types_1.WalletType.none, "")];
                case 8:
                    _c.apply(_b, [(_d.userData = _h.sent(),
                            _d.supportedTypes = [],
                            _d.activeTypes = [],
                            _d.activeWallets = [],
                            _d.locked = true,
                            _d)]);
                    return [3 /*break*/, 16];
                case 9: throw e_5;
                case 10:
                    _f = (_e = devs).push;
                    _g = {
                        id: deviceID
                    };
                    return [4 /*yield*/, getAvailableSpace(deviceID)];
                case 11:
                    _g.space = _h.sent();
                    return [4 /*yield*/, getFirmwareVersion(deviceID)];
                case 12:
                    _g.firmware = _h.sent();
                    return [4 /*yield*/, getSupportedWalletTypes(deviceID)];
                case 13:
                    _g.supportedTypes = _h.sent();
                    return [4 /*yield*/, getWalletUserData(deviceID, types_1.WalletType.none, "")];
                case 14:
                    _g.userData = _h.sent(),
                        _g.activeTypes = activeTypes;
                    return [4 /*yield*/, getWallets(deviceID, activeTypes)];
                case 15:
                    _f.apply(_e, [(_g.activeWallets = _h.sent(),
                            _g.locked = false,
                            _g)]);
                    _h.label = 16;
                case 16:
                    devArray_1_1 = devArray_1.next();
                    return [3 /*break*/, 3];
                case 17: return [3 /*break*/, 20];
                case 18:
                    e_4_1 = _h.sent();
                    e_4 = { error: e_4_1 };
                    return [3 /*break*/, 20];
                case 19:
                    try {
                        if (devArray_1_1 && !devArray_1_1.done && (_a = devArray_1["return"])) _a.call(devArray_1);
                    }
                    finally { if (e_4) throw e_4.error; }
                    return [7 /*endfinally*/];
                case 20:
                    exports.BCData = { devices: devs };
                    FireAllListeners(0);
                    return [3 /*break*/, 24];
                case 21:
                    devices = void 0;
                    return [4 /*yield*/, getDevices()];
                case 22:
                    devices = _h.sent();
                    if (!!arraysEqual(devices, lastSeenDevices)) return [3 /*break*/, 24];
                    lastSeenDevices = devices;
                    return [4 /*yield*/, triggerManualUpdate(true)];
                case 23:
                    _h.sent();
                    _h.label = 24;
                case 24: return [2 /*return*/];
            }
        });
    });
}
exports.triggerManualUpdate = triggerManualUpdate;
// async function pollBCObject(interval:number){ Todo fix this
// await triggerManualUpdate();
// setTimeout(()=>pollBCObject(interval),interval);
// }
function pollDevicesChanged(interval) {
    return __awaiter(this, void 0, void 0, function () {
        var e_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, triggerManualUpdate(false)];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    e_6 = _a.sent();
                    FireAllListeners(-1);
                    console.error(e_6);
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
    var e_7, _a;
    try {
        for (var listeners_1 = __values(listeners), listeners_1_1 = listeners_1.next(); !listeners_1_1.done; listeners_1_1 = listeners_1.next()) {
            var listener = listeners_1_1.value;
            listener.call.apply(listener, __spread([null], args));
        }
    }
    catch (e_7_1) { e_7 = { error: e_7_1 }; }
    finally {
        try {
            if (listeners_1_1 && !listeners_1_1.done && (_a = listeners_1["return"])) _a.call(listeners_1);
        }
        finally { if (e_7) throw e_7.error; }
    }
}
function toLegacyWalletType(t) {
    var stringId;
    for (var typeProperty in types_1.WalletType) {
        if (types_1.WalletType[typeProperty] === t) {
            stringId = typeProperty;
        }
    }
    if (stringId === undefined) {
        return 2147483646;
    }
    for (var legacyTypeProperty in types_1.WalletType_Legacy) {
        if (legacyTypeProperty === stringId) {
            return types_1.WalletType_Legacy[legacyTypeProperty];
        }
    }
    return 2147483646;
}
function fromLegacyWalletType(t) {
    var stringId;
    for (var legacyTypeProperty in types_1.WalletType_Legacy) {
        if (types_1.WalletType_Legacy[legacyTypeProperty] === t) {
            stringId = legacyTypeProperty;
        }
    }
    if (stringId === undefined) {
        return "Unknown:" + t;
    }
    for (var typeProperty in types_1.WalletType) {
        if (typeProperty === stringId) {
            return types_1.WalletType[typeProperty];
        }
    }
    return "Unknown:" + t;
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
function getWalletTypeInfo(id) {
    return types_1.typeInfoMap.find(function (x) { return x.type === id; });
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
function getWalletBalance(type, sourcePublicID) {
    return __awaiter(this, void 0, void 0, function () {
        var httpr;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getResponsePromised(types_1.Endpoint.GetWalletBalance, { walletType: toLegacyWalletType(type), walletTypeString: type, sourcePublicID: sourcePublicID })];
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
function getSupportedWalletTypes(device) {
    return __awaiter(this, void 0, void 0, function () {
        var httpr, newFormat;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getResponsePromised(types_1.Endpoint.WalletTypes, { device: device })];
                case 1:
                    httpr = _a.sent();
                    assertIsBCHttpResponse(httpr);
                    newFormat = httpr.body.data;
                    if (typeof (newFormat[0]) === typeof (1)) {
                        newFormat = newFormat.map(function (x) { return fromLegacyWalletType(x); });
                    }
                    return [2 /*return*/, newFormat];
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
function getActiveWalletTypes(device) {
    return __awaiter(this, void 0, void 0, function () {
        var httpr, newFormat;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getResponsePromised(types_1.Endpoint.SavedWalletTypes, { device: device })];
                case 1:
                    httpr = _a.sent();
                    assertIsBCHttpResponse(httpr);
                    newFormat = httpr.body.data;
                    if (typeof (newFormat[0]) === typeof (1)) {
                        newFormat = newFormat.map(function (x) { return fromLegacyWalletType(x); });
                    }
                    return [2 /*return*/, newFormat];
            }
        });
    });
}
exports.getActiveWalletTypes = getActiveWalletTypes;
/**
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
function getWalletsOfType(device, type) {
    return __awaiter(this, void 0, void 0, function () {
        var httpr;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getResponsePromised(types_1.Endpoint.WalletsOfType, { device: device, walletType: toLegacyWalletType(type), walletTypeString: type })];
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
function getWalletUserData(device, type, publicAddress, parseHex) {
    if (parseHex === void 0) { parseHex = true; }
    return __awaiter(this, void 0, void 0, function () {
        var httpr, responseString, responseStringArray, byteArrayStr, i;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getResponsePromised(types_1.Endpoint.WalletUserData, { device: device, walletType: toLegacyWalletType(type), walletTypeString: type, sourcePublicID: publicAddress })];
                case 1:
                    httpr = _a.sent();
                    assertIsBCHttpResponse(httpr);
                    responseString = httpr.body.data;
                    if (parseHex && responseString.length % 2 === 0) {
                        responseString = responseString.substr(2); //remove 0x
                        responseStringArray = __spread(responseString);
                        byteArrayStr = [];
                        for (i = 0; i < responseStringArray.length; i += 2) {
                            byteArrayStr.push(parseInt(responseStringArray[i] + responseStringArray[i + 1], 16));
                        }
                        responseString = String.fromCharCode.apply(String, __spread(byteArrayStr));
                    }
                    return [2 /*return*/, responseString];
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
function CopyWalletToType(device, oldType, newType, publicAddress) {
    return __awaiter(this, void 0, void 0, function () {
        var httpr, id;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getSecureWindowResponse(types_1.PasswordType.WalletPassword)];
                case 1:
                    id = _a.sent();
                    return [4 /*yield*/, getResponsePromised(types_1.Endpoint.CopyWalletToType, { device: device, walletType: toLegacyWalletType(oldType), walletTypeString: newType, newWalletType: toLegacyWalletType(newType), newWalletTypeString: newType, sourcePublicID: publicAddress, password: id })];
                case 2:
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
function getIsAddressValid(device, type, publicAddress) {
    return __awaiter(this, void 0, void 0, function () {
        var httpr;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getResponsePromised(types_1.Endpoint.IsAddressValid, { device: device, walletType: toLegacyWalletType(type), walletTypeString: type, address: publicAddress })];
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
function DisplayAddressOnDevice(device, type, publicAddress) {
    return __awaiter(this, void 0, void 0, function () {
        var httpr;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getResponsePromised(types_1.Endpoint.DisplayAddress, { device: device, walletType: toLegacyWalletType(type), walletTypeString: type, publicID: publicAddress })];
                case 1:
                    httpr = _a.sent();
                    assertIsBCHttpResponse(httpr);
                    return [2 /*return*/, true];
            }
        });
    });
}
exports.DisplayAddressOnDevice = DisplayAddressOnDevice;
function showAuthPopup(id, passwordType) {
    return new Promise(function (res) {
        var isIE = window.ActiveXObject || "ActiveXObject" in window;
        var target;
        if (isIE) {
            window.showModalDialog("https://localhost.bc-vault.com:1991/PasswordInput?channelID=" + id + "&channelPasswordType=" + passwordType);
            parent.postMessage("OKAY", "*");
            res();
        }
        else {
            target = window.open("https://localhost.bc-vault.com:1991/PasswordInput?channelID=" + id + "&channelPasswordType=" + passwordType, "_blank", "location=no,menubar=no,resizable=no,scrollbars=no,status=no,toolbar=no,centerscreen=yes,width=750,height:500");
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
function getSecureWindowResponse(passwordType) {
    var _this = this;
    return new Promise(function (res) { return __awaiter(_this, void 0, void 0, function () {
        var x, id;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getResponsePromised(types_1.Endpoint.GetAuthID)];
                case 1:
                    x = _a.sent();
                    id = x.body;
                    return [4 /*yield*/, showAuthPopup(id, passwordType)];
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
function GenerateWallet(device, type) {
    return __awaiter(this, void 0, void 0, function () {
        var id, httpr;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getSecureWindowResponse(types_1.PasswordType.WalletPassword)];
                case 1:
                    id = _a.sent();
                    return [4 /*yield*/, getResponsePromised(types_1.Endpoint.GenerateWallet, { device: device, walletType: toLegacyWalletType(type), walletTypeString: type, password: id })];
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
function EnterGlobalPin(device, passwordType) {
    if (passwordType === void 0) { passwordType = types_1.PasswordType.GlobalPassword; }
    return __awaiter(this, void 0, void 0, function () {
        var id, httpr;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getSecureWindowResponse(passwordType)];
                case 1:
                    id = _a.sent();
                    log("Got pin popup:" + id);
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
function GenerateTransaction(device, type, data, broadcast) {
    return __awaiter(this, void 0, void 0, function () {
        var id, httpr;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getSecureWindowResponse(types_1.PasswordType.WalletPassword)];
                case 1:
                    id = _a.sent();
                    log("Got auth id:" + id, types_1.LogLevel.debug);
                    log("Sending object:" + JSON.stringify({ device: device, walletType: toLegacyWalletType(type), walletTypeString: type, transaction: data, password: id }), types_1.LogLevel.debug);
                    return [4 /*yield*/, getResponsePromised(types_1.Endpoint.GenerateTransaction, { device: device, walletType: toLegacyWalletType(type), walletTypeString: type, transaction: data, password: id, broadcast: broadcast })];
                case 2:
                    httpr = _a.sent();
                    log(httpr.body, types_1.LogLevel.debug);
                    assertIsBCHttpResponse(httpr);
                    // i know.
                    // tslint:disable-next-line: no-string-literal
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
                case 0: return [4 /*yield*/, getSecureWindowResponse(types_1.PasswordType.WalletPassword)];
                case 1:
                    id = _a.sent();
                    log("Got auth id:" + id, types_1.LogLevel.debug);
                    log("Sending object:" + JSON.stringify({ device: device, walletType: toLegacyWalletType(type), walletTypeString: type, sourcePublicID: publicAddress, srcData: data, password: id }), types_1.LogLevel.debug);
                    return [4 /*yield*/, getResponsePromised(types_1.Endpoint.SignData, { device: device, walletType: toLegacyWalletType(type), walletTypeString: type, sourcePublicID: publicAddress, srcData: data, password: id })];
                case 2:
                    httpr = _a.sent();
                    log("Response body:" + httpr.body, types_1.LogLevel.debug);
                    assertIsBCHttpResponse(httpr);
                    // i know.
                    // tslint:disable-next-line: no-string-literal
                    return [2 /*return*/, httpr.body["data"]];
            }
        });
    });
}
exports.SignData = SignData;
function web3_GetAccounts(cb) {
    return __awaiter(this, void 0, void 0, function () {
        var devices, wallets, e_8, wallets, e_9;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 9, , 10]);
                    return [4 /*yield*/, getDevices()];
                case 1:
                    devices = _a.sent();
                    if (devices.length === 0) {
                        cb("No BC Vault connected");
                        return [2 /*return*/];
                    }
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 8]);
                    return [4 /*yield*/, getWalletsOfType(devices[0], types_1.WalletType.ethereum)];
                case 3:
                    wallets = _a.sent();
                    cb(null, wallets.map(function (x) { return "0x" + x; }));
                    return [3 /*break*/, 8];
                case 4:
                    e_8 = _a.sent();
                    if (!(e_8.BCHttpResponse !== undefined)) return [3 /*break*/, 7];
                    // unlock BC Vault!
                    return [4 /*yield*/, EnterGlobalPin(devices[0], types_1.PasswordType.GlobalPassword)];
                case 5:
                    // unlock BC Vault!
                    _a.sent();
                    return [4 /*yield*/, getWalletsOfType(devices[0], types_1.WalletType.ethereum)];
                case 6:
                    wallets = _a.sent();
                    return [2 /*return*/, cb(null, wallets.map(function (x) { return "0x" + x; }))];
                case 7: return [3 /*break*/, 8];
                case 8: return [3 /*break*/, 10];
                case 9:
                    e_9 = _a.sent();
                    cb(e_9, null);
                    return [3 /*break*/, 10];
                case 10: return [2 /*return*/];
            }
        });
    });
}
exports.web3_GetAccounts = web3_GetAccounts;
function strip0x(str) {
    if (str.startsWith('0x')) {
        return str.substr(2);
    }
    return str;
}
function toEtherCase(inputString) {
    var kec = new sha3_1.Keccak(256);
    kec.update(inputString.toLowerCase());
    var keccakArray = kec.digest('hex').split('');
    var upperCase = '89abcdef';
    return inputString.toLowerCase().split('').map(function (x, idx) {
        if (upperCase.indexOf(keccakArray[idx]) !== -1) {
            return x.toUpperCase();
        }
        return x;
    }).join('');
}
function web3_signTransaction(txParams, cb) {
    return __awaiter(this, void 0, void 0, function () {
        var devices, txHex, e_10;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, getDevices()];
                case 1:
                    devices = _a.sent();
                    if (devices.length === 0) {
                        cb("No BC Vault connected");
                        return [2 /*return*/];
                    }
                    txParams.feePrice = txParams.gasPrice;
                    txParams.feeCount = txParams.gas;
                    txParams.amount = txParams.value;
                    txParams.from = toEtherCase(strip0x(txParams.from));
                    return [4 /*yield*/, GenerateTransaction(devices[devices.length - 1], types_1.WalletType.ethereum, txParams)];
                case 2:
                    txHex = _a.sent();
                    cb(null, txHex);
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
exports.web3_signTransaction = web3_signTransaction;
function web3_signPersonalMessage(msgParams, cb) {
    return __awaiter(this, void 0, void 0, function () {
        var devices, signedMessage, e_11;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, getDevices()];
                case 1:
                    devices = _a.sent();
                    if (devices.length === 0) {
                        cb("No BC Vault connected");
                        return [2 /*return*/];
                    }
                    msgParams.from = toEtherCase(strip0x(msgParams.from));
                    return [4 /*yield*/, SignData(devices[devices.length - 1], types_1.WalletType.ethereum, msgParams.from, msgParams.data)];
                case 2:
                    signedMessage = _a.sent();
                    cb(null, signedMessage);
                    return [3 /*break*/, 4];
                case 3:
                    e_11 = _a.sent();
                    cb(e_11, null);
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
