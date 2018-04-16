'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
/** 模块类型 */
exports.type = 'optimizer';
/**
 * 模块初始化
 *
 * @param {Segment} segment 分词接口
 */
exports.init = function (_segment) {
    exports.segment = _segment;
};
function isMergeable(w1, w2, { POSTAG, TABLE, nw, i, }) {
    let bool;
    let m;
    /**
     * 原始判斷模式
     */
    if (w1.p == w2.p) {
        bool = true;
    }
    /**
     * 不確定沒有BUG 但原始模式已經不合需求 因為單一項目多個詞性
     */
    else if (m = (w1.p & w2.p)) {
        if (1 || m & POSTAG.D_N) {
            bool = true;
        }
    }
    return bool && (nw in TABLE);
}
exports.isMergeable = isMergeable;
/**
 * 词典优化
 *
 * @param {array} words 单词数组
 * @param {bool} is_not_first 是否为管理器调用的
 * @return {array}
 */
function doOptimize(words, is_not_first) {
    //debug(words);
    if (typeof is_not_first == 'undefined') {
        is_not_first = false;
    }
    // 合并相邻的能组成一个单词的两个词
    let TABLE = exports.segment.getDict('TABLE');
    let POSTAG = exports.segment.POSTAG;
    let i = 0;
    let ie = words.length - 1;
    while (i < ie) {
        let w1 = words[i];
        let w2 = words[i + 1];
        //debug(w1.w + ', ' + w2.w);
        // ==========================================
        let nw = w1.w + w2.w;
        // 形容词 + 助词 = 形容词，如： 不同 + 的 = 不同的
        if ((w1.p & POSTAG.D_A) > 0 && (w2.p & POSTAG.D_U)) {
            let p = POSTAG.D_A;
            if (nw in TABLE && (TABLE[nw].p & POSTAG.D_A)) {
                p = TABLE[nw].p;
            }
            else if (w1.p & POSTAG.BAD) {
                p = POSTAG.D_A + POSTAG.BAD;
            }
            words.splice(i, 2, {
                w: nw,
                //p: ((nw in TABLE && TABLE[nw].p & POSTAG.D_A) ? TABLE[nw].p : POSTAG.D_A),
                p,
                m: [w1, w2],
            });
            ie--;
            continue;
        }
        // 能组成一个新词的(词性必须相同)
        if (isMergeable(w1, w2, {
            nw,
            POSTAG,
            TABLE,
            i,
        })) 
        //if (w1.p == w2.p && nw in TABLE)
        {
            words.splice(i, 2, {
                w: nw,
                p: TABLE[nw].p,
                m: [w1, w2],
            });
            ie--;
            continue;
        }
        // ============================================
        // 数词组合
        if ((w1.p & POSTAG.A_M) > 0) {
            //debug(w2.w + ' ' + (w2.p & POSTAG.A_M));
            // 百分比数字 如 10%，或者下一个词也是数词，则合并
            if ((w2.p & POSTAG.A_M) > 0 || w2.w == '%') {
                words.splice(i, 2, {
                    w: w1.w + w2.w,
                    p: POSTAG.A_M,
                    m: [w1, w2],
                });
                ie--;
                continue;
            }
            // 数词 + 量词，合并。如： 100个
            if ((w2.p & POSTAG.A_Q) > 0) {
                words.splice(i, 2, {
                    w: w1.w + w2.w,
                    p: POSTAG.D_MQ,
                    m: [w1, w2],
                });
                ie--;
                continue;
            }
            // 带小数点的数字 ，如 “3 . 14”，或者 “十五点三”
            // 数词 + "分之" + 数词，如“五十分之一”
            let w3 = words[i + 2];
            if (w3 && (w3.p & POSTAG.A_M) > 0 &&
                (w2.w == '.' || w2.w == '点' || w2.w == '分之')) {
                words.splice(i, 3, {
                    w: w1.w + w2.w + w3.w,
                    p: POSTAG.A_M,
                    m: [w1, w2, w3],
                });
                ie -= 2;
                continue;
            }
        }
        // 修正 “十五点五八”问题
        if ((w1.p & POSTAG.D_MQ) > 0 && w1.w.substr(-1) === '点' && w2.p & POSTAG.A_M) {
            //debug(w1, w2);
            let i2 = 2;
            let w4w = '';
            for (let j = i + i2; j < ie; j++) {
                let w3 = words[j];
                if ((w3.p & POSTAG.A_M) > 0) {
                    w4w += w3.w;
                    i2++;
                }
                else {
                    break;
                }
            }
            words.splice(i, i2, {
                w: w1.w + w2.w + w4w,
                p: POSTAG.D_MQ,
                m: [w1, w2, w4w],
            });
            ie -= i2 - 1;
            continue;
        }
        // 移到下一个词
        i++;
    }
    // 针对组合数字后无法识别新组合的数字问题，需要重新扫描一次
    return is_not_first === true ? words : doOptimize(words, true);
}
exports.doOptimize = doOptimize;
