"use strict";
const a = require("./lib/bcapi");
const b = require("./lib/types");
module.exports = Object.assign(new a.BCJS(), a, b);
