/**
 * 人名优化模块
 *
 * @author 老雷<leizongmin@gmail.com>
 * @version 0.1
 */
'use strict';
const CHS_NAMES_1 = require("./CHS_NAMES");
var ChsNameOptimizer;
(function (ChsNameOptimizer) {
    /** 模块类型 */
    ChsNameOptimizer.type = 'optimizer';
    /**
     * 模块初始化
     *
     * @param {Segment} segment 分词接口
     */
    function init(_segment) {
        ChsNameOptimizer.segment = _segment;
        return ChsNameOptimizer;
    }
    ChsNameOptimizer.init = init;
    /**
     * 对可能是人名的单词进行优化
     *
     * @param {array} words 单词数组
     * @return {array}
     */
    function doOptimize(words) {
        //debug(words);
        let POSTAG = ChsNameOptimizer.segment.POSTAG;
        let i = 0;
        /* 第一遍扫描 */
        while (i < words.length) {
            let word = words[i];
            let nextword = words[i + 1];
            if (nextword) {
                //debug(nextword);
                // 如果为  "小|老" + 姓
                if (nextword && (word.w == '小' || word.w == '老') &&
                    (nextword.w in CHS_NAMES_1.default.FAMILY_NAME_1 || nextword.w in CHS_NAMES_1.default.FAMILY_NAME_2)) {
                    words.splice(i, 2, {
                        w: word.w + nextword.w,
                        p: POSTAG.A_NR,
                        m: [word, nextword],
                    });
                    i++;
                    continue;
                }
                // 如果是 姓 + 名（2字以内）
                if ((word.w in CHS_NAMES_1.default.FAMILY_NAME_1 || word.w in CHS_NAMES_1.default.FAMILY_NAME_2) &&
                    ((nextword.p & POSTAG.A_NR) > 0 && nextword.w.length <= 2)) {
                    words.splice(i, 2, {
                        w: word.w + nextword.w,
                        p: POSTAG.A_NR,
                        m: [word, nextword],
                    });
                    i++;
                    continue;
                }
                // 如果相邻两个均为单字且至少有一个字是未识别的，则尝试判断其是否为人名
                if (!word.p || !nextword.p) {
                    if ((word.w in CHS_NAMES_1.default.SINGLE_NAME && word.w == nextword.w) ||
                        (word.w in CHS_NAMES_1.default.DOUBLE_NAME_1 && nextword.w in CHS_NAMES_1.default.DOUBLE_NAME_2)) {
                        words.splice(i, 2, {
                            w: word.w + nextword.w,
                            p: POSTAG.A_NR,
                            m: [word, nextword],
                        });
                        // 如果上一个单词可能是一个姓，则合并
                        let preword = words[i - 1];
                        if (preword &&
                            (preword.w in CHS_NAMES_1.default.FAMILY_NAME_1 || preword.w in CHS_NAMES_1.default.FAMILY_NAME_2)) {
                            words.splice(i - 1, 2, {
                                w: preword.w + word.w + nextword.w,
                                p: POSTAG.A_NR,
                                m: [preword, word, nextword],
                            });
                        }
                        else {
                            i++;
                        }
                        continue;
                    }
                }
                // 如果为 无歧义的姓 + 名（2字以内） 且其中一个未未识别词
                if ((word.w in CHS_NAMES_1.default.FAMILY_NAME_1 || word.w in CHS_NAMES_1.default.FAMILY_NAME_2)
                    && (!word.p || !nextword.p)
                    /**
                     * 防止將標點符號當作名字的BUG
                     */
                    && !(word.p & POSTAG.D_W || nextword.p & POSTAG.D_W)) {
                    //debug(word, nextword);
                    words.splice(i, 2, {
                        w: word.w + nextword.w,
                        p: POSTAG.A_NR,
                        m: [word, nextword],
                    });
                }
            }
            // 移到下一个单词
            i++;
        }
        /* 第二遍扫描 */
        i = 0;
        while (i < words.length) {
            let word = words[i];
            let nextword = words[i + 1];
            if (nextword) {
                // 如果为 姓 + 单字名
                if ((word.w in CHS_NAMES_1.default.FAMILY_NAME_1 || word.w in CHS_NAMES_1.default.FAMILY_NAME_2) &&
                    nextword.w in CHS_NAMES_1.default.SINGLE_NAME) {
                    words.splice(i, 2, {
                        w: word.w + nextword.w,
                        p: POSTAG.A_NR,
                        m: [word, nextword],
                    });
                    i++;
                    continue;
                }
            }
            // 移到下一个单词
            i++;
        }
        return words;
    }
    ChsNameOptimizer.doOptimize = doOptimize;
})(ChsNameOptimizer || (ChsNameOptimizer = {}));
module.exports = ChsNameOptimizer;
