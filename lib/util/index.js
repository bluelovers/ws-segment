"use strict";
/**
 * Created by user on 2018/4/17/017.
 */
Object.defineProperty(exports, "__esModule", { value: true });
function debug(...argv) {
    return console.log(...argv);
}
exports.debug = debug;
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
function toHex(p) {
    return '0x' + p
        .toString(16)
        .padStart(4, '0')
        .toUpperCase();
}
exports.toHex = toHex;
function hexAndAny(n, ...argv) {
    if (!argv.length) {
        return n;
    }
    for (let v of argv) {
        let r = (n & v);
        if (r) {
            return r;
        }
    }
    return 0;
}
exports.hexAndAny = hexAndAny;
function hexAnd(n, ...argv) {
    if (argv.length) {
        let r = 0;
        for (let v of argv) {
            let p = n & v;
            if (!p) {
                return 0;
            }
            r |= v;
        }
        return r;
    }
    return n;
}
exports.hexAnd = hexAnd;
function hexOr(n, ...argv) {
    for (let v of argv) {
        n |= v;
    }
    return n;
}
exports.hexOr = hexOr;
//let p = hexAnd(0x6000 | 0x8000, 0x2000, 0x4000)
//console.log(p, toHex(p));
const self = require("./index");
exports.default = self;
