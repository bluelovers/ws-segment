'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.type = exports.init = exports.DictOptimizer = void 0;
const mod_1 = require("../mod");
const DIRECTIONS_REGEXP = /^[東西南北东]+$/;
/**
 * 词典优化模块
 *
 * @author 老雷<leizongmin@gmail.com>
 */
class DictOptimizer extends mod_1.SubSModuleOptimizer {
    constructor() {
        super(...arguments);
        this.name = 'DictOptimizer';
    }
    _cache() {
        super._cache();
        this._TABLE = this.segment.getDict('TABLE');
        this._POSTAG = this.segment.POSTAG;
    }
    isMergeable(w1, w2, { POSTAG, TABLE, nw, i, nw_cache, nw_cache_exists, }) {
        let bool;
        let m;
        /**
         * 原始判斷模式
         */
        if (w1.p === w2.p) {
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
        /**
         * 允許例如 幾 + ％
         */
        else if (w1.p && typeof w2.p === 'undefined') {
            bool = true;
        }
        else if (w1.p & POSTAG.D_D && w2.p & POSTAG.D_V) {
            ({
                nw_cache,
                nw_cache_exists,
            } = this._getWordCache(nw, nw_cache, nw_cache_exists));
            let mw = nw_cache;
            if (mw && (mw.p & POSTAG.D_D || mw.p & POSTAG.D_V)) {
                bool = true;
            }
        }
        return bool
            && this._getWordCache(nw, nw_cache, nw_cache_exists).nw_cache_exists;
    }
    _getWordCache(nw, nw_cache, nw_cache_exists) {
        if (typeof nw_cache_exists === 'undefined') {
            const TABLE = this._TABLE;
            nw_cache = nw_cache || TABLE[nw];
            nw_cache_exists = !!nw_cache;
        }
        return {
            nw,
            nw_cache,
            nw_cache_exists,
        };
    }
    /**
     * 词典优化
     *
     * @param {array} words 单词数组
     * @param {bool} is_not_first 是否为管理器调用的
     * @return {array}
     */
    doOptimize(words, is_not_first) {
        var _a;
        //debug(words);
        if (typeof is_not_first === 'undefined') {
            is_not_first = false;
        }
        // 合并相邻的能组成一个单词的两个词
        const TABLE = this._TABLE;
        const POSTAG = this._POSTAG;
        const self = this;
        let i = 0;
        let ie = words.length - 1;
        while (i < ie) {
            let w1 = words[i];
            let w2 = words[i + 1];
            //debug(w1.w + ', ' + w2.w);
            // ==========================================
            let nw = w1.w + w2.w;
            let nw_cache;
            let nw_cache_exists;
            /**
             * 形容词 + 助词 = 形容词，如： 不同 + 的 = 不同的
             */
            if (w1.w !== '了'
                && (w1.p & POSTAG.D_A)
                && (w2.p & POSTAG.D_U)) {
                let p = POSTAG.D_A;
                let f;
                ({
                    nw_cache,
                    nw_cache_exists,
                } = self._getWordCache(nw, nw_cache, nw_cache_exists));
                let mw = nw_cache;
                if (!mw || (mw.p & POSTAG.D_A)) {
                    if (((mw === null || mw === void 0 ? void 0 : mw.p) & POSTAG.D_A)) {
                        p = mw.p;
                        f = mw.f;
                    }
                    else if (w1.p & POSTAG.BAD) {
                        p = POSTAG.D_A + POSTAG.BAD;
                    }
                    this.sliceToken(words, i, 2, {
                        w: nw,
                        //p: ((nw in TABLE && TABLE[nw].p & POSTAG.D_A) ? TABLE[nw].p : POSTAG.D_A),
                        p,
                        f,
                        m: [w1, w2],
                    }, undefined, {
                        [this.name]: 1,
                    });
                    ie--;
                    continue;
                }
            }
            /**
             * 形容詞 + 名詞 = 名詞
             */
            if ((w1.p & POSTAG.D_A)
                && (w2.p & POSTAG.D_N)) {
                ({
                    nw_cache,
                    nw_cache_exists,
                } = self._getWordCache(nw, nw_cache, nw_cache_exists));
                if (nw_cache_exists) {
                    let mw = nw_cache;
                    if (mw.p & POSTAG.D_N) {
                        this.sliceToken(words, i, 2, {
                            w: nw,
                            p: mw.p,
                            f: mw.f,
                            m: [w1, w2],
                        }, undefined, {
                            [this.name]: 7,
                        });
                        ie--;
                        continue;
                    }
                }
            }
            // 能组成一个新词的(词性必须相同)
            if (this.isMergeable(w1, w2, {
                nw,
                POSTAG,
                TABLE,
                i,
                nw_cache,
                nw_cache_exists,
            })) 
            //if (w1.p == w2.p && nw in TABLE)
            {
                ({
                    nw_cache,
                    nw_cache_exists,
                } = self._getWordCache(nw, nw_cache, nw_cache_exists));
                let mw = nw_cache;
                this.sliceToken(words, i, 2, {
                    w: nw,
                    p: mw.p,
                    f: mw.f,
                    m: [w1, w2],
                }, undefined, {
                    [this.name]: 2,
                });
                ie--;
                continue;
            }
            // ============================================
            // 数词组合
            if ((w1.p & POSTAG.A_M)) {
                //debug(w2.w + ' ' + (w2.p & POSTAG.A_M));
                // 百分比数字 如 10%，或者下一个词也是数词，则合并
                if ((w2.p & POSTAG.A_M
                    && !/^第/.test(w2.w)) || w2.w === '%' || w2.w === '％') {
                    this.sliceToken(words, i, 2, {
                        w: w1.w + w2.w,
                        p: POSTAG.A_M,
                        m: [w1, w2],
                    }, undefined, {
                        [this.name]: 3,
                    });
                    ie--;
                    continue;
                }
                // 数词 + 量词，合并。如： 100个
                if ((w2.p & POSTAG.A_Q)) {
                    // 数量词
                    let p = POSTAG.D_MQ;
                    let nw = w1.w + w2.w;
                    ({
                        nw_cache,
                        nw_cache_exists,
                    } = self._getWordCache(nw, nw_cache, nw_cache_exists));
                    p = this._mergeWordHowManyProp(p, w2.p, nw_cache === null || nw_cache === void 0 ? void 0 : nw_cache.p);
                    /*
                    if (nw_cache)
                    {
                        p = nw_cache.p | POSTAG.D_MQ;
                    }
                    else
                    {
                        if (w2.p & POSTAG.D_T)
                        {
                            p = p | POSTAG.D_T;
                        }
                        if (w2.p & POSTAG.D_N)
                        {
                            p = p | POSTAG.D_N;
                        }
                        if (w2.p & POSTAG.D_V)
                        {
                            p = p | POSTAG.D_V;
                        }
                    }
                     */
                    this.sliceToken(words, i, 2, {
                        w: nw,
                        p,
                        m: [w1, w2],
                    }, undefined, {
                        [this.name]: 4,
                    });
                    ie--;
                    continue;
                }
                // 带小数点的数字 ，如 “3 . 14”，或者 “十五点三”
                // 数词 + "分之" + 数词，如“五十分之一”
                let w3 = words[i + 2];
                if (((w3 === null || w3 === void 0 ? void 0 : w3.p) & POSTAG.A_M)) {
                    if (w2.w === '.'
                        || w2.w === '点'
                        || w2.w === '點'
                        || w2.w === '分之') {
                        this.sliceToken(words, i, 3, {
                            w: w1.w + w2.w + w3.w,
                            p: POSTAG.A_M,
                            m: [w1, w2, w3],
                        }, undefined, {
                            [this.name]: 5,
                        });
                        ie -= 2;
                        continue;
                    }
                    /**
                     * 支援 `最多容納59,000個人,或5.9萬人,再多就不行了.這是環評的結論.`
                     */
                    if (w2.w === ',') {
                        let _r1 = /^[\d０-９]+$/;
                        let _r2 = /^(?:(?:[\d０-９]+)?(?:\.[\d０-９]+)|(?:[\d０-９]+))$/;
                        if (_r1.test(w1.w) && _r2.test(w3.w)) {
                            this.sliceToken(words, i, 3, {
                                w: w1.w + w2.w + w3.w,
                                p: POSTAG.A_M,
                                m: [w1, w2, w3],
                            }, undefined, {
                                [this.name]: 6,
                            });
                            ie -= 2;
                            continue;
                        }
                    }
                }
            }
            if (/^(?:[數数幾几][百千萬十億兆万亿]|毎)$/.test(w1.w) && w2.p & POSTAG.A_Q) {
                let ow = w1.w + w2.w;
                let nw = w1.w + w2.w;
                if (0 && /^几/.test(nw)) {
                    nw = nw.replace(/^几/, '幾');
                }
                ({
                    nw_cache,
                    nw_cache_exists,
                } = self._getWordCache(nw, nw_cache, nw_cache_exists));
                let p = this._mergeWordHowManyProp(POSTAG.D_MQ, w2.p, nw_cache === null || nw_cache === void 0 ? void 0 : nw_cache.p);
                this.sliceToken(words, i, 2, {
                    w: nw,
                    p,
                    m: [w1, w2],
                }, undefined, {
                    [this.name]: 9,
                });
                ie--;
                continue;
            }
            if (/^[數数幾几第]$/.test(w1.w) && w2.p & POSTAG.A_M && ((_a = words[i + 2]) === null || _a === void 0 ? void 0 : _a.p) & POSTAG.A_Q) {
                let w3 = words[i + 2];
                let nw;
                if (0 && w1.w === '几') {
                    nw = '幾' + w2.w + w3.w;
                }
                else {
                    nw = w1.w + w2.w + w3.w;
                }
                let nw_cache = this._TABLE[nw];
                /**
                 * 已經看過數百遍的動畫。
                 */
                if (!(nw_cache === null || nw_cache === void 0 ? void 0 : nw_cache.p)) {
                    let p = this._mergeWordHowManyProp(POSTAG.D_MQ, w3.p, nw_cache === null || nw_cache === void 0 ? void 0 : nw_cache.p);
                    this.sliceToken(words, i, 3, {
                        w: nw,
                        p,
                        m: [w1, w2, w3],
                    }, undefined, {
                        [this.name]: 9,
                    });
                    ie -= 2;
                    continue;
                }
            }
            // 修正 “十五点五八”问题
            if ((w1.p & POSTAG.D_MQ) && ['點', '点'].includes(w1.w.substr(-1)) && w2.p & POSTAG.A_M) {
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
                this.sliceToken(words, i, i2, {
                    w: w1.w + w2.w + w4w,
                    p: POSTAG.D_MQ,
                    m: [w1, w2, w4w],
                }, undefined, {
                    [this.name]: 6,
                });
                ie -= i2 - 1;
                continue;
            }
            /**
             * 合併 東南西北
             */
            if (DIRECTIONS_REGEXP.test(w1.w)) {
                if (DIRECTIONS_REGEXP.test(w2.w)) {
                    ({
                        nw_cache,
                        nw_cache_exists,
                    } = self._getWordCache(nw, nw_cache, nw_cache_exists));
                    let mw = this.createToken({
                        p: POSTAG.D_F,
                        ...nw_cache,
                        w: nw,
                        m: [w1, w2],
                    });
                    mw.p = mw.p | POSTAG.D_F;
                    this.sliceToken(words, i, 2, mw, true, {
                        [this.name]: 8,
                    });
                    ie--;
                    continue;
                }
            }
            // 移到下一个词
            i++;
        }
        // 针对组合数字后无法识别新组合的数字问题，需要重新扫描一次
        return is_not_first === true ? words : this.doOptimize(words, true);
    }
    /**
     * 數詞 + 量詞
     */
    _mergeWordHowManyProp(p, p2, p3) {
        if (p3) {
            p = p3 | this._POSTAG.D_MQ;
        }
        else {
            if (p2 & this._POSTAG.D_T) {
                p = p | this._POSTAG.D_T;
            }
            if (p2 & this._POSTAG.D_N) {
                p = p | this._POSTAG.D_N;
            }
            if (p2 & this._POSTAG.D_V) {
                p = p | this._POSTAG.D_V;
            }
        }
        return p;
    }
}
exports.DictOptimizer = DictOptimizer;
exports.init = DictOptimizer.init.bind(DictOptimizer);
exports.type = DictOptimizer.type;
exports.default = DictOptimizer;
//# sourceMappingURL=DictOptimizer.js.map