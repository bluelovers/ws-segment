"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertSynonym = void 0;
const tslib_1 = require("tslib");
const core_1 = tslib_1.__importDefault(require("deepmerge-plus/core"));
const debug_1 = require("../../util/debug");
function convertSynonym(ret, options) {
    const { showcount, POSTAG, DICT_SYNONYM, DICT_TABLE } = options;
    let total_count = 0;
    //const RAW = Symbol.for('RAW');
    // 转换同义词
    function _convertSynonym(list) {
        let count = 0;
        list = list.reduce(function (a, item) {
            let bool;
            let w = item.w;
            let nw;
            let debug = (0, debug_1.debugToken)(item);
            if (w in DICT_SYNONYM) {
                bool = true;
                nw = DICT_SYNONYM[w];
            }
            else if (debug.autoCreate && !debug.convertSynonym && !item.ow && item.m && item.m.length) {
                nw = item.m.reduce(function (a, b) {
                    if (typeof b === 'string') {
                        a.push(b);
                    }
                    else if (b.w in DICT_SYNONYM) {
                        a.push(DICT_SYNONYM[b.w]);
                        bool = true;
                    }
                    else {
                        a.push(b.w);
                    }
                    return a;
                }, []).join('');
            }
            if (bool) {
                count++;
                total_count++;
                //return { w: DICT_SYNONYM[item.w], p: item.p };
                let p = item.p;
                if (w in DICT_TABLE) {
                    p = DICT_TABLE[w].p || p;
                }
                if (p & POSTAG.BAD) {
                    p = p ^ POSTAG.BAD;
                }
                let item_new = (0, debug_1.debugToken)({
                    ...item,
                    w: nw,
                    ow: w,
                    p,
                    op: item.p,
                    //[RAW]: item,
                    //source: item,
                }, {
                    convertSynonym: true,
                    //_source: item,
                    /**
                     * JSON.stringify
                     * avoid TypeError: Converting circular structure to JSON
                     */
                    _source: (0, core_1.default)({}, item),
                }, true);
                a.push(item_new);
            }
            else {
                a.push(item);
            }
            debug = undefined;
            return a;
        }, []);
        return { count: count, list: list };
    }
    let result;
    do {
        result = _convertSynonym(ret);
        ret = result.list;
        result.list = undefined;
    } while (result.count > 0);
    result = undefined;
    if (showcount) {
        return { count: total_count, list: ret };
    }
    return ret;
}
exports.convertSynonym = convertSynonym;
//# sourceMappingURL=convertSynonym.js.map