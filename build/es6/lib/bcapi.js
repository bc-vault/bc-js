"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const types_1 = require("./types");
const sha3_1 = require("sha3");
const es6_promise_1 = require("es6-promise");
es6_promise_1.polyfill();
class BCJS {
    constructor() {
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
        this.API_VERSION = 2;
        this.lastSeenDevices = [];
        this.listeners = [];
        this.stopPolling = false;
        this.lastPushedStatus = types_1.BCDataRefreshStatusCode.Ready;
    }
    BCJS(authWindowHandler) {
        if (typeof (window) === 'undefined') {
            // is nodejs, authWindowHandler MUST be specified!
            if (typeof (authWindowHandler) !== 'function') {
                throw new Error('authWindowHandler MUST be of type function for BCJS constructor in NodeJS');
            }
            else {
                this.authHandler = authWindowHandler;
            }
        }
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
    startObjectPolling(deviceInterval = 150) {
        if (this.isPolling)
            throw Error("Already polling!");
        this.isPolling = true;
        // pollBCObject(fullInterval);
        this.pollDevicesChanged(deviceInterval);
    }
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
    stopObjectPolling() {
        this.stopPolling = true;
    }
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
    triggerManualUpdate(fullUpdate = true) {
        return __awaiter(this, void 0, void 0, function* () {
            if (fullUpdate) {
                const devArray = yield this.getDevices();
                const devs = [];
                this.FireAllStatusListeners(1);
                for (const deviceID of devArray) {
                    let activeTypes;
                    try {
                        activeTypes = yield this.getActiveWalletTypes(deviceID);
                    }
                    catch (e) {
                        if (e.BCHttpResponse !== undefined) {
                            const userData = yield this.getWalletUserData(deviceID, types_1.WalletType.none, "", false);
                            devs.push({
                                id: deviceID,
                                space: { available: 1, complete: 1 },
                                firmware: yield this.getFirmwareVersion(deviceID),
                                userData: this.parseHex(userData),
                                userDataRaw: userData,
                                supportedTypes: yield this.getSupportedWalletTypes(deviceID),
                                activeTypes: [],
                                activeWallets: [],
                                locked: true
                            });
                            continue;
                        }
                        throw e;
                    }
                    const usrDataHex = yield this.getWalletUserData(deviceID, types_1.WalletType.none, "", false);
                    let deviceUID;
                    try {
                        deviceUID = yield this.getDeviceUID(deviceID);
                    }
                    catch (_a) {
                        deviceUID = undefined;
                    }
                    devs.push({
                        id: deviceID,
                        UID: deviceUID,
                        space: yield this.getAvailableSpace(deviceID),
                        firmware: yield this.getFirmwareVersion(deviceID),
                        supportedTypes: yield this.getSupportedWalletTypes(deviceID),
                        userData: this.parseHex(usrDataHex),
                        userDataRaw: usrDataHex,
                        activeTypes,
                        activeWallets: yield this.getWallets(deviceID, activeTypes),
                        locked: false
                    });
                }
                this.BCData = { devices: devs };
                this.FireAllStatusListeners(0);
            }
            else {
                let devices;
                devices = yield this.getDevices();
                if (!this.arraysEqual(devices, this.lastSeenDevices) || this.lastPushedStatus === types_1.BCDataRefreshStatusCode.ConnectionError) {
                    this.lastSeenDevices = devices;
                    yield this.triggerManualUpdate(true);
                }
            }
        });
    }
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
    AddBCDataChangedListener(func) {
        this.listeners.push(func);
    }
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
    getWalletTypeInfo(id) {
        return types_1.typeInfoMap.find(x => x.type === id);
    }
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
    getDevices() {
        return __awaiter(this, void 0, void 0, function* () {
            let httpr;
            httpr = yield this.getResponsePromised(types_1.Endpoint.Devices);
            this.assertIsBCHttpResponse(httpr);
            return httpr.body.data;
        });
    }
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
    getFirmwareVersion(device) {
        return __awaiter(this, void 0, void 0, function* () {
            let httpr;
            httpr = yield this.getResponsePromised(types_1.Endpoint.FirmwareVersion, { device });
            this.assertIsBCHttpResponse(httpr);
            return httpr.body.data;
        });
    }
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
    getWalletBalance(type, sourcePublicID) {
        return __awaiter(this, void 0, void 0, function* () {
            let httpr;
            httpr = yield this.getResponsePromised(types_1.Endpoint.GetWalletBalance, { walletType: this.toLegacyWalletType(type), walletTypeString: type, sourcePublicID });
            this.assertIsBCHttpResponse(httpr);
            return httpr.body.data;
        });
    }
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
    getAvailableSpace(device) {
        return __awaiter(this, void 0, void 0, function* () {
            let httpr;
            httpr = yield this.getResponsePromised(types_1.Endpoint.AvailableSpace, { device });
            this.assertIsBCHttpResponse(httpr);
            return httpr.body.data;
        });
    }
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
    getDeviceUID(device) {
        return __awaiter(this, void 0, void 0, function* () {
            let httpr;
            try {
                httpr = yield this.getResponsePromised(types_1.Endpoint.DeviceUID, { device });
                this.assertIsBCHttpResponse(httpr);
            }
            catch (_a) {
                httpr = yield axios_1.default({
                    method: 'get',
                    baseURL: this.Host,
                    url: '/version'
                });
                if (httpr.data === "1") {
                    // daemon predates graceful endpoint error handling
                    const err = new types_1.DaemonError({
                        daemonError: 4,
                        parseError: "Command not found"
                    });
                    throw err;
                }
            }
            return httpr.body.data;
        });
    }
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
    getSupportedWalletTypes(device) {
        return __awaiter(this, void 0, void 0, function* () {
            let httpr;
            httpr = yield this.getResponsePromised(types_1.Endpoint.WalletTypes, { device });
            this.assertIsBCHttpResponse(httpr);
            let newFormat = httpr.body.data;
            if (typeof (newFormat[0]) === typeof (1)) {
                newFormat = newFormat.map(x => this.fromLegacyWalletType(x));
            }
            return newFormat;
        });
    }
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
    getActiveWalletTypes(device) {
        return __awaiter(this, void 0, void 0, function* () {
            let httpr;
            httpr = yield this.getResponsePromised(types_1.Endpoint.SavedWalletTypes, { device });
            this.assertIsBCHttpResponse(httpr);
            let newFormat = httpr.body.data;
            if (typeof (newFormat[0]) === typeof (1)) {
                newFormat = newFormat.map(x => this.fromLegacyWalletType(x));
            }
            return newFormat;
        });
    }
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
    getWalletsOfType(device, type) {
        return __awaiter(this, void 0, void 0, function* () {
            let httpr;
            httpr = yield this.getResponsePromised(types_1.Endpoint.WalletsOfType, { device, walletType: this.toLegacyWalletType(type), walletTypeString: type });
            this.assertIsBCHttpResponse(httpr);
            return httpr.body.data;
        });
    }
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
    getBatchWalletDetails(device, walletTypes, walletDetails = types_1.WalletDetailsQuery.all) {
        return __awaiter(this, void 0, void 0, function* () {
            let httpr;
            try {
                httpr = yield this.getResponsePromised(types_1.Endpoint.WalletsOfTypes, { device, walletTypes, walletDetails });
                this.assertIsBCHttpResponse(httpr);
                return httpr.body.data;
            }
            catch (e) {
                // legacy daemon
                const outArray = [];
                for (const wt of walletTypes) {
                    const wallets = yield this.getWalletsOfType(device, wt);
                    for (const wallet of wallets) {
                        const walletUserData = yield this.getWalletUserData(device, wt, wallet, false);
                        outArray.push({
                            address: wallet,
                            type: wt,
                            userData: walletUserData
                        });
                    }
                }
                return outArray;
            }
        });
    }
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
    getWalletUserData(device, type, publicAddress, shouldParseHex = true) {
        return __awaiter(this, void 0, void 0, function* () {
            let httpr;
            httpr = yield this.getResponsePromised(types_1.Endpoint.WalletUserData, { device, walletType: this.toLegacyWalletType(type), walletTypeString: type, sourcePublicID: publicAddress });
            this.assertIsBCHttpResponse(httpr);
            let responseString = httpr.body.data;
            if (shouldParseHex) {
                responseString = this.parseHex(responseString);
            }
            return responseString;
        });
    }
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
    CopyWalletToType(device, oldType, newType, publicAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            let httpr;
            const id = yield this.getSecureWindowResponse(types_1.PasswordType.WalletPassword);
            httpr = yield this.getResponsePromised(types_1.Endpoint.CopyWalletToType, { device, walletType: this.toLegacyWalletType(oldType), walletTypeString: newType, newWalletType: this.toLegacyWalletType(newType), newWalletTypeString: newType, sourcePublicID: publicAddress, password: id });
            this.assertIsBCHttpResponse(httpr);
            return true;
        });
    }
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
    getIsAddressValid(device, type, publicAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            let httpr;
            httpr = yield this.getResponsePromised(types_1.Endpoint.IsAddressValid, { device, walletType: this.toLegacyWalletType(type), walletTypeString: type, address: publicAddress });
            return httpr.body.errorCode === 0x9000;
        });
    }
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
    DisplayAddressOnDevice(device, type, publicAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            let httpr;
            httpr = yield this.getResponsePromised(types_1.Endpoint.DisplayAddress, { device, walletType: this.toLegacyWalletType(type), walletTypeString: type, publicID: publicAddress });
            this.assertIsBCHttpResponse(httpr);
            return true;
        });
    }
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
    GenerateWallet(device, type) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = yield this.getSecureWindowResponse(types_1.PasswordType.WalletPassword);
            const httpr = yield this.getResponsePromised(types_1.Endpoint.GenerateWallet, { device, walletType: this.toLegacyWalletType(type), walletTypeString: type, password: id });
            this.assertIsBCHttpResponse(httpr);
            return httpr.body.data;
        });
    }
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
    EnterGlobalPin(device, passwordType = types_1.PasswordType.GlobalPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = yield this.getSecureWindowResponse(passwordType);
            this.log("Got pin popup:" + id);
            const httpr = yield this.getResponsePromised(types_1.Endpoint.EnterGlobalPin, { device, password: id });
            this.assertIsBCHttpResponse(httpr);
            this.triggerManualUpdate();
        });
    }
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
    GenerateTransaction(device, type, data, broadcast) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = yield this.getSecureWindowResponse(types_1.PasswordType.WalletPassword);
            this.log("Got auth id:" + id, types_1.LogLevel.debug);
            this.log("Sending object:" + JSON.stringify({ device, walletType: this.toLegacyWalletType(type), walletTypeString: type, transaction: data, password: id }), types_1.LogLevel.debug);
            const httpr = yield this.getResponsePromised(types_1.Endpoint.GenerateTransaction, { device, walletType: this.toLegacyWalletType(type), walletTypeString: type, transaction: data, password: id, broadcast });
            this.log(httpr.body, types_1.LogLevel.debug);
            this.assertIsBCHttpResponse(httpr);
            // i know.
            // tslint:disable-next-line: no-string-literal
            return httpr.body["data"];
        });
    }
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
    SignData(device, type, publicAddress, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = yield this.getSecureWindowResponse(types_1.PasswordType.WalletPassword);
            this.log("Got auth id:" + id, types_1.LogLevel.debug);
            this.log("Sending object:" + JSON.stringify({ device, walletType: this.toLegacyWalletType(type), walletTypeString: type, sourcePublicID: publicAddress, srcData: data, password: id }), types_1.LogLevel.debug);
            const httpr = yield this.getResponsePromised(types_1.Endpoint.SignData, { device, walletType: this.toLegacyWalletType(type), walletTypeString: type, sourcePublicID: publicAddress, srcData: data, password: id });
            this.log("Response body:" + httpr.body, types_1.LogLevel.debug);
            this.assertIsBCHttpResponse(httpr);
            // i know.
            // tslint:disable-next-line: no-string-literal
            return httpr.body["data"];
        });
    }
    web3_GetAccounts(cb) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const devices = yield this.getDevices();
                if (devices.length === 0) {
                    cb("No BC Vault connected");
                    return;
                }
                try {
                    const wallets = yield this.getWalletsOfType(devices[0], types_1.WalletType.ethereum);
                    cb(null, wallets.map((x) => "0x" + x));
                }
                catch (e) {
                    if (e.BCHttpResponse !== undefined) {
                        // unlock BC Vault!
                        yield this.EnterGlobalPin(devices[0], types_1.PasswordType.GlobalPassword);
                        const wallets = yield this.getWalletsOfType(devices[0], types_1.WalletType.ethereum);
                        return cb(null, wallets.map((x) => "0x" + x));
                    }
                }
            }
            catch (e) {
                cb(e, null);
            }
        });
    }
    web3_signTransaction(txParams, cb) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const devices = yield this.getDevices();
                if (devices.length === 0) {
                    cb("No BC Vault connected");
                    return;
                }
                txParams.feePrice = txParams.gasPrice;
                txParams.feeCount = txParams.gas;
                txParams.amount = txParams.value;
                txParams.from = this.toEtherCase(this.strip0x(txParams.from));
                const txHex = yield this.GenerateTransaction(devices[devices.length - 1], types_1.WalletType.ethereum, txParams);
                cb(null, txHex);
            }
            catch (e) {
                cb(e, null);
            }
        });
    }
    web3_signPersonalMessage(msgParams, cb) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const devices = yield this.getDevices();
                if (devices.length === 0) {
                    cb("No BC Vault connected");
                    return;
                }
                msgParams.from = this.toEtherCase(this.strip0x(msgParams.from));
                const signedMessage = yield this.SignData(devices[devices.length - 1], types_1.WalletType.ethereum, msgParams.from, msgParams.data);
                cb(null, signedMessage);
            }
            catch (e) {
                cb(e, null);
            }
        });
    }
    strip0x(str) {
        if (str.startsWith('0x')) {
            return str.substr(2);
        }
        return str;
    }
    toEtherCase(inputString) {
        const kec = new sha3_1.Keccak(256);
        kec.update(inputString.toLowerCase());
        const keccakArray = kec.digest('hex').split('');
        const upperCase = '89abcdef';
        return inputString.toLowerCase().split('').map((x, idx) => {
            if (upperCase.indexOf(keccakArray[idx]) !== -1) {
                return x.toUpperCase();
            }
            return x;
        }).join('');
    }
    parseHex(str) {
        let out = str;
        if (out.length % 2 === 0) {
            out = out.substr(2); // remove 0x
            const responseStringArray = [...out];
            const byteArrayStr = [];
            for (let i = 0; i < responseStringArray.length; i += 2) {
                byteArrayStr.push(parseInt(responseStringArray[i] + responseStringArray[i + 1], 16));
            }
            out = String.fromCharCode(...byteArrayStr);
        }
        return out;
    }
    getNewSession() {
        return __awaiter(this, void 0, void 0, function* () {
            const scp = {
                sessionType: this.authTokenUseCookies ? types_1.SessionAuthType.any : types_1.SessionAuthType.token,
                expireSeconds: this.authTokenExpireSeconds,
                matchPath: this.authTokenMatchPath,
                versionNumber: this.API_VERSION
            };
            const axiosConfig = {
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
            const response = yield axios_1.default(axiosConfig);
            return response.data.d_token;
        });
    }
    getResponsePromised(endpoint, data) {
        const dataWithToken = Object.assign({}, (data || {}), { d_token: this.authToken });
        return new Promise((res, rej) => __awaiter(this, void 0, void 0, function* () {
            if (this.endpointAllowsCredentials === undefined) {
                try {
                    const methodCheck = yield axios_1.default({ baseURL: this.Host, data: "{}", method: "POST", url: "/Devices" });
                    this.endpointAllowsCredentials = methodCheck.data.daemonError === types_1.DaemonErrorCodes.sessionError;
                }
                catch (e) {
                    this.log("Daemon offline during initialization.", types_1.LogLevel.debug);
                    return rej(new types_1.DaemonError(e));
                }
            }
            const options = {
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
            this.log(`getResponsePromised - ${endpoint} - ${options.data}`);
            const responseFunction = (response) => __awaiter(this, void 0, void 0, function* () {
                const htpr = { status: response.status, body: response.data };
                if (response.data.daemonError === types_1.DaemonErrorCodes.sessionError) {
                    this.log(`Creating new session.`, types_1.LogLevel.debug);
                    this.authToken = yield this.getNewSession();
                    this.log(`New session created: ${this.authToken}`, types_1.LogLevel.debug);
                    options.data = JSON.stringify(Object.assign({}, dataWithToken, { d_token: this.authToken }));
                    axios_1.default(options).then((authenticatedResponse) => {
                        if (authenticatedResponse.data.daemonError) {
                            return rej(new types_1.DaemonError(authenticatedResponse.data));
                        }
                        else {
                            return res({ status: authenticatedResponse.status, body: authenticatedResponse.data });
                        }
                    }).catch((e) => {
                        this.log(`Daemon request failed: ${JSON.stringify(e)}`, types_1.LogLevel.warning);
                        rej(new types_1.DaemonError(e));
                    });
                    return;
                }
                res(htpr);
            });
            axios_1.default(options).then(responseFunction).catch((e) => {
                this.log(`Daemon request failed: ${JSON.stringify(e)}`, types_1.LogLevel.warning);
                rej(new types_1.DaemonError(e));
            });
        }));
    }
    assertIsBCHttpResponse(httpr) {
        if (httpr.body.errorCode !== 0x9000)
            throw new types_1.DaemonError(httpr.body);
    }
    log(msg, level = types_1.LogLevel.verbose) {
        if (this.logLevel <= level) {
            console.log('[' + new Date(Date.now()).toLocaleTimeString() + ']: ' + msg);
        }
    }
    getWallets(deviceID, activeTypes) {
        return __awaiter(this, void 0, void 0, function* () {
            const ret = [];
            const response = yield this.getBatchWalletDetails(deviceID, activeTypes);
            for (const detailItem of response) {
                ret.push({
                    publicKey: detailItem.address,
                    userData: detailItem.userData,
                    extraData: detailItem.extraData,
                    walletType: detailItem.type
                });
            }
            return ret;
        });
    }
    arraysEqual(a, b) {
        let equal = a.length === b.length;
        for (let i = 0; i < a.length && equal; i++) {
            equal = a[i] === b[i];
        }
        return equal;
    }
    pollDevicesChanged(interval) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.triggerManualUpdate(false);
            }
            catch (e) {
                this.FireAllStatusListeners(-1);
                console.error(e);
            }
            if (this.stopPolling) {
                this.isPolling = false;
                this.stopPolling = false;
                return;
            }
            setTimeout(() => this.pollDevicesChanged(interval), interval);
        });
    }
    FireAllStatusListeners(args) {
        this.lastPushedStatus = args;
        for (const listener of this.listeners) {
            listener.call(null, args);
        }
    }
    toLegacyWalletType(t) {
        let stringId;
        for (const typeProperty in types_1.WalletType) {
            if (types_1.WalletType[typeProperty] === t) {
                stringId = typeProperty;
            }
        }
        if (stringId === undefined) {
            return 2147483646;
        }
        for (const legacyTypeProperty in types_1.WalletType_Legacy) {
            if (legacyTypeProperty === stringId) {
                return types_1.WalletType_Legacy[legacyTypeProperty];
            }
        }
        return 2147483646;
    }
    fromLegacyWalletType(t) {
        let stringId;
        for (const legacyTypeProperty in types_1.WalletType_Legacy) {
            if (types_1.WalletType_Legacy[legacyTypeProperty] === t) {
                stringId = legacyTypeProperty;
            }
        }
        if (stringId === undefined) {
            return "Unknown:" + t;
        }
        for (const typeProperty in types_1.WalletType) {
            if (typeProperty === stringId) {
                return types_1.WalletType[typeProperty];
            }
        }
        return "Unknown:" + t;
    }
    showAuthPopup(id, passwordType) {
        return new Promise((res) => {
            const isIE = window.ActiveXObject || "ActiveXObject" in window;
            let target;
            if (isIE) {
                window.showModalDialog("https://localhost.bc-vault.com:1991/PasswordInput?channelID=" + id + "&channelPasswordType=" + passwordType);
                parent.postMessage("OKAY", "*");
                res();
            }
            else {
                target = window.open("https://localhost.bc-vault.com:1991/PasswordInput?channelID=" + id + "&channelPasswordType=" + passwordType, "_blank", "location=no,menubar=no,resizable=no,scrollbars=no,status=no,toolbar=no,centerscreen=yes,width=750,height:500");
                if (target === null)
                    throw TypeError("Could not create popup!");
                const timer = setInterval(() => {
                    if (target.closed) {
                        clearInterval(timer);
                        res();
                    }
                }, 500);
            }
        });
    }
    getSecureWindowResponse(passwordType) {
        return new Promise((res) => __awaiter(this, void 0, void 0, function* () {
            const x = yield this.getResponsePromised(types_1.Endpoint.GetAuthID);
            const id = x.body;
            if (this.authHandler === undefined) {
                yield this.showAuthPopup(id, passwordType);
            }
            else {
                yield this.authHandler(id, passwordType);
            }
            res(id);
        }));
    }
}
exports.BCJS = BCJS;
