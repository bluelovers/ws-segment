"use strict";
/**
 * Created by user on 2018/4/17/017.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.hexOr = exports.hexAnd = exports.hexAndAny = exports.debug_options = exports.debug = exports.debug_inspect = exports.token_add_info = exports.toHex = exports.debug_token = void 0;
const debug_1 = require("./debug");
Object.defineProperty(exports, "debug_token", { enumerable: true, get: function () { return debug_1.debug_token; } });
Object.defineProperty(exports, "toHex", { enumerable: true, get: function () { return debug_1.toHex; } });
Object.defineProperty(exports, "token_add_info", { enumerable: true, get: function () { return debug_1.token_add_info; } });
const util_1 = require("util");
function debug_inspect(argv, options = {}) {
    options = Object.assign({
        colors: true,
    }, options);
    return argv.map(function (b) {
        return (0, util_1.inspect)(b, options);
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
//let p = hexAnd(0x6000 | 0x8000, 0x2000, 0x4000)
//debug(p, toHex(p));
//# sourceMappingURL=index.js.map