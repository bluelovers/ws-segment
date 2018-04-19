"use strict";
/**
 * Created by user on 2018/4/19/019.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const mod_1 = require("../mod");
class JpSimpleTokenizer extends mod_1.SubSModuleTokenizer {
    constructor() {
        super(...arguments);
        this.name = 'JpSimpleTokenizer';
    }
    split(words, ...argv) {
        return this._splitUnset(words, this._splitText);
    }
    _splitText(text) {
        //const POSTAG = this.segment.POSTAG;
        let self = this;
        let b1 = /[ぁ-ん]/.test(text);
        let b2 = /[ァ-ヴーｱ-ﾝﾞｰ]/.test(text);
        if (!b1 || !b2) {
            if (b1 && /^[ぁ-ん]+$/.test(text) || b2 && /^[ァ-ヴーｱ-ﾝﾞｰ]+$/.test(text)) {
                return [self.debugToken({
                        w: text,
                    }, {
                        [self.name]: b1 ? 0x1 : 0x2,
                    }, true)];
            }
            return null;
        }
        let ret = [];
        text
            .split(/((?:[^ァ-ヴーｱ-ﾝﾞｰ]+)?[ぁ-ん]+(?=[ァ-ヴーｱ-ﾝﾞｰ])|(?:[^ぁ-ん]+)?[ァ-ヴーｱ-ﾝﾞｰ]+(?=[ぁ-ん]))/)
            .forEach(function (w, i) {
            if (w !== '') {
                ret.push(self.debugToken({
                    w,
                }, {
                    [self.name]: /[ぁ-ん]/.test(w) ? 0x1 : 0x2,
                }, true));
            }
        });
        return ret;
    }
}
exports.JpSimpleTokenizer = JpSimpleTokenizer;
exports.init = JpSimpleTokenizer.init.bind(JpSimpleTokenizer);
exports.default = JpSimpleTokenizer;
