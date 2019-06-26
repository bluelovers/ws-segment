'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const mod_1 = require("../mod");
const uni_string_1 = require("uni-string");
/**
 * 单字切分模块
 * 此模組不包含模組列表內 需要手動指定
 *
 * @author 老雷<leizongmin@gmail.com>
 */
class SingleTokenizer extends mod_1.SubSModuleTokenizer {
    /**
     * 对未识别的单词进行分词
     *
     * @param {array} words 单词数组
     * @return {array}
     */
    split(words) {
        const POSTAG = this.segment.POSTAG;
        let ret = [];
        for (let i = 0, word; word = words[i]; i++) {
            if (typeof word.p == 'undefined' || word.p) {
                ret.push(word);
            }
            else {
                // 仅对未识别的词进行匹配
                ret = ret.concat(this.splitSingle(word.w));
            }
        }
        return ret;
    }
    /**
     * 单字切分
     *
     * @param {string} text 要切分的文本
     * @param {int} cur 开始位置
     * @return {array}
     */
    splitSingle(text, cur) {
        const POSTAG = this.segment.POSTAG;
        if (isNaN(cur))
            cur = 0;
        if (cur > 0) {
            text = text.slice(cur);
        }
        let ret = [];
        uni_string_1.default
            .split(text, '')
            .forEach(function (w, i) {
            ret.push({
                w,
                p: POSTAG.UNK,
            });
        });
        return ret;
    }
}
exports.SingleTokenizer = SingleTokenizer;
exports.init = SingleTokenizer.init.bind(SingleTokenizer);
exports.default = SingleTokenizer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2luZ2xlVG9rZW5pemVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiU2luZ2xlVG9rZW5pemVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7QUFFYixnQ0FBeUQ7QUFFekQsMkNBQWlDO0FBRWpDOzs7OztHQUtHO0FBQ0gsTUFBYSxlQUFnQixTQUFRLHlCQUFtQjtJQUd2RDs7Ozs7T0FLRztJQUNILEtBQUssQ0FBQyxLQUFjO1FBRW5CLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDO1FBRW5DLElBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQztRQUNiLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUMxQztZQUNDLElBQUksT0FBTyxJQUFJLENBQUMsQ0FBQyxJQUFJLFdBQVcsSUFBSSxJQUFJLENBQUMsQ0FBQyxFQUMxQztnQkFDQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ2Y7aUJBRUQ7Z0JBQ0MsY0FBYztnQkFDZCxHQUFHLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQzNDO1NBQ0Q7UUFDRCxPQUFPLEdBQUcsQ0FBQztJQUNaLENBQUM7SUFFRDs7Ozs7O09BTUc7SUFDSCxXQUFXLENBQUMsSUFBSSxFQUFFLEdBQVk7UUFFN0IsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUM7UUFFbkMsSUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDO1lBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQztRQUV4QixJQUFJLEdBQUcsR0FBRyxDQUFDLEVBQ1g7WUFDQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUN2QjtRQUVELElBQUksR0FBRyxHQUFZLEVBQUUsQ0FBQztRQUV0QixvQkFBTzthQUNMLEtBQUssQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDO2FBQ2YsT0FBTyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUM7WUFFdEIsR0FBRyxDQUFDLElBQUksQ0FBQztnQkFDUixDQUFDO2dCQUNELENBQUMsRUFBRSxNQUFNLENBQUMsR0FBRzthQUNiLENBQUMsQ0FBQztRQUNKLENBQUMsQ0FBQyxDQUNGO1FBRUQsT0FBTyxHQUFHLENBQUM7SUFDWixDQUFDO0NBQ0Q7QUE5REQsMENBOERDO0FBRVksUUFBQSxJQUFJLEdBQUcsZUFBZSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFnQyxDQUFDO0FBRTlGLGtCQUFlLGVBQWUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IHsgU3ViU01vZHVsZSwgU3ViU01vZHVsZVRva2VuaXplciB9IGZyb20gJy4uL21vZCc7XG5pbXBvcnQgeyBTZWdtZW50LCBJV29yZCB9IGZyb20gJy4uL1NlZ21lbnQnO1xuaW1wb3J0IFVTdHJpbmcgZnJvbSAndW5pLXN0cmluZyc7XG5cbi8qKlxuICog5Y2V5a2X5YiH5YiG5qih5Z2XXG4gKiDmraTmqKHntYTkuI3ljIXlkKvmqKHntYTliJfooajlhacg6ZyA6KaB5omL5YuV5oyH5a6aXG4gKlxuICogQGF1dGhvciDogIHpm7c8bGVpem9uZ21pbkBnbWFpbC5jb20+XG4gKi9cbmV4cG9ydCBjbGFzcyBTaW5nbGVUb2tlbml6ZXIgZXh0ZW5kcyBTdWJTTW9kdWxlVG9rZW5pemVyXG57XG5cblx0LyoqXG5cdCAqIOWvueacquivhuWIq+eahOWNleivjei/m+ihjOWIhuivjVxuXHQgKlxuXHQgKiBAcGFyYW0ge2FycmF5fSB3b3JkcyDljZXor43mlbDnu4Rcblx0ICogQHJldHVybiB7YXJyYXl9XG5cdCAqL1xuXHRzcGxpdCh3b3JkczogSVdvcmRbXSk6IElXb3JkW11cblx0e1xuXHRcdGNvbnN0IFBPU1RBRyA9IHRoaXMuc2VnbWVudC5QT1NUQUc7XG5cblx0XHRsZXQgcmV0ID0gW107XG5cdFx0Zm9yIChsZXQgaSA9IDAsIHdvcmQ7IHdvcmQgPSB3b3Jkc1tpXTsgaSsrKVxuXHRcdHtcblx0XHRcdGlmICh0eXBlb2Ygd29yZC5wID09ICd1bmRlZmluZWQnIHx8IHdvcmQucClcblx0XHRcdHtcblx0XHRcdFx0cmV0LnB1c2god29yZCk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlXG5cdFx0XHR7XG5cdFx0XHRcdC8vIOS7heWvueacquivhuWIq+eahOivjei/m+ihjOWMuemFjVxuXHRcdFx0XHRyZXQgPSByZXQuY29uY2F0KHRoaXMuc3BsaXRTaW5nbGUod29yZC53KSk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiByZXQ7XG5cdH1cblxuXHQvKipcblx0ICog5Y2V5a2X5YiH5YiGXG5cdCAqXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0IOimgeWIh+WIhueahOaWh+acrFxuXHQgKiBAcGFyYW0ge2ludH0gY3VyIOW8gOWni+S9jee9rlxuXHQgKiBAcmV0dXJuIHthcnJheX1cblx0ICovXG5cdHNwbGl0U2luZ2xlKHRleHQsIGN1cj86IG51bWJlcik6IElXb3JkW11cblx0e1xuXHRcdGNvbnN0IFBPU1RBRyA9IHRoaXMuc2VnbWVudC5QT1NUQUc7XG5cblx0XHRpZiAoaXNOYU4oY3VyKSkgY3VyID0gMDtcblxuXHRcdGlmIChjdXIgPiAwKVxuXHRcdHtcblx0XHRcdHRleHQgPSB0ZXh0LnNsaWNlKGN1cik7XG5cdFx0fVxuXG5cdFx0bGV0IHJldDogSVdvcmRbXSA9IFtdO1xuXG5cdFx0VVN0cmluZ1xuXHRcdFx0LnNwbGl0KHRleHQsICcnKVxuXHRcdFx0LmZvckVhY2goZnVuY3Rpb24gKHcsIGkpXG5cdFx0XHR7XG5cdFx0XHRcdHJldC5wdXNoKHtcblx0XHRcdFx0XHR3LFxuXHRcdFx0XHRcdHA6IFBPU1RBRy5VTkssXG5cdFx0XHRcdH0pO1xuXHRcdFx0fSlcblx0XHQ7XG5cblx0XHRyZXR1cm4gcmV0O1xuXHR9XG59XG5cbmV4cG9ydCBjb25zdCBpbml0ID0gU2luZ2xlVG9rZW5pemVyLmluaXQuYmluZChTaW5nbGVUb2tlbml6ZXIpIGFzIHR5cGVvZiBTaW5nbGVUb2tlbml6ZXIuaW5pdDtcblxuZXhwb3J0IGRlZmF1bHQgU2luZ2xlVG9rZW5pemVyO1xuIl19