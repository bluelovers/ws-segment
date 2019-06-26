"use strict";
/**
 * Created by user on 2018/4/19/019.
 */
Object.defineProperty(exports, "__esModule", { value: true });
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
exports.JpSimpleTokenizer = JpSimpleTokenizer;
JpSimpleTokenizer.NAME = 'JpSimpleTokenizer';
exports.init = JpSimpleTokenizer.init.bind(JpSimpleTokenizer);
exports.default = JpSimpleTokenizer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSnBTaW1wbGVUb2tlbml6ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJKcFNpbXBsZVRva2VuaXplci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7O0FBRUgsZ0NBQXlEO0FBS3pELElBQWtCLHlCQVlqQjtBQVpELFdBQWtCLHlCQUF5QjtJQUUxQzs7O09BR0c7SUFDSCxpRkFBYyxDQUFBO0lBQ2Q7OztPQUdHO0lBQ0gsaUZBQWMsQ0FBQTtBQUNmLENBQUMsRUFaaUIseUJBQXlCLEdBQXpCLGlDQUF5QixLQUF6QixpQ0FBeUIsUUFZMUM7QUFFRCxNQUFhLGlCQUFrQixTQUFRLHlCQUFtQjtJQUExRDs7UUFJQyxTQUFJLEdBQUcsbUJBQTRCLENBQUM7SUF5RHJDLENBQUM7SUF2REEsS0FBSyxDQUFDLEtBQWMsRUFBRSxHQUFHLElBQUk7UUFFNUIsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDakQsQ0FBQztJQUVTLG1CQUFtQixDQUF1QixJQUFPLEVBQUUsSUFBK0I7UUFFM0YsT0FBTyxLQUFLLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRTtZQUM3QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJO1NBQ2pCLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDVixDQUFDO0lBRVMsVUFBVSxDQUFDLElBQVk7UUFFaEMscUNBQXFDO1FBRXJDLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQztRQUVoQixJQUFJLEVBQUUsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzVCLElBQUksRUFBRSxHQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFbEMsSUFBSSxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFDZDtZQUNDLElBQUksRUFBRSxJQUFJLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFDcEU7Z0JBQ0MsT0FBTyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQzt3QkFDaEMsQ0FBQyxFQUFFLElBQUk7cUJBQ1AsRUFBRSxFQUFFLENBQUMsQ0FBQyxrQkFBb0MsQ0FBQyxpQkFBbUMsQ0FDOUUsQ0FBQyxDQUFDO2FBQ0g7WUFFRCxPQUFPLElBQUksQ0FBQztTQUNaO1FBRUQsSUFBSSxHQUFHLEdBQVksRUFBRSxDQUFDO1FBRXRCLElBQUk7YUFDRixLQUFLLENBQUMsNkVBQTZFLENBQUM7YUFDcEYsT0FBTyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUM7WUFFdEIsSUFBSSxDQUFDLEtBQUssRUFBRSxFQUNaO2dCQUNDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDO29CQUNqQyxDQUFDO2lCQUNELEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNsQixDQUFDLGlCQUFtQyxDQUNyQyxDQUFDLENBQUM7YUFDSDtRQUNGLENBQUMsQ0FBQyxDQUVGO1FBRUQsT0FBTyxHQUFHLENBQUM7SUFDWixDQUFDOztBQTNERiw4Q0E2REM7QUEzRE8sc0JBQUksR0FBRyxtQkFBNEIsQ0FBQztBQTZEL0IsUUFBQSxJQUFJLEdBQUcsaUJBQWlCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBa0MsQ0FBQztBQUVwRyxrQkFBZSxpQkFBaUIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTgvNC8xOS8wMTkuXG4gKi9cblxuaW1wb3J0IHsgU3ViU01vZHVsZSwgU3ViU01vZHVsZVRva2VuaXplciB9IGZyb20gJy4uL21vZCc7XG5pbXBvcnQgeyBTZWdtZW50LCBJV29yZCB9IGZyb20gJy4uL1NlZ21lbnQnO1xuaW1wb3J0IFVTdHJpbmcgZnJvbSAndW5pLXN0cmluZyc7XG5pbXBvcnQgeyBJV29yZERlYnVnLCBJV29yZERlYnVnSW5mbyB9IGZyb20gJy4uL3V0aWwnO1xuXG5leHBvcnQgY29uc3QgZW51bSBFbnVtSnBTaW1wbGVUb2tlbml6ZXJUeXBlXG57XG5cdC8qKlxuXHQgKiDlubPku67lkI1cblx0ICogaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvSGlyYWdhbmFcblx0ICovXG5cdEhJUkFHQU5BID0gMHgxLFxuXHQvKipcblx0ICog54mH5Luu5ZCNXG5cdCAqIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0thdGFrYW5hXG5cdCAqL1xuXHRLQVRBS0FOQSA9IDB4Mixcbn1cblxuZXhwb3J0IGNsYXNzIEpwU2ltcGxlVG9rZW5pemVyIGV4dGVuZHMgU3ViU01vZHVsZVRva2VuaXplclxue1xuXHRzdGF0aWMgTkFNRSA9ICdKcFNpbXBsZVRva2VuaXplcicgYXMgY29uc3Q7XG5cblx0bmFtZSA9ICdKcFNpbXBsZVRva2VuaXplcicgYXMgY29uc3Q7XG5cblx0c3BsaXQod29yZHM6IElXb3JkW10sIC4uLmFyZ3YpOiBJV29yZFtdXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fc3BsaXRVbnNldCh3b3JkcywgdGhpcy5fc3BsaXRUZXh0KTtcblx0fVxuXG5cdHByb3RlY3RlZCBjcmVhdGVKcFNpbXBsZVRva2VuPFQgZXh0ZW5kcyBJV29yZERlYnVnPihkYXRhOiBULCB0eXBlOiBFbnVtSnBTaW1wbGVUb2tlbml6ZXJUeXBlKVxuXHR7XG5cdFx0cmV0dXJuIHN1cGVyLmRlYnVnVG9rZW4oZGF0YSwge1xuXHRcdFx0W3RoaXMubmFtZV06IHR5cGUsXG5cdFx0fSwgdHJ1ZSk7XG5cdH1cblxuXHRwcm90ZWN0ZWQgX3NwbGl0VGV4dCh0ZXh0OiBzdHJpbmcpOiBJV29yZFtdXG5cdHtcblx0XHQvL2NvbnN0IFBPU1RBRyA9IHRoaXMuc2VnbWVudC5QT1NUQUc7XG5cblx0XHRsZXQgc2VsZiA9IHRoaXM7XG5cblx0XHRsZXQgYjEgPSAvW+OBgS3jgpNdLy50ZXN0KHRleHQpO1xuXHRcdGxldCBiMiA9IC9b44KhLeODtOODvO+9sS3vvp3vvp7vvbBdLy50ZXN0KHRleHQpO1xuXG5cdFx0aWYgKCFiMSB8fCAhYjIpXG5cdFx0e1xuXHRcdFx0aWYgKGIxICYmIC9eW+OBgS3jgpNdKyQvLnRlc3QodGV4dCkgfHwgYjIgJiYgL15b44KhLeODtOODvO+9sS3vvp3vvp7vvbBdKyQvLnRlc3QodGV4dCkpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiBbc2VsZi5jcmVhdGVKcFNpbXBsZVRva2VuKHtcblx0XHRcdFx0XHR3OiB0ZXh0LFxuXHRcdFx0XHR9LCBiMSA/IEVudW1KcFNpbXBsZVRva2VuaXplclR5cGUuSElSQUdBTkEgOiBFbnVtSnBTaW1wbGVUb2tlbml6ZXJUeXBlLktBVEFLQU5BXG5cdFx0XHRcdCldO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9XG5cblx0XHRsZXQgcmV0OiBJV29yZFtdID0gW107XG5cblx0XHR0ZXh0XG5cdFx0XHQuc3BsaXQoLygoPzpbXuOCoS3jg7Tjg7zvvbEt776d776e772wXSspP1vjgYEt44KTXSsoPz1b44KhLeODtOODvO+9sS3vvp3vvp7vvbBdKXwoPzpbXuOBgS3jgpNdKyk/W+OCoS3jg7Tjg7zvvbEt776d776e772wXSsoPz1b44GBLeOCk10pKS8pXG5cdFx0XHQuZm9yRWFjaChmdW5jdGlvbiAodywgaSlcblx0XHRcdHtcblx0XHRcdFx0aWYgKHcgIT09ICcnKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cmV0LnB1c2goc2VsZi5jcmVhdGVKcFNpbXBsZVRva2VuKHtcblx0XHRcdFx0XHRcdHcsXG5cdFx0XHRcdFx0fSwgL1vjgYEt44KTXS8udGVzdCh3KSA/IEVudW1KcFNpbXBsZVRva2VuaXplclR5cGUuSElSQUdBTkFcblx0XHRcdFx0XHRcdFx0OiBFbnVtSnBTaW1wbGVUb2tlbml6ZXJUeXBlLktBVEFLQU5BXG5cdFx0XHRcdFx0KSk7XG5cdFx0XHRcdH1cblx0XHRcdH0pXG5cblx0XHQ7XG5cblx0XHRyZXR1cm4gcmV0O1xuXHR9XG5cbn1cblxuZXhwb3J0IGNvbnN0IGluaXQgPSBKcFNpbXBsZVRva2VuaXplci5pbml0LmJpbmQoSnBTaW1wbGVUb2tlbml6ZXIpIGFzIHR5cGVvZiBKcFNpbXBsZVRva2VuaXplci5pbml0O1xuXG5leHBvcnQgZGVmYXVsdCBKcFNpbXBsZVRva2VuaXplcjtcblxuIl19