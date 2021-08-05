"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.type = exports.init = exports.AdjectiveOptimizer = void 0;
const mod_1 = require("../mod");
const COLORS_1 = require("../mod/COLORS");
/**
 * 把一些错认为名词的词标注为形容词，或者对名词作定语的情况
 */
class AdjectiveOptimizer extends mod_1.SubSModuleOptimizer {
    constructor() {
        super(...arguments);
        this.name = 'AdjectiveOptimizer';
    }
    doOptimize(words) {
        const POSTAG = this._POSTAG;
        let index = 0;
        while (index < words.length) {
            const word = words[index];
            const nextword = words[index + 1];
            if (nextword) {
                // 对于<颜色>+<的>，直接判断颜色是形容词（字典里颜色都是名词）
                if (nextword.p & POSTAG.D_U && COLORS_1.COLOR_ALL[word.w]) {
                    word.op = word.op || word.p;
                    word.p |= POSTAG.D_A;
                    this.debugToken(word, {
                        [this.name]: true,
                    });
                }
                // 如果是连续的两个名词，前一个是颜色，那这个颜色也是形容词
                if (word.p & POSTAG.D_N && this.isNominal(nextword.p) && COLORS_1.COLOR_ALL[word.w]) {
                    word.op = word.op || word.p;
                    word.p |= POSTAG.D_A;
                    word.p |= POSTAG.D_N;
                    this.debugToken(word, {
                        [this.name]: true,
                    });
                }
                if ((word.w === '純' || word.w === '纯') && COLORS_1.COLOR_HAIR[nextword.w]) {
                    word.op = word.op || word.p;
                    word.p |= POSTAG.D_A;
                    this.debugToken(word, {
                        [this.name]: true,
                    });
                }
            }
            // 移到下一个单词
            index += 1;
        }
        return words;
    }
    isNominal(pos) {
        /*
        if (Array.isArray(pos))
        {
            return this.isNominal(pos[0]);
        }
        */
        const POSTAG = this._POSTAG;
        return (pos === POSTAG.D_N ||
            pos === POSTAG.A_NT ||
            pos === POSTAG.A_NX ||
            pos === POSTAG.A_NZ ||
            pos === POSTAG.A_NR ||
            pos === POSTAG.A_NS ||
            pos === POSTAG.URL);
    }
}
exports.AdjectiveOptimizer = AdjectiveOptimizer;
exports.init = AdjectiveOptimizer.init.bind(AdjectiveOptimizer);
exports.type = AdjectiveOptimizer.type;
exports.default = AdjectiveOptimizer;
//# sourceMappingURL=AdjectiveOptimizer.js.map