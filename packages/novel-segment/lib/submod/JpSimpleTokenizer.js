"use strict";
/**
 * Created by user on 2018/4/19/019.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = exports.JpSimpleTokenizer = exports.EnumJpSimpleTokenizerType = void 0;
const mod_1 = require("../mod");
var EnumJpSimpleTokenizerType;
(function (EnumJpSimpleTokenizerType) {
    /**
     * 平仮名
     * https://en.wikipedia.org/wiki/Hiragana
     */
    EnumJpSimpleTokenizerType[EnumJpSimpleTokenizerType["HIRAGANA"] = 1] = "HIRAGANA";
    /**
     * 片仮名
     * https://en.wikipedia.org/wiki/Katakana
     */
    EnumJpSimpleTokenizerType[EnumJpSimpleTokenizerType["KATAKANA"] = 2] = "KATAKANA";
})(EnumJpSimpleTokenizerType = exports.EnumJpSimpleTokenizerType || (exports.EnumJpSimpleTokenizerType = {}));
let JpSimpleTokenizer = /** @class */ (() => {
    class JpSimpleTokenizer extends mod_1.SubSModuleTokenizer {
        constructor() {
            super(...arguments);
            this.name = 'JpSimpleTokenizer';
        }
        split(words, ...argv) {
            return this._splitUnset(words, this._splitText);
        }
        createJpSimpleToken(data, type) {
            return super.debugToken(data, {
                [this.name]: type,
            }, true);
        }
        _splitText(text) {
            //const POSTAG = this.segment.POSTAG;
            let self = this;
            let b1 = /[ぁ-ん]/.test(text);
            let b2 = /[ァ-ヴーｱ-ﾝﾞｰ]/.test(text);
            if (!b1 || !b2) {
                if (b1 && /^[ぁ-ん]+$/.test(text) || b2 && /^[ァ-ヴーｱ-ﾝﾞｰ]+$/.test(text)) {
                    return [self.createJpSimpleToken({
                            w: text,
                        }, b1 ? 1 /* HIRAGANA */ : 2 /* KATAKANA */)];
                }
                return null;
            }
            let ret = [];
            text
                .split(/((?:[^ァ-ヴーｱ-ﾝﾞｰ]+)?[ぁ-ん]+(?=[ァ-ヴーｱ-ﾝﾞｰ])|(?:[^ぁ-ん]+)?[ァ-ヴーｱ-ﾝﾞｰ]+(?=[ぁ-ん]))/)
                .forEach(function (w, i) {
                if (w !== '') {
                    ret.push(self.createJpSimpleToken({
                        w,
                    }, /[ぁ-ん]/.test(w) ? 1 /* HIRAGANA */
                        : 2 /* KATAKANA */));
                }
            });
            return ret;
        }
    }
    JpSimpleTokenizer.NAME = 'JpSimpleTokenizer';
    return JpSimpleTokenizer;
})();
exports.JpSimpleTokenizer = JpSimpleTokenizer;
exports.init = JpSimpleTokenizer.init.bind(JpSimpleTokenizer);
exports.default = JpSimpleTokenizer;
//# sourceMappingURL=JpSimpleTokenizer.js.map