"use strict";
/**
 * Created by user on 2018/2/20/020.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.debug = console.log;
function enumIsNaN(v) {
    return isNaN(Number(v));
}
exports.enumIsNaN = enumIsNaN;
function enumList(varEnum, byValue) {
    let keys = Object.keys(varEnum);
    if (byValue) {
        return keys.filter(key => isNaN(Number(varEnum[key])));
    }
    else {
        return keys.filter(key => !isNaN(Number(varEnum[key])));
    }
}
exports.enumList = enumList;
const self = require("./util");
exports.default = self;
