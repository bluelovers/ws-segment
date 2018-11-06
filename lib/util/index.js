"use strict";
/**
 * Created by user on 2018/4/17/017.
 */
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
const util = require("util");
__export(require("./core"));
const debug_1 = require("./debug");
exports.debug_token = debug_1.debug_token;
exports.toHex = debug_1.toHex;
exports.token_add_info = debug_1.token_add_info;
function debug_inspect(argv, options = {}) {
    options = Object.assign({
        colors: true,
    }, options);
    return argv.map(function (b) {
        return util.inspect(b, options);
    }, []);
}
exports.debug_inspect = debug_inspect;
function debug(...argv) {
    return console.log(...debug_inspect(argv));
}
exports.debug = debug;
function debug_options(argv, options) {
    return console.log(...debug_inspect(argv, options));
}
exports.debug_options = debug_options;
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
// @ts-ignore
exports.cloneDeep = require('lodash.clonedeep');
//let p = hexAnd(0x6000 | 0x8000, 0x2000, 0x4000)
//debug(p, toHex(p));
const self = require("./index");
exports.default = self;
