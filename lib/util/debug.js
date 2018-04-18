"use strict";
/**
 * Created by user on 2018/4/19/019.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const POSTAG_1 = require("../POSTAG");
const sort_object_keys2_1 = require("sort-object-keys2");
//export const SYMBOL_DEBUG_KEY = Symbol.for('_debug');
exports.SYMBOL_DEBUG_KEY = '_debug';
function debugToken(data, attr, returnSource) {
    if (attr) {
        data[exports.SYMBOL_DEBUG_KEY] = Object.assign(data[exports.SYMBOL_DEBUG_KEY] || {}, attr);
    }
    if (returnSource) {
        return data;
    }
    return (data[exports.SYMBOL_DEBUG_KEY] || {});
}
exports.debugToken = debugToken;
function debug_token(ks, returnSource) {
    let ks2 = [];
    ks.map(function (v, index) {
        //v.index = index;
        debugToken(v, {
            index,
        });
        if (v.p) {
            token_add_info(v);
        }
        else if (v.m) {
            v.m.map(token_add_info);
        }
        else {
            ks2.push(v);
        }
    });
    return returnSource ? ks : ks2;
}
exports.debug_token = debug_token;
function token_add_info(v) {
    if (v.p) {
        v.ps = POSTAG_1.POSTAG.zhName(v.p);
        //v.ps_en = POSTAG.enName(v.p);
        let debug = debugToken(v, {
            ps_en: POSTAG_1.POSTAG.enName(v.p),
        });
        v.pp = toHex(v.p);
        if (v.m) {
            v.m.map(token_add_info);
        }
        if (debug._source) {
            token_add_info(debug._source);
        }
    }
    sort_object_keys2_1.default(v, {
        keys: [
            'w',
            'p',
            'f',
            'ow',
            'op',
            'ps',
            'pp',
        ],
        useSource: true,
    });
    return v;
}
exports.token_add_info = token_add_info;
function toHex(p) {
    return '0x' + p
        .toString(16)
        .padStart(4, '0')
        .toUpperCase();
}
exports.toHex = toHex;
const self = require("./debug");
exports.default = self;
