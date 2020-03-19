/**
 * 分词模块管理器
 *
 * @author 老雷<leizongmin@gmail.com>
 */
'use strict';
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tokenizer = exports.SubSModuleTokenizer = void 0;
const core_decorators_1 = require("core-decorators");
const mod_1 = require("./mod");
let SubSModuleTokenizer = /** @class */ (() => {
    let SubSModuleTokenizer = 
    // @ts-ignore
    class SubSModuleTokenizer extends mod_1.SubSModule {
        constructor() {
            super(...arguments);
            this.type = 'tokenizer';
        }
        init(segment, ...argv) {
            super.init(segment, ...argv);
            return this;
        }
        static init(segment, ...argv) {
            // @ts-ignore
            return super.init(segment, ...argv);
        }
        /**
         * 仅对未识别的词进行匹配
         * 不包含 p 為 0
         */
        _splitUnset(words, fn) {
            //const POSTAG = this.segment.POSTAG;
            fn = fn.bind(this);
            let ret = [];
            for (let i = 0, word; word = words[i]; i++) {
                if (typeof word.p == 'number') {
                    ret.push(word);
                }
                else {
                    let words_new = fn(word.w);
                    if (words_new == null) {
                        ret.push(word);
                    }
                    else {
                        ret = ret.concat(words_new);
                    }
                }
            }
            return ret;
        }
        /**
         * 仅对未识别的词进行匹配
         * 包含已存在 但 p 為 0
         */
        _splitUnknow(words, fn) {
            //const POSTAG = this.segment.POSTAG;
            fn = fn.bind(this);
            let ret = [];
            for (let i = 0, word; word = words[i]; i++) {
                if (word.p) {
                    ret.push(word);
                }
                else {
                    //let words_new = fn.call(this, word.w);
                    let words_new = fn(word.w);
                    if (typeof words_new == 'undefined' || words_new === null) {
                        ret.push(word);
                    }
                    else {
                        ret = ret.concat(words_new);
                    }
                }
            }
            return ret;
        }
    };
    SubSModuleTokenizer.type = 'tokenizer';
    SubSModuleTokenizer = __decorate([
        core_decorators_1.autobind
        // @ts-ignore
    ], SubSModuleTokenizer);
    return SubSModuleTokenizer;
})();
exports.SubSModuleTokenizer = SubSModuleTokenizer;
/**
 * 分词模块管理器
 */
class Tokenizer extends mod_1.SModule {
    constructor() {
        super(...arguments);
        this.type = 'tokenizer';
    }
    /**
     * 对一段文本进行分词
     *
     * @param {string} text 文本
     * @param {array} modules 分词模块数组
     * @return {array}
     */
    split(text, mods, ...argv) {
        if (mods.length < 1) {
            throw Error('No tokenizer module!');
        }
        else {
            let ret = [{ w: text }];
            return this._doMethod('split', ret, mods, ...argv);
            /*
            // 按顺序分别调用各个module来进行分词 ： 各个module仅对没有识别类型的单词进行分词
            mods.forEach(function (mod)
            {
                // @ts-ignore
                if (typeof mod._cache == 'function')
                {
                    // @ts-ignore
                    mod._cache();
                }

                ret = mod.split(ret, ...argv);
            });
            return ret;
            */
        }
    }
}
exports.Tokenizer = Tokenizer;
exports.default = Tokenizer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVG9rZW5pemVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiVG9rZW5pemVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7O0dBSUc7QUFFSCxZQUFZLENBQUM7Ozs7Ozs7OztBQUViLHFEQUEyQztBQUUzQywrQkFBMkY7QUFjM0Y7SUFBQSxJQUFzQixtQkFBbUI7SUFEekMsYUFBYTtJQUNiLE1BQXNCLG1CQUFvQixTQUFRLGdCQUFVO1FBQTVEOztZQUdpQixTQUFJLEdBQUcsV0FBVyxDQUFDO1FBd0ZwQyxDQUFDO1FBcEZPLElBQUksQ0FBQyxPQUFnQixFQUFFLEdBQUcsSUFBSTtZQUVwQyxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO1lBRTdCLE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUVNLE1BQU0sQ0FBQyxJQUFJLENBQXNELE9BQWdCLEVBQUUsR0FBRyxJQUFJO1lBRWhHLGFBQWE7WUFDYixPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUksT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDeEMsQ0FBQztRQUVEOzs7V0FHRztRQUNPLFdBQVcsQ0FBdUMsS0FBVSxFQUFFLEVBQWtDO1lBRXpHLHFDQUFxQztZQUVyQyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUVuQixJQUFJLEdBQUcsR0FBRyxFQUFFLENBQUM7WUFDYixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFDMUM7Z0JBQ0MsSUFBSSxPQUFPLElBQUksQ0FBQyxDQUFDLElBQUksUUFBUSxFQUM3QjtvQkFDQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2lCQUNmO3FCQUVEO29CQUNDLElBQUksU0FBUyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBRTNCLElBQUksU0FBUyxJQUFJLElBQUksRUFDckI7d0JBQ0MsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDZjt5QkFFRDt3QkFDQyxHQUFHLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztxQkFDNUI7aUJBQ0Q7YUFDRDtZQUVELE9BQU8sR0FBRyxDQUFDO1FBQ1osQ0FBQztRQUVEOzs7V0FHRztRQUNPLFlBQVksQ0FBdUMsS0FBVSxFQUFFLEVBQWtDO1lBRTFHLHFDQUFxQztZQUVyQyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUVuQixJQUFJLEdBQUcsR0FBRyxFQUFFLENBQUM7WUFDYixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFDMUM7Z0JBQ0MsSUFBSSxJQUFJLENBQUMsQ0FBQyxFQUNWO29CQUNDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7aUJBQ2Y7cUJBRUQ7b0JBQ0Msd0NBQXdDO29CQUN4QyxJQUFJLFNBQVMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUUzQixJQUFJLE9BQU8sU0FBUyxJQUFJLFdBQVcsSUFBSSxTQUFTLEtBQUssSUFBSSxFQUN6RDt3QkFDQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO3FCQUNmO3lCQUVEO3dCQUNDLEdBQUcsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO3FCQUM1QjtpQkFFRDthQUNEO1lBRUQsT0FBTyxHQUFHLENBQUM7UUFDWixDQUFDO0tBQ0QsQ0FBQTtJQXpGdUIsd0JBQUksR0FBRyxXQUFXLENBQUM7SUFGckIsbUJBQW1CO1FBRnhDLDBCQUFRO1FBQ1QsYUFBYTtPQUNTLG1CQUFtQixDQTJGeEM7SUFBRCwwQkFBQztLQUFBO0FBM0ZxQixrREFBbUI7QUE2RnpDOztHQUVHO0FBQ0gsTUFBYSxTQUFVLFNBQVEsYUFBTztJQUF0Qzs7UUFFQyxTQUFJLEdBQUcsV0FBVyxDQUFDO0lBc0NwQixDQUFDO0lBcENBOzs7Ozs7T0FNRztJQUNILEtBQUssQ0FBQyxJQUFZLEVBQUUsSUFBcUIsRUFBRSxHQUFHLElBQUk7UUFFakQsSUFBSSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsRUFDbkI7WUFDQyxNQUFNLEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1NBQ3BDO2FBRUQ7WUFDQyxJQUFJLEdBQUcsR0FBWSxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7WUFFakMsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7WUFFbkQ7Ozs7Ozs7Ozs7Ozs7O2NBY0U7U0FDRjtJQUNGLENBQUM7Q0FDRDtBQXhDRCw4QkF3Q0M7QUFFRCxrQkFBZSxTQUFTLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIOWIhuivjeaooeWdl+euoeeQhuWZqFxuICpcbiAqIEBhdXRob3Ig6ICB6Zu3PGxlaXpvbmdtaW5AZ21haWwuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IHsgYXV0b2JpbmQgfSBmcm9tICdjb3JlLWRlY29yYXRvcnMnO1xuaW1wb3J0IHsgU2VnbWVudCwgSVdvcmQgfSBmcm9tICcuLi9TZWdtZW50JztcbmltcG9ydCB7IElNb2R1bGVTdGF0aWMsIElTdWJTTW9kdWxlLCBTTW9kdWxlLCBTdWJTTW9kdWxlLCBJU3ViU01vZHVsZUNyZWF0ZSB9IGZyb20gJy4vbW9kJztcblxuZXhwb3J0IHR5cGUgSVN1YlRva2VuaXplciA9IElTdWJTTW9kdWxlICYge1xuXHR0eXBlOiAndG9rZW5pemVyJyxcblx0c3BsaXQod29yZHM6IElXb3JkW10sIC4uLmFyZ3YpOiBJV29yZFtdLFxufVxuXG5leHBvcnQgdHlwZSBJU3ViVG9rZW5pemVyQ3JlYXRlPFQgZXh0ZW5kcyBTdWJTTW9kdWxlVG9rZW5pemVyLCBSIGV4dGVuZHMgU3ViU01vZHVsZVRva2VuaXplciA9IFN1YlNNb2R1bGVUb2tlbml6ZXI+ID0ge1xuXHQoLi4uYXJndjogUGFyYW1ldGVyczxUW1wiaW5pdFwiXT4pOiBUICYgUixcblx0KHNlZ21lbnQ6IFNlZ21lbnQsIC4uLmFyZ3YpOiBUICYgUixcbn07XG5cbkBhdXRvYmluZFxuLy8gQHRzLWlnbm9yZVxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFN1YlNNb2R1bGVUb2tlbml6ZXIgZXh0ZW5kcyBTdWJTTW9kdWxlIGltcGxlbWVudHMgSVN1YlRva2VuaXplclxue1xuXHRwdWJsaWMgc3RhdGljIHJlYWRvbmx5IHR5cGUgPSAndG9rZW5pemVyJztcblx0cHVibGljIHJlYWRvbmx5IHR5cGUgPSAndG9rZW5pemVyJztcblxuXHRwdWJsaWMgYWJzdHJhY3Qgc3BsaXQod29yZHM6IElXb3JkW10sIC4uLmFyZ3YpOiBJV29yZFtdXG5cblx0cHVibGljIGluaXQoc2VnbWVudDogU2VnbWVudCwgLi4uYXJndilcblx0e1xuXHRcdHN1cGVyLmluaXQoc2VnbWVudCwgLi4uYXJndik7XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdHB1YmxpYyBzdGF0aWMgaW5pdDxUIGV4dGVuZHMgU3ViU01vZHVsZVRva2VuaXplciA9IFN1YlNNb2R1bGVUb2tlbml6ZXI+KHNlZ21lbnQ6IFNlZ21lbnQsIC4uLmFyZ3YpOiBUXG5cdHtcblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0cmV0dXJuIHN1cGVyLmluaXQ8VD4oc2VnbWVudCwgLi4uYXJndik7XG5cdH1cblxuXHQvKipcblx0ICog5LuF5a+55pyq6K+G5Yir55qE6K+N6L+b6KGM5Yy56YWNXG5cdCAqIOS4jeWMheWQqyBwIOeCuiAwXG5cdCAqL1xuXHRwcm90ZWN0ZWQgX3NwbGl0VW5zZXQ8VCBleHRlbmRzIElXb3JkLCBVIGV4dGVuZHMgSVdvcmQgPSBUPih3b3JkczogVFtdLCBmbjogKHRleHQ6IHN0cmluZywgLi4uYXJndikgPT4gVVtdKTogVVtdXG5cdHtcblx0XHQvL2NvbnN0IFBPU1RBRyA9IHRoaXMuc2VnbWVudC5QT1NUQUc7XG5cblx0XHRmbiA9IGZuLmJpbmQodGhpcyk7XG5cblx0XHRsZXQgcmV0ID0gW107XG5cdFx0Zm9yIChsZXQgaSA9IDAsIHdvcmQ7IHdvcmQgPSB3b3Jkc1tpXTsgaSsrKVxuXHRcdHtcblx0XHRcdGlmICh0eXBlb2Ygd29yZC5wID09ICdudW1iZXInKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXQucHVzaCh3b3JkKTtcblx0XHRcdH1cblx0XHRcdGVsc2Vcblx0XHRcdHtcblx0XHRcdFx0bGV0IHdvcmRzX25ldyA9IGZuKHdvcmQudyk7XG5cblx0XHRcdFx0aWYgKHdvcmRzX25ldyA9PSBudWxsKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cmV0LnB1c2god29yZCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cmV0ID0gcmV0LmNvbmNhdCh3b3Jkc19uZXcpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHJldDtcblx0fVxuXG5cdC8qKlxuXHQgKiDku4Xlr7nmnKror4bliKvnmoTor43ov5vooYzljLnphY1cblx0ICog5YyF5ZCr5bey5a2Y5ZyoIOS9hiBwIOeCuiAwXG5cdCAqL1xuXHRwcm90ZWN0ZWQgX3NwbGl0VW5rbm93PFQgZXh0ZW5kcyBJV29yZCwgVSBleHRlbmRzIElXb3JkID0gVD4od29yZHM6IFRbXSwgZm46ICh0ZXh0OiBzdHJpbmcsIC4uLmFyZ3YpID0+IFVbXSk6IFVbXVxuXHR7XG5cdFx0Ly9jb25zdCBQT1NUQUcgPSB0aGlzLnNlZ21lbnQuUE9TVEFHO1xuXG5cdFx0Zm4gPSBmbi5iaW5kKHRoaXMpO1xuXG5cdFx0bGV0IHJldCA9IFtdO1xuXHRcdGZvciAobGV0IGkgPSAwLCB3b3JkOyB3b3JkID0gd29yZHNbaV07IGkrKylcblx0XHR7XG5cdFx0XHRpZiAod29yZC5wKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXQucHVzaCh3b3JkKTtcblx0XHRcdH1cblx0XHRcdGVsc2Vcblx0XHRcdHtcblx0XHRcdFx0Ly9sZXQgd29yZHNfbmV3ID0gZm4uY2FsbCh0aGlzLCB3b3JkLncpO1xuXHRcdFx0XHRsZXQgd29yZHNfbmV3ID0gZm4od29yZC53KTtcblxuXHRcdFx0XHRpZiAodHlwZW9mIHdvcmRzX25ldyA9PSAndW5kZWZpbmVkJyB8fCB3b3Jkc19uZXcgPT09IG51bGwpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXQucHVzaCh3b3JkKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXQgPSByZXQuY29uY2F0KHdvcmRzX25ldyk7XG5cdFx0XHRcdH1cblxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiByZXQ7XG5cdH1cbn1cblxuLyoqXG4gKiDliIbor43mqKHlnZfnrqHnkIblmahcbiAqL1xuZXhwb3J0IGNsYXNzIFRva2VuaXplciBleHRlbmRzIFNNb2R1bGVcbntcblx0dHlwZSA9ICd0b2tlbml6ZXInO1xuXG5cdC8qKlxuXHQgKiDlr7nkuIDmrrXmlofmnKzov5vooYzliIbor41cblx0ICpcblx0ICogQHBhcmFtIHtzdHJpbmd9IHRleHQg5paH5pysXG5cdCAqIEBwYXJhbSB7YXJyYXl9IG1vZHVsZXMg5YiG6K+N5qih5Z2X5pWw57uEXG5cdCAqIEByZXR1cm4ge2FycmF5fVxuXHQgKi9cblx0c3BsaXQodGV4dDogc3RyaW5nLCBtb2RzOiBJU3ViVG9rZW5pemVyW10sIC4uLmFyZ3YpXG5cdHtcblx0XHRpZiAobW9kcy5sZW5ndGggPCAxKVxuXHRcdHtcblx0XHRcdHRocm93IEVycm9yKCdObyB0b2tlbml6ZXIgbW9kdWxlIScpO1xuXHRcdH1cblx0XHRlbHNlXG5cdFx0e1xuXHRcdFx0bGV0IHJldDogSVdvcmRbXSA9IFt7IHc6IHRleHQgfV07XG5cblx0XHRcdHJldHVybiB0aGlzLl9kb01ldGhvZCgnc3BsaXQnLCByZXQsIG1vZHMsIC4uLmFyZ3YpO1xuXG5cdFx0XHQvKlxuXHRcdFx0Ly8g5oyJ6aG65bqP5YiG5Yir6LCD55So5ZCE5LiqbW9kdWxl5p2l6L+b6KGM5YiG6K+NIO+8miDlkITkuKptb2R1bGXku4Xlr7nmsqHmnInor4bliKvnsbvlnovnmoTljZXor43ov5vooYzliIbor41cblx0XHRcdG1vZHMuZm9yRWFjaChmdW5jdGlvbiAobW9kKVxuXHRcdFx0e1xuXHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdGlmICh0eXBlb2YgbW9kLl9jYWNoZSA9PSAnZnVuY3Rpb24nKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRcdG1vZC5fY2FjaGUoKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldCA9IG1vZC5zcGxpdChyZXQsIC4uLmFyZ3YpO1xuXHRcdFx0fSk7XG5cdFx0XHRyZXR1cm4gcmV0O1xuXHRcdFx0Ki9cblx0XHR9XG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgVG9rZW5pemVyO1xuIl19