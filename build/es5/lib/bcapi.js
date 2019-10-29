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
var BCJS = /** @class */ (function () {
    function BCJS() {
        this.Host = "https://localhost.bc-vault.com:1991/";
        /** Is BCData object polling already taking place? */
        this.isPolling = false;
        /** Set Logging verbosity */
        this.logLevel = types_1.LogLevel.debug;
        /** Use cookies for session management. If set to false no cookies will be set and the session will be lost when 'authToken' is unloaded. It will need to be manually specified. It will be automatically refreshed if a request fails due to a token error. */
        this.authTokenUseCookies = true;
        /** How long each auth grant will last in seconds since the last request. */
        this.authTokenExpireSeconds = 3600;
        /** The path to match the auth-token against. This is a security feature and allows you to fine tune access. Default is: '/' (web root) */
        this.authTokenMatchPath = '/';
        /** The current state of the daemon, updated either manually or on device connect/disconnect after calling startObjectPolling  */
        this.BCData = { devices: [] };
        this.API_VERSION = 1;
        this.lastSeenDevices = [];
        this.listeners = [];
        this.stopPolling = false;
        this.lastPushedStatus = types_1.BCDataRefreshStatusCode.Ready;
    }
    BCJS.prototype.BCJS = function (authWindowHandler) {
        if (typeof (window) !== 'undefined') {
            // is browser, ignore param and set default
            this.authHandler = this.showAuthPopup;
        }
        else {
            // is nodejs, authWindowHandler MUST be specified!
            if (typeof (authWindowHandler) !== 'function') {
                throw new Error('authWindowHandler MUST be of type function for BCJS constructor in NodeJS');
            }
            else {
                this.authHandler = authWindowHandler;
            }
        }
    };
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
        this.stopPolling = true;
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
            var e_1, _a, devArray, devs, devArray_1, devArray_1_1, deviceID, activeTypes, e_2, userData, _b, _c, _d, usrDataHex, _e, _f, _g, e_1_1, devices;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        if (!fullUpdate) return [3 /*break*/, 23];
                        return [4 /*yield*/, this.getDevices()];
                    case 1:
                        devArray = _h.sent();
                        devs = [];
                        this.FireAllStatusListeners(1);
                        _h.label = 2;
                    case 2:
                        _h.trys.push([2, 20, 21, 22]);
                        devArray_1 = __values(devArray), devArray_1_1 = devArray_1.next();
                        _h.label = 3;
                    case 3:
                        if (!!devArray_1_1.done) return [3 /*break*/, 19];
                        deviceID = devArray_1_1.value;
                        activeTypes = void 0;
                        _h.label = 4;
                    case 4:
                        _h.trys.push([4, 6, , 11]);
                        return [4 /*yield*/, this.getActiveWalletTypes(deviceID)];
                    case 5:
                        activeTypes = _h.sent();
                        return [3 /*break*/, 11];
                    case 6:
                        e_2 = _h.sent();
                        if (!(e_2.BCHttpResponse !== undefined)) return [3 /*break*/, 10];
                        return [4 /*yield*/, this.getWalletUserData(deviceID, types_1.WalletType.none, "", false)];
                    case 7:
                        userData = _h.sent();
                        _c = (_b = devs).push;
                        _d = {
                            id: deviceID,
                            space: { available: 1, complete: 1 }
                        };
                        return [4 /*yield*/, this.getFirmwareVersion(deviceID)];
                    case 8:
                        _d.firmware = _h.sent(),
                            _d.userData = this.parseHex(userData),
                            _d.userDataRaw = userData;
                        return [4 /*yield*/, this.getSupportedWalletTypes(deviceID)];
                    case 9:
                        _c.apply(_b, [(_d.supportedTypes = _h.sent(),
                                _d.activeTypes = [],
                                _d.activeWallets = [],
                                _d.locked = true,
                                _d)]);
                        return [3 /*break*/, 18];
                    case 10: throw e_2;
                    case 11: return [4 /*yield*/, this.getWalletUserData(deviceID, types_1.WalletType.none, "", false)];
                    case 12:
                        usrDataHex = _h.sent();
                        _f = (_e = devs).push;
                        _g = {
                            id: deviceID
                        };
                        return [4 /*yield*/, this.getDeviceUID(deviceID)];
                    case 13:
                        _g.UID = _h.sent();
                        return [4 /*yield*/, this.getAvailableSpace(deviceID)];
                    case 14:
                        _g.space = _h.sent();
                        return [4 /*yield*/, this.getFirmwareVersion(deviceID)];
                    case 15:
                        _g.firmware = _h.sent();
                        return [4 /*yield*/, this.getSupportedWalletTypes(deviceID)];
                    case 16:
                        _g.supportedTypes = _h.sent(),
                            _g.userData = this.parseHex(usrDataHex),
                            _g.userDataRaw = usrDataHex,
                            _g.activeTypes = activeTypes;
                        return [4 /*yield*/, this.getWallets(deviceID, activeTypes)];
                    case 17:
                        _f.apply(_e, [(_g.activeWallets = _h.sent(),
                                _g.locked = false,
                                _g)]);
                        _h.label = 18;
                    case 18:
                        devArray_1_1 = devArray_1.next();
                        return [3 /*break*/, 3];
                    case 19: return [3 /*break*/, 22];
                    case 20:
                        e_1_1 = _h.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 22];
                    case 21:
                        try {
                            if (devArray_1_1 && !devArray_1_1.done && (_a = devArray_1["return"])) _a.call(devArray_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                        return [7 /*endfinally*/];
                    case 22:
                        this.BCData = { devices: devs };
                        this.FireAllStatusListeners(0);
                        return [3 /*break*/, 26];
                    case 23:
                        devices = void 0;
                        return [4 /*yield*/, this.getDevices()];
                    case 24:
                        devices = _h.sent();
                        if (!(!this.arraysEqual(devices, this.lastSeenDevices) || this.lastPushedStatus === types_1.BCDataRefreshStatusCode.ConnectionError)) return [3 /*break*/, 26];
                        this.lastSeenDevices = devices;
                        return [4 /*yield*/, this.triggerManualUpdate(true)];
                    case 25:
                        _h.sent();
                        _h.label = 26;
                    case 26: return [2 /*return*/];
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
                    case 0: return [4 /*yield*/, this.getResponsePromised(types_1.Endpoint.GetWalletBalance, { walletType: this.toLegacyWalletType(type), walletTypeString: type, sourcePublicID: sourcePublicID })];
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
            var httpr;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getResponsePromised(types_1.Endpoint.DeviceUID, { device: device })];
                    case 1:
                        httpr = _a.sent();
                        this.assertIsBCHttpResponse(httpr);
                        return [2 /*return*/, httpr.body.data];
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
            var httpr, newFormat;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getResponsePromised(types_1.Endpoint.WalletTypes, { device: device })];
                    case 1:
                        httpr = _a.sent();
                        this.assertIsBCHttpResponse(httpr);
                        newFormat = httpr.body.data;
                        if (typeof (newFormat[0]) === typeof (1)) {
                            newFormat = newFormat.map(function (x) { return _this.fromLegacyWalletType(x); });
                        }
                        return [2 /*return*/, newFormat];
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
            var httpr, newFormat;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getResponsePromised(types_1.Endpoint.SavedWalletTypes, { device: device })];
                    case 1:
                        httpr = _a.sent();
                        this.assertIsBCHttpResponse(httpr);
                        newFormat = httpr.body.data;
                        if (typeof (newFormat[0]) === typeof (1)) {
                            newFormat = newFormat.map(function (x) { return _this.fromLegacyWalletType(x); });
                        }
                        return [2 /*return*/, newFormat];
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
                    case 0: return [4 /*yield*/, this.getResponsePromised(types_1.Endpoint.WalletsOfType, { device: device, walletType: this.toLegacyWalletType(type), walletTypeString: type })];
                    case 1:
                        httpr = _a.sent();
                        this.assertIsBCHttpResponse(httpr);
                        return [2 /*return*/, httpr.body.data];
                }
            });
        });
    };
    /**
      Gets the requested data about wallets stored on the device. Details to query can be specified through the final parameter, which is set to query all details by default.
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
            var e_3, _a, e_4, _b, httpr, e_5, outArray, walletTypes_1, walletTypes_1_1, wt, wallets, wallets_1, wallets_1_1, wallet, walletUserData, e_4_1, e_3_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 18]);
                        return [4 /*yield*/, this.getResponsePromised(types_1.Endpoint.WalletsOfTypes, { device: device, walletTypes: walletTypes, walletDetails: walletDetails })];
                    case 1:
                        httpr = _c.sent();
                        this.assertIsBCHttpResponse(httpr);
                        return [2 /*return*/, httpr.body.data];
                    case 2:
                        e_5 = _c.sent();
                        outArray = [];
                        _c.label = 3;
                    case 3:
                        _c.trys.push([3, 15, 16, 17]);
                        walletTypes_1 = __values(walletTypes), walletTypes_1_1 = walletTypes_1.next();
                        _c.label = 4;
                    case 4:
                        if (!!walletTypes_1_1.done) return [3 /*break*/, 14];
                        wt = walletTypes_1_1.value;
                        return [4 /*yield*/, this.getWalletsOfType(device, wt)];
                    case 5:
                        wallets = _c.sent();
                        _c.label = 6;
                    case 6:
                        _c.trys.push([6, 11, 12, 13]);
                        wallets_1 = __values(wallets), wallets_1_1 = wallets_1.next();
                        _c.label = 7;
                    case 7:
                        if (!!wallets_1_1.done) return [3 /*break*/, 10];
                        wallet = wallets_1_1.value;
                        return [4 /*yield*/, this.getWalletUserData(device, wt, wallet, false)];
                    case 8:
                        walletUserData = _c.sent();
                        outArray.push({
                            address: wallet,
                            type: wt,
                            userData: walletUserData
                        });
                        _c.label = 9;
                    case 9:
                        wallets_1_1 = wallets_1.next();
                        return [3 /*break*/, 7];
                    case 10: return [3 /*break*/, 13];
                    case 11:
                        e_4_1 = _c.sent();
                        e_4 = { error: e_4_1 };
                        return [3 /*break*/, 13];
                    case 12:
                        try {
                            if (wallets_1_1 && !wallets_1_1.done && (_b = wallets_1["return"])) _b.call(wallets_1);
                        }
                        finally { if (e_4) throw e_4.error; }
                        return [7 /*endfinally*/];
                    case 13:
                        walletTypes_1_1 = walletTypes_1.next();
                        return [3 /*break*/, 4];
                    case 14: return [3 /*break*/, 17];
                    case 15:
                        e_3_1 = _c.sent();
                        e_3 = { error: e_3_1 };
                        return [3 /*break*/, 17];
                    case 16:
                        try {
                            if (walletTypes_1_1 && !walletTypes_1_1.done && (_a = walletTypes_1["return"])) _a.call(walletTypes_1);
                        }
                        finally { if (e_3) throw e_3.error; }
                        return [7 /*endfinally*/];
                    case 17: return [2 /*return*/, outArray];
                    case 18: return [2 /*return*/];
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
                    case 0: return [4 /*yield*/, this.getResponsePromised(types_1.Endpoint.WalletUserData, { device: device, walletType: this.toLegacyWalletType(type), walletTypeString: type, sourcePublicID: publicAddress })];
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
                        return [4 /*yield*/, this.getResponsePromised(types_1.Endpoint.CopyWalletToType, { device: device, walletType: this.toLegacyWalletType(oldType), walletTypeString: newType, newWalletType: this.toLegacyWalletType(newType), newWalletTypeString: newType, sourcePublicID: publicAddress, password: id })];
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
                    case 0: return [4 /*yield*/, this.getResponsePromised(types_1.Endpoint.IsAddressValid, { device: device, walletType: this.toLegacyWalletType(type), walletTypeString: type, address: publicAddress })];
                    case 1:
                        httpr = _a.sent();
                        return [2 /*return*/, httpr.body.errorCode === 0x9000];
                }
            });
        });
    };
    /**
      Displays address on device for verification
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
                    case 0: return [4 /*yield*/, this.getResponsePromised(types_1.Endpoint.DisplayAddress, { device: device, walletType: this.toLegacyWalletType(type), walletTypeString: type, publicID: publicAddress })];
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
                        return [4 /*yield*/, this.getResponsePromised(types_1.Endpoint.GenerateWallet, { device: device, walletType: this.toLegacyWalletType(type), walletTypeString: type, password: id })];
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
            var id, httpr;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getSecureWindowResponse(types_1.PasswordType.WalletPassword)];
                    case 1:
                        id = _a.sent();
                        this.log("Got auth id:" + id, types_1.LogLevel.debug);
                        this.log("Sending object:" + JSON.stringify({ device: device, walletType: this.toLegacyWalletType(type), walletTypeString: type, transaction: data, password: id }), types_1.LogLevel.debug);
                        return [4 /*yield*/, this.getResponsePromised(types_1.Endpoint.GenerateTransaction, { device: device, walletType: this.toLegacyWalletType(type), walletTypeString: type, transaction: data, password: id, broadcast: broadcast })];
                    case 2:
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
                        this.log("Sending object:" + JSON.stringify({ device: device, walletType: this.toLegacyWalletType(type), walletTypeString: type, sourcePublicID: publicAddress, srcData: data, password: id }), types_1.LogLevel.debug);
                        return [4 /*yield*/, this.getResponsePromised(types_1.Endpoint.SignData, { device: device, walletType: this.toLegacyWalletType(type), walletTypeString: type, sourcePublicID: publicAddress, srcData: data, password: id })];
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
            var devices, wallets, e_6, wallets, e_7;
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
                        e_6 = _a.sent();
                        if (!(e_6.BCHttpResponse !== undefined)) return [3 /*break*/, 7];
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
                        e_7 = _a.sent();
                        cb(e_7, null);
                        return [3 /*break*/, 10];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    BCJS.prototype.web3_signTransaction = function (txParams, cb) {
        return __awaiter(this, void 0, void 0, function () {
            var devices, txHex, e_8;
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
                        e_8 = _a.sent();
                        cb(e_8, null);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    BCJS.prototype.web3_signPersonalMessage = function (msgParams, cb) {
        return __awaiter(this, void 0, void 0, function () {
            var devices, signedMessage, e_9;
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
                        e_9 = _a.sent();
                        cb(e_9, null);
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
                            baseURL: this.Host,
                            method: "POST",
                            url: 'SetBCSessionParams',
                            withCredentials: true,
                            data: scp,
                            headers: { "Api-Version": this.API_VERSION }
                        };
                        if (typeof (window) === 'undefined') {
                            axiosConfig.headers["Origin"] = "https://localhost";
                            axiosConfig.headers["Referer"] = "https://localhost";
                        }
                        return [4 /*yield*/, axios_1["default"](axiosConfig)];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data.d_token];
                }
            });
        });
    };
    BCJS.prototype.getResponsePromised = function (endpoint, data) {
        var _this = this;
        var dataWithToken = __assign({}, (data || {}), { d_token: this.authToken });
        return new Promise(function (res, rej) { return __awaiter(_this, void 0, void 0, function () {
            var methodCheck, e_10, options, responseFunction;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(this.endpointAllowsCredentials === undefined)) return [3 /*break*/, 4];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, axios_1["default"]({ baseURL: this.Host, data: "{}", method: "POST", url: "/Devices" })];
                    case 2:
                        methodCheck = _a.sent();
                        this.endpointAllowsCredentials = methodCheck.data.daemonError === types_1.DaemonErrorCodes.sessionError;
                        return [3 /*break*/, 4];
                    case 3:
                        e_10 = _a.sent();
                        this.log("Daemon offline during initialization.", types_1.LogLevel.debug);
                        return [3 /*break*/, 4];
                    case 4:
                        options = {
                            baseURL: this.Host,
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
                            options.headers["Origin"] = "https://localhost";
                            options.headers["Referer"] = "https://localhost";
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
                                        options.data = JSON.stringify(__assign({}, dataWithToken, { d_token: this.authToken }));
                                        axios_1["default"](options).then(function (authenticatedResponse) {
                                            if (authenticatedResponse.data.daemonError) {
                                                return rej(new types_1.DaemonError({ status: authenticatedResponse.status, body: authenticatedResponse.data }));
                                            }
                                            else {
                                                return res({ status: authenticatedResponse.status, body: authenticatedResponse.data });
                                            }
                                        })["catch"](function (e) {
                                            _this.log("Daemon request failed: " + JSON.stringify(e), types_1.LogLevel.warning);
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
                            _this.log("Daemon request failed: " + JSON.stringify(e), types_1.LogLevel.warning);
                            rej(e);
                        });
                        return [2 /*return*/];
                }
            });
        }); });
    };
    BCJS.prototype.assertIsBCHttpResponse = function (httpr) {
        if (httpr.body.errorCode !== 0x9000)
            throw new types_1.DaemonError(httpr.body);
    };
    BCJS.prototype.log = function (msg, level) {
        if (level === void 0) { level = types_1.LogLevel.verbose; }
        if (this.logLevel <= level) {
            console.log('[' + new Date(Date.now()).toLocaleTimeString() + ']: ' + msg);
        }
    };
    BCJS.prototype.getWallets = function (deviceID, activeTypes) {
        return __awaiter(this, void 0, void 0, function () {
            var e_11, _a, ret, response, response_1, response_1_1, detailItem;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        ret = [];
                        return [4 /*yield*/, this.getBatchWalletDetails(deviceID, activeTypes)];
                    case 1:
                        response = _b.sent();
                        try {
                            for (response_1 = __values(response), response_1_1 = response_1.next(); !response_1_1.done; response_1_1 = response_1.next()) {
                                detailItem = response_1_1.value;
                                ret.push({
                                    publicKey: detailItem.address,
                                    userData: detailItem.userData,
                                    extraData: detailItem.extraData,
                                    walletType: detailItem.type
                                });
                            }
                        }
                        catch (e_11_1) { e_11 = { error: e_11_1 }; }
                        finally {
                            try {
                                if (response_1_1 && !response_1_1.done && (_a = response_1["return"])) _a.call(response_1);
                            }
                            finally { if (e_11) throw e_11.error; }
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
        return __awaiter(this, void 0, void 0, function () {
            var e_12;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.triggerManualUpdate(false)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        e_12 = _a.sent();
                        this.FireAllStatusListeners(-1);
                        console.error(e_12);
                        return [3 /*break*/, 3];
                    case 3:
                        if (this.stopPolling) {
                            this.isPolling = false;
                            this.stopPolling = false;
                            return [2 /*return*/];
                        }
                        setTimeout(function () { return _this.pollDevicesChanged(interval); }, interval);
                        return [2 /*return*/];
                }
            });
        });
    };
    BCJS.prototype.FireAllStatusListeners = function (args) {
        var e_13, _a;
        this.lastPushedStatus = args;
        try {
            for (var _b = __values(this.listeners), _c = _b.next(); !_c.done; _c = _b.next()) {
                var listener = _c.value;
                listener.call(null, args);
            }
        }
        catch (e_13_1) { e_13 = { error: e_13_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
            }
            finally { if (e_13) throw e_13.error; }
        }
    };
    BCJS.prototype.toLegacyWalletType = function (t) {
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
    };
    BCJS.prototype.fromLegacyWalletType = function (t) {
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
    };
    BCJS.prototype.showAuthPopup = function (id, passwordType) {
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
    };
    BCJS.prototype.getSecureWindowResponse = function (passwordType) {
        var _this = this;
        return new Promise(function (res) { return __awaiter(_this, void 0, void 0, function () {
            var x, id;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getResponsePromised(types_1.Endpoint.GetAuthID)];
                    case 1:
                        x = _a.sent();
                        id = x.body;
                        return [4 /*yield*/, this.authHandler(id, passwordType)];
                    case 2:
                        _a.sent();
                        res(id);
                        return [2 /*return*/];
                }
            });
        }); });
    };
    return BCJS;
}());
exports.BCJS = BCJS;
