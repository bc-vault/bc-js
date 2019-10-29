# bc-js

Javascript library for interfacing with the BC VAULT daemon via HTTP.

## Description


BC-JS is a clientside library which makes integrating support for BC VAULT as easy as possible. When reading this documentation keep in mind that some functions that require user input will display a popup to the user for confirmation. No extra work is required on your part but keep that in mind. 

All functions are defined as Promises, which means that in [supported environments](https://caniuse.com/#feat=async-functions) you can use the native await syntax to resolve actions.


## Documentation

A static version of the latest documentation is hosted at [https://www.bc-vault.com/api/js/](https://www.bc-vault.com/api/js/)
You can also build the documentation yourself using the instructions below

## Quick start in browser

To get started download [bc-js](#) and place it somewhere where it can be found from a HTML file. This will register the object `_bcvault` in the global `window` object. This object is a union of all other Global types and an instance of BCJS. This means you can do `const a = _bcvault.WalletType.bitCoin` and `const b = _bcvault.getDevices()`, you can also create a new object of type BCJS using `const c = new _bcvault.BCJS()`

Include it where needed:
```html
<head>
<script src="/path/to/bc-js.js"></script>
</head>
```

For example, to query currently connected devices:

```html
<head>
	<script src="/path/to/bc-js.js"></script>
</head>
<body>
  <script>
    window.addEventListener("load",function(){
		_bcvault.getDevices().then(function(resultArray){
            console.log(resultArray);
        });
    }
  </script>
</body>

```
or, if your target browsers support async/await:

```html
<head>
	<script src="/path/to/bc-js.js"></script>
</head>
<body>
  <script>
    window.addEventListener("load",async function(){
        var result = await _bcvault.getDevices();
        console.log(result);
    }
  </script>
</body>

```
## Quick start in Node.js

To get started, run `npm i bc-vault-js` or `yarn add bc-vault-js`

A simple example - querying the current device list:

```js
const bclib = require("bc-vault-js")

let bc = new bclib.BCJS(()=>{});// first arg MUST be a function in node, see AuthWindowHandler to find out more

bc.getDevices().then((result)=>{
  console.log(JSON.stringify(result));
})

//this should output [1,2,3,4,5] depending on how many BC Vaults are connected.

```

### IE workarounds

To support Internet Explorer which doesn't allow communication cross-domain-area between popups, we had to use showModalDialog internally. This means that if a popup is shown in IE, it will block the entire browser until it is either completed or closed. Other browsers are unaffected.


## Build Instructions


### Generate Documentation

#### Global Dependencies

 - TypeDoc

#### Instructions

1. Make sure to cd to the project root
1. Run `npm run doc`

Alternatively, run typedoc directly:

`typedoc --mode file --excludeNotExported --excludePrivate --name bc-js --out docs`

#### Output

Output files are in `docs/`

### Build

#### Global Dependencies

1. Typescript
1. Browserify

#### Instructions


1. Make sure to cd to the project root
1. Run `npm run build`

#### Output

Output files are in
 - `build/es5` - ES5 Polyfills for IE, used in bc_js_ie.js
 - `build/es2017` - ES2017 with commonJS modules (NodeJS)
 - `build/es6` - ES6 with commonJS modules (NodeJS), also used in bc_js_noie.js
 - `build/esnext` - ES6 with esnext modules (Future)
 - `build/bc_js_*.js` - Browserified single dependency output for use in browsers.