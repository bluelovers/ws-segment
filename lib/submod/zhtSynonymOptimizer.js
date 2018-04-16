"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Optimizer_1 = require("../mod/Optimizer");
/**
 * 自動處理 `里|裏|后`
 */
class ZhtSynonymOptimizer extends Optimizer_1.SubSModuleOptimizer {
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
            if (w1.w == '裏' || w1.w == '里') {
                // 如果前一個項目為 名詞 或 處所
                if (w0 && (w0.p & POSTAG.D_N || w0.p & POSTAG.D_S)) {
                    // @ts-ignore
                    w1.ow = w1.w;
                    w1.w = '裡';
                }
            }
            // 如果項目為 方位
            else if (w1.p & POSTAG.D_F) {
                let nw = w1.w
                    .replace(/(.)[裏里]|[裏里](.)/, '$1裡$2')
                    .replace(/.[后]|[后]./, '後');
                if (nw != w1.w) {
                    // @ts-ignore
                    w1.ow = w1.w;
                    w1.w = nw;
                }
            }
            // 如果項目為 處所
            else if (w1.p & POSTAG.D_S) {
                let nw = w1.w
                    .replace(/(.)[裏里]$/, '$1裡');
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
exports.default = exports.init;
