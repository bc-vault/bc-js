
export interface HttpResponse{
    readonly status:number;
    readonly body:BCHttpResponse | string | object;
  
  }
  export interface BCHttpResponse{
    readonly errorCode:number;
    readonly data:any;
  }
  export enum LogLevel{
    verbose=1,
    debug=2,
    warning=3,
    error=4
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
    public HttpResponse:HttpResponse
    /**
     * @description BCHttpResponse !== undefined if the request succeeded but the device returned an error code. 
     */
    public BCHttpResponse:BCHttpResponse
    constructor(data:HttpResponse | BCHttpResponse,m:string="DaemonError") {
        super(m);

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, DaemonError.prototype);
        this.name="DaemonError";
        if((data as HttpResponse).status !== undefined){// data is HttpResponse
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
    SignData            ="SignData",

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
  const WalletTypeConstants = {
    BTC:0,
    ERC20:0x02000000,
    ETH:0x01000000,
    TESTNET:0x40000000
  }
  export enum WalletType_Legacy{
    bitCoin               =WalletTypeConstants.BTC,
    bitCoinCash           =WalletTypeConstants.BTC+1,
    bitCoinGold           =WalletTypeConstants.BTC+2,
    liteCoin              =WalletTypeConstants.BTC+3,
    dash                  =WalletTypeConstants.BTC+4,
    dogeCoin              =WalletTypeConstants.BTC+5,
    ripple                =WalletTypeConstants.BTC+6,
    stellar               =WalletTypeConstants.BTC+7,
    ethereum              =WalletTypeConstants.ETH,
    erc20Bokky            =WalletTypeConstants.ETH  | WalletTypeConstants.ERC20,
    erc20Salt             =(WalletTypeConstants.ETH | WalletTypeConstants.ERC20)+1,
    erc20Polymath			    =(WalletTypeConstants.ETH | WalletTypeConstants.ERC20)+2,
    erc200x			          =(WalletTypeConstants.ETH | WalletTypeConstants.ERC20)+3,
    erc20Cindicator			  =(WalletTypeConstants.ETH | WalletTypeConstants.ERC20)+4,
    erc20CargoX		    	  =(WalletTypeConstants.ETH | WalletTypeConstants.ERC20)+5,
    erc20Viberate			    =(WalletTypeConstants.ETH | WalletTypeConstants.ERC20)+6,
    erc20Iconomi	    		=(WalletTypeConstants.ETH | WalletTypeConstants.ERC20)+7,
    erc20DTR			        =(WalletTypeConstants.ETH | WalletTypeConstants.ERC20)+8,
    erc20OriginTrail			=(WalletTypeConstants.ETH | WalletTypeConstants.ERC20)+9,
    erc20InsurePal		   	=(WalletTypeConstants.ETH | WalletTypeConstants.ERC20)+10,
    erc20Xaurum	    	   	=(WalletTypeConstants.ETH | WalletTypeConstants.ERC20)+11,
    erc20Tron		    	    =(WalletTypeConstants.ETH | WalletTypeConstants.ERC20)+12,
    erc20VeChain    			=(WalletTypeConstants.ETH | WalletTypeConstants.ERC20)+13,
    erc20Binance    			=(WalletTypeConstants.ETH | WalletTypeConstants.ERC20)+14,
    erc20Icon		    	    =(WalletTypeConstants.ETH | WalletTypeConstants.ERC20)+15,
    erc20OmiseGo    			=(WalletTypeConstants.ETH | WalletTypeConstants.ERC20)+16,
    erc20WaltonChain			=(WalletTypeConstants.ETH | WalletTypeConstants.ERC20)+17,
   
    bitCoinTest         =(WalletTypeConstants.BTC)  | WalletTypeConstants.TESTNET,
    bitCoinCashTest     =(WalletTypeConstants.BTC+1)| WalletTypeConstants.TESTNET,
    bitCoinGoldTest     =(WalletTypeConstants.BTC+2)| WalletTypeConstants.TESTNET,
    liteCoinTest        =(WalletTypeConstants.BTC+3)| WalletTypeConstants.TESTNET,
    dashTest            =(WalletTypeConstants.BTC+4)| WalletTypeConstants.TESTNET,
    dogeCoinTest        =(WalletTypeConstants.BTC+5)| WalletTypeConstants.TESTNET,
    rippleTest          =(WalletTypeConstants.BTC+6)| WalletTypeConstants.TESTNET,
    stellarTest         =(WalletTypeConstants.BTC+7)| WalletTypeConstants.TESTNET,
    ethereumTest        =(WalletTypeConstants.ETH)  | WalletTypeConstants.TESTNET,
    erc20BokkyTest      =(WalletTypeConstants.ETH | WalletTypeConstants.ERC20)| WalletTypeConstants.TESTNET,
    erc20SaltTest			  =(WalletTypeConstants.ETH | WalletTypeConstants.ERC20 | WalletTypeConstants.TESTNET)+1,
    erc20PolymathTest	  =(WalletTypeConstants.ETH | WalletTypeConstants.ERC20 | WalletTypeConstants.TESTNET)+2,
    erc200xTest			    =(WalletTypeConstants.ETH | WalletTypeConstants.ERC20 | WalletTypeConstants.TESTNET)+3,
    erc20CindicatorTest =(WalletTypeConstants.ETH | WalletTypeConstants.ERC20 | WalletTypeConstants.TESTNET)+4,
    erc20CargoXTest		  =(WalletTypeConstants.ETH | WalletTypeConstants.ERC20 | WalletTypeConstants.TESTNET)+5,	
    erc20ViberateTest	  =(WalletTypeConstants.ETH | WalletTypeConstants.ERC20 | WalletTypeConstants.TESTNET)+6,
    erc20IconomiTest	  =(WalletTypeConstants.ETH | WalletTypeConstants.ERC20 | WalletTypeConstants.TESTNET)+7,
    erc20DTRTest			  =(WalletTypeConstants.ETH | WalletTypeConstants.ERC20 | WalletTypeConstants.TESTNET)+8,
    erc20OriginTrailTest=(WalletTypeConstants.ETH | WalletTypeConstants.ERC20 | WalletTypeConstants.TESTNET)+9,
    erc20InsurePalTest  =(WalletTypeConstants.ETH | WalletTypeConstants.ERC20 | WalletTypeConstants.TESTNET)+10,	
    erc20XaurumTest		  =(WalletTypeConstants.ETH | WalletTypeConstants.ERC20 | WalletTypeConstants.TESTNET)+11,
    erc20TronTest			  =(WalletTypeConstants.ETH | WalletTypeConstants.ERC20 | WalletTypeConstants.TESTNET)+12,
    erc20VeChainTest	  =(WalletTypeConstants.ETH | WalletTypeConstants.ERC20 | WalletTypeConstants.TESTNET)+13,
    erc20BinanceTest	  =(WalletTypeConstants.ETH | WalletTypeConstants.ERC20 | WalletTypeConstants.TESTNET)+14,
    erc20IconTest			  =(WalletTypeConstants.ETH | WalletTypeConstants.ERC20 | WalletTypeConstants.TESTNET)+15,
    erc20OmiseGoTest	  =(WalletTypeConstants.ETH | WalletTypeConstants.ERC20 | WalletTypeConstants.TESTNET)+16,
    erc20WaltonChainTest=(WalletTypeConstants.ETH | WalletTypeConstants.ERC20 | WalletTypeConstants.TESTNET)+17,
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
    space:SpaceObject;
    firmware:VersionObject;
    userData:string;
    supportedTypes:ReadonlyArray<WalletType>;
    activeTypes:ReadonlyArray<WalletType>;
    activeWallets:WalletData[];
    locked:boolean;
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
    matchPath: string;
    expireSeconds: number;
    versionNumber: number;
  }
  export enum DaemonErrorCodes{
    sessionError=1,
    parameterError=2,
    httpsInvalid=3
  }