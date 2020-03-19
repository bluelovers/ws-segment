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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSnBTaW1wbGVUb2tlbml6ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJKcFNpbXBsZVRva2VuaXplci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7OztBQUVILGdDQUF5RDtBQUt6RCxJQUFrQix5QkFZakI7QUFaRCxXQUFrQix5QkFBeUI7SUFFMUM7OztPQUdHO0lBQ0gsaUZBQWMsQ0FBQTtJQUNkOzs7T0FHRztJQUNILGlGQUFjLENBQUE7QUFDZixDQUFDLEVBWmlCLHlCQUF5QixHQUF6QixpQ0FBeUIsS0FBekIsaUNBQXlCLFFBWTFDO0FBRUQ7SUFBQSxNQUFhLGlCQUFrQixTQUFRLHlCQUFtQjtRQUExRDs7WUFJQyxTQUFJLEdBQUcsbUJBQTRCLENBQUM7UUF5RHJDLENBQUM7UUF2REEsS0FBSyxDQUFDLEtBQWMsRUFBRSxHQUFHLElBQUk7WUFFNUIsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDakQsQ0FBQztRQUVTLG1CQUFtQixDQUF1QixJQUFPLEVBQUUsSUFBK0I7WUFFM0YsT0FBTyxLQUFLLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRTtnQkFDN0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSTthQUNqQixFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ1YsQ0FBQztRQUVTLFVBQVUsQ0FBQyxJQUFZO1lBRWhDLHFDQUFxQztZQUVyQyxJQUFJLElBQUksR0FBRyxJQUFJLENBQUM7WUFFaEIsSUFBSSxFQUFFLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM1QixJQUFJLEVBQUUsR0FBRyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRWxDLElBQUksQ0FBQyxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQ2Q7Z0JBQ0MsSUFBSSxFQUFFLElBQUksVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUNwRTtvQkFDQyxPQUFPLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDOzRCQUNoQyxDQUFDLEVBQUUsSUFBSTt5QkFDUCxFQUFFLEVBQUUsQ0FBQyxDQUFDLGtCQUFvQyxDQUFDLGlCQUFtQyxDQUM5RSxDQUFDLENBQUM7aUJBQ0g7Z0JBRUQsT0FBTyxJQUFJLENBQUM7YUFDWjtZQUVELElBQUksR0FBRyxHQUFZLEVBQUUsQ0FBQztZQUV0QixJQUFJO2lCQUNGLEtBQUssQ0FBQyw2RUFBNkUsQ0FBQztpQkFDcEYsT0FBTyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUM7Z0JBRXRCLElBQUksQ0FBQyxLQUFLLEVBQUUsRUFDWjtvQkFDQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQzt3QkFDakMsQ0FBQztxQkFDRCxFQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDbEIsQ0FBQyxpQkFBbUMsQ0FDckMsQ0FBQyxDQUFDO2lCQUNIO1lBQ0YsQ0FBQyxDQUFDLENBRUY7WUFFRCxPQUFPLEdBQUcsQ0FBQztRQUNaLENBQUM7O0lBekRNLHNCQUFJLEdBQUcsbUJBQTRCLENBQUM7SUEyRDVDLHdCQUFDO0tBQUE7QUE3RFksOENBQWlCO0FBK0RqQixRQUFBLElBQUksR0FBRyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFrQyxDQUFDO0FBRXBHLGtCQUFlLGlCQUFpQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDcmVhdGVkIGJ5IHVzZXIgb24gMjAxOC80LzE5LzAxOS5cbiAqL1xuXG5pbXBvcnQgeyBTdWJTTW9kdWxlLCBTdWJTTW9kdWxlVG9rZW5pemVyIH0gZnJvbSAnLi4vbW9kJztcbmltcG9ydCB7IFNlZ21lbnQsIElXb3JkIH0gZnJvbSAnLi4vU2VnbWVudCc7XG5pbXBvcnQgVVN0cmluZyBmcm9tICd1bmktc3RyaW5nJztcbmltcG9ydCB7IElXb3JkRGVidWcsIElXb3JkRGVidWdJbmZvIH0gZnJvbSAnLi4vdXRpbCc7XG5cbmV4cG9ydCBjb25zdCBlbnVtIEVudW1KcFNpbXBsZVRva2VuaXplclR5cGVcbntcblx0LyoqXG5cdCAqIOW5s+S7ruWQjVxuXHQgKiBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9IaXJhZ2FuYVxuXHQgKi9cblx0SElSQUdBTkEgPSAweDEsXG5cdC8qKlxuXHQgKiDniYfku67lkI1cblx0ICogaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvS2F0YWthbmFcblx0ICovXG5cdEtBVEFLQU5BID0gMHgyLFxufVxuXG5leHBvcnQgY2xhc3MgSnBTaW1wbGVUb2tlbml6ZXIgZXh0ZW5kcyBTdWJTTW9kdWxlVG9rZW5pemVyXG57XG5cdHN0YXRpYyBOQU1FID0gJ0pwU2ltcGxlVG9rZW5pemVyJyBhcyBjb25zdDtcblxuXHRuYW1lID0gJ0pwU2ltcGxlVG9rZW5pemVyJyBhcyBjb25zdDtcblxuXHRzcGxpdCh3b3JkczogSVdvcmRbXSwgLi4uYXJndik6IElXb3JkW11cblx0e1xuXHRcdHJldHVybiB0aGlzLl9zcGxpdFVuc2V0KHdvcmRzLCB0aGlzLl9zcGxpdFRleHQpO1xuXHR9XG5cblx0cHJvdGVjdGVkIGNyZWF0ZUpwU2ltcGxlVG9rZW48VCBleHRlbmRzIElXb3JkRGVidWc+KGRhdGE6IFQsIHR5cGU6IEVudW1KcFNpbXBsZVRva2VuaXplclR5cGUpXG5cdHtcblx0XHRyZXR1cm4gc3VwZXIuZGVidWdUb2tlbihkYXRhLCB7XG5cdFx0XHRbdGhpcy5uYW1lXTogdHlwZSxcblx0XHR9LCB0cnVlKTtcblx0fVxuXG5cdHByb3RlY3RlZCBfc3BsaXRUZXh0KHRleHQ6IHN0cmluZyk6IElXb3JkW11cblx0e1xuXHRcdC8vY29uc3QgUE9TVEFHID0gdGhpcy5zZWdtZW50LlBPU1RBRztcblxuXHRcdGxldCBzZWxmID0gdGhpcztcblxuXHRcdGxldCBiMSA9IC9b44GBLeOCk10vLnRlc3QodGV4dCk7XG5cdFx0bGV0IGIyID0gL1vjgqEt44O044O8772xLe++ne++nu+9sF0vLnRlc3QodGV4dCk7XG5cblx0XHRpZiAoIWIxIHx8ICFiMilcblx0XHR7XG5cdFx0XHRpZiAoYjEgJiYgL15b44GBLeOCk10rJC8udGVzdCh0ZXh0KSB8fCBiMiAmJiAvXlvjgqEt44O044O8772xLe++ne++nu+9sF0rJC8udGVzdCh0ZXh0KSlcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIFtzZWxmLmNyZWF0ZUpwU2ltcGxlVG9rZW4oe1xuXHRcdFx0XHRcdHc6IHRleHQsXG5cdFx0XHRcdH0sIGIxID8gRW51bUpwU2ltcGxlVG9rZW5pemVyVHlwZS5ISVJBR0FOQSA6IEVudW1KcFNpbXBsZVRva2VuaXplclR5cGUuS0FUQUtBTkFcblx0XHRcdFx0KV07XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH1cblxuXHRcdGxldCByZXQ6IElXb3JkW10gPSBbXTtcblxuXHRcdHRleHRcblx0XHRcdC5zcGxpdCgvKCg/Olte44KhLeODtOODvO+9sS3vvp3vvp7vvbBdKyk/W+OBgS3jgpNdKyg/PVvjgqEt44O044O8772xLe++ne++nu+9sF0pfCg/Olte44GBLeOCk10rKT9b44KhLeODtOODvO+9sS3vvp3vvp7vvbBdKyg/PVvjgYEt44KTXSkpLylcblx0XHRcdC5mb3JFYWNoKGZ1bmN0aW9uICh3LCBpKVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAodyAhPT0gJycpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXQucHVzaChzZWxmLmNyZWF0ZUpwU2ltcGxlVG9rZW4oe1xuXHRcdFx0XHRcdFx0dyxcblx0XHRcdFx0XHR9LCAvW+OBgS3jgpNdLy50ZXN0KHcpID8gRW51bUpwU2ltcGxlVG9rZW5pemVyVHlwZS5ISVJBR0FOQVxuXHRcdFx0XHRcdFx0XHQ6IEVudW1KcFNpbXBsZVRva2VuaXplclR5cGUuS0FUQUtBTkFcblx0XHRcdFx0XHQpKTtcblx0XHRcdFx0fVxuXHRcdFx0fSlcblxuXHRcdDtcblxuXHRcdHJldHVybiByZXQ7XG5cdH1cblxufVxuXG5leHBvcnQgY29uc3QgaW5pdCA9IEpwU2ltcGxlVG9rZW5pemVyLmluaXQuYmluZChKcFNpbXBsZVRva2VuaXplcikgYXMgdHlwZW9mIEpwU2ltcGxlVG9rZW5pemVyLmluaXQ7XG5cbmV4cG9ydCBkZWZhdWx0IEpwU2ltcGxlVG9rZW5pemVyO1xuXG4iXX0=