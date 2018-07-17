# bc-js

Javascript library for interfacing with the BC VAULT daemon via HTTP.

## Description


BC-JS is a clientside library which makes integrating support for BC VAULT as easy as possible. When reading this documentation keep in mind that some functions that require user input will display a popup to the user for confirmation. No extra work is required on your part but keep that in mind. 

All functions are defined as Promises, which means that in [supported environments](https://caniuse.com/#feat=async-functions) you can use the native await syntax to resolve actions.


## Quick start in browser

To get started download [bc-js](#) and place it somewhere where it can be found from a HTML file. This will register the object `_bcvault` in the global `window` object.

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

`typedoc --mode file --excludeNotExported --excludePrivate --name bc-js --out build/docs`

#### Output

Output files are in `build/docs`

### Build

#### Global Dependencies

1. Typescript
1. Browserify

#### Instructions


1. Make sure to cd to the project root
1. Run `npm build`

#### Output

Output files are in
 - `build/module` - ES6 with esnext modules (Future)
 - `build/ie` - ES3 Polyfills for IE, used in bc_js_*.js
 - `build/main` - ES6 with commonJS modules (NodeJS)
 - `build/bc_js_*.js` - Browserified output for use in browsers (obviously)