/**
 * 人名优化模块
 *
 * @author 老雷<leizongmin@gmail.com>
 * @version 0.1
 */
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const mod_1 = require("../mod");
const CHS_NAMES_1 = require("../mod/CHS_NAMES");
class ChsNameOptimizer extends mod_1.SubSModuleOptimizer {
    constructor() {
        super(...arguments);
        this.name = 'ChsNameOptimizer';
    }
    _cache() {
        super._cache();
        this._TABLE = this.segment.getDict('TABLE');
    }
    /**
     * 对可能是人名的单词进行优化
     *
     * @param {array} words 单词数组
     * @return {array}
     */
    doOptimize(words) {
        //debug(words);
        const POSTAG = this._POSTAG;
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
                    /*
                    words.splice(i, 2, {
                        w: word.w + nextword.w,
                        p: POSTAG.A_NR,
                        m: [word, nextword],
                    });
                    */
                    this.sliceToken(words, i, 2, {
                        w: word.w + nextword.w,
                        p: POSTAG.A_NR,
                        m: [word, nextword],
                    }, undefined, {
                        [this.name]: 1,
                    });
                    i++;
                    continue;
                }
                // 如果是 姓 + 名（2字以内）
                if ((word.w in CHS_NAMES_1.default.FAMILY_NAME_1 || word.w in CHS_NAMES_1.default.FAMILY_NAME_2) &&
                    ((nextword.p & POSTAG.A_NR) > 0 && nextword.w.length <= 2)) {
                    /*
                    words.splice(i, 2, {
                        w: word.w + nextword.w,
                        p: POSTAG.A_NR,
                        m: [word, nextword],
                    });
                    */
                    this.sliceToken(words, i, 2, {
                        w: word.w + nextword.w,
                        p: POSTAG.A_NR,
                        m: [word, nextword],
                    }, undefined, {
                        [this.name]: 2,
                    });
                    i++;
                    continue;
                }
                // 如果相邻两个均为单字且至少有一个字是未识别的，则尝试判断其是否为人名
                if (!word.p || !nextword.p) {
                    if ((word.w in CHS_NAMES_1.default.SINGLE_NAME && word.w == nextword.w) ||
                        (word.w in CHS_NAMES_1.default.DOUBLE_NAME_1 && nextword.w in CHS_NAMES_1.default.DOUBLE_NAME_2)) {
                        /*
                        words.splice(i, 2, {
                            w: word.w + nextword.w,
                            p: POSTAG.A_NR,
                            m: [word, nextword],
                        });
                        */
                        this.sliceToken(words, i, 2, {
                            w: word.w + nextword.w,
                            p: POSTAG.A_NR,
                            m: [word, nextword],
                        }, undefined, {
                            [this.name]: 3,
                        });
                        // 如果上一个单词可能是一个姓，则合并
                        let preword = words[i - 1];
                        if (preword &&
                            (preword.w in CHS_NAMES_1.default.FAMILY_NAME_1 || preword.w in CHS_NAMES_1.default.FAMILY_NAME_2)) {
                            /*
                            words.splice(i - 1, 2, {
                                w: preword.w + word.w + nextword.w,
                                p: POSTAG.A_NR,
                                m: [preword, word, nextword],
                            });
                            */
                            this.sliceToken(words, i - 1, 2, {
                                w: preword.w + word.w + nextword.w,
                                p: POSTAG.A_NR,
                                m: [preword, word, nextword],
                            }, undefined, {
                                [this.name]: 4,
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
                    /*
                    words.splice(i, 2, {
                        w: word.w + nextword.w,
                        p: POSTAG.A_NR,
                        m: [word, nextword],
                    });
                    */
                    this.sliceToken(words, i, 2, {
                        w: word.w + nextword.w,
                        p: POSTAG.A_NR,
                        m: [word, nextword],
                    }, undefined, {
                        [this.name]: 5,
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
                if ((word.w in CHS_NAMES_1.default.FAMILY_NAME_1 || word.w in CHS_NAMES_1.default.FAMILY_NAME_2)
                    &&
                        nextword.w in CHS_NAMES_1.default.SINGLE_NAME) {
                    /*
                    words.splice(i, 2, {
                        w: word.w + nextword.w,
                        p: POSTAG.A_NR,
                        m: [word, nextword],
                    });
                    */
                    let nw = word.w + nextword.w;
                    let ew = this._TABLE[nw];
                    /**
                     * 更改為只有新詞屬於人名或未知詞時才會合併
                     */
                    if (!ew || !ew.p || ew.p & POSTAG.A_NR) {
                        this.sliceToken(words, i, 2, {
                            w: nw,
                            p: POSTAG.A_NR,
                            m: [word, nextword],
                        }, undefined, {
                            [this.name]: 6,
                            exists_word: ew,
                        });
                        i++;
                        continue;
                    }
                }
            }
            // 移到下一个单词
            i++;
        }
        return words;
    }
}
exports.ChsNameOptimizer = ChsNameOptimizer;
exports.init = ChsNameOptimizer.init.bind(ChsNameOptimizer);
exports.default = ChsNameOptimizer;
