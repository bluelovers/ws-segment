"use strict";
/**
 * Created by user on 2018/4/19/019.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.toHex = exports.token_add_info = exports.debug_token = exports.debugToken = exports.clearTokemDebug = exports.SYMBOL_DEBUG_KEY = void 0;
const tslib_1 = require("tslib");
const sort_object_keys2_1 = tslib_1.__importDefault(require("sort-object-keys2"));
const i18n_1 = require("@novel-segment/postag/lib/i18n");
//export const SYMBOL_DEBUG_KEY = Symbol.for('_debug');
exports.SYMBOL_DEBUG_KEY = '_debug';
function clearTokemDebug(data, returnClone) {
    if (returnClone) {
        return {
            w: data.w,
            p: data.p,
            f: data.f,
        };
    }
    for (let k in data) {
        if (k !== 'w' && k !== 'p' && k !== 'f') {
            delete data[k];
        }
    }
    delete data[exports.SYMBOL_DEBUG_KEY];
    return data;
}
exports.clearTokemDebug = clearTokemDebug;
function debugToken(data, attr, returnToken, ...argv) {
    if (attr) {
        data[exports.SYMBOL_DEBUG_KEY] = Object.assign(data[exports.SYMBOL_DEBUG_KEY] || {}, attr);
    }
    if (returnToken) {
        return data;
    }
    return (data[exports.SYMBOL_DEBUG_KEY] || {});
}
exports.debugToken = debugToken;
function debug_token(ks, returnSource) {
    let ks2 = [];
    // @ts-ignore
    ks.map(function (v, index) {
        //v.index = index;
        // @ts-ignore
        debugToken(v, {
            index,
        });
        if (v.p) {
            // @ts-ignore
            token_add_info(v);
        }
        else if (v.m) {
            // @ts-ignore
            v.m.map(token_add_info);
        }
        else {
            // @ts-ignore
            ks2.push(v);
        }
    });
    return returnSource ? ks : ks2;
}
exports.debug_token = debug_token;
function token_add_info(v) {
    if (v.p) {
        v.ps = (0, i18n_1.zhName)(v.p);
        //v.ps_en = POSTAG.enName(v.p);
        let debug = debugToken(v, {
            ps_en: (0, i18n_1.enName)(v.p),
        });
        v.pp = toHex(v.p);
        if (v.op) {
            v.ops = (0, i18n_1.zhName)(v.op);
            v.opp = toHex(v.op);
        }
        if (v.m) {
            v.m.map(function (v) {
                if (typeof v === 'string') {
                    return v;
                }
                return token_add_info(v);
            });
        }
        if (debug._source) {
            token_add_info(debug._source);
        }
    }
    if (v) {
        (0, sort_object_keys2_1.default)(v, {
            keys: [
                'w',
                'p',
                'f',
                'ps',
                'pp',
                'ow',
                'op',
                'ops',
                'opp',
                'os',
            ],
            useSource: true,
        });
    }
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
//# sourceMappingURL=debug.js.map