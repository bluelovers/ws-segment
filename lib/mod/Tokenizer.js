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
const core_decorators_1 = require("core-decorators");
const mod_1 = require("./mod");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVG9rZW5pemVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiVG9rZW5pemVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7O0dBSUc7QUFFSCxZQUFZLENBQUM7Ozs7Ozs7O0FBRWIscURBQTJDO0FBRTNDLCtCQUEyRjtBQWEzRixJQUFzQixtQkFBbUI7QUFEekMsYUFBYTtBQUNiLE1BQXNCLG1CQUFvQixTQUFRLGdCQUFVO0lBRjVEOztRQUtpQixTQUFJLEdBQUcsV0FBVyxDQUFDO0lBd0ZwQyxDQUFDO0lBcEZPLElBQUksQ0FBQyxPQUFnQixFQUFFLEdBQUcsSUFBSTtRQUVwQyxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO1FBRTdCLE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQUVNLE1BQU0sQ0FBQyxJQUFJLENBQXNELE9BQWdCLEVBQUUsR0FBRyxJQUFJO1FBRWhHLGFBQWE7UUFDYixPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUksT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7SUFDeEMsQ0FBQztJQUVEOzs7T0FHRztJQUNPLFdBQVcsQ0FBdUMsS0FBVSxFQUFFLEVBQWtDO1FBRXpHLHFDQUFxQztRQUVyQyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUVuQixJQUFJLEdBQUcsR0FBRyxFQUFFLENBQUM7UUFDYixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFDMUM7WUFDQyxJQUFJLE9BQU8sSUFBSSxDQUFDLENBQUMsSUFBSSxRQUFRLEVBQzdCO2dCQUNDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDZjtpQkFFRDtnQkFDQyxJQUFJLFNBQVMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUUzQixJQUFJLE9BQU8sU0FBUyxJQUFJLFdBQVcsSUFBSSxTQUFTLEtBQUssSUFBSSxFQUN6RDtvQkFDQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2lCQUNmO3FCQUVEO29CQUNDLEdBQUcsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO2lCQUM1QjthQUNEO1NBQ0Q7UUFFRCxPQUFPLEdBQUcsQ0FBQztJQUNaLENBQUM7SUFFRDs7O09BR0c7SUFDTyxZQUFZLENBQXVDLEtBQVUsRUFBRSxFQUFrQztRQUUxRyxxQ0FBcUM7UUFFckMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFbkIsSUFBSSxHQUFHLEdBQUcsRUFBRSxDQUFDO1FBQ2IsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQzFDO1lBQ0MsSUFBSSxJQUFJLENBQUMsQ0FBQyxFQUNWO2dCQUNDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDZjtpQkFFRDtnQkFDQyx3Q0FBd0M7Z0JBQ3hDLElBQUksU0FBUyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBRTNCLElBQUksT0FBTyxTQUFTLElBQUksV0FBVyxJQUFJLFNBQVMsS0FBSyxJQUFJLEVBQ3pEO29CQUNDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7aUJBQ2Y7cUJBRUQ7b0JBQ0MsR0FBRyxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7aUJBQzVCO2FBRUQ7U0FDRDtRQUVELE9BQU8sR0FBRyxDQUFDO0lBQ1osQ0FBQztDQUNELENBQUE7QUF6RnVCLHdCQUFJLEdBQUcsV0FBVyxDQUFDO0FBRnJCLG1CQUFtQjtJQUZ4QywwQkFBUTtJQUNULGFBQWE7R0FDUyxtQkFBbUIsQ0EyRnhDO0FBM0ZxQixrREFBbUI7QUE2RnpDOztHQUVHO0FBQ0gsTUFBYSxTQUFVLFNBQVEsYUFBTztJQUF0Qzs7UUFFQyxTQUFJLEdBQUcsV0FBVyxDQUFDO0lBc0NwQixDQUFDO0lBcENBOzs7Ozs7T0FNRztJQUNILEtBQUssQ0FBQyxJQUFZLEVBQUUsSUFBcUIsRUFBRSxHQUFHLElBQUk7UUFFakQsSUFBSSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsRUFDbkI7WUFDQyxNQUFNLEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1NBQ3BDO2FBRUQ7WUFDQyxJQUFJLEdBQUcsR0FBWSxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7WUFFakMsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7WUFFbkQ7Ozs7Ozs7Ozs7Ozs7O2NBY0U7U0FDRjtJQUNGLENBQUM7Q0FDRDtBQXhDRCw4QkF3Q0M7QUFFRCxrQkFBZSxTQUFTLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIOWIhuivjeaooeWdl+euoeeQhuWZqFxuICpcbiAqIEBhdXRob3Ig6ICB6Zu3PGxlaXpvbmdtaW5AZ21haWwuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IHsgYXV0b2JpbmQgfSBmcm9tICdjb3JlLWRlY29yYXRvcnMnO1xuaW1wb3J0IHsgU2VnbWVudCwgSVdvcmQgfSBmcm9tICcuLi9TZWdtZW50JztcbmltcG9ydCB7IElNb2R1bGVTdGF0aWMsIElTdWJTTW9kdWxlLCBTTW9kdWxlLCBTdWJTTW9kdWxlLCBJU3ViU01vZHVsZUNyZWF0ZSB9IGZyb20gJy4vbW9kJztcblxuZXhwb3J0IHR5cGUgSVN1YlRva2VuaXplciA9IElTdWJTTW9kdWxlICYge1xuXHR0eXBlOiAndG9rZW5pemVyJyxcblx0c3BsaXQod29yZHM6IElXb3JkW10sIC4uLmFyZ3YpOiBJV29yZFtdLFxufVxuXG5leHBvcnQgdHlwZSBJU3ViVG9rZW5pemVyQ3JlYXRlPFQgZXh0ZW5kcyBTdWJTTW9kdWxlVG9rZW5pemVyLCBSIGV4dGVuZHMgU3ViU01vZHVsZVRva2VuaXplciA9IFN1YlNNb2R1bGVUb2tlbml6ZXI+ID0ge1xuXHQoc2VnbWVudDogU2VnbWVudCwgLi4uYXJndik6IFQgJiBSLFxufTtcblxuQGF1dG9iaW5kXG4vLyBAdHMtaWdub3JlXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgU3ViU01vZHVsZVRva2VuaXplciBleHRlbmRzIFN1YlNNb2R1bGUgaW1wbGVtZW50cyBJU3ViVG9rZW5pemVyXG57XG5cdHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgdHlwZSA9ICd0b2tlbml6ZXInO1xuXHRwdWJsaWMgcmVhZG9ubHkgdHlwZSA9ICd0b2tlbml6ZXInO1xuXG5cdHB1YmxpYyBhYnN0cmFjdCBzcGxpdCh3b3JkczogSVdvcmRbXSwgLi4uYXJndik6IElXb3JkW11cblxuXHRwdWJsaWMgaW5pdChzZWdtZW50OiBTZWdtZW50LCAuLi5hcmd2KVxuXHR7XG5cdFx0c3VwZXIuaW5pdChzZWdtZW50LCAuLi5hcmd2KTtcblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0cHVibGljIHN0YXRpYyBpbml0PFQgZXh0ZW5kcyBTdWJTTW9kdWxlVG9rZW5pemVyID0gU3ViU01vZHVsZVRva2VuaXplcj4oc2VnbWVudDogU2VnbWVudCwgLi4uYXJndik6IFRcblx0e1xuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRyZXR1cm4gc3VwZXIuaW5pdDxUPihzZWdtZW50LCAuLi5hcmd2KTtcblx0fVxuXG5cdC8qKlxuXHQgKiDku4Xlr7nmnKror4bliKvnmoTor43ov5vooYzljLnphY1cblx0ICog5LiN5YyF5ZCrIHAg54K6IDBcblx0ICovXG5cdHByb3RlY3RlZCBfc3BsaXRVbnNldDxUIGV4dGVuZHMgSVdvcmQsIFUgZXh0ZW5kcyBJV29yZCA9IFQ+KHdvcmRzOiBUW10sIGZuOiAodGV4dDogc3RyaW5nLCAuLi5hcmd2KSA9PiBVW10pOiBVW11cblx0e1xuXHRcdC8vY29uc3QgUE9TVEFHID0gdGhpcy5zZWdtZW50LlBPU1RBRztcblxuXHRcdGZuID0gZm4uYmluZCh0aGlzKTtcblxuXHRcdGxldCByZXQgPSBbXTtcblx0XHRmb3IgKGxldCBpID0gMCwgd29yZDsgd29yZCA9IHdvcmRzW2ldOyBpKyspXG5cdFx0e1xuXHRcdFx0aWYgKHR5cGVvZiB3b3JkLnAgPT0gJ251bWJlcicpXG5cdFx0XHR7XG5cdFx0XHRcdHJldC5wdXNoKHdvcmQpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZVxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgd29yZHNfbmV3ID0gZm4od29yZC53KTtcblxuXHRcdFx0XHRpZiAodHlwZW9mIHdvcmRzX25ldyA9PSAndW5kZWZpbmVkJyB8fCB3b3Jkc19uZXcgPT09IG51bGwpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXQucHVzaCh3b3JkKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXQgPSByZXQuY29uY2F0KHdvcmRzX25ldyk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gcmV0O1xuXHR9XG5cblx0LyoqXG5cdCAqIOS7heWvueacquivhuWIq+eahOivjei/m+ihjOWMuemFjVxuXHQgKiDljIXlkKvlt7LlrZjlnKgg5L2GIHAg54K6IDBcblx0ICovXG5cdHByb3RlY3RlZCBfc3BsaXRVbmtub3c8VCBleHRlbmRzIElXb3JkLCBVIGV4dGVuZHMgSVdvcmQgPSBUPih3b3JkczogVFtdLCBmbjogKHRleHQ6IHN0cmluZywgLi4uYXJndikgPT4gVVtdKTogVVtdXG5cdHtcblx0XHQvL2NvbnN0IFBPU1RBRyA9IHRoaXMuc2VnbWVudC5QT1NUQUc7XG5cblx0XHRmbiA9IGZuLmJpbmQodGhpcyk7XG5cblx0XHRsZXQgcmV0ID0gW107XG5cdFx0Zm9yIChsZXQgaSA9IDAsIHdvcmQ7IHdvcmQgPSB3b3Jkc1tpXTsgaSsrKVxuXHRcdHtcblx0XHRcdGlmICh3b3JkLnApXG5cdFx0XHR7XG5cdFx0XHRcdHJldC5wdXNoKHdvcmQpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZVxuXHRcdFx0e1xuXHRcdFx0XHQvL2xldCB3b3Jkc19uZXcgPSBmbi5jYWxsKHRoaXMsIHdvcmQudyk7XG5cdFx0XHRcdGxldCB3b3Jkc19uZXcgPSBmbih3b3JkLncpO1xuXG5cdFx0XHRcdGlmICh0eXBlb2Ygd29yZHNfbmV3ID09ICd1bmRlZmluZWQnIHx8IHdvcmRzX25ldyA9PT0gbnVsbClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHJldC5wdXNoKHdvcmQpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHJldCA9IHJldC5jb25jYXQod29yZHNfbmV3KTtcblx0XHRcdFx0fVxuXG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHJldDtcblx0fVxufVxuXG4vKipcbiAqIOWIhuivjeaooeWdl+euoeeQhuWZqFxuICovXG5leHBvcnQgY2xhc3MgVG9rZW5pemVyIGV4dGVuZHMgU01vZHVsZVxue1xuXHR0eXBlID0gJ3Rva2VuaXplcic7XG5cblx0LyoqXG5cdCAqIOWvueS4gOauteaWh+acrOi/m+ihjOWIhuivjVxuXHQgKlxuXHQgKiBAcGFyYW0ge3N0cmluZ30gdGV4dCDmlofmnKxcblx0ICogQHBhcmFtIHthcnJheX0gbW9kdWxlcyDliIbor43mqKHlnZfmlbDnu4Rcblx0ICogQHJldHVybiB7YXJyYXl9XG5cdCAqL1xuXHRzcGxpdCh0ZXh0OiBzdHJpbmcsIG1vZHM6IElTdWJUb2tlbml6ZXJbXSwgLi4uYXJndilcblx0e1xuXHRcdGlmIChtb2RzLmxlbmd0aCA8IDEpXG5cdFx0e1xuXHRcdFx0dGhyb3cgRXJyb3IoJ05vIHRva2VuaXplciBtb2R1bGUhJyk7XG5cdFx0fVxuXHRcdGVsc2Vcblx0XHR7XG5cdFx0XHRsZXQgcmV0OiBJV29yZFtdID0gW3sgdzogdGV4dCB9XTtcblxuXHRcdFx0cmV0dXJuIHRoaXMuX2RvTWV0aG9kKCdzcGxpdCcsIHJldCwgbW9kcywgLi4uYXJndik7XG5cblx0XHRcdC8qXG5cdFx0XHQvLyDmjInpobrluo/liIbliKvosIPnlKjlkITkuKptb2R1bGXmnaXov5vooYzliIbor40g77yaIOWQhOS4qm1vZHVsZeS7heWvueayoeacieivhuWIq+exu+Wei+eahOWNleivjei/m+ihjOWIhuivjVxuXHRcdFx0bW9kcy5mb3JFYWNoKGZ1bmN0aW9uIChtb2QpXG5cdFx0XHR7XG5cdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0aWYgKHR5cGVvZiBtb2QuX2NhY2hlID09ICdmdW5jdGlvbicpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0bW9kLl9jYWNoZSgpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0ID0gbW9kLnNwbGl0KHJldCwgLi4uYXJndik7XG5cdFx0XHR9KTtcblx0XHRcdHJldHVybiByZXQ7XG5cdFx0XHQqL1xuXHRcdH1cblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBUb2tlbml6ZXI7XG4iXX0=