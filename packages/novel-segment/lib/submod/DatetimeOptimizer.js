'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.doOptimize = exports.init = exports.segment = exports.type = void 0;
const const_1 = require("../mod/const");
/** 模块类型 */
exports.type = 'optimizer';
/**
 * 模块初始化
 *
 * @param {Segment} segment 分词接口
 */
function init(_segment) {
    exports.segment = _segment;
}
exports.init = init;
/**
 * 日期时间优化
 *
 * @param {array} words 单词数组
 * @param {bool} is_not_first 是否为管理器调用的
 * @return {array}
 */
function doOptimize(words, is_not_first) {
    if (typeof is_not_first === 'undefined') {
        is_not_first = false;
    }
    // 合并相邻的能组成一个单词的两个词
    const TABLE = exports.segment.getDict('TABLE');
    const POSTAG = exports.segment.POSTAG;
    let i = 0;
    let ie = words.length - 1;
    while (i < ie) {
        let w1 = words[i];
        let w2 = words[i + 1];
        //debug(w1.w + ', ' + w2.w);
        if ((w1.p & POSTAG.A_M) > 0) {
            // =========================================
            // 日期时间组合   数字 + 日期单位，如 “2005年"
            if (w2.w in const_1.DATETIME) {
                let nw = w1.w + w2.w;
                let len = 2;
                let ma = [w1, w2];
                // 继续搜索后面连续的日期时间描述，必须符合  数字 + 日期单位
                while (true) {
                    let w11 = words[i + len];
                    let w22 = words[i + len + 1];
                    if (w11 && w22 && (w11.p & POSTAG.A_M) > 0 && w22.w in const_1.DATETIME) {
                        len += 2;
                        nw += w11.w + w22.w;
                        ma.push(w11);
                        ma.push(w22);
                    }
                    else {
                        break;
                    }
                }
                words.splice(i, len, {
                    w: nw,
                    p: POSTAG.D_T,
                    m: ma,
                });
                ie -= len - 1;
                continue;
            }
            // =========================================
        }
        // 移到下一个词
        i++;
    }
    return words;
}
exports.doOptimize = doOptimize;
//# sourceMappingURL=DatetimeOptimizer.js.map