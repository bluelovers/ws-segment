'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const mod_1 = require("../mod");
const UString = require("uni-string");
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
        UString
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2luZ2xlVG9rZW5pemVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiU2luZ2xlVG9rZW5pemVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7QUFFYixnQ0FBeUQ7QUFFekQsc0NBQXVDO0FBRXZDOzs7OztHQUtHO0FBQ0gsTUFBYSxlQUFnQixTQUFRLHlCQUFtQjtJQUd2RDs7Ozs7T0FLRztJQUNILEtBQUssQ0FBQyxLQUFjO1FBRW5CLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDO1FBRW5DLElBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQztRQUNiLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUMxQztZQUNDLElBQUksT0FBTyxJQUFJLENBQUMsQ0FBQyxJQUFJLFdBQVcsSUFBSSxJQUFJLENBQUMsQ0FBQyxFQUMxQztnQkFDQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ2Y7aUJBRUQ7Z0JBQ0MsY0FBYztnQkFDZCxHQUFHLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQzNDO1NBQ0Q7UUFDRCxPQUFPLEdBQUcsQ0FBQztJQUNaLENBQUM7SUFFRDs7Ozs7O09BTUc7SUFDSCxXQUFXLENBQUMsSUFBSSxFQUFFLEdBQVk7UUFFN0IsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUM7UUFFbkMsSUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDO1lBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQztRQUV4QixJQUFJLEdBQUcsR0FBRyxDQUFDLEVBQ1g7WUFDQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUN2QjtRQUVELElBQUksR0FBRyxHQUFZLEVBQUUsQ0FBQztRQUV0QixPQUFPO2FBQ0wsS0FBSyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUM7YUFDZixPQUFPLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQztZQUV0QixHQUFHLENBQUMsSUFBSSxDQUFDO2dCQUNSLENBQUM7Z0JBQ0QsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxHQUFHO2FBQ2IsQ0FBQyxDQUFDO1FBQ0osQ0FBQyxDQUFDLENBQ0Y7UUFFRCxPQUFPLEdBQUcsQ0FBQztJQUNaLENBQUM7Q0FDRDtBQTlERCwwQ0E4REM7QUFFWSxRQUFBLElBQUksR0FBRyxlQUFlLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQWdDLENBQUM7QUFFOUYsa0JBQWUsZUFBZSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgeyBTdWJTTW9kdWxlLCBTdWJTTW9kdWxlVG9rZW5pemVyIH0gZnJvbSAnLi4vbW9kJztcbmltcG9ydCB7IFNlZ21lbnQsIElXb3JkIH0gZnJvbSAnLi4vU2VnbWVudCc7XG5pbXBvcnQgVVN0cmluZyA9IHJlcXVpcmUoJ3VuaS1zdHJpbmcnKTtcblxuLyoqXG4gKiDljZXlrZfliIfliIbmqKHlnZdcbiAqIOatpOaooee1hOS4jeWMheWQq+aooee1hOWIl+ihqOWFpyDpnIDopoHmiYvli5XmjIflrppcbiAqXG4gKiBAYXV0aG9yIOiAgembtzxsZWl6b25nbWluQGdtYWlsLmNvbT5cbiAqL1xuZXhwb3J0IGNsYXNzIFNpbmdsZVRva2VuaXplciBleHRlbmRzIFN1YlNNb2R1bGVUb2tlbml6ZXJcbntcblxuXHQvKipcblx0ICog5a+55pyq6K+G5Yir55qE5Y2V6K+N6L+b6KGM5YiG6K+NXG5cdCAqXG5cdCAqIEBwYXJhbSB7YXJyYXl9IHdvcmRzIOWNleivjeaVsOe7hFxuXHQgKiBAcmV0dXJuIHthcnJheX1cblx0ICovXG5cdHNwbGl0KHdvcmRzOiBJV29yZFtdKTogSVdvcmRbXVxuXHR7XG5cdFx0Y29uc3QgUE9TVEFHID0gdGhpcy5zZWdtZW50LlBPU1RBRztcblxuXHRcdGxldCByZXQgPSBbXTtcblx0XHRmb3IgKGxldCBpID0gMCwgd29yZDsgd29yZCA9IHdvcmRzW2ldOyBpKyspXG5cdFx0e1xuXHRcdFx0aWYgKHR5cGVvZiB3b3JkLnAgPT0gJ3VuZGVmaW5lZCcgfHwgd29yZC5wKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXQucHVzaCh3b3JkKTtcblx0XHRcdH1cblx0XHRcdGVsc2Vcblx0XHRcdHtcblx0XHRcdFx0Ly8g5LuF5a+55pyq6K+G5Yir55qE6K+N6L+b6KGM5Yy56YWNXG5cdFx0XHRcdHJldCA9IHJldC5jb25jYXQodGhpcy5zcGxpdFNpbmdsZSh3b3JkLncpKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHJldDtcblx0fVxuXG5cdC8qKlxuXHQgKiDljZXlrZfliIfliIZcblx0ICpcblx0ICogQHBhcmFtIHtzdHJpbmd9IHRleHQg6KaB5YiH5YiG55qE5paH5pysXG5cdCAqIEBwYXJhbSB7aW50fSBjdXIg5byA5aeL5L2N572uXG5cdCAqIEByZXR1cm4ge2FycmF5fVxuXHQgKi9cblx0c3BsaXRTaW5nbGUodGV4dCwgY3VyPzogbnVtYmVyKTogSVdvcmRbXVxuXHR7XG5cdFx0Y29uc3QgUE9TVEFHID0gdGhpcy5zZWdtZW50LlBPU1RBRztcblxuXHRcdGlmIChpc05hTihjdXIpKSBjdXIgPSAwO1xuXG5cdFx0aWYgKGN1ciA+IDApXG5cdFx0e1xuXHRcdFx0dGV4dCA9IHRleHQuc2xpY2UoY3VyKTtcblx0XHR9XG5cblx0XHRsZXQgcmV0OiBJV29yZFtdID0gW107XG5cblx0XHRVU3RyaW5nXG5cdFx0XHQuc3BsaXQodGV4dCwgJycpXG5cdFx0XHQuZm9yRWFjaChmdW5jdGlvbiAodywgaSlcblx0XHRcdHtcblx0XHRcdFx0cmV0LnB1c2goe1xuXHRcdFx0XHRcdHcsXG5cdFx0XHRcdFx0cDogUE9TVEFHLlVOSyxcblx0XHRcdFx0fSk7XG5cdFx0XHR9KVxuXHRcdDtcblxuXHRcdHJldHVybiByZXQ7XG5cdH1cbn1cblxuZXhwb3J0IGNvbnN0IGluaXQgPSBTaW5nbGVUb2tlbml6ZXIuaW5pdC5iaW5kKFNpbmdsZVRva2VuaXplcikgYXMgdHlwZW9mIFNpbmdsZVRva2VuaXplci5pbml0O1xuXG5leHBvcnQgZGVmYXVsdCBTaW5nbGVUb2tlbml6ZXI7XG4iXX0=