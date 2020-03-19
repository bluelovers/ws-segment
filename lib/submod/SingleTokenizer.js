'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = exports.SingleTokenizer = void 0;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2luZ2xlVG9rZW5pemVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiU2luZ2xlVG9rZW5pemVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7O0FBRWIsZ0NBQXlEO0FBRXpELDJDQUFpQztBQUVqQzs7Ozs7R0FLRztBQUNILE1BQWEsZUFBZ0IsU0FBUSx5QkFBbUI7SUFHdkQ7Ozs7O09BS0c7SUFDSCxLQUFLLENBQUMsS0FBYztRQUVuQixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQztRQUVuQyxJQUFJLEdBQUcsR0FBRyxFQUFFLENBQUM7UUFDYixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFDMUM7WUFDQyxJQUFJLE9BQU8sSUFBSSxDQUFDLENBQUMsSUFBSSxXQUFXLElBQUksSUFBSSxDQUFDLENBQUMsRUFDMUM7Z0JBQ0MsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUNmO2lCQUVEO2dCQUNDLGNBQWM7Z0JBQ2QsR0FBRyxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUMzQztTQUNEO1FBQ0QsT0FBTyxHQUFHLENBQUM7SUFDWixDQUFDO0lBRUQ7Ozs7OztPQU1HO0lBQ0gsV0FBVyxDQUFDLElBQUksRUFBRSxHQUFZO1FBRTdCLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDO1FBRW5DLElBQUksS0FBSyxDQUFDLEdBQUcsQ0FBQztZQUFFLEdBQUcsR0FBRyxDQUFDLENBQUM7UUFFeEIsSUFBSSxHQUFHLEdBQUcsQ0FBQyxFQUNYO1lBQ0MsSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDdkI7UUFFRCxJQUFJLEdBQUcsR0FBWSxFQUFFLENBQUM7UUFFdEIsb0JBQU87YUFDTCxLQUFLLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQzthQUNmLE9BQU8sQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDO1lBRXRCLEdBQUcsQ0FBQyxJQUFJLENBQUM7Z0JBQ1IsQ0FBQztnQkFDRCxDQUFDLEVBQUUsTUFBTSxDQUFDLEdBQUc7YUFDYixDQUFDLENBQUM7UUFDSixDQUFDLENBQUMsQ0FDRjtRQUVELE9BQU8sR0FBRyxDQUFDO0lBQ1osQ0FBQztDQUNEO0FBOURELDBDQThEQztBQUVZLFFBQUEsSUFBSSxHQUFHLGVBQWUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBZ0MsQ0FBQztBQUU5RixrQkFBZSxlQUFlLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbmltcG9ydCB7IFN1YlNNb2R1bGUsIFN1YlNNb2R1bGVUb2tlbml6ZXIgfSBmcm9tICcuLi9tb2QnO1xuaW1wb3J0IHsgU2VnbWVudCwgSVdvcmQgfSBmcm9tICcuLi9TZWdtZW50JztcbmltcG9ydCBVU3RyaW5nIGZyb20gJ3VuaS1zdHJpbmcnO1xuXG4vKipcbiAqIOWNleWtl+WIh+WIhuaooeWdl1xuICog5q2k5qih57WE5LiN5YyF5ZCr5qih57WE5YiX6KGo5YWnIOmcgOimgeaJi+WLleaMh+WumlxuICpcbiAqIEBhdXRob3Ig6ICB6Zu3PGxlaXpvbmdtaW5AZ21haWwuY29tPlxuICovXG5leHBvcnQgY2xhc3MgU2luZ2xlVG9rZW5pemVyIGV4dGVuZHMgU3ViU01vZHVsZVRva2VuaXplclxue1xuXG5cdC8qKlxuXHQgKiDlr7nmnKror4bliKvnmoTljZXor43ov5vooYzliIbor41cblx0ICpcblx0ICogQHBhcmFtIHthcnJheX0gd29yZHMg5Y2V6K+N5pWw57uEXG5cdCAqIEByZXR1cm4ge2FycmF5fVxuXHQgKi9cblx0c3BsaXQod29yZHM6IElXb3JkW10pOiBJV29yZFtdXG5cdHtcblx0XHRjb25zdCBQT1NUQUcgPSB0aGlzLnNlZ21lbnQuUE9TVEFHO1xuXG5cdFx0bGV0IHJldCA9IFtdO1xuXHRcdGZvciAobGV0IGkgPSAwLCB3b3JkOyB3b3JkID0gd29yZHNbaV07IGkrKylcblx0XHR7XG5cdFx0XHRpZiAodHlwZW9mIHdvcmQucCA9PSAndW5kZWZpbmVkJyB8fCB3b3JkLnApXG5cdFx0XHR7XG5cdFx0XHRcdHJldC5wdXNoKHdvcmQpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZVxuXHRcdFx0e1xuXHRcdFx0XHQvLyDku4Xlr7nmnKror4bliKvnmoTor43ov5vooYzljLnphY1cblx0XHRcdFx0cmV0ID0gcmV0LmNvbmNhdCh0aGlzLnNwbGl0U2luZ2xlKHdvcmQudykpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gcmV0O1xuXHR9XG5cblx0LyoqXG5cdCAqIOWNleWtl+WIh+WIhlxuXHQgKlxuXHQgKiBAcGFyYW0ge3N0cmluZ30gdGV4dCDopoHliIfliIbnmoTmlofmnKxcblx0ICogQHBhcmFtIHtpbnR9IGN1ciDlvIDlp4vkvY3nva5cblx0ICogQHJldHVybiB7YXJyYXl9XG5cdCAqL1xuXHRzcGxpdFNpbmdsZSh0ZXh0LCBjdXI/OiBudW1iZXIpOiBJV29yZFtdXG5cdHtcblx0XHRjb25zdCBQT1NUQUcgPSB0aGlzLnNlZ21lbnQuUE9TVEFHO1xuXG5cdFx0aWYgKGlzTmFOKGN1cikpIGN1ciA9IDA7XG5cblx0XHRpZiAoY3VyID4gMClcblx0XHR7XG5cdFx0XHR0ZXh0ID0gdGV4dC5zbGljZShjdXIpO1xuXHRcdH1cblxuXHRcdGxldCByZXQ6IElXb3JkW10gPSBbXTtcblxuXHRcdFVTdHJpbmdcblx0XHRcdC5zcGxpdCh0ZXh0LCAnJylcblx0XHRcdC5mb3JFYWNoKGZ1bmN0aW9uICh3LCBpKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXQucHVzaCh7XG5cdFx0XHRcdFx0dyxcblx0XHRcdFx0XHRwOiBQT1NUQUcuVU5LLFxuXHRcdFx0XHR9KTtcblx0XHRcdH0pXG5cdFx0O1xuXG5cdFx0cmV0dXJuIHJldDtcblx0fVxufVxuXG5leHBvcnQgY29uc3QgaW5pdCA9IFNpbmdsZVRva2VuaXplci5pbml0LmJpbmQoU2luZ2xlVG9rZW5pemVyKSBhcyB0eXBlb2YgU2luZ2xlVG9rZW5pemVyLmluaXQ7XG5cbmV4cG9ydCBkZWZhdWx0IFNpbmdsZVRva2VuaXplcjtcbiJdfQ==