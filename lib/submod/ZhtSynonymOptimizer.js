"use strict";
/**
 * Created by user on 2018/4/16/016.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const mod_1 = require("../mod");
const index_1 = require("../util/index");
/**
 * 以詞意來自動轉換 而不需要手動加入字典於 synonym.txt
 * 適用於比較容易需要人工處理的轉換
 *
 * 自動處理 `里|后`
 *
 * 建議在字典內追加人名地名等等名字 來增加準確性
 * 防止轉換錯誤
 *
 * @todo 發于余干松冲准呆只范舍涂
 */
class ZhtSynonymOptimizer extends mod_1.SubSModuleOptimizer {
    constructor() {
        super(...arguments);
        this.type = 'optimizer';
        this.name = 'ZhtSynonymOptimizer';
    }
    _cache() {
        super._cache();
        this._TABLE = this.segment.getDict('TABLE');
        this._POSTAG = this.segment.POSTAG;
        this._SYNONYM = this.segment.getDict('SYNONYM') || {};
    }
    _getSynonym(w, nw) {
        const SYNONYM = this._SYNONYM;
        if (w in SYNONYM) {
            nw = SYNONYM[w];
        }
        if (nw in SYNONYM) {
            //let w = nw;
            nw = SYNONYM[nw];
        }
        return nw;
    }
    doOptimize(words) {
        const self = this;
        const POSTAG = this._POSTAG;
        const TABLE = this._TABLE;
        const SYNONYM = this._SYNONYM;
        let i = 0;
        while (i < words.length) {
            let w0 = words[i - 1] || null;
            let w1 = words[i];
            let w2 = words[i + 1] || null;
            let bool;
            if (w1.w == '里') {
                if (w0 && index_1.hexAndAny(w0.p, 
                // 名詞
                POSTAG.D_N, 
                // 處所
                POSTAG.D_S, 
                // 方位
                POSTAG.D_F, 
                // 时间词
                POSTAG.D_T, 
                // 动词 训练
                POSTAG.D_V)) {
                    w1.ow = w1.w;
                    w1.w = '裡';
                    bool = true;
                }
            }
            else if (w1.w == '后') {
                // 如果前一個項目為
                if (w0 && (w0.p && index_1.hexAndAny(w0.p, 
                // 动词 離開
                POSTAG.D_V, 
                // 处所词
                POSTAG.D_S, 
                // 时间词
                POSTAG.D_T, 
                // 名词 名语素
                POSTAG.D_N, 
                // 数量词 - 几次后
                POSTAG.D_MQ))) {
                    w1.ow = w1.w;
                    w1.w = '後';
                    bool = true;
                }
                else if (w2 && (w2.p & POSTAG.D_V)) {
                    w1.ow = w1.w;
                    w1.w = '後';
                    bool = true;
                }
            }
            // 如果項目為 錯字
            else if (w1.p & POSTAG.BAD) {
                let nw;
                nw = w1.w
                    .replace(/(.)里|里(.)/, '$1裡$2')
                    .replace(/(.)后|后(.)/, '$1後$2')
                    .replace(/蔘(.)/, '參$1');
                nw = this._getSynonym(w1.w, nw);
                if (nw != w1.w) {
                    w1.ow = w1.w;
                    w1.w = nw;
                    bool = true;
                }
            }
            // 如果項目為 方位
            else if (w1.p & POSTAG.D_F) {
                let nw = w1.w
                    .replace(/(.)里|里(.)/, '$1裡$2')
                    .replace(/(.)后|后(.)/, '$1後$2');
                nw = this._getSynonym(w1.w, nw);
                if (nw != w1.w) {
                    w1.ow = w1.w;
                    w1.w = nw;
                    bool = true;
                }
            }
            // 如果項目為 處所
            else if (w1.p & POSTAG.D_S) {
                let nw = w1.w
                    .replace(/(.)里$/, '$1裡');
                nw = this._getSynonym(w1.w, nw);
                if (nw != w1.w) {
                    w1.ow = w1.w;
                    w1.w = nw;
                    bool = true;
                }
            }
            // 如果項目為 时间
            else if (w1.p & POSTAG.D_T || w1.p & POSTAG.D_V) {
                let nw = w1.w
                    .replace(/(.)后|后(.)/, '$1後$2');
                nw = this._getSynonym(w1.w, nw);
                if (nw != w1.w) {
                    w1.ow = w1.w;
                    w1.w = nw;
                    bool = true;
                }
            }
            if (bool && w1.ow && w1.ow != w1.w) {
                if (w1.w in TABLE) {
                    let p = TABLE[w1.w].p;
                    if (p != w1.p) {
                        w1.op = w1.op || w1.p;
                        w1.p = TABLE[w1.w].p;
                    }
                }
                this.debugToken(w1, {
                    [this.name]: true,
                });
            }
            i++;
        }
        return words;
    }
}
ZhtSynonymOptimizer.type = 'optimizer';
exports.ZhtSynonymOptimizer = ZhtSynonymOptimizer;
exports.init = ZhtSynonymOptimizer.init.bind(ZhtSynonymOptimizer);
exports.default = ZhtSynonymOptimizer;
