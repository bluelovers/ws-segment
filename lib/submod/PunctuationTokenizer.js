'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = exports.PunctuationTokenizer = void 0;
/**
 * 标点符号识别模块
 *
 * @author 老雷<leizongmin@gmail.com>
 */
const mod_1 = require("../mod");
const STOPWORD_1 = require("../mod/data/STOPWORD");
class PunctuationTokenizer extends mod_1.SubSModuleTokenizer {
    constructor() {
        super(...arguments);
        this.name = 'PunctuationTokenizer';
        this._STOPWORD = STOPWORD_1._STOPWORD;
        this.STOPWORD = STOPWORD_1.STOPWORD;
        this.STOPWORD2 = STOPWORD_1.STOPWORD2;
    }
    /**
     * 对未识别的单词进行分词
     *
     * @param {array} words 单词数组
     * @return {array}
     */
    split(words) {
        const POSTAG = this._POSTAG;
        const self = this;
        let ret = [];
        for (let i = 0, word; word = words[i]; i++) {
            if (word.p > 0) {
                ret.push(word);
                continue;
            }
            // 仅对未识别的词进行匹配
            let stopinfo = self.matchStopword(word.w);
            if (stopinfo.length < 1) {
                ret.push(word);
                continue;
            }
            // 分离出标点符号
            let lastc = 0;
            for (let ui = 0, sw; sw = stopinfo[ui]; ui++) {
                if (sw.c > lastc) {
                    ret.push({
                        w: word.w.substr(lastc, sw.c - lastc)
                    });
                }
                ret.push(self.debugToken({
                    w: sw.w,
                    p: POSTAG.D_W
                }, {
                    [self.name]: true,
                }, true));
                lastc = sw.c + sw.w.length;
            }
            let lastsw = stopinfo[stopinfo.length - 1];
            if (lastsw.c + lastsw.w.length < word.w.length) {
                ret.push({
                    w: word.w.substr(lastsw.c + lastsw.w.length)
                });
            }
        }
        return ret;
    }
    /**
     * 匹配包含的标点符号，返回相关信息
     *
     * @param {string} text 文本
     * @param {int} cur 开始位置
     * @return {array}  返回格式   {w: '网址', c: 开始位置}
     */
    matchStopword(text, cur) {
        const STOPWORD2 = this.STOPWORD2;
        if (isNaN(cur))
            cur = 0;
        let ret = [];
        let isMatch = false;
        while (cur < text.length) {
            let w;
            for (let i in STOPWORD2) {
                w = text.substr(cur, i);
                if (w in STOPWORD2[i]) {
                    ret.push({ w: w, c: cur });
                    isMatch = true;
                    break;
                }
            }
            cur += isMatch === false ? 1 : w.length;
            isMatch = false;
        }
        return ret;
    }
}
exports.PunctuationTokenizer = PunctuationTokenizer;
// debug(STOPWORD2);
exports.init = PunctuationTokenizer.init.bind(PunctuationTokenizer);
exports.default = PunctuationTokenizer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHVuY3R1YXRpb25Ub2tlbml6ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJQdW5jdHVhdGlvblRva2VuaXplci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7OztBQUViOzs7O0dBSUc7QUFFSCxnQ0FBNkM7QUFJN0MsbURBQXNFO0FBRXRFLE1BQWEsb0JBQXFCLFNBQVEseUJBQW1CO0lBQTdEOztRQUVDLFNBQUksR0FBRyxzQkFBc0IsQ0FBQztRQUV2QixjQUFTLEdBQUcsb0JBQVMsQ0FBQztRQUN0QixhQUFRLEdBQUcsbUJBQVEsQ0FBQztRQUNwQixjQUFTLEdBQUcsb0JBQVMsQ0FBQztJQTRGOUIsQ0FBQztJQTFGQTs7Ozs7T0FLRztJQUNILEtBQUssQ0FBQyxLQUFjO1FBRW5CLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7UUFDNUIsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBRWxCLElBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQztRQUNiLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUMxQztZQUNDLElBQUksSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQ2Q7Z0JBQ0MsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDZixTQUFTO2FBQ1Q7WUFDRCxjQUFjO1lBQ2QsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDMUMsSUFBSSxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsRUFDdkI7Z0JBQ0MsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDZixTQUFTO2FBQ1Q7WUFDRCxVQUFVO1lBQ1YsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDO1lBQ2QsS0FBSyxJQUFJLEVBQUUsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsR0FBRyxRQUFRLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQzVDO2dCQUNDLElBQUksRUFBRSxDQUFDLENBQUMsR0FBRyxLQUFLLEVBQ2hCO29CQUNDLEdBQUcsQ0FBQyxJQUFJLENBQUM7d0JBQ1IsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQztxQkFDckMsQ0FBQyxDQUFDO2lCQUNIO2dCQUVELEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQztvQkFDeEIsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO29CQUNQLENBQUMsRUFBRSxNQUFNLENBQUMsR0FBRztpQkFDYixFQUFFO29CQUNGLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUk7aUJBQ2pCLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFFVixLQUFLLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQzthQUMzQjtZQUNELElBQUksTUFBTSxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQzNDLElBQUksTUFBTSxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFDOUM7Z0JBQ0MsR0FBRyxDQUFDLElBQUksQ0FBQztvQkFDUixDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztpQkFDNUMsQ0FBQyxDQUFDO2FBQ0g7U0FDRDtRQUNELE9BQU8sR0FBRyxDQUFDO0lBQ1osQ0FBQztJQUVEOzs7Ozs7T0FNRztJQUNILGFBQWEsQ0FBQyxJQUFZLEVBQUUsR0FBWTtRQUV2QyxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBRWpDLElBQUksS0FBSyxDQUFDLEdBQUcsQ0FBQztZQUFFLEdBQUcsR0FBRyxDQUFDLENBQUM7UUFDeEIsSUFBSSxHQUFHLEdBQUcsRUFBRSxDQUFDO1FBQ2IsSUFBSSxPQUFPLEdBQUcsS0FBSyxDQUFDO1FBQ3BCLE9BQU8sR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQ3hCO1lBQ0MsSUFBSSxDQUFDLENBQUM7WUFDTixLQUFLLElBQUksQ0FBQyxJQUFJLFNBQVMsRUFDdkI7Z0JBQ0MsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQWtCLENBQUMsQ0FBQztnQkFDekMsSUFBSSxDQUFDLElBQUksU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUNyQjtvQkFDQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztvQkFDM0IsT0FBTyxHQUFHLElBQUksQ0FBQztvQkFDZixNQUFNO2lCQUNOO2FBQ0Q7WUFDRCxHQUFHLElBQUksT0FBTyxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDO1lBQ3hDLE9BQU8sR0FBRyxLQUFLLENBQUM7U0FDaEI7UUFFRCxPQUFPLEdBQUcsQ0FBQztJQUNaLENBQUM7Q0FDRDtBQWxHRCxvREFrR0M7QUFFRCxvQkFBb0I7QUFFUCxRQUFBLElBQUksR0FBRyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFxQyxDQUFDO0FBRTdHLGtCQUFlLG9CQUFvQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIOagh+eCueespuWPt+ivhuWIq+aooeWdl1xuICpcbiAqIEBhdXRob3Ig6ICB6Zu3PGxlaXpvbmdtaW5AZ21haWwuY29tPlxuICovXG5cbmltcG9ydCB7IFN1YlNNb2R1bGVUb2tlbml6ZXIgfSBmcm9tICcuLi9tb2QnO1xuaW1wb3J0IFNlZ21lbnQsIHsgSVdvcmQgfSBmcm9tICcuLi9TZWdtZW50JztcbmltcG9ydCB7IGRlYnVnIH0gZnJvbSAnLi4vdXRpbCc7XG5pbXBvcnQgVVN0cmluZyBmcm9tICd1bmktc3RyaW5nJztcbmltcG9ydCB7IF9TVE9QV09SRCwgU1RPUFdPUkQsIFNUT1BXT1JEMiB9IGZyb20gJy4uL21vZC9kYXRhL1NUT1BXT1JEJztcblxuZXhwb3J0IGNsYXNzIFB1bmN0dWF0aW9uVG9rZW5pemVyIGV4dGVuZHMgU3ViU01vZHVsZVRva2VuaXplclxue1xuXHRuYW1lID0gJ1B1bmN0dWF0aW9uVG9rZW5pemVyJztcblxuXHRwdWJsaWMgX1NUT1BXT1JEID0gX1NUT1BXT1JEO1xuXHRwdWJsaWMgU1RPUFdPUkQgPSBTVE9QV09SRDtcblx0cHVibGljIFNUT1BXT1JEMiA9IFNUT1BXT1JEMjtcblxuXHQvKipcblx0ICog5a+55pyq6K+G5Yir55qE5Y2V6K+N6L+b6KGM5YiG6K+NXG5cdCAqXG5cdCAqIEBwYXJhbSB7YXJyYXl9IHdvcmRzIOWNleivjeaVsOe7hFxuXHQgKiBAcmV0dXJuIHthcnJheX1cblx0ICovXG5cdHNwbGl0KHdvcmRzOiBJV29yZFtdKTogSVdvcmRbXVxuXHR7XG5cdFx0Y29uc3QgUE9TVEFHID0gdGhpcy5fUE9TVEFHO1xuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xuXG5cdFx0bGV0IHJldCA9IFtdO1xuXHRcdGZvciAobGV0IGkgPSAwLCB3b3JkOyB3b3JkID0gd29yZHNbaV07IGkrKylcblx0XHR7XG5cdFx0XHRpZiAod29yZC5wID4gMClcblx0XHRcdHtcblx0XHRcdFx0cmV0LnB1c2god29yZCk7XG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXHRcdFx0Ly8g5LuF5a+55pyq6K+G5Yir55qE6K+N6L+b6KGM5Yy56YWNXG5cdFx0XHRsZXQgc3RvcGluZm8gPSBzZWxmLm1hdGNoU3RvcHdvcmQod29yZC53KTtcblx0XHRcdGlmIChzdG9waW5mby5sZW5ndGggPCAxKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXQucHVzaCh3b3JkKTtcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cdFx0XHQvLyDliIbnprvlh7rmoIfngrnnrKblj7dcblx0XHRcdGxldCBsYXN0YyA9IDA7XG5cdFx0XHRmb3IgKGxldCB1aSA9IDAsIHN3OyBzdyA9IHN0b3BpbmZvW3VpXTsgdWkrKylcblx0XHRcdHtcblx0XHRcdFx0aWYgKHN3LmMgPiBsYXN0Yylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHJldC5wdXNoKHtcblx0XHRcdFx0XHRcdHc6IHdvcmQudy5zdWJzdHIobGFzdGMsIHN3LmMgLSBsYXN0Yylcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldC5wdXNoKHNlbGYuZGVidWdUb2tlbih7XG5cdFx0XHRcdFx0dzogc3cudyxcblx0XHRcdFx0XHRwOiBQT1NUQUcuRF9XXG5cdFx0XHRcdH0sIHtcblx0XHRcdFx0XHRbc2VsZi5uYW1lXTogdHJ1ZSxcblx0XHRcdFx0fSwgdHJ1ZSkpO1xuXG5cdFx0XHRcdGxhc3RjID0gc3cuYyArIHN3LncubGVuZ3RoO1xuXHRcdFx0fVxuXHRcdFx0bGV0IGxhc3RzdyA9IHN0b3BpbmZvW3N0b3BpbmZvLmxlbmd0aCAtIDFdO1xuXHRcdFx0aWYgKGxhc3Rzdy5jICsgbGFzdHN3LncubGVuZ3RoIDwgd29yZC53Lmxlbmd0aClcblx0XHRcdHtcblx0XHRcdFx0cmV0LnB1c2goe1xuXHRcdFx0XHRcdHc6IHdvcmQudy5zdWJzdHIobGFzdHN3LmMgKyBsYXN0c3cudy5sZW5ndGgpXG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gcmV0O1xuXHR9XG5cblx0LyoqXG5cdCAqIOWMuemFjeWMheWQq+eahOagh+eCueespuWPt++8jOi/lOWbnuebuOWFs+S/oeaBr1xuXHQgKlxuXHQgKiBAcGFyYW0ge3N0cmluZ30gdGV4dCDmlofmnKxcblx0ICogQHBhcmFtIHtpbnR9IGN1ciDlvIDlp4vkvY3nva5cblx0ICogQHJldHVybiB7YXJyYXl9ICDov5Tlm57moLzlvI8gICB7dzogJ+e9keWdgCcsIGM6IOW8gOWni+S9jee9rn1cblx0ICovXG5cdG1hdGNoU3RvcHdvcmQodGV4dDogc3RyaW5nLCBjdXI/OiBudW1iZXIpOiBJV29yZFtdXG5cdHtcblx0XHRjb25zdCBTVE9QV09SRDIgPSB0aGlzLlNUT1BXT1JEMjtcblxuXHRcdGlmIChpc05hTihjdXIpKSBjdXIgPSAwO1xuXHRcdGxldCByZXQgPSBbXTtcblx0XHRsZXQgaXNNYXRjaCA9IGZhbHNlO1xuXHRcdHdoaWxlIChjdXIgPCB0ZXh0Lmxlbmd0aClcblx0XHR7XG5cdFx0XHRsZXQgdztcblx0XHRcdGZvciAobGV0IGkgaW4gU1RPUFdPUkQyKVxuXHRcdFx0e1xuXHRcdFx0XHR3ID0gdGV4dC5zdWJzdHIoY3VyLCBpIGFzIGFueSBhcyBudW1iZXIpO1xuXHRcdFx0XHRpZiAodyBpbiBTVE9QV09SRDJbaV0pXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXQucHVzaCh7IHc6IHcsIGM6IGN1ciB9KTtcblx0XHRcdFx0XHRpc01hdGNoID0gdHJ1ZTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0Y3VyICs9IGlzTWF0Y2ggPT09IGZhbHNlID8gMSA6IHcubGVuZ3RoO1xuXHRcdFx0aXNNYXRjaCA9IGZhbHNlO1xuXHRcdH1cblxuXHRcdHJldHVybiByZXQ7XG5cdH1cbn1cblxuLy8gZGVidWcoU1RPUFdPUkQyKTtcblxuZXhwb3J0IGNvbnN0IGluaXQgPSBQdW5jdHVhdGlvblRva2VuaXplci5pbml0LmJpbmQoUHVuY3R1YXRpb25Ub2tlbml6ZXIpIGFzIHR5cGVvZiBQdW5jdHVhdGlvblRva2VuaXplci5pbml0O1xuXG5leHBvcnQgZGVmYXVsdCBQdW5jdHVhdGlvblRva2VuaXplcjtcbiJdfQ==