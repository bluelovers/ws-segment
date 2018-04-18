"use strict";
/**
 * Created by user on 2018/4/16/016.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const mod_1 = require("../mod");
const index_1 = require("../util/index");
/**
 * 自動處理 `里|后`
 *
 * @todo 發于余干松冲准呆只范舍涂
 */
class ZhtSynonymOptimizer extends mod_1.SubSModuleOptimizer {
    constructor() {
        super(...arguments);
        this.type = 'optimizer';
    }
    doOptimize(words) {
        const self = this;
        const POSTAG = self.segment.POSTAG;
        const TABLE = self.segment.getDict('TABLE');
        let i = 0;
        while (i < words.length) {
            let w0 = words[i - 1] || null;
            let w1 = words[i];
            let w2 = words[i + 1] || null;
            if (w1.w == '里') {
                // 如果前一個項目為 名詞 或 處所
                if (w0 && (w0.p & POSTAG.D_N || w0.p & POSTAG.D_S)) {
                    w1.ow = w1.w;
                    w1.w = '裡';
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
                }
                else if (w2 && (w2.p & POSTAG.D_V)) {
                    w1.ow = w1.w;
                    w1.w = '後';
                }
            }
            // 如果項目為 錯字
            else if (w1.p & POSTAG.BAD) {
                let nw = w1.w
                    .replace(/(.)里|里(.)/, '$1裡$2')
                    .replace(/(.)后|后(.)/, '$1後$2')
                    .replace(/蔘(.)/, '參$1');
                if (nw != w1.w) {
                    w1.ow = w1.w;
                    w1.w = nw;
                }
            }
            // 如果項目為 方位
            else if (w1.p & POSTAG.D_F || w1.p & POSTAG.BAD) {
                let nw = w1.w
                    .replace(/(.)里|里(.)/, '$1裡$2')
                    .replace(/(.)后|后(.)/, '$1後$2');
                if (nw != w1.w) {
                    w1.ow = w1.w;
                    w1.w = nw;
                }
            }
            // 如果項目為 處所
            else if (w1.p & POSTAG.D_S) {
                let nw = w1.w
                    .replace(/(.)里$/, '$1裡');
                if (nw != w1.w) {
                    w1.ow = w1.w;
                    w1.w = nw;
                }
            }
            // 如果項目為 时间
            else if (w1.p & POSTAG.D_T || w1.p & POSTAG.D_V) {
                let nw = w1.w
                    .replace(/(.)后|后(.)/, '$1後$2');
                if (nw != w1.w) {
                    w1.ow = w1.w;
                    w1.w = nw;
                }
            }
            if (w1.ow && w1.ow != w1.w && w1.w in TABLE) {
                let p = TABLE[w1.w].p;
                if (p != w1.p) {
                    w1.op = w1.op || w1.p;
                    w1.p = TABLE[w1.w].p;
                }
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