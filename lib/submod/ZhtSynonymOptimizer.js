"use strict";
/**
 * Created by user on 2018/4/16/016.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const mod_1 = require("../mod");
/**
 * 自動處理 `里|裏|后`
 *
 * @todo 發于余干松冲准呆只范舍涂
 */
class ZhtSynonymOptimizer extends mod_1.SubSModuleOptimizer {
    constructor() {
        super(...arguments);
        this.type = 'optimizer';
    }
    /**
     * 自動處理 `里|裏|后`
     */
    doOptimize(words) {
        const self = this;
        const POSTAG = self.segment.POSTAG;
        let i = 0;
        while (i < words.length) {
            let w0 = words[i - 1] || null;
            let w1 = words[i];
            let w2 = words[i + 1] || null;
            if (w1.w == '里') {
                // 如果前一個項目為 名詞 或 處所
                if (w0 && (w0.p & POSTAG.D_N || w0.p & POSTAG.D_S)) {
                    // @ts-ignore
                    w1.ow = w1.w;
                    w1.w = '裡';
                }
            }
            else if (w1.w == '后') {
                // 如果前一個項目為 动词 ex: 離開
                if (w0 && (w0.p & POSTAG.D_V || w0.p & POSTAG.D_S || w0.p & POSTAG.D_T || w0.p & POSTAG.D_N)) {
                    // @ts-ignore
                    w1.ow = w1.w;
                    w1.w = '後';
                }
                else if (w2 && (w2.p & POSTAG.D_V)) {
                    // @ts-ignore
                    w1.ow = w1.w;
                    w1.w = '後';
                }
            }
            // 如果項目為 方位 錯字
            else if (w1.p & POSTAG.D_F || w1.p & POSTAG.BAD) {
                let nw = w1.w
                    .replace(/(.)里|里(.)/, '$1裡$2')
                    .replace(/(.)后|后(.)/, '$1後$2');
                if (nw != w1.w) {
                    // @ts-ignore
                    w1.ow = w1.w;
                    w1.w = nw;
                }
            }
            // 如果項目為 處所
            else if (w1.p & POSTAG.D_S) {
                let nw = w1.w
                    .replace(/(.)里$/, '$1裡');
                if (nw != w1.w) {
                    // @ts-ignore
                    w1.ow = w1.w;
                    w1.w = nw;
                }
            }
            // 如果項目為 时间
            else if (w1.p & POSTAG.D_T || w1.p & POSTAG.D_V) {
                let nw = w1.w
                    .replace(/(.)后|后(.)/, '$1後$2');
                if (nw != w1.w) {
                    // @ts-ignore
                    w1.ow = w1.w;
                    w1.w = nw;
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
