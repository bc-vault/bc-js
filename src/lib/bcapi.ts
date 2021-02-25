import axios, { AxiosRequestConfig, AxiosError } from 'axios';
import { BCHttpResponse, Endpoint, HttpResponse, SpaceObject, PasswordType, WalletType, DaemonError, VersionObject, TransactionData, BCDataRefreshStatusCode, BCObject, BCDevice, typeInfoMap, WalletTypeInfo, WalletData, LogLevel, SessionCreateParameters, SessionAuthType, DaemonErrorCodes, WalletDetailsQuery, WalletBatchDataResponse, hexString, AuthorizationHandler, DaemonHttpResponse, JSErrorCode, PreAuthorizationHandler } from './types'
import { polyfill } from 'es6-promise'; polyfill();


export class BCJS {



	/** Is BCData object polling already taking place? *///
	public isPolling = false;
	/** Set Logging verbosity */
	public logLevel: LogLevel = LogLevel.debug;
	/** Get/Set token to be used for device actions */
	public authToken: string;
	/** Use cookies for session management. If set to false no cookies will be set and the session will be lost when 'authToken' is unloaded. It will need to be manually specified. It will be automatically refreshed if a request fails due to a token error. */
	public authTokenUseCookies: boolean = true;
	/** How long each auth grant will last in seconds since the last request. */
	public authTokenExpireSeconds: number = 3600;
	/** The path to match the auth-token against. This is a security feature and allows you to fine tune access. Default is: undefined (don't check the full path, note: specifying this may require you to allow https://www.w3.org/TR/referrer-policy/#referrer-policy-origin-when-cross-origin on your webpage depending on which browsers you target) */
	public authTokenMatchPath?: string = undefined;
	/** The current state of the daemon, updated either manually or on device connect/disconnect after calling startObjectPolling  */
	public BCData: BCObject = { devices: [] };


	private readonly API_VERSION = 5;
	private REMOTE_API_VERSION?:number;
	private endpointAllowsCredentials: boolean;
	private lastSeenDevices: number[] = [];
	private listeners: Array<(status: BCDataRefreshStatusCode) => void> = []
	private authHandler?: AuthorizationHandler;
	private preAuthHandler?: PreAuthorizationHandler;
	private lastPushedStatus: BCDataRefreshStatusCode = BCDataRefreshStatusCode.Ready;
	private timeoutRef: any;// polling setTimeout reference
	
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
	public constructor(authWindowHandler?: AuthorizationHandler,preAuthWindowHandler?: PreAuthorizationHandler) {
		if (typeof (window) === 'undefined') {
			// is nodejs, authWindowHandler MUST be specified!
			if (typeof (authWindowHandler) !== 'function') {
				throw new Error('authWindowHandler MUST be of type function for BCJS constructor in NodeJS');
			} else {
				this.authHandler = authWindowHandler;
			}
		}
		if(typeof(preAuthWindowHandler) !== 'function' && typeof(preAuthWindowHandler) !== 'undefined'){
			throw new Error('type of preAuthWindowHandler must be either undefined or function');
		}
		if(typeof(preAuthWindowHandler) === 'function' && !authWindowHandler){
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
	public startObjectPolling(deviceInterval: number = 150): void {
		if (this.isPolling) throw Error("Already polling!");
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
	public stopObjectPolling(): void {
		if (!this.isPolling) {
			throw new Error("Not polling!");
		}
		this.isPolling = false;
		clearTimeout(this.timeoutRef);

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
	public async triggerManualUpdate(fullUpdate: boolean = true): Promise<void> {
		if (fullUpdate) {
			const devArray = await this.getDevices();
			const devs: BCDevice[] = [];
			this.FireAllStatusListeners(1);
			for (const deviceID of devArray) {
				let activeTypes;
				try {
					activeTypes = await this.getActiveWalletTypes(deviceID);
				} catch (e) {
					if (e.BCHttpResponse !== undefined) {
						const userData = await this.getWalletUserData(deviceID, WalletType.none, "", false);
						devs.push({
							id: deviceID,
							space: { available: 1, complete: 1 },
							firmware: await this.getFirmwareVersion(deviceID),
							userData: this.parseHex(userData),
							userDataRaw: userData,
							supportedTypes: await this.getSupportedWalletTypes(deviceID),
							activeTypes: [],
							activeWallets: [],
							locked: true
						});
						continue;
					}
					throw e;
				}
				const usrDataHex = await this.getWalletUserData(deviceID, WalletType.none, "", false);
				let deviceUID;
				try {
					deviceUID = await this.getDeviceUID(deviceID);
				} catch{
					deviceUID = undefined;
				}
				devs.push(
					{
						id: deviceID,
						UID: deviceUID,
						space: await this.getAvailableSpace(deviceID),
						firmware: await this.getFirmwareVersion(deviceID),
						supportedTypes: await this.getSupportedWalletTypes(deviceID),
						userData: this.parseHex(usrDataHex),
						userDataRaw: usrDataHex,
						activeTypes,
						activeWallets: await this.getWallets(deviceID, activeTypes),
						locked: false
					});
			}
			this.BCData = { devices: devs };
			this.FireAllStatusListeners(0);
		} else {
			let devices;
			devices = await this.getDevices();
			if (!this.arraysEqual(devices, this.lastSeenDevices) || this.lastPushedStatus === BCDataRefreshStatusCode.ConnectionError) {
				this.lastSeenDevices = devices;
				await this.triggerManualUpdate(true);
			}
		}
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
	public AddBCDataChangedListener(func: (status: BCDataRefreshStatusCode) => void): void {
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
	public getWalletTypeInfo(id: string): WalletTypeInfo | undefined {
		return typeInfoMap.find(x => x.type === id);
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
	public async getDevices(): Promise<number[]> {
		let httpr;
		httpr = await this.getResponsePromised(Endpoint.Devices);
		this.assertIsBCHttpResponse(httpr);

		return httpr.body.data;
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
	public async getFirmwareVersion(device: number): Promise<VersionObject> {
		let httpr;
		httpr = await this.getResponsePromised(Endpoint.FirmwareVersion, { device });
		this.assertIsBCHttpResponse(httpr);

		return httpr.body.data as VersionObject;
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
	public async getWalletBalance(type: WalletType, sourcePublicID: string): Promise<string> {
		let httpr;
		httpr = await this.getResponsePromised(Endpoint.GetWalletBalance, { walletTypeString: type, sourcePublicID });
		this.assertIsBCHttpResponse(httpr);

		return httpr.body.data as string;
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
	public async getAvailableSpace(device: number): Promise<SpaceObject> {
		let httpr;
		httpr = await this.getResponsePromised(Endpoint.AvailableSpace, { device });
		this.assertIsBCHttpResponse(httpr);
		return httpr.body.data as SpaceObject;
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
	public async getDeviceUID(device: number): Promise<hexString> {
		let httpr;
		try {
			httpr = await this.getResponsePromised(Endpoint.DeviceUID, { device });
			this.assertIsBCHttpResponse(httpr);
		} catch (e) {
			if (e.HttpResponse !== undefined) {
				// daemon predates graceful endpoint error handling
				const err = new DaemonError({
					daemonError: 4,
					parseError: "Command not found"
				});
				throw err;
			}
			throw e;

		}
		return httpr.body.data;
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
	public async getSupportedWalletTypes(device: number): Promise<WalletType[]> {
		let httpr;
		httpr = await this.getResponsePromised(Endpoint.WalletTypes, { device });
		this.assertIsBCHttpResponse(httpr);
		return httpr.body.data;
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
	public async getActiveWalletTypes(device: number): Promise<WalletType[]> {
		let httpr;
		httpr = await this.getResponsePromised(Endpoint.SavedWalletTypes, { device });
		this.assertIsBCHttpResponse(httpr);
		return httpr.body.data;
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
	public async getWalletsOfType(device: number, type: WalletType): Promise<string[]> {
		let httpr;
		httpr = await this.getResponsePromised(Endpoint.WalletsOfType, { device, walletTypeString: type });
		this.assertIsBCHttpResponse(httpr);

		return httpr.body.data as string[];
	}
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
	public async getBatchWalletDetails(device: number, walletTypes: WalletType[], walletDetails: WalletDetailsQuery = WalletDetailsQuery.all): Promise<WalletBatchDataResponse[]> {
		let httpr;
		if(walletTypes.length === 0){
			return [];
		}
		httpr = await this.getResponsePromised(Endpoint.WalletsOfTypes, { device, walletTypes, walletDetails });
		this.assertIsBCHttpResponse(httpr);
		httpr.body.data = httpr.body.data.map(x=>{
			return {...x,userDataRaw: x.userData,userData:this.parseHex(x.userData)}
		})
		return httpr.body.data;
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
	public async getWalletUserData(device: number, type: WalletType, publicAddress: string, shouldParseHex = true): Promise<string> {
		let httpr;
		httpr = await this.getResponsePromised(Endpoint.WalletUserData, { device, walletTypeString: type, sourcePublicID: publicAddress });
		this.assertIsBCHttpResponse(httpr);
		let responseString = httpr.body.data as string;
		if (shouldParseHex) {
			responseString = this.parseHex(responseString);
		}


		return responseString;
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
	public async CopyWalletToType(device: number, oldType: WalletType, newType: WalletType, publicAddress: string): Promise<boolean> {
		let httpr;
		const id = await this.getSecureWindowResponse(PasswordType.WalletPassword);
		httpr = await this.getResponsePromised(Endpoint.CopyWalletToType, { device, walletTypeString: oldType, newWalletTypeString: newType, sourcePublicID: publicAddress, password: id });
		this.assertIsBCHttpResponse(httpr);

		return true;

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
	public async getIsAddressValid(device: number, type: WalletType, publicAddress: string): Promise<boolean> {
		let httpr;
		httpr = await this.getResponsePromised(Endpoint.IsAddressValid, { device, walletTypeString: type, address: publicAddress });

		return (httpr.body as BCHttpResponse).errorCode === 0x9000;

	}

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
	public async DisplayAddressOnDevice(device: number, type: WalletType, publicAddress: string): Promise<boolean> {
		let httpr;
		httpr = await this.getResponsePromised(Endpoint.DisplayAddress, { device, walletTypeString: type, publicID: publicAddress });
		this.assertIsBCHttpResponse(httpr);

		return true;

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
	public async GenerateWallet(device: number, type: WalletType): Promise<string> {
		const id = await this.getSecureWindowResponse(PasswordType.WalletPassword);
		const httpr = await this.getResponsePromised(Endpoint.GenerateWallet, { device, walletTypeString: type, password: id });
		this.assertIsBCHttpResponse(httpr);
		return (httpr.body as BCHttpResponse).data;
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
	public async EnterGlobalPin(device: number, passwordType: PasswordType = PasswordType.GlobalPassword): Promise<void> {
		const id = await this.getSecureWindowResponse(passwordType);
		this.log("Got pin popup:" + id);
		const httpr = await this.getResponsePromised(Endpoint.EnterGlobalPin, { device, password: id });
		this.assertIsBCHttpResponse(httpr);
		this.triggerManualUpdate();
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
	public async GenerateTransaction(device: number, type: WalletType, data: TransactionData, broadcast?: boolean): Promise<string> {
		const apiVersion = await this.getVersion();
		if(data.contractData !== undefined) {
			// check compatibility
			if(apiVersion < 4) {
				throw new Error("Unsupported parameter: contract data. Update daemon.");
			}
		}
		if(data.memo){
			if(apiVersion < 5) {
				throw new Error("Unsupported parameter: memo. Update daemon.");
			}
		}
		if(data.advanced && data.advanced.eth && data.advanced.eth.chainID !== undefined){
			if(apiVersion < 5) {
				throw new Error("Unsupported parameter: advanced.eth.chainID. Update daemon.");
			}
		}
		if(!data.feeCount){
			data.feeCount =0;
		}
		const id = await this.getSecureWindowResponse(PasswordType.WalletPassword);
		this.log("Got auth id:" + id, LogLevel.debug);
		this.log("Sending object:" + JSON.stringify({ device, walletTypeString: type, transaction: data, password: id }), LogLevel.debug);
		const httpr = await this.getResponsePromised(Endpoint.GenerateTransaction, { device, walletTypeString: type, transaction: data, password: id, broadcast });

		this.log(httpr.body, LogLevel.debug);
		this.assertIsBCHttpResponse(httpr);
		// i know.
		// tslint:disable-next-line: no-string-literal
		return httpr.body["data"] as string;
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
	public async SignData(device: number, type: WalletType, publicAddress: string, data: string): Promise<string> {
		const id = await this.getSecureWindowResponse(PasswordType.WalletPassword);
		this.log("Got auth id:" + id, LogLevel.debug);
		this.log("Sending object:" + JSON.stringify({ device, walletTypeString: type, sourcePublicID: publicAddress, srcData: data, password: id }), LogLevel.debug);

		const httpr = await this.getResponsePromised(Endpoint.SignData, { device, walletTypeString: type, sourcePublicID: publicAddress, srcData: data, password: id });

		this.log("Response body:" + httpr.body, LogLevel.debug);
		this.assertIsBCHttpResponse(httpr);
		// i know.
		// tslint:disable-next-line: no-string-literal
		return httpr.body["data"] as string;
	}




	public async web3_GetAccounts(cb: ((err?: any, res?: any) => void)): Promise<void> {
		try {
			const devices = await this.getDevices();
			if (devices.length === 0) {
				cb("No BC Vault connected");
				return;
			}
			try {
				const wallets = await this.getWalletsOfType(devices[0], WalletType.ethereum);
				cb(null, wallets.map((x) => "0x" + x));
			} catch (e) {
				if (e.BCHttpResponse !== undefined) {
					// unlock BC Vault!
					await this.EnterGlobalPin(devices[0], PasswordType.GlobalPassword);
					const wallets = await this.getWalletsOfType(devices[0], WalletType.ethereum);
					return cb(null, wallets.map((x) => "0x" + x));
				}
			}
		} catch (e) {
			cb(e, null)
		}
	}
	public async web3_signTransaction(txParams: any, cb: ((err?: any, res?: any) => void)): Promise<void> {
		try {
			const devices = await this.getDevices();
			if (devices.length === 0) {
				cb("No BC Vault connected");
				return;
			}
			txParams.feePrice = txParams.gasPrice;
			txParams.feeCount = txParams.gas;
			txParams.amount = txParams.value;
			txParams.from = this.toEtherCase(this.strip0x(txParams.from))

			const txHex = await this.GenerateTransaction(devices[devices.length - 1], WalletType.ethereum, txParams)
			cb(null, txHex);
		} catch (e) {
			cb(e, null)
		}
	}

	public async web3_signPersonalMessage(msgParams: any, cb: ((err?: any, res?: any) => void)): Promise<void> {
		try {
			const devices = await this.getDevices();
			if (devices.length === 0) {
				cb("No BC Vault connected");
				return;
			}
			msgParams.from = this.toEtherCase(this.strip0x(msgParams.from))


			const signedMessage = await this.SignData(devices[devices.length - 1], WalletType.ethereum, msgParams.from, msgParams.data);
			cb(null, signedMessage);
		} catch (e) {
			cb(e, null)
		}
	}
	private strip0x(str: string): string {
		if (str.startsWith('0x')) {
			return str.substr(2);
		}
		return str;
	}
	private toEtherCase(inputString: string): string {
		return inputString.toUpperCase();
	}
	private parseHex(str: string): string {
		let out = str;
		if (out.length % 2 === 0) {
			out = out.substr(2);// remove 0x
			const responseStringArray = [...out];
			const byteArrayStr: number[] = [];
			for (let i = 0; i < responseStringArray.length; i += 2) {
				byteArrayStr.push(parseInt(responseStringArray[i] + responseStringArray[i + 1], 16));
			}
			out = String.fromCharCode(...byteArrayStr)
		}
		return out;
	}
	private getServerURL(): string{
		return 'https://localhost:1991';

	}
	private async getNewSession(): Promise<string> {
		const scp: SessionCreateParameters = {
			sessionType: this.authTokenUseCookies ? SessionAuthType.any : SessionAuthType.token,
			expireSeconds: this.authTokenExpireSeconds,
			matchPath: this.authTokenMatchPath,
			versionNumber: this.API_VERSION
		}
		const axiosConfig: AxiosRequestConfig = {
			baseURL: this.getServerURL(),
			method: "POST",
			url: 'SetBCSessionParams',
			withCredentials: true,
			data: scp,
			headers: { "Api-Version": this.API_VERSION }
		}
		if (typeof (window) === 'undefined') {
			axiosConfig.headers.Origin = "https://localhost";
			axiosConfig.headers.Referer = "https://localhost";
		}
		const response = await axios(axiosConfig)
		return response.data.d_token;
	}
	private async getVersion(): Promise<number>{
		if(this.REMOTE_API_VERSION === undefined) {
			this.log('Getting remote version...',LogLevel.verbose)
			const response = await axios(this.getServerURL()+'/version');
			this.REMOTE_API_VERSION = parseInt(response.data,10);
			this.log('Got remote version:' + this.REMOTE_API_VERSION,LogLevel.verbose)
		}
		return this.REMOTE_API_VERSION;
	}
	private getResponsePromised(endpoint: Endpoint, data?: object): Promise<HttpResponse> {
		const dataWithToken = { ...(data || {}), d_token: this.authToken }
		return new Promise(async (res, rej) => {
			if (this.endpointAllowsCredentials === undefined) {
				try {
					const methodCheck = await axios({ baseURL: this.getServerURL(), data: "{}", method: "POST", url: "/Devices" });
					this.endpointAllowsCredentials = methodCheck.data.daemonError === DaemonErrorCodes.sessionError;
				} catch (e) {
					this.log("Daemon offline during initialization.", LogLevel.debug)
					return rej(new DaemonError(e as AxiosError))
				}
			}
			const options: AxiosRequestConfig = {
				baseURL: this.getServerURL(),
				data: JSON.stringify(dataWithToken),
				method: "POST",
				url: endpoint,
				headers: {}
			}
			if (this.endpointAllowsCredentials && this.authTokenUseCookies) {
				options.withCredentials = true;
				options.headers["Api-Version"] = this.API_VERSION;
			}
			if (typeof (window) === 'undefined') {
				options.headers.Origin = "https://localhost";
				options.headers.Referer = "https://localhost";
			}
			this.log(`getResponsePromised - ${endpoint} - ${options.data}`)
			const responseFunction = async (response) => {
				const htpr = { status: response.status, body: response.data };
				if (response.data.daemonError === DaemonErrorCodes.sessionError) {
					this.log(`Creating new session.`, LogLevel.debug);
					this.authToken = await this.getNewSession();
					this.log(`New session created: ${this.authToken}`, LogLevel.debug);
					options.data = JSON.stringify({ ...dataWithToken, d_token: this.authToken });
					axios(options).then((authenticatedResponse) => {
						if (authenticatedResponse.data.daemonError) {
							return rej(new DaemonError(authenticatedResponse.data as DaemonHttpResponse))
						} else {
							return res({ status: authenticatedResponse.status, body: authenticatedResponse.data })
						}
					}).catch((e: any) => {
						this.log(`Daemon request failed: ${JSON.stringify(e)}`, LogLevel.warning);
						rej(new DaemonError(e as AxiosError));
					})
					return;
				}
				res(htpr as HttpResponse);

			}
			axios(options).then(responseFunction).catch((e: AxiosError) => {
				this.log(`Daemon request failed: ${JSON.stringify(e)}`, LogLevel.warning);
				rej(new DaemonError(e as AxiosError));
			});

		});
	}
	private assertIsBCHttpResponse(httpr: HttpResponse): void {
		if ((httpr.body as BCHttpResponse).errorCode !== 0x9000){
			throw new DaemonError(httpr.body as BCHttpResponse)
		}
	}
	private log(msg: any, level = LogLevel.verbose): void {
		if (this.logLevel <= level) {
			console.log('[' + new Date(Date.now()).toLocaleTimeString() + ']: ' + msg);
		}
	}
	private async getWallets(deviceID: number, activeTypes: WalletType[]): Promise<WalletData[]> {
		const ret: WalletData[] = [];
		if(activeTypes.length === 0){
			return [];
		}
		const response = await this.getBatchWalletDetails(deviceID, activeTypes);
		for (const detailItem of response) {
			ret.push({
				publicKey: detailItem.address,
				userData: detailItem.userData,
				userDataRaw: detailItem.userDataRaw,
				extraData: detailItem.extraData,
				walletType: detailItem.type
			})
		}
		return ret;
	}
	private arraysEqual<T>(a: T[], b: T[]): boolean {
		let equal = a.length === b.length;
		for (let i = 0; i < a.length && equal; i++) {
			equal = a[i] === b[i];
		}
		return equal;
	}
	private pollDevicesChanged(interval: number): Promise<void> {
		this.timeoutRef = setTimeout(() => this.pollDevicesChanged(interval), interval);
		return new Promise(async (res) => {
			try {
				await this.triggerManualUpdate(false);
				res();
			} catch (e) {
				this.FireAllStatusListeners(-1);
				console.error(e);
			}
		})
	}
	private FireAllStatusListeners(args: BCDataRefreshStatusCode): void {
		this.lastPushedStatus = args;
		for (const listener of this.listeners) {
			listener.call(null, args);
		}
	}
	private showAuthPopup(id: string, passwordType: PasswordType, popupReference: Window): Promise<void> {
		return new Promise<void>(async (res) => {
			const isIE = (window as any).ActiveXObject || "ActiveXObject" in window;
			if (isIE) {
				(window as any).showModalDialog(this.getServerURL() + "/PasswordInput?channelID=" + id + "&channelPasswordType=" + passwordType);
				parent.postMessage("OKAY", "*");
				res();
			} else {
				popupReference.location.href = this.getServerURL() + "/PasswordInput?channelID=" + id + "&channelPasswordType=" + passwordType;
				const timer = setInterval(() => {
					if ((popupReference as Window).closed) {
						clearInterval(timer);
						res();
					}
				}, 500);
			}
		});
	}

	private async getSecureWindowResponse(passwordType: PasswordType): Promise<string> {
		let preAuthObj:any;
		if (this.preAuthHandler === undefined) {
			const isIE = (window as any).ActiveXObject || "ActiveXObject" in window;
			if(window && !isIE){
				preAuthObj = window.open('127.0.0.1', '_blank','location=yes,menubar=yes,resizable=no,scrollbars=no,status=no,toolbar=no,centerscreen=yes,width=750,height=500')
				if(preAuthObj === null){
					throw new DaemonError(JSErrorCode.popupCreateFailed,'Could not create popup!');
				}
			}
		}else{
			preAuthObj = this.preAuthHandler(passwordType);
		}
		const x = await this.getResponsePromised(Endpoint.GetAuthID);
		const id = x.body as string;
		if (this.authHandler === undefined) {
			await this.showAuthPopup(id, passwordType,preAuthObj);
		} else {
			await this.authHandler(id, passwordType,preAuthObj);
		}
		return id;
	}
}