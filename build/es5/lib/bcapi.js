"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
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
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
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
exports.BCJS = void 0;
var axios_1 = require("axios");
var types_1 = require("./types");
var es6_promise_1 = require("es6-promise");
es6_promise_1.polyfill();
var BCJS = /** @class */ (function () {
    /**
     * The BCJS constructor.
     * @param authWindowHandler Setting this parameter is not needed in the browser, but is required for NodeJS. This is a function which must submit a device or wallet password to the daemon for use in the next call.
     * See showAuthPopup and the popup for implementation ideas. A function of this type must be specified in the constructor of BCJS in node, but in the browser it is ignored/optional.
     * The call you are expected to make can be found in the source of:
     * https://localhost.bc-vault.com:1991/PasswordInput?channelID=1&channelPasswordType=global
     *
     * If the call was not successful, reject the promise. If it was, resolve it with no value.
     *
     * The `preAuthReference` object is passed from the `preAuthWindowHandler` called previously.
     *
     * @param preAuthWindowHandler This is a function which is called prior to `authWindowHandler` and prepares it for use. In the browser this function is used to prime a popup window.
     *
     * If the call was not successful, reject the promise. If it was, resolve it with a value you expect to be passed to `authWindowHandler`.
     *
     * This function is completely optional and can be left undefined.
     *
     */
    function BCJS(authWindowHandler, preAuthWindowHandler) {
        /** Is BCData object polling already taking place? */ //
        this.isPolling = false;
        /** Set Logging verbosity */
        this.logLevel = types_1.LogLevel.debug;
        /** Use cookies for session management. If set to false no cookies will be set and the session will be lost when 'authToken' is unloaded. It will need to be manually specified. It will be automatically refreshed if a request fails due to a token error. */
        this.authTokenUseCookies = true;
        /** How long each auth grant will last in seconds since the last request. */
        this.authTokenExpireSeconds = 3600;
        /** The path to match the auth-token against. This is a security feature and allows you to fine tune access. Default is: undefined (don't check the full path, note: specifying this may require you to allow https://www.w3.org/TR/referrer-policy/#referrer-policy-origin-when-cross-origin on your webpage depending on which browsers you target) */
        this.authTokenMatchPath = undefined;
        /** The current state of the daemon, updated either manually or on device connect/disconnect after calling startObjectPolling  */
        this.BCData = { devices: [] };
        this.API_VERSION = 5;
        this.lastSeenDevices = [];
        this.listeners = [];
        this.lastPushedStatus = types_1.BCDataRefreshStatusCode.Ready;
        if (typeof (window) === 'undefined') {
            // is nodejs, authWindowHandler MUST be specified!
            if (typeof (authWindowHandler) !== 'function') {
                throw new Error('authWindowHandler MUST be of type function for BCJS constructor in NodeJS');
            }
            else {
                this.authHandler = authWindowHandler;
            }
        }
        if (typeof (preAuthWindowHandler) !== 'function' && typeof (preAuthWindowHandler) !== 'undefined') {
            throw new Error('type of preAuthWindowHandler must be either undefined or function');
        }
        if (typeof (preAuthWindowHandler) === 'function' && !authWindowHandler) {
            throw new Error('AuthWindowHandler must be specified if using preAuthWindowHandler.');
        }
        this.preAuthHandler = preAuthWindowHandler;
    }
    /**
      Starts polling daemon for changes and updates BCData object
      ### Example (es3)
      ```js
        bc.startObjectPolling(150);
        //=> bc.BCData will now be updated if the getDevices array changes
      ```

      ### Example (es6 (node and most browsers))
      ```js
        bc.startObjectPolling(150);
        //=> bc.BCData will now be updated if the getDevices array changes
      ```


    @param deviceInterval how many milliseconds to wait between getDevices pings to daemon
    @throws        Will throw "Already polling" if polling is already taking place.
     */
    BCJS.prototype.startObjectPolling = function (deviceInterval) {
        if (deviceInterval === void 0) { deviceInterval = 150; }
        if (this.isPolling)
            throw Error("Already polling!");
        this.isPolling = true;
        // pollBCObject(fullInterval);
        this.pollDevicesChanged(deviceInterval);
    };
    /**
      Stops polling daemon for changes
      ### Example (es3)
      ```js
        bc.startObjectPolling(150);
        bc.stopObjectPolling();
        //=> bc.BCData will now not be updated if the getDevices array changes
      ```

      ### Example (es6 (node and most browsers))
      ```js
        bc.startObjectPolling(150);
        bc.stopObjectPolling();
        //=> bc.BCData will now not be updated if the getDevices array changes
      ```
     */
    BCJS.prototype.stopObjectPolling = function () {
        if (!this.isPolling) {
            throw new Error("Not polling!");
        }
        this.isPolling = false;
        clearTimeout(this.timeoutRef);
    };
    /**
      Triggers a manual update to BCData.
      ### Example (es3)
      ```js
      console.log(JSON.stringify(bc.BCData));//Old
      bc.triggerManualUpdate().then(function(){
        console.log(JSON.stringify(bc.BCData));//Updated
      });
      ```

      ### Example (es6 (node and most browsers))
      ```js
        console.log(JSON.stringify(bc.BCData));//Old
        await bc.triggerManualUpdate();
        console.log(JSON.stringify(bc.BCData));//Updated
      ```


    @param fullUpdate Force an update or only update data if a new device connects or disconnects.
    @throws        Will throw a DaemonError if the status code of the request was rejected by the server for any reason
    @throws        Will throw an AxiosError if the request itself failed or if status code != 200
     */
    BCJS.prototype.triggerManualUpdate = function (fullUpdate) {
        if (fullUpdate === void 0) { fullUpdate = true; }
        return __awaiter(this, void 0, void 0, function () {
            var devArray, devs, devArray_1, devArray_1_1, deviceID, activeTypes, e_1, userData, _a, _b, usrDataHex, deviceUID, _c, _d, _e, e_2_1, devices;
            var e_2, _f, _g, _h;
            return __generator(this, function (_j) {
                switch (_j.label) {
                    case 0:
                        if (!fullUpdate) return [3 /*break*/, 26];
                        return [4 /*yield*/, this.getDevices()];
                    case 1:
                        devArray = _j.sent();
                        devs = [];
                        this.FireAllStatusListeners(1);
                        _j.label = 2;
                    case 2:
                        _j.trys.push([2, 23, 24, 25]);
                        devArray_1 = __values(devArray), devArray_1_1 = devArray_1.next();
                        _j.label = 3;
                    case 3:
                        if (!!devArray_1_1.done) return [3 /*break*/, 22];
                        deviceID = devArray_1_1.value;
                        activeTypes = void 0;
                        _j.label = 4;
                    case 4:
                        _j.trys.push([4, 6, , 11]);
                        return [4 /*yield*/, this.getActiveWalletTypes(deviceID)];
                    case 5:
                        activeTypes = _j.sent();
                        return [3 /*break*/, 11];
                    case 6:
                        e_1 = _j.sent();
                        if (!(e_1.BCHttpResponse !== undefined)) return [3 /*break*/, 10];
                        return [4 /*yield*/, this.getWalletUserData(deviceID, types_1.WalletType.none, "", false)];
                    case 7:
                        userData = _j.sent();
                        _b = (_a = devs).push;
                        _g = {
                            id: deviceID,
                            space: { available: 1, complete: 1 }
                        };
                        return [4 /*yield*/, this.getFirmwareVersion(deviceID)];
                    case 8:
                        _g.firmware = _j.sent(),
                            _g.userData = this.parseHex(userData),
                            _g.userDataRaw = userData;
                        return [4 /*yield*/, this.getSupportedWalletTypes(deviceID)];
                    case 9:
                        _b.apply(_a, [(_g.supportedTypes = _j.sent(),
                                _g.activeTypes = [],
                                _g.activeWallets = [],
                                _g.locked = true,
                                _g)]);
                        return [3 /*break*/, 21];
                    case 10: throw e_1;
                    case 11: return [4 /*yield*/, this.getWalletUserData(deviceID, types_1.WalletType.none, "", false)];
                    case 12:
                        usrDataHex = _j.sent();
                        deviceUID = void 0;
                        _j.label = 13;
                    case 13:
                        _j.trys.push([13, 15, , 16]);
                        return [4 /*yield*/, this.getDeviceUID(deviceID)];
                    case 14:
                        deviceUID = _j.sent();
                        return [3 /*break*/, 16];
                    case 15:
                        _c = _j.sent();
                        deviceUID = undefined;
                        return [3 /*break*/, 16];
                    case 16:
                        _e = (_d = devs).push;
                        _h = {
                            id: deviceID,
                            UID: deviceUID
                        };
                        return [4 /*yield*/, this.getAvailableSpace(deviceID)];
                    case 17:
                        _h.space = _j.sent();
                        return [4 /*yield*/, this.getFirmwareVersion(deviceID)];
                    case 18:
                        _h.firmware = _j.sent();
                        return [4 /*yield*/, this.getSupportedWalletTypes(deviceID)];
                    case 19:
                        _h.supportedTypes = _j.sent(),
                            _h.userData = this.parseHex(usrDataHex),
                            _h.userDataRaw = usrDataHex,
                            _h.activeTypes = activeTypes;
                        return [4 /*yield*/, this.getWallets(deviceID, activeTypes)];
                    case 20:
                        _e.apply(_d, [(_h.activeWallets = _j.sent(),
                                _h.locked = false,
                                _h)]);
                        _j.label = 21;
                    case 21:
                        devArray_1_1 = devArray_1.next();
                        return [3 /*break*/, 3];
                    case 22: return [3 /*break*/, 25];
                    case 23:
                        e_2_1 = _j.sent();
                        e_2 = { error: e_2_1 };
                        return [3 /*break*/, 25];
                    case 24:
                        try {
                            if (devArray_1_1 && !devArray_1_1.done && (_f = devArray_1["return"])) _f.call(devArray_1);
                        }
                        finally { if (e_2) throw e_2.error; }
                        return [7 /*endfinally*/];
                    case 25:
                        this.BCData = { devices: devs };
                        this.FireAllStatusListeners(0);
                        return [3 /*break*/, 29];
                    case 26:
                        devices = void 0;
                        return [4 /*yield*/, this.getDevices()];
                    case 27:
                        devices = _j.sent();
                        if (!(!this.arraysEqual(devices, this.lastSeenDevices) || this.lastPushedStatus === types_1.BCDataRefreshStatusCode.ConnectionError)) return [3 /*break*/, 29];
                        this.lastSeenDevices = devices;
                        return [4 /*yield*/, this.triggerManualUpdate(true)];
                    case 28:
                        _j.sent();
                        _j.label = 29;
                    case 29: return [2 /*return*/];
                }
            });
        });
    };
    /**
      Adds a status changed listener for updates to the BCData object
      ### Example (es3)
      ```js
        bc.AddBCDataChangedListener(console.log);
        bc.triggerManualUpdate();
        // => 1
        // => 0
      ```

      ### Example (es6 (node and most browsers))
      ```js
        bc.AddBCDataChangedListener(console.log);
        bc.triggerManualUpdate();
        // => 1
        // => 0
      ```


     */
    BCJS.prototype.AddBCDataChangedListener = function (func) {
        this.listeners.push(func);
    };
    /**
      Returns WalletTypeInfo(name, ticker, etc...) for a specified WalletType if it exists
      ### Example (es3)
      ```js
        console.log(JSON.stringify(bc.getWalletTypeInfo(1)));
        // => {"type":"BcCash01","name":"Bitcoin Cash","ticker":"BCH"}
      ```

      ### Example (es6 (node and most browsers))
      ```js
        console.log(JSON.stringify(bc.getWalletTypeInfo(1)));
        // => {"type":"BcCash01","name":"Bitcoin Cash","ticker":"BCH"}
      ```


     */
    BCJS.prototype.getWalletTypeInfo = function (id) {
        return types_1.typeInfoMap.find(function (x) { return x.type === id; });
    };
    /**
      Gets the currently connected devices.
      ### Example (es3)
      ```js
      bc.getDevices().then(console.log)
      // => [1,2]
      ```

      ### Example (es6 (node and most browsers))
      ```js
      console.log(await bc.getDevices())
      // => [1,2]
      ```


    @throws        Will throw a DaemonError if the status code of the request was rejected by the server for any reason
    @throws        Will throw an AxiosError if the request itself failed or if status code != 200
    @returns       An array of Device IDs of currently connected devices
     */
    BCJS.prototype.getDevices = function () {
        return __awaiter(this, void 0, void 0, function () {
            var httpr;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getResponsePromised(types_1.Endpoint.Devices)];
                    case 1:
                        httpr = _a.sent();
                        this.assertIsBCHttpResponse(httpr);
                        return [2 /*return*/, httpr.body.data];
                }
            });
        });
    };
    /**
      Gets the firmware version of a specific device.
      ### Example (es3)
      ```js
      bc.getFirmwareVersion(1).then(console.log)
      // => {"major":1,"minor":0,"revision":1,"date":{"day":17,"month":10,"year":2017},"apiVersion":{"major":1,"minor":0}}
      ```

      ### Example (es6 (node and most browsers))
      ```js
      console.log(await bc.getFirmwareVersion(1))
      // => {"major":1,"minor":0,"revision":1,"date":{"day":17,"month":10,"year":2017},"apiVersion":{"major":1,"minor":0}}
      ```


      @param device  DeviceID obtained from getDevices
      @throws        Will throw a DaemonError if the status code of the request was rejected by the server for any reason
      @throws        Will throw an AxiosError if the request itself failed or if status code != 200
      @returns       An object containing requested data
     */
    BCJS.prototype.getFirmwareVersion = function (device) {
        return __awaiter(this, void 0, void 0, function () {
            var httpr;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getResponsePromised(types_1.Endpoint.FirmwareVersion, { device: device })];
                    case 1:
                        httpr = _a.sent();
                        this.assertIsBCHttpResponse(httpr);
                        return [2 /*return*/, httpr.body.data];
                }
            });
        });
    };
    /**
      Gets the balance in currency-specific minimum units for the specified wallet from a web-service.
      ### Example (es3)
      ```js
      bc.getWalletBalance("BitCoin1","1PekCrsopzENYBa82YpmmBtJcsNgu4PqEV").then(console.log)
      // => {"errorCode": 36864,"data": "0"}
      ```

      ### Example (es6 (node and most browsers))
      ```js
      console.log(await bc.getWalletBalance("BitCoin1","1PekCrsopzENYBa82YpmmBtJcsNgu4PqEV"))
      // => {"errorCode": 36864,"data": "0"}
      ```


      @param device  DeviceID obtained from getDevices
      @throws        Will throw a DaemonError if the status code of the request was rejected by the server for any reason
      @throws        Will throw an AxiosError if the request itself failed or if status code != 200
      @returns       An object containing requested data
     */
    BCJS.prototype.getWalletBalance = function (type, sourcePublicID) {
        return __awaiter(this, void 0, void 0, function () {
            var httpr;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getResponsePromised(types_1.Endpoint.GetWalletBalance, { walletTypeString: type, sourcePublicID: sourcePublicID })];
                    case 1:
                        httpr = _a.sent();
                        this.assertIsBCHttpResponse(httpr);
                        return [2 /*return*/, httpr.body.data];
                }
            });
        });
    };
    /**
      Gets the available space on a specific device
      ### Example (es3)
      ```js
      bc.getAvailableSpace(1).then(console.log)
      // => {"available":4294967295,"complete":4294967295}
      ```

      ### Example (es6 (node and most browsers))
      ```js
      console.log(await bc.getAvailableSpace(1))
      // => {"available":4294967295,"complete":4294967295}
      ```


      @param device  DeviceID obtained from getDevices
      @throws        Will throw a DaemonError if the status code of the request was rejected by the server for any reason
      @throws        Will throw an AxiosError if the request itself failed or if status code != 200
      @returns       An object containing requested data, all numbers are in BYTES
     */
    BCJS.prototype.getAvailableSpace = function (device) {
        return __awaiter(this, void 0, void 0, function () {
            var httpr;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getResponsePromised(types_1.Endpoint.AvailableSpace, { device: device })];
                    case 1:
                        httpr = _a.sent();
                        this.assertIsBCHttpResponse(httpr);
                        return [2 /*return*/, httpr.body.data];
                }
            });
        });
    };
    /**
      Gets an ID unique to each device. Will not persist device wipes and will change according to the HTTP Origin. This ID will persist reboots and requires global-pin authorization.
      ### Example (es3)
      ```js
      bc.getDeviceUID(1).then(console.log)
      // => "0x9d8e1b33b93d7c27fb4fc17857e22fb529937947152ca7af441095949b20ba02"
      ```

      ### Example (es6 (node and most browsers))
      ```js
      console.log(await bc.getDeviceUID(1))
      // => "0x9d8e1b33b93d7c27fb4fc17857e22fb529937947152ca7af441095949b20ba02"
      ```


      @param device  DeviceID obtained from getDevices
      @throws        Will throw a DaemonError if the status code of the request was rejected by the server for any reason
      @throws        Will throw an AxiosError if the request itself failed or if status code != 200
      @returns       The unique ID
     */
    BCJS.prototype.getDeviceUID = function (device) {
        return __awaiter(this, void 0, void 0, function () {
            var httpr, e_3, err;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.getResponsePromised(types_1.Endpoint.DeviceUID, { device: device })];
                    case 1:
                        httpr = _a.sent();
                        this.assertIsBCHttpResponse(httpr);
                        return [3 /*break*/, 3];
                    case 2:
                        e_3 = _a.sent();
                        if (e_3.HttpResponse !== undefined) {
                            err = new types_1.DaemonError({
                                daemonError: 4,
                                parseError: "Command not found"
                            });
                            throw err;
                        }
                        throw e_3;
                    case 3: return [2 /*return*/, httpr.body.data];
                }
            });
        });
    };
    /**
      Gets the supported WalletTypes on a specific device
      ### Example (es3)
      ```js
      bc.getSupportedWalletTypes("BitCoin1").then(console.log)
      // => [  "BitCoin1",  "BcCash01",  "Ethereum",  "LiteCoi1",  "Dash0001", ...]
      ```

      ### Example (es6 (node and most browsers))
      ```js
      console.log(await bc.getSupportedWalletTypes(1))
      // => [  "BitCoin1",  "BcCash01",  "Ethereum",  "LiteCoi1",  "Dash0001", ...]
      ```


      @param device  DeviceID obtained from getDevices
      @throws        Will throw a DaemonError if the status code of the request was rejected by the server for any reason
      @throws        Will throw an AxiosError if the request itself failed or if status code != 200
      @returns       An array containing requested data
     */
    BCJS.prototype.getSupportedWalletTypes = function (device) {
        return __awaiter(this, void 0, void 0, function () {
            var httpr;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getResponsePromised(types_1.Endpoint.WalletTypes, { device: device })];
                    case 1:
                        httpr = _a.sent();
                        this.assertIsBCHttpResponse(httpr);
                        return [2 /*return*/, httpr.body.data];
                }
            });
        });
    };
    /**
      Gets a list of WalletTypes that are actually used on a specific device(have at least one wallet)
      ### Example (es3)
      ```js
      bc.getActiveWalletTypes(1).then(console.log)
      // => ["BitCoin1","Ethereum"]
      ```

      ### Example (es6 (node and most browsers))
      ```js
      console.log(await bc.getActiveWalletTypes(1))
      // => ["BitCoin1","Ethereum"]
      ```


      @param device  DeviceID obtained from getDevices
      @throws        Will throw a DaemonError if the status code of the request was rejected by the server for any reason
      @throws        Will throw an AxiosError if the request itself failed or if status code != 200
      @returns       An array containing requested data
     */
    BCJS.prototype.getActiveWalletTypes = function (device) {
        return __awaiter(this, void 0, void 0, function () {
            var httpr;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getResponsePromised(types_1.Endpoint.SavedWalletTypes, { device: device })];
                    case 1:
                        httpr = _a.sent();
                        this.assertIsBCHttpResponse(httpr);
                        return [2 /*return*/, httpr.body.data];
                }
            });
        });
    };
    /**
     * @deprecated since 1.3.2, use getBatchWalletDetails instead
      Gets an array(string) of public keys of a specific WalletTypes on a device
      ### Example (es5 (old browsers))
      ```js
      bc.getWalletsOfType(1,"BitCoin1").then(console.log)
      // => ["1271DpdZ7iM6sXRasvjAQ6Hg2zw8bS3ADc"]
      ```

      ### Example (es6 (node and most browsers))
      ```js
      console.log(await bc.getWalletsOfType(1,"BitCoin1"))
      // => ["1271DpdZ7iM6sXRasvjAQ6Hg2zw8bS3ADc"]
      ```
      @param device  DeviceID obtained from getDevices
      @param type    WalletType obtained from getActiveWalletTypes or getSupportedWalletTypes
      @throws        Will throw a DaemonError if the status code of the request was rejected by the server for any reason
      @throws        Will throw an AxiosError if the request itself failed or if status code != 200
      @returns       An array containing requested data
     */
    BCJS.prototype.getWalletsOfType = function (device, type) {
        return __awaiter(this, void 0, void 0, function () {
            var httpr;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getResponsePromised(types_1.Endpoint.WalletsOfType, { device: device, walletTypeString: type })];
                    case 1:
                        httpr = _a.sent();
                        this.assertIsBCHttpResponse(httpr);
                        return [2 /*return*/, httpr.body.data];
                }
            });
        });
    };
    /**
      Gets the requested data about wallets stored on the device. Details to query can be specified through the final parameter, which is set to query all details by default. Anything not queried will be filled with the empty value of that type, ie '' for strings and 0 for numbers.
      ### Example (es3)
      ```js
      bc.getBatchWalletDetails(1,"BitCoin1").then(console.log)
      // => an array of type WalletBatchDataResponse
      ```

      ### Example (es6 (node and most browsers))
      ```js
      console.log(await bc.getBatchWalletDetails(1,"BitCoin1"))
      // => an array of type WalletBatchDataResponse
      ```


      @param device           DeviceID obtained from getDevices
      @param walletTypes      WalletTypes obtained from getActiveWalletTypes or getSupportedWalletTypes
      @param walletDetails    Query details flags, can be combined with binary OR
      @throws                 Will throw a DaemonError if the status code of the request was rejected by the server for any reason
      @throws                 Will throw an AxiosError if the request itself failed or if status code != 200
      @returns                An array containing requested data
     */
    BCJS.prototype.getBatchWalletDetails = function (device, walletTypes, walletDetails) {
        if (walletDetails === void 0) { walletDetails = types_1.WalletDetailsQuery.all; }
        return __awaiter(this, void 0, void 0, function () {
            var httpr;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (walletTypes.length === 0) {
                            return [2 /*return*/, []];
                        }
                        return [4 /*yield*/, this.getResponsePromised(types_1.Endpoint.WalletsOfTypes, { device: device, walletTypes: walletTypes, walletDetails: walletDetails })];
                    case 1:
                        httpr = _a.sent();
                        this.assertIsBCHttpResponse(httpr);
                        httpr.body.data = httpr.body.data.map(function (x) {
                            return __assign(__assign({}, x), { userDataRaw: x.userData, userData: _this.parseHex(x.userData) });
                        });
                        return [2 /*return*/, httpr.body.data];
                }
            });
        });
    };
    /**
     * @deprecated since 1.3.2, use getBatchWalletDetails instead
      Gets the user data associated with a publicAddress on this device
      ### Example (es3)
      ```js
      bc.getWalletUserData(1,"BitCoin1","1271DpdZ7iM6sXRasvjAQ6Hg2zw8bS3ADc",true).then(console.log)
      // => "This is my mining wallet!"
      ```

      ### Example (es6 (node and most browsers))
      ```js
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
    BCJS.prototype.getWalletUserData = function (device, type, publicAddress, shouldParseHex) {
        if (shouldParseHex === void 0) { shouldParseHex = true; }
        return __awaiter(this, void 0, void 0, function () {
            var httpr, responseString;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getResponsePromised(types_1.Endpoint.WalletUserData, { device: device, walletTypeString: type, sourcePublicID: publicAddress })];
                    case 1:
                        httpr = _a.sent();
                        this.assertIsBCHttpResponse(httpr);
                        responseString = httpr.body.data;
                        if (shouldParseHex) {
                            responseString = this.parseHex(responseString);
                        }
                        return [2 /*return*/, responseString];
                }
            });
        });
    };
    /**
      Copies a wallet private key to another walletType (in case of a fork etc.)
      ### Example (es3)
      ```js
      bc.CopyWalletToType(1,"BitCoin1","BcCash01","1271DpdZ7iM6sXRasvjAQ6Hg2zw8bS3ADc").then(console.log)
      // => "true"
      ```

      ### Example (es6 (node and most browsers))
      ```js
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
    BCJS.prototype.CopyWalletToType = function (device, oldType, newType, publicAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var httpr, id;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getSecureWindowResponse(types_1.PasswordType.WalletPassword)];
                    case 1:
                        id = _a.sent();
                        return [4 /*yield*/, this.getResponsePromised(types_1.Endpoint.CopyWalletToType, { device: device, walletTypeString: oldType, newWalletTypeString: newType, sourcePublicID: publicAddress, password: id })];
                    case 2:
                        httpr = _a.sent();
                        this.assertIsBCHttpResponse(httpr);
                        return [2 /*return*/, true];
                }
            });
        });
    };
    /**
      Check if address is valid for a specific WalletType
      ### Example (es3)
      ```js
      bc.getIsAddressValid(1,"BitCoin1","1271DpdZ7iM6sXRasvjAQ6Hg2zw8bS3ADc").then(console.log)
      // => "true"
      ```

      ### Example (es6 (node and most browsers))
      ```js
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
    BCJS.prototype.getIsAddressValid = function (device, type, publicAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var httpr;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getResponsePromised(types_1.Endpoint.IsAddressValid, { device: device, walletTypeString: type, address: publicAddress })];
                    case 1:
                        httpr = _a.sent();
                        return [2 /*return*/, httpr.body.errorCode === 0x9000];
                }
            });
        });
    };
    /**
      Displays address on device for verification
      @deprecated You should not use this function as it is not supported on newer firmwares.
      ### Example (es3)
      ```js
      bc.DisplayAddressOnDevice(1,"BitCoin1","1271DpdZ7iM6sXRasvjAQ6Hg2zw8bS3ADc").then(console.log)
      // => "true"
      ```

      ### Example (es6 (node and most browsers))
      ```js
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
    BCJS.prototype.DisplayAddressOnDevice = function (device, type, publicAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var httpr;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getResponsePromised(types_1.Endpoint.DisplayAddress, { device: device, walletTypeString: type, publicID: publicAddress })];
                    case 1:
                        httpr = _a.sent();
                        this.assertIsBCHttpResponse(httpr);
                        return [2 /*return*/, true];
                }
            });
        });
    };
    /**
      Generates a new wallet on the device
      ### Example (es3)
      ```js
      bc.GenerateWallet(1,"BitCoin1").then(console.log)
      // => "true"
      ```

      ### Example (es6 (node and most browsers))
      ```js
      await bc.GenerateWallet(1,"BitCoin1")
      // => true
      ```


      @param device  DeviceID obtained from getDevices
      @param type    WalletType obtained from getActiveWalletTypes or getSupportedWalletTypes
      @throws        Will throw a DaemonError if the status code of the request was rejected by the server for any reason
      @throws        Will throw an AxiosError if the request itself failed or if status code != 200
      @returns       the public key of the new wallet
     */
    BCJS.prototype.GenerateWallet = function (device, type) {
        return __awaiter(this, void 0, void 0, function () {
            var id, httpr;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getSecureWindowResponse(types_1.PasswordType.WalletPassword)];
                    case 1:
                        id = _a.sent();
                        return [4 /*yield*/, this.getResponsePromised(types_1.Endpoint.GenerateWallet, { device: device, walletTypeString: type, password: id })];
                    case 2:
                        httpr = _a.sent();
                        this.assertIsBCHttpResponse(httpr);
                        return [2 /*return*/, httpr.body.data];
                }
            });
        });
    };
    /**
      Prompt the user to unlock the device
      ### Example (es3)
      ```js
      bc.EnterGlobalPin(1).then(console.log)
      ```

      ### Example (es6 (node and most browsers))
      ```js
      await bc.EnterGlobalPin(1)
      ```


      @param device  DeviceID obtained from getDevices
      @throws        Will throw a DaemonError if the status code of the request was rejected by the server for any reason
      @throws        Will throw an AxiosError if the request itself failed or if status code != 200
     */
    BCJS.prototype.EnterGlobalPin = function (device, passwordType) {
        if (passwordType === void 0) { passwordType = types_1.PasswordType.GlobalPassword; }
        return __awaiter(this, void 0, void 0, function () {
            var id, httpr;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getSecureWindowResponse(passwordType)];
                    case 1:
                        id = _a.sent();
                        this.log("Got pin popup:" + id);
                        return [4 /*yield*/, this.getResponsePromised(types_1.Endpoint.EnterGlobalPin, { device: device, password: id })];
                    case 2:
                        httpr = _a.sent();
                        this.assertIsBCHttpResponse(httpr);
                        this.triggerManualUpdate();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
      Generates a new transaction on the device
      ### Example (es3)
      ```js
      var trxOptions = {from:"1271DpdZ7iM6sXRasvjAQ6Hg2zw8bS3ADc",to:"1271DpdZ7iM6sXRasvjAQ6Hg2zw8bS3ADc",feeCount:0,feePrice:"50000",amount:"500000000"};
      bc.GenerateTransaction(1,"BitCoin1",trxOptions).then(console.log)
      // generates a transaction of type bitCoinCash which uses 0.00050000 BCH as fee and sends 5 BCH back to the same address
      ```

      ### Example (es6 (node and most browsers))
      ```js
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
    BCJS.prototype.GenerateTransaction = function (device, type, data, broadcast) {
        return __awaiter(this, void 0, void 0, function () {
            var apiVersion, id, httpr;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getVersion()];
                    case 1:
                        apiVersion = _a.sent();
                        if (data.contractData !== undefined) {
                            // check compatibility
                            if (apiVersion < 4) {
                                throw new Error("Unsupported parameter: contract data. Update daemon.");
                            }
                        }
                        if (data.memo) {
                            if (apiVersion < 5) {
                                throw new Error("Unsupported parameter: memo. Update daemon.");
                            }
                        }
                        if (data.advanced && data.advanced.eth && data.advanced.eth.chainID !== undefined) {
                            if (apiVersion < 5) {
                                throw new Error("Unsupported parameter: advanced.eth.chainID. Update daemon.");
                            }
                        }
                        if (!data.feeCount) {
                            data.feeCount = 0;
                        }
                        return [4 /*yield*/, this.getSecureWindowResponse(types_1.PasswordType.WalletPassword)];
                    case 2:
                        id = _a.sent();
                        this.log("Got auth id:" + id, types_1.LogLevel.debug);
                        this.log("Sending object:" + JSON.stringify({ device: device, walletTypeString: type, transaction: data, password: id }), types_1.LogLevel.debug);
                        return [4 /*yield*/, this.getResponsePromised(types_1.Endpoint.GenerateTransaction, { device: device, walletTypeString: type, transaction: data, password: id, broadcast: broadcast })];
                    case 3:
                        httpr = _a.sent();
                        this.log(httpr.body, types_1.LogLevel.debug);
                        this.assertIsBCHttpResponse(httpr);
                        // i know.
                        // tslint:disable-next-line: no-string-literal
                        return [2 /*return*/, httpr.body["data"]];
                }
            });
        });
    };
    /**
      Signs data on the device
      ### Example (es3)
      ```js
      bc.SignData(1,bc.WalletType.ethereum,"0x9283099a29556fcf8fff5b2cea2d4f67cb7a7a8b","0x4920616d20627574206120737461636b2065786368616e676520706f7374").then(console.log)
      // => "0x..."
      ```

      ### Example (es6 (node and most browsers))
      ```js
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
    BCJS.prototype.SignData = function (device, type, publicAddress, data) {
        return __awaiter(this, void 0, void 0, function () {
            var id, httpr;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getSecureWindowResponse(types_1.PasswordType.WalletPassword)];
                    case 1:
                        id = _a.sent();
                        this.log("Got auth id:" + id, types_1.LogLevel.debug);
                        this.log("Sending object:" + JSON.stringify({ device: device, walletTypeString: type, sourcePublicID: publicAddress, srcData: data, password: id }), types_1.LogLevel.debug);
                        return [4 /*yield*/, this.getResponsePromised(types_1.Endpoint.SignData, { device: device, walletTypeString: type, sourcePublicID: publicAddress, srcData: data, password: id })];
                    case 2:
                        httpr = _a.sent();
                        this.log("Response body:" + httpr.body, types_1.LogLevel.debug);
                        this.assertIsBCHttpResponse(httpr);
                        // i know.
                        // tslint:disable-next-line: no-string-literal
                        return [2 /*return*/, httpr.body["data"]];
                }
            });
        });
    };
    BCJS.prototype.web3_GetAccounts = function (cb) {
        return __awaiter(this, void 0, void 0, function () {
            var devices, wallets, e_4, wallets, e_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 9, , 10]);
                        return [4 /*yield*/, this.getDevices()];
                    case 1:
                        devices = _a.sent();
                        if (devices.length === 0) {
                            cb("No BC Vault connected");
                            return [2 /*return*/];
                        }
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 8]);
                        return [4 /*yield*/, this.getWalletsOfType(devices[0], types_1.WalletType.ethereum)];
                    case 3:
                        wallets = _a.sent();
                        cb(null, wallets.map(function (x) { return "0x" + x; }));
                        return [3 /*break*/, 8];
                    case 4:
                        e_4 = _a.sent();
                        if (!(e_4.BCHttpResponse !== undefined)) return [3 /*break*/, 7];
                        // unlock BC Vault!
                        return [4 /*yield*/, this.EnterGlobalPin(devices[0], types_1.PasswordType.GlobalPassword)];
                    case 5:
                        // unlock BC Vault!
                        _a.sent();
                        return [4 /*yield*/, this.getWalletsOfType(devices[0], types_1.WalletType.ethereum)];
                    case 6:
                        wallets = _a.sent();
                        return [2 /*return*/, cb(null, wallets.map(function (x) { return "0x" + x; }))];
                    case 7: return [3 /*break*/, 8];
                    case 8: return [3 /*break*/, 10];
                    case 9:
                        e_5 = _a.sent();
                        cb(e_5, null);
                        return [3 /*break*/, 10];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    BCJS.prototype.web3_signTransaction = function (txParams, cb) {
        return __awaiter(this, void 0, void 0, function () {
            var devices, txHex, e_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.getDevices()];
                    case 1:
                        devices = _a.sent();
                        if (devices.length === 0) {
                            cb("No BC Vault connected");
                            return [2 /*return*/];
                        }
                        txParams.feePrice = txParams.gasPrice;
                        txParams.feeCount = txParams.gas;
                        txParams.amount = txParams.value;
                        txParams.from = this.toEtherCase(this.strip0x(txParams.from));
                        return [4 /*yield*/, this.GenerateTransaction(devices[devices.length - 1], types_1.WalletType.ethereum, txParams)];
                    case 2:
                        txHex = _a.sent();
                        cb(null, txHex);
                        return [3 /*break*/, 4];
                    case 3:
                        e_6 = _a.sent();
                        cb(e_6, null);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    BCJS.prototype.web3_signPersonalMessage = function (msgParams, cb) {
        return __awaiter(this, void 0, void 0, function () {
            var devices, signedMessage, e_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.getDevices()];
                    case 1:
                        devices = _a.sent();
                        if (devices.length === 0) {
                            cb("No BC Vault connected");
                            return [2 /*return*/];
                        }
                        msgParams.from = this.toEtherCase(this.strip0x(msgParams.from));
                        return [4 /*yield*/, this.SignData(devices[devices.length - 1], types_1.WalletType.ethereum, msgParams.from, msgParams.data)];
                    case 2:
                        signedMessage = _a.sent();
                        cb(null, signedMessage);
                        return [3 /*break*/, 4];
                    case 3:
                        e_7 = _a.sent();
                        cb(e_7, null);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    BCJS.prototype.strip0x = function (str) {
        if (str.startsWith('0x')) {
            return str.substr(2);
        }
        return str;
    };
    BCJS.prototype.toEtherCase = function (inputString) {
        return inputString.toUpperCase();
    };
    BCJS.prototype.parseHex = function (str) {
        var out = str;
        if (out.length % 2 === 0) {
            out = out.substr(2); // remove 0x
            var responseStringArray = __spread(out);
            var byteArrayStr = [];
            for (var i = 0; i < responseStringArray.length; i += 2) {
                byteArrayStr.push(parseInt(responseStringArray[i] + responseStringArray[i + 1], 16));
            }
            out = String.fromCharCode.apply(String, __spread(byteArrayStr));
        }
        return out;
    };
    BCJS.prototype.getServerURL = function () {
        return 'https://localhost:1991';
    };
    BCJS.prototype.getNewSession = function () {
        return __awaiter(this, void 0, void 0, function () {
            var scp, axiosConfig, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        scp = {
                            sessionType: this.authTokenUseCookies ? types_1.SessionAuthType.any : types_1.SessionAuthType.token,
                            expireSeconds: this.authTokenExpireSeconds,
                            matchPath: this.authTokenMatchPath,
                            versionNumber: this.API_VERSION
                        };
                        axiosConfig = {
                            baseURL: this.getServerURL(),
                            method: "POST",
                            url: 'SetBCSessionParams',
                            withCredentials: true,
                            data: scp,
                            headers: { "Api-Version": this.API_VERSION }
                        };
                        if (typeof (window) === 'undefined') {
                            axiosConfig.headers.Origin = "https://localhost";
                            axiosConfig.headers.Referer = "https://localhost";
                        }
                        return [4 /*yield*/, axios_1["default"](axiosConfig)];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data.d_token];
                }
            });
        });
    };
    BCJS.prototype.getVersion = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(this.REMOTE_API_VERSION === undefined)) return [3 /*break*/, 2];
                        this.log('Getting remote version...', types_1.LogLevel.verbose);
                        return [4 /*yield*/, axios_1["default"](this.getServerURL() + '/version')];
                    case 1:
                        response = _a.sent();
                        this.REMOTE_API_VERSION = parseInt(response.data, 10);
                        this.log('Got remote version:' + this.REMOTE_API_VERSION, types_1.LogLevel.verbose);
                        _a.label = 2;
                    case 2: return [2 /*return*/, this.REMOTE_API_VERSION];
                }
            });
        });
    };
    BCJS.prototype.getResponsePromised = function (endpoint, data) {
        var _this = this;
        var dataWithToken = __assign(__assign({}, (data || {})), { d_token: this.authToken });
        return new Promise(function (res, rej) { return __awaiter(_this, void 0, void 0, function () {
            var methodCheck, e_8, options, responseFunction;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(this.endpointAllowsCredentials === undefined)) return [3 /*break*/, 4];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, axios_1["default"]({ baseURL: this.getServerURL(), data: "{}", method: "POST", url: "/Devices" })];
                    case 2:
                        methodCheck = _a.sent();
                        this.endpointAllowsCredentials = methodCheck.data.daemonError === types_1.DaemonErrorCodes.sessionError;
                        return [3 /*break*/, 4];
                    case 3:
                        e_8 = _a.sent();
                        this.log("Daemon offline during initialization.", types_1.LogLevel.debug);
                        return [2 /*return*/, rej(new types_1.DaemonError(e_8))];
                    case 4:
                        options = {
                            baseURL: this.getServerURL(),
                            data: JSON.stringify(dataWithToken),
                            method: "POST",
                            url: endpoint,
                            headers: {}
                        };
                        if (this.endpointAllowsCredentials && this.authTokenUseCookies) {
                            options.withCredentials = true;
                            options.headers["Api-Version"] = this.API_VERSION;
                        }
                        if (typeof (window) === 'undefined') {
                            options.headers.Origin = "https://localhost";
                            options.headers.Referer = "https://localhost";
                        }
                        this.log("getResponsePromised - " + endpoint + " - " + options.data);
                        responseFunction = function (response) { return __awaiter(_this, void 0, void 0, function () {
                            var htpr, _a;
                            var _this = this;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        htpr = { status: response.status, body: response.data };
                                        if (!(response.data.daemonError === types_1.DaemonErrorCodes.sessionError)) return [3 /*break*/, 2];
                                        this.log("Creating new session.", types_1.LogLevel.debug);
                                        _a = this;
                                        return [4 /*yield*/, this.getNewSession()];
                                    case 1:
                                        _a.authToken = _b.sent();
                                        this.log("New session created: " + this.authToken, types_1.LogLevel.debug);
                                        options.data = JSON.stringify(__assign(__assign({}, dataWithToken), { d_token: this.authToken }));
                                        axios_1["default"](options).then(function (authenticatedResponse) {
                                            if (authenticatedResponse.data.daemonError) {
                                                return rej(new types_1.DaemonError(authenticatedResponse.data));
                                            }
                                            else {
                                                return res({ status: authenticatedResponse.status, body: authenticatedResponse.data });
                                            }
                                        })["catch"](function (e) {
                                            _this.log("Daemon request failed: " + JSON.stringify(e), types_1.LogLevel.warning);
                                            rej(new types_1.DaemonError(e));
                                        });
                                        return [2 /*return*/];
                                    case 2:
                                        res(htpr);
                                        return [2 /*return*/];
                                }
                            });
                        }); };
                        axios_1["default"](options).then(responseFunction)["catch"](function (e) {
                            _this.log("Daemon request failed: " + JSON.stringify(e), types_1.LogLevel.warning);
                            rej(new types_1.DaemonError(e));
                        });
                        return [2 /*return*/];
                }
            });
        }); });
    };
    BCJS.prototype.assertIsBCHttpResponse = function (httpr) {
        if (httpr.body.errorCode !== 0x9000) {
            throw new types_1.DaemonError(httpr.body);
        }
    };
    BCJS.prototype.log = function (msg, level) {
        if (level === void 0) { level = types_1.LogLevel.verbose; }
        if (this.logLevel <= level) {
            console.log('[' + new Date(Date.now()).toLocaleTimeString() + ']: ' + msg);
        }
    };
    BCJS.prototype.getWallets = function (deviceID, activeTypes) {
        return __awaiter(this, void 0, void 0, function () {
            var ret, response, response_1, response_1_1, detailItem;
            var e_9, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        ret = [];
                        if (activeTypes.length === 0) {
                            return [2 /*return*/, []];
                        }
                        return [4 /*yield*/, this.getBatchWalletDetails(deviceID, activeTypes)];
                    case 1:
                        response = _b.sent();
                        try {
                            for (response_1 = __values(response), response_1_1 = response_1.next(); !response_1_1.done; response_1_1 = response_1.next()) {
                                detailItem = response_1_1.value;
                                ret.push({
                                    publicKey: detailItem.address,
                                    userData: detailItem.userData,
                                    userDataRaw: detailItem.userDataRaw,
                                    extraData: detailItem.extraData,
                                    walletType: detailItem.type
                                });
                            }
                        }
                        catch (e_9_1) { e_9 = { error: e_9_1 }; }
                        finally {
                            try {
                                if (response_1_1 && !response_1_1.done && (_a = response_1["return"])) _a.call(response_1);
                            }
                            finally { if (e_9) throw e_9.error; }
                        }
                        return [2 /*return*/, ret];
                }
            });
        });
    };
    BCJS.prototype.arraysEqual = function (a, b) {
        var equal = a.length === b.length;
        for (var i = 0; i < a.length && equal; i++) {
            equal = a[i] === b[i];
        }
        return equal;
    };
    BCJS.prototype.pollDevicesChanged = function (interval) {
        var _this = this;
        this.timeoutRef = setTimeout(function () { return _this.pollDevicesChanged(interval); }, interval);
        return new Promise(function (res) { return __awaiter(_this, void 0, void 0, function () {
            var e_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.triggerManualUpdate(false)];
                    case 1:
                        _a.sent();
                        res();
                        return [3 /*break*/, 3];
                    case 2:
                        e_10 = _a.sent();
                        this.FireAllStatusListeners(-1);
                        console.error(e_10);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
    };
    BCJS.prototype.FireAllStatusListeners = function (args) {
        var e_11, _a;
        this.lastPushedStatus = args;
        try {
            for (var _b = __values(this.listeners), _c = _b.next(); !_c.done; _c = _b.next()) {
                var listener = _c.value;
                listener.call(null, args);
            }
        }
        catch (e_11_1) { e_11 = { error: e_11_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
            }
            finally { if (e_11) throw e_11.error; }
        }
    };
    BCJS.prototype.showAuthPopup = function (id, passwordType, popupReference) {
        var _this = this;
        return new Promise(function (res) { return __awaiter(_this, void 0, void 0, function () {
            var isIE, timer_1;
            return __generator(this, function (_a) {
                isIE = window.ActiveXObject || "ActiveXObject" in window;
                if (isIE) {
                    window.showModalDialog(this.getServerURL() + "/PasswordInput?channelID=" + id + "&channelPasswordType=" + passwordType);
                    parent.postMessage("OKAY", "*");
                    res();
                }
                else {
                    popupReference.location.href = this.getServerURL() + "/PasswordInput?channelID=" + id + "&channelPasswordType=" + passwordType;
                    timer_1 = setInterval(function () {
                        if (popupReference.closed) {
                            clearInterval(timer_1);
                            res();
                        }
                    }, 500);
                }
                return [2 /*return*/];
            });
        }); });
    };
    BCJS.prototype.getSecureWindowResponse = function (passwordType) {
        return __awaiter(this, void 0, void 0, function () {
            var preAuthObj, isIE, x, id;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.preAuthHandler === undefined) {
                            isIE = window.ActiveXObject || "ActiveXObject" in window;
                            if (window && !isIE) {
                                preAuthObj = window.open('127.0.0.1', '_blank', 'location=yes,menubar=yes,resizable=no,scrollbars=no,status=no,toolbar=no,centerscreen=yes,width=750,height=500');
                                if (preAuthObj === null) {
                                    throw new types_1.DaemonError(types_1.JSErrorCode.popupCreateFailed, 'Could not create popup!');
                                }
                            }
                        }
                        else {
                            preAuthObj = this.preAuthHandler(passwordType);
                        }
                        return [4 /*yield*/, this.getResponsePromised(types_1.Endpoint.GetAuthID)];
                    case 1:
                        x = _a.sent();
                        id = x.body;
                        if (!(this.authHandler === undefined)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.showAuthPopup(id, passwordType, preAuthObj)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, this.authHandler(id, passwordType, preAuthObj)];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [2 /*return*/, id];
                }
            });
        });
    };
    return BCJS;
}());
exports.BCJS = BCJS;
