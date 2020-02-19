import { AxiosError } from "axios";

export interface HttpResponse{
    readonly status:number;
    readonly body?: any;
  
  }
  export interface BCHttpResponse{
    readonly errorCode:number;
    readonly data:any;
  }
  export interface DaemonHttpResponse{
    readonly daemonError: number;
    readonly parseError: string;
  }
  export type hexString = string;
  export enum LogLevel{
    verbose=1,
    debug=2,
    warning=3,
    error=4
  }
  /**
   * @description the type of address, segwit, legacy etc...
   */
  export enum AddressType{
    All = 0,
    PKH,
    PSH,
    P2WPKH,
    B32,
    BCHNew,
    EOSAccount,
    EOSOwner,
    EOSActive,
    EOS,
    EOSK1,
    err
  }
  export enum StellarCreateAccount{
    No,
    Yes,
    FetchFromNetwork=0xff
  }
  export interface Utxo{
    txId: string,
    outputIndex: number,
    amount: number,
    address: number,
    type: AddressType
  }
  export interface AdvancedBTC{
    utxos: Utxo[];
  }
  export interface AdvancedETH{
    nonce: number;
  }
  export interface AdvancedTRX{
    timeStamp: number;
    refBlockBytes: number;
    refBlockHash: number;
    expiration: number;
  }
  export interface AdvancedEOS{
    expiration: number;
    refBlockNum: number;
    refBlockPrefix: number;
  }
  export interface AdvancedBNB{
    accountNumber: number;
    nonce: number;
    networkId: string;
  }
  export interface AdvancedXRP{
    nonce: number;
  }
  export interface AdvancedXLM{
    nonce: number;
    createDestination: StellarCreateAccount;
  }
  export interface AdvancedOptions{
    btc?:AdvancedBTC;
    eth?:AdvancedETH;
    trx?:AdvancedTRX;
    eos?:AdvancedEOS;
    bnb?:AdvancedBNB;
    xrp?:AdvancedXRP;
    xlm?:AdvancedXLM;
  }
  export interface TransactionData{
    /**
     * @description the public address from which to send
     */
    from:string;
    /**
     * @description the public address to which to send
     */
    to:string;
    /**
     * @description the transaction fee count (in eth this is not optional as the Gas Limit, in btc and others it's an ignored field)
     */
    feeCount?:number;
    /**
     * @description the price to pay for each fee( in BTC this is the transaction fee, in eth this is gas price) capped to 2^64.
     * @description This field is in MINIMUM CURRENCY UNITS (sat for BTC, wei for ETH) and is an INTEGER AS A STRING, not a decimal
     */
    feePrice:string;
    /**
     * @description the amount to send.
     * @description This field is in MINIMUM CURRENCY UNITS (sat for BTC, wei for ETH) and is an INTEGER AS A STRING, not a decimal
     */
    amount:string;
    /** 
     * @description an optional set of parameters used for offline transaction generation.
    */
	advanced?:AdvancedOptions
	/**
	 * @description Optional contract data specified for ethereum transactions
	 */
	contractData?: hexString
  }
  /**
   * @description The DaemonError class contains a BCHttpResponse and a HttpResponse, depending on where the failure was
   * @description HttpResponse !== undefined if the response code was != 200 or if the request itself failed
   * @description BCHttpResponse !== undefined if the request succeeded but the device returned an error code. 
   */
  export class DaemonError extends Error {
    /**
     * @description HttpResponse !== undefined if the request failed, this means the daemon could not be reached. 
     */
    public HttpResponse?:AxiosError
    /**
     * @description BCHttpResponse !== undefined if the request succeeded but the device returned an error code. 
     */
    public BCHttpResponse?:BCHttpResponse
    /**
     * @description DaemonHttpResponse !== undefined if the request reached the daemon, who then reject it for a specified reason. 
     */
    public DaemonHttpResponse?:DaemonHttpResponse
    // tslint:disable: no-string-literal
    constructor(data: BCHttpResponse | DaemonHttpResponse | AxiosError,m:string="DaemonError") {
        super(m);

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, DaemonError.prototype);
        this.name="DaemonError";
        if(data['config'] !== undefined){
          this.HttpResponse = data as AxiosError;
          return;
        }
        if(data['errorCode'] !== undefined){
          this.BCHttpResponse = data as BCHttpResponse;
          return;
        }
        if(data['daemonError'] !== undefined){
          this.DaemonHttpResponse = data as DaemonHttpResponse;
          return;
        }
        throw new Error('Error could not be parsed, this should never happen.');
        
    }
    // tslint:enable: no-string-literal
  }
  export interface VersionObject{
    major:number
    minor:number
    revision:number
    date:DateObject
    apiVersion:ApiVersionObject

  }
  export interface ApiVersionObject{
    major:number
    minor:number
  }
  export interface DateObject{
    day:number
    month:number
    year:number
  }
  export enum Endpoint{
    Devices             ="Devices",
    FirmwareVersion     ="FirmwareVersion",
    AvailableSpace      ="AvailableSpace",
    WalletTypes         ="WalletTypes",
    SavedWalletTypes    ="SavedWalletTypes",
    WalletsOfType       ="WalletsOfType",
    WalletsOfTypes       ="WalletsOfTypes",
    GenerateWallet      ="GenerateWallet",
    WalletUserData      ="WalletUserData",
    GenerateTransaction ="GenerateTransaction",
    SignTransactionData ="SignTransactionData",
    CopyWalletToType    ="CopyWalletToType",
    IsAddressValid      ="IsAddressValid",
    EnterGlobalPin      ="EnterGlobalPin",
    DisplayAddress      ="DisplayAddress",
    PasswordInput       ="PasswordInput",
    GetAuthID           ="GetAuthID",
    GetWalletBalance    ="WalletBalance",
    SignData            ="SignData",
    DeviceUID           ="DeviceUID"

  }
  export interface SpaceObject{
    readonly available:number;
    readonly complete:number;
  }
  export enum WalletType{
    none,
    bitCoin		  	    ="BitCoin1",
    ethereum	  	    ="Ethereum",
    ripple		  	    ="Ripple01",
    stellar		  	    ="Stellar1",
    eos				        ="Eos____1",
    binanceCoin	      ="Bnb____1",
    tron			  	    ="Tron___1",
    bitCoinCash		    ="BcCash01",
    bitcoinGold		    ="BcGold01",
    liteCoin			    ="LiteCoi1",
    dash			  	    ="Dash0001",
    dogeCoin			    ="DogeCoi1",
    groestlcoin		    ="Groestl1",
    erc20Salt		    	="E2Salt_1",
    erc20Polymath		  ="E2Polym1",
    erc200x 	        ="E2_0X__1",
    erc20Cindicator		="E2Cindi1",
    erc20CargoX		    ="E2Cargo1",
    erc20Viberate		  ="E2Viber1",
    erc20Iconomi 	    ="E2Icono1",
    erc20DTR		      ="E2DynTR1",
    erc20OriginTrail	="E2OriTr1",
    erc20InsurePal		="E2InsuP1",
    erc20Xaurum	      ="E2Xauru1",
    erc20OmiseGo 	    ="E2Omise1",
    erc20WaltonChain	="E2WaltC1",
  }
  export interface WalletTypeInfo{
    type:WalletType
    name:string;
    ticker:string;
  }
  export const typeInfoMap:WalletTypeInfo[] = [
    {type:WalletType.bitCoin,name:"Bitcoin", ticker:"BTC"},
    {type:WalletType.ethereum,name:"Ethereum", ticker:"ETH"},
    {type:WalletType.bitCoinCash,name:"Bitcoin Cash", ticker:"BCH"},
    {type:WalletType.liteCoin,name:"Litecoin", ticker:"LTC"},
    {type:WalletType.dash,name:"Dash", ticker:"DASH"},
    {type:WalletType.dogeCoin,name:"Dogecoin", ticker:"DOGE"},
    {type:WalletType.eos,name:"EOS", ticker:"EOS"},
    {type:WalletType.binanceCoin,name:"Binance", ticker:"BNB"},
    {type:WalletType.tron,name:"TRON", ticker:"TRX"},
    {type:WalletType.groestlcoin,name:"Groestlcoin", ticker:"GRS"},
    {type:WalletType.erc20Salt,name:"Salt" ,ticker:"SALT"},
    {type:WalletType.erc20Polymath,name:"Polymath" ,ticker:"POLY"},
    {type:WalletType.erc200x,name:"0X" ,ticker:"ZRX"},
    {type:WalletType.erc20Cindicator,name:"Cindicator" ,ticker:"CND"},
    {type:WalletType.erc20CargoX,name:"CargoX" ,ticker:"CXO"},
    {type:WalletType.erc20Viberate,name:"Viberate" ,ticker:"VIB"},
    {type:WalletType.erc20Iconomi,name:"Iconomi" ,ticker:"ICN"},
    {type:WalletType.erc20DTR,name:"Dynamic Trading Rights" ,ticker:"DTR"},
    {type:WalletType.erc20OriginTrail,name:"OriginTrail" ,ticker:"TRAC"},
    {type:WalletType.erc20InsurePal,name:"InsurePal" ,ticker:"IPL"},
    {type:WalletType.erc20Xaurum,name:"Xaurum" ,ticker:"XAURUM"},
    {type:WalletType.erc20OmiseGo,name:"OmiseGo" ,ticker:"OMG"},
    {type:WalletType.erc20WaltonChain,name:"WaltonChain" ,ticker:"WTC"},
    {type:WalletType.ripple,name:"Ripple", ticker:"XRP"},
    {type:WalletType.stellar,name:"Stellar", ticker:"XLM"},
  ];

  export interface BCObject{
    devices:BCDevice[];

  }
  export interface BCDevice{
    id:number;
    UID?:hexString;
    space:SpaceObject;
    firmware:VersionObject;
    userData:string;
    userDataRaw:hexString;
    supportedTypes:WalletType[];
    activeTypes:WalletType[];
    activeWallets:WalletData[];
    locked:boolean;
  }
  /**
   * This is a function which must submit a device or wallet password to the daemon for use in the next call.
   * See showAuthPopup and the popup for implementation ideas. A function of this type must be specified in the constructor of BCJS in node, but in the browser it is ignored/optional.
   * The call you are expected to make can be found in the source of:
   * https://localhost.bc-vault.com:1991/PasswordInput?channelID=1&channelPasswordType=global
   * 
   * If the call was not successful, reject the promise. If it was, resolve it with no value.
   */
  export type AuthorizationHandler = (authID:string,passwordType:PasswordType) => Promise<void>
  export interface WalletData{
    publicKey:string;
    userData:string;
    userDataRaw:hexString;
    extraData?: hexString;
    walletType:WalletType;
    balance?:string;
  }
  export interface WalletBatchDataResponse{
    type:     WalletType;
    
    address:  string;
    userData: string;
    userDataRaw: hexString;
    
    /** May be undefined in the case of an old daemon which doesn't support fetching this property */
    extraData?: hexString;
    /** May be undefined in the case of an old daemon which doesn't support fetching this property */
    status?:   number;
  }
  export enum BCDataRefreshStatusCode{
    ConnectionError=-1,
    Ready=0,
    Working=1
  }
  export enum PasswordType{
    WalletPassword='wallet',
    GlobalPassword='global'
  }
  export enum SessionAuthType{
    token="token",
    any="any"
  }
  export interface SessionCreateParameters{
    sessionType: SessionAuthType,
    matchPath?: string;
    expireSeconds: number;
    versionNumber: number;
  }
  export enum DaemonErrorCodes{
    sessionError=1,
    parameterError=2,
    httpsInvalid=3
  }
  export enum WalletDetailsQuery{
    none = 0,
	  userData = 1 << 0,
	  extraData = 1 << 1,
	  status = 1 << 2,
	  all=0xffffffff
  }