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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSnBTaW1wbGVUb2tlbml6ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJKcFNpbXBsZVRva2VuaXplci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7O0FBRUgsZ0NBQXlEO0FBS3pELElBQWtCLHlCQVlqQjtBQVpELFdBQWtCLHlCQUF5QjtJQUUxQzs7O09BR0c7SUFDSCxpRkFBYyxDQUFBO0lBQ2Q7OztPQUdHO0lBQ0gsaUZBQWMsQ0FBQTtBQUNmLENBQUMsRUFaaUIseUJBQXlCLEdBQXpCLGlDQUF5QixLQUF6QixpQ0FBeUIsUUFZMUM7QUFFRDtJQUFBLE1BQWEsaUJBQWtCLFNBQVEseUJBQW1CO1FBQTFEOztZQUlDLFNBQUksR0FBRyxtQkFBNEIsQ0FBQztRQXlEckMsQ0FBQztRQXZEQSxLQUFLLENBQUMsS0FBYyxFQUFFLEdBQUcsSUFBSTtZQUU1QixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUNqRCxDQUFDO1FBRVMsbUJBQW1CLENBQXVCLElBQU8sRUFBRSxJQUErQjtZQUUzRixPQUFPLEtBQUssQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFO2dCQUM3QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJO2FBQ2pCLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDVixDQUFDO1FBRVMsVUFBVSxDQUFDLElBQVk7WUFFaEMscUNBQXFDO1lBRXJDLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQztZQUVoQixJQUFJLEVBQUUsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzVCLElBQUksRUFBRSxHQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFbEMsSUFBSSxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFDZDtnQkFDQyxJQUFJLEVBQUUsSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQ3BFO29CQUNDLE9BQU8sQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUM7NEJBQ2hDLENBQUMsRUFBRSxJQUFJO3lCQUNQLEVBQUUsRUFBRSxDQUFDLENBQUMsa0JBQW9DLENBQUMsaUJBQW1DLENBQzlFLENBQUMsQ0FBQztpQkFDSDtnQkFFRCxPQUFPLElBQUksQ0FBQzthQUNaO1lBRUQsSUFBSSxHQUFHLEdBQVksRUFBRSxDQUFDO1lBRXRCLElBQUk7aUJBQ0YsS0FBSyxDQUFDLDZFQUE2RSxDQUFDO2lCQUNwRixPQUFPLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQztnQkFFdEIsSUFBSSxDQUFDLEtBQUssRUFBRSxFQUNaO29CQUNDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDO3dCQUNqQyxDQUFDO3FCQUNELEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUNsQixDQUFDLGlCQUFtQyxDQUNyQyxDQUFDLENBQUM7aUJBQ0g7WUFDRixDQUFDLENBQUMsQ0FFRjtZQUVELE9BQU8sR0FBRyxDQUFDO1FBQ1osQ0FBQzs7SUF6RE0sc0JBQUksR0FBRyxtQkFBNEIsQ0FBQztJQTJENUMsd0JBQUM7S0FBQTtBQTdEWSw4Q0FBaUI7QUErRGpCLFFBQUEsSUFBSSxHQUFHLGlCQUFpQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQWtDLENBQUM7QUFFcEcsa0JBQWUsaUJBQWlCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgdXNlciBvbiAyMDE4LzQvMTkvMDE5LlxuICovXG5cbmltcG9ydCB7IFN1YlNNb2R1bGUsIFN1YlNNb2R1bGVUb2tlbml6ZXIgfSBmcm9tICcuLi9tb2QnO1xuaW1wb3J0IHsgU2VnbWVudCwgSVdvcmQgfSBmcm9tICcuLi9TZWdtZW50JztcbmltcG9ydCBVU3RyaW5nIGZyb20gJ3VuaS1zdHJpbmcnO1xuaW1wb3J0IHsgSVdvcmREZWJ1ZywgSVdvcmREZWJ1Z0luZm8gfSBmcm9tICcuLi91dGlsJztcblxuZXhwb3J0IGNvbnN0IGVudW0gRW51bUpwU2ltcGxlVG9rZW5pemVyVHlwZVxue1xuXHQvKipcblx0ICog5bmz5Luu5ZCNXG5cdCAqIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0hpcmFnYW5hXG5cdCAqL1xuXHRISVJBR0FOQSA9IDB4MSxcblx0LyoqXG5cdCAqIOeJh+S7ruWQjVxuXHQgKiBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9LYXRha2FuYVxuXHQgKi9cblx0S0FUQUtBTkEgPSAweDIsXG59XG5cbmV4cG9ydCBjbGFzcyBKcFNpbXBsZVRva2VuaXplciBleHRlbmRzIFN1YlNNb2R1bGVUb2tlbml6ZXJcbntcblx0c3RhdGljIE5BTUUgPSAnSnBTaW1wbGVUb2tlbml6ZXInIGFzIGNvbnN0O1xuXG5cdG5hbWUgPSAnSnBTaW1wbGVUb2tlbml6ZXInIGFzIGNvbnN0O1xuXG5cdHNwbGl0KHdvcmRzOiBJV29yZFtdLCAuLi5hcmd2KTogSVdvcmRbXVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX3NwbGl0VW5zZXQod29yZHMsIHRoaXMuX3NwbGl0VGV4dCk7XG5cdH1cblxuXHRwcm90ZWN0ZWQgY3JlYXRlSnBTaW1wbGVUb2tlbjxUIGV4dGVuZHMgSVdvcmREZWJ1Zz4oZGF0YTogVCwgdHlwZTogRW51bUpwU2ltcGxlVG9rZW5pemVyVHlwZSlcblx0e1xuXHRcdHJldHVybiBzdXBlci5kZWJ1Z1Rva2VuKGRhdGEsIHtcblx0XHRcdFt0aGlzLm5hbWVdOiB0eXBlLFxuXHRcdH0sIHRydWUpO1xuXHR9XG5cblx0cHJvdGVjdGVkIF9zcGxpdFRleHQodGV4dDogc3RyaW5nKTogSVdvcmRbXVxuXHR7XG5cdFx0Ly9jb25zdCBQT1NUQUcgPSB0aGlzLnNlZ21lbnQuUE9TVEFHO1xuXG5cdFx0bGV0IHNlbGYgPSB0aGlzO1xuXG5cdFx0bGV0IGIxID0gL1vjgYEt44KTXS8udGVzdCh0ZXh0KTtcblx0XHRsZXQgYjIgPSAvW+OCoS3jg7Tjg7zvvbEt776d776e772wXS8udGVzdCh0ZXh0KTtcblxuXHRcdGlmICghYjEgfHwgIWIyKVxuXHRcdHtcblx0XHRcdGlmIChiMSAmJiAvXlvjgYEt44KTXSskLy50ZXN0KHRleHQpIHx8IGIyICYmIC9eW+OCoS3jg7Tjg7zvvbEt776d776e772wXSskLy50ZXN0KHRleHQpKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gW3NlbGYuY3JlYXRlSnBTaW1wbGVUb2tlbih7XG5cdFx0XHRcdFx0dzogdGV4dCxcblx0XHRcdFx0fSwgYjEgPyBFbnVtSnBTaW1wbGVUb2tlbml6ZXJUeXBlLkhJUkFHQU5BIDogRW51bUpwU2ltcGxlVG9rZW5pemVyVHlwZS5LQVRBS0FOQVxuXHRcdFx0XHQpXTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXG5cdFx0bGV0IHJldDogSVdvcmRbXSA9IFtdO1xuXG5cdFx0dGV4dFxuXHRcdFx0LnNwbGl0KC8oKD86W17jgqEt44O044O8772xLe++ne++nu+9sF0rKT9b44GBLeOCk10rKD89W+OCoS3jg7Tjg7zvvbEt776d776e772wXSl8KD86W17jgYEt44KTXSspP1vjgqEt44O044O8772xLe++ne++nu+9sF0rKD89W+OBgS3jgpNdKSkvKVxuXHRcdFx0LmZvckVhY2goZnVuY3Rpb24gKHcsIGkpXG5cdFx0XHR7XG5cdFx0XHRcdGlmICh3ICE9PSAnJylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHJldC5wdXNoKHNlbGYuY3JlYXRlSnBTaW1wbGVUb2tlbih7XG5cdFx0XHRcdFx0XHR3LFxuXHRcdFx0XHRcdH0sIC9b44GBLeOCk10vLnRlc3QodykgPyBFbnVtSnBTaW1wbGVUb2tlbml6ZXJUeXBlLkhJUkFHQU5BXG5cdFx0XHRcdFx0XHRcdDogRW51bUpwU2ltcGxlVG9rZW5pemVyVHlwZS5LQVRBS0FOQVxuXHRcdFx0XHRcdCkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KVxuXG5cdFx0O1xuXG5cdFx0cmV0dXJuIHJldDtcblx0fVxuXG59XG5cbmV4cG9ydCBjb25zdCBpbml0ID0gSnBTaW1wbGVUb2tlbml6ZXIuaW5pdC5iaW5kKEpwU2ltcGxlVG9rZW5pemVyKSBhcyB0eXBlb2YgSnBTaW1wbGVUb2tlbml6ZXIuaW5pdDtcblxuZXhwb3J0IGRlZmF1bHQgSnBTaW1wbGVUb2tlbml6ZXI7XG5cbiJdfQ==