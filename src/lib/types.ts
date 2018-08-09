
export interface HttpResponse{
    readonly status:number;
    readonly body:BCHttpResponse|string|object;
  
  }
  export interface BCHttpResponse{
    readonly errorCode:number;
    readonly data:any;
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
     * @description the transaction fee count (in eth this is the Gas Limit, btc and others, ignored field)
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
  }
  /**
   * @description The DaemonError class contains a BCHttpResponse and a HttpResponse, depending on where the failure was
   * @description HttpResponse !== undefined if the response code was != 200 or if the request itself failed
   * @description BCHttpResponse !== undefined if the request succeeded but the device returned an error code. 
   */
  export class DaemonError extends Error {
    /**
     * @description HttpResponse !== undefined if the request succeeded but the device returned an error code. 
     */
    HttpResponse:HttpResponse
    /**
     * @description BCHttpResponse !== undefined if the request succeeded but the device returned an error code. 
     */
    BCHttpResponse:BCHttpResponse
    constructor(data:HttpResponse|BCHttpResponse,m:string="DaemonError") {
        super(m);

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, DaemonError.prototype);
        this.name="DaemonError";
        if((data as HttpResponse).status !== undefined){//data is HttpResponse
          this.HttpResponse = data as HttpResponse;
        }else{
          this.BCHttpResponse = data as BCHttpResponse;
        }
        
    }
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

  }
  export interface SpaceObject{
    readonly available:number;
    readonly complete:number;
  }
  const WalletTypeConstants = {
    BTC:0,
    ERC20:0x02000000,
    ETH:0x01000000,
    TESTNET:0x40000000
  }
  export enum WalletType{
    bitCoin     =WalletTypeConstants.BTC,
    bitCoinCash =WalletTypeConstants.BTC+1,
    liteCoin    =WalletTypeConstants.BTC+2,
    dash        =WalletTypeConstants.BTC+3,
    dogeCoin    =WalletTypeConstants.BTC+4,
    ripple      =WalletTypeConstants.BTC+5,
    ethereum    =WalletTypeConstants.ETH,
    erc20Bokky  =WalletTypeConstants.ETH|WalletTypeConstants.ERC20,
  
    bitCoinTest     =(WalletTypeConstants.BTC) | WalletTypeConstants.TESTNET,
    bitCoinCashTest =(WalletTypeConstants.BTC+1)| WalletTypeConstants.TESTNET,
    liteCoinTest    =(WalletTypeConstants.BTC+2)| WalletTypeConstants.TESTNET,
    dashTest        =(WalletTypeConstants.BTC+3)| WalletTypeConstants.TESTNET,
    dogeCoinTest    =(WalletTypeConstants.BTC+4)| WalletTypeConstants.TESTNET,
    rippleTest      =(WalletTypeConstants.BTC+5)| WalletTypeConstants.TESTNET,
    ethereumTest    =(WalletTypeConstants.ETH)  | WalletTypeConstants.TESTNET,
    erc20BokkyTest  =(WalletTypeConstants.ETH|WalletTypeConstants.ERC20)| WalletTypeConstants.TESTNET
  }
  export interface WalletTypeInfo{
    type:WalletType
    name:string;
    ticker:string;
  }
  export const typeInfoMap:WalletTypeInfo[] = [
    	{type:WalletType.bitCoin				,name:"Bitcoin",ticker:"BTC"} ,
    	{type:WalletType.bitCoinCash		,name:"Bitcoin Cash",ticker:"BCH"} ,
    	{type:WalletType.liteCoin				,name:"Litecoin",ticker:"LTC"} ,
      {type:WalletType.dash					  ,name:"Dash",ticker:"DASH"} ,
      {type:WalletType.dogeCoin			  ,name:"Dogecoin",ticker:"DOGE"} ,
      {type:WalletType.ripple				  ,name:"Ripple",ticker:"XRP"} ,
      {type:WalletType.ethereum			  ,name:"Ethereum",ticker:"ETH"} ,
      {type:WalletType.erc20Bokky		  ,name:"Bokky",ticker:"BOKKY"} ,
    	{type:WalletType.bitCoinTest		,name:"Bitcoin Test",ticker:"BTC-T"} ,
    	{type:WalletType.bitCoinCashTest,name:"Bitcoin Cash Test",ticker:"BCH-T"} ,
    	{type:WalletType.liteCoinTest		,name:"Litecoin Test",ticker:"LTC-T"} ,
    	{type:WalletType.dogeCoinTest		,name:"Dogecoin Test",ticker:"DOGE-T"} ,
    	{type:WalletType.rippleTest			,name:"Ripple Test",ticker:"XRP-T"} ,
    	{type:WalletType.ethereumTest		,name:"Ethereum Test",ticker:"ETH-T"} ,
    	{type:WalletType.erc20BokkyTest	,name:"Bokky Test",ticker:"BOKKY-T"} ,
  ];

  export interface BCObject{
    devices:BCDevice[];

  }
  export interface BCDevice{
    id:number;
    space:SpaceObject;
    firmware:VersionObject;
    supportedTypes:ReadonlyArray<WalletType>;
    activeTypes:ReadonlyArray<WalletType>;
    activeWallets:WalletData[];
  }
  export interface WalletData{
    publicKey:string;
    walletType:WalletType;
    balance?:string;
  }
  export enum BCDataRefreshStatusCode{
    ConnectionError=-1,
    Ready=0,
    Working=1
  }