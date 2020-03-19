'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = exports.WildcardTokenizer = void 0;
/**
 * 通配符识别模块
 *
 * @author 老雷<leizongmin@gmail.com>
 */
const mod_1 = require("../mod");
class WildcardTokenizer extends mod_1.SubSModuleTokenizer {
    constructor() {
        super(...arguments);
        this.name = 'WildcardTokenizer';
    }
    _cache() {
        super._cache();
        this._TABLE = this.segment.getDict('WILDCARD');
        this._TABLE2 = this.segment.getDict('WILDCARD2');
    }
    /**
     * 对未识别的单词进行分词
     *
     * @param {array} words 单词数组
     * @return {array}
     */
    split(words) {
        //return this._splitUnknow(words, this.splitForeign);
        return this._splitUnknow(words, this.splitWildcard);
    }
    createWildcardToken(word, lasttype, attr) {
        let nw = this.createToken(word, true, attr);
        return nw;
    }
    splitWildcard(text, cur) {
        //const POSTAG = this._POSTAG;
        const TABLE = this._TABLE;
        let ret = [];
        let self = this;
        // 分离出已识别的单词
        let wordinfo = self.matchWord(text);
        if (wordinfo.length) {
            let lastc = 0;
            for (let ui = 0, bw; bw = wordinfo[ui]; ui++) {
                if (bw.c > lastc) {
                    ret.push({
                        w: text.substr(lastc, bw.c - lastc),
                    });
                }
                let nw = self.createWildcardToken({
                    w: bw.w,
                    p: TABLE[bw.w.toLowerCase()].p,
                });
                ret.push(nw);
                lastc = bw.c + bw.w.length;
            }
            let lastword = wordinfo[wordinfo.length - 1];
            if (lastword.c + lastword.w.length < text.length) {
                ret.push({
                    w: text.substr(lastword.c + lastword.w.length),
                });
            }
        }
        return ret.length ? ret : undefined;
    }
    /**
     * 匹配单词，返回相关信息
     *
     * @param {string} text 文本
     * @param {int} cur 开始位置
     * @return {array}  返回格式   {w: '单词', c: 开始位置}
     */
    matchWord(text, cur) {
        //const POSTAG = this._POSTAG;
        const TABLE = this._TABLE2;
        if (isNaN(cur))
            cur = 0;
        let ret = [];
        //let self = this;
        let s = false;
        // 匹配可能出现的单词，取长度最大的那个
        let lowertext = text.toLowerCase();
        while (cur < text.length) {
            let stopword = null;
            for (let i in TABLE) {
                if (lowertext.substr(cur, i) in TABLE[i]) {
                    stopword = {
                        w: text.substr(cur, i),
                        c: cur,
                    };
                }
            }
            if (stopword !== null) {
                ret.push(stopword);
                cur += stopword.w.length;
            }
            else {
                cur++;
            }
        }
        return ret;
    }
}
exports.WildcardTokenizer = WildcardTokenizer;
exports.init = WildcardTokenizer.init.bind(WildcardTokenizer);
exports.default = WildcardTokenizer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiV2lsZGNhcmRUb2tlbml6ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJXaWxkY2FyZFRva2VuaXplci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7OztBQUViOzs7O0dBSUc7QUFDSCxnQ0FBOEU7QUFPOUUsTUFBYSxpQkFBa0IsU0FBUSx5QkFBbUI7SUFBMUQ7O1FBR0MsU0FBSSxHQUFHLG1CQUFtQixDQUFDO0lBMkg1QixDQUFDO0lBdEhBLE1BQU07UUFFTCxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDZixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQy9DLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDbEQsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0gsS0FBSyxDQUFDLEtBQWM7UUFFbkIscURBQXFEO1FBQ3JELE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQ3JELENBQUM7SUFFRCxtQkFBbUIsQ0FBQyxJQUFXLEVBQUUsUUFBaUIsRUFBRSxJQUFxQjtRQUV4RSxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFRLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFbkQsT0FBTyxFQUFFLENBQUM7SUFDWCxDQUFDO0lBRUQsYUFBYSxDQUFDLElBQVksRUFBRSxHQUFZO1FBRXZDLDhCQUE4QjtRQUM5QixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBRTFCLElBQUksR0FBRyxHQUFZLEVBQUUsQ0FBQztRQUN0QixJQUFJLElBQUksR0FBRyxJQUFJLENBQUM7UUFFaEIsWUFBWTtRQUNaLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMs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QUksR0FBRyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUEyQyxDQUFDO0FBRTdHLGtCQUFlLGlCQUFpQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIOmAmumFjeespuivhuWIq+aooeWdl1xuICpcbiAqIEBhdXRob3Ig6ICB6Zu3PGxlaXpvbmdtaW5AZ21haWwuY29tPlxuICovXG5pbXBvcnQgeyBTdWJTTW9kdWxlLCBTdWJTTW9kdWxlVG9rZW5pemVyLCBJU3ViVG9rZW5pemVyQ3JlYXRlIH0gZnJvbSAnLi4vbW9kJztcbmltcG9ydCB7IFNlZ21lbnQsIElXb3JkLCBJRElDVCwgSURJQ1QyIH0gZnJvbSAnLi4vU2VnbWVudCc7XG5pbXBvcnQgeyBkZWJ1Z1Rva2VuIH0gZnJvbSAnLi4vdXRpbC9kZWJ1Zyc7XG5pbXBvcnQgVVN0cmluZyBmcm9tICd1bmktc3RyaW5nJztcbmltcG9ydCB7IGRlYnVnIH0gZnJvbSAnLi4vdXRpbCc7XG5pbXBvcnQgeyBJV29yZERlYnVnSW5mbyB9IGZyb20gJy4uL3V0aWwvaW5kZXgnO1xuXG5leHBvcnQgY2xhc3MgV2lsZGNhcmRUb2tlbml6ZXIgZXh0ZW5kcyBTdWJTTW9kdWxlVG9rZW5pemVyXG57XG5cblx0bmFtZSA9ICdXaWxkY2FyZFRva2VuaXplcic7XG5cblx0cHJvdGVjdGVkIF9UQUJMRTogSURJQ1Q8SVdvcmQ+O1xuXHRwcm90ZWN0ZWQgX1RBQkxFMjogSURJQ1QyPElXb3JkPjtcblxuXHRfY2FjaGUoKVxuXHR7XG5cdFx0c3VwZXIuX2NhY2hlKCk7XG5cdFx0dGhpcy5fVEFCTEUgPSB0aGlzLnNlZ21lbnQuZ2V0RGljdCgnV0lMRENBUkQnKTtcblx0XHR0aGlzLl9UQUJMRTIgPSB0aGlzLnNlZ21lbnQuZ2V0RGljdCgnV0lMRENBUkQyJyk7XG5cdH1cblxuXHQvKipcblx0ICog5a+55pyq6K+G5Yir55qE5Y2V6K+N6L+b6KGM5YiG6K+NXG5cdCAqXG5cdCAqIEBwYXJhbSB7YXJyYXl9IHdvcmRzIOWNleivjeaVsOe7hFxuXHQgKiBAcmV0dXJuIHthcnJheX1cblx0ICovXG5cdHNwbGl0KHdvcmRzOiBJV29yZFtdKTogSVdvcmRbXVxuXHR7XG5cdFx0Ly9yZXR1cm4gdGhpcy5fc3BsaXRVbmtub3cod29yZHMsIHRoaXMuc3BsaXRGb3JlaWduKTtcblx0XHRyZXR1cm4gdGhpcy5fc3BsaXRVbmtub3cod29yZHMsIHRoaXMuc3BsaXRXaWxkY2FyZCk7XG5cdH1cblxuXHRjcmVhdGVXaWxkY2FyZFRva2VuKHdvcmQ6IElXb3JkLCBsYXN0dHlwZT86IG51bWJlciwgYXR0cj86IElXb3JkRGVidWdJbmZvKVxuXHR7XG5cdFx0bGV0IG53ID0gdGhpcy5jcmVhdGVUb2tlbjxJV29yZD4od29yZCwgdHJ1ZSwgYXR0cik7XG5cblx0XHRyZXR1cm4gbnc7XG5cdH1cblxuXHRzcGxpdFdpbGRjYXJkKHRleHQ6IHN0cmluZywgY3VyPzogbnVtYmVyKTogSVdvcmRbXVxuXHR7XG5cdFx0Ly9jb25zdCBQT1NUQUcgPSB0aGlzLl9QT1NUQUc7XG5cdFx0Y29uc3QgVEFCTEUgPSB0aGlzLl9UQUJMRTtcblxuXHRcdGxldCByZXQ6IElXb3JkW10gPSBbXTtcblx0XHRsZXQgc2VsZiA9IHRoaXM7XG5cblx0XHQvLyDliIbnprvlh7rlt7Lor4bliKvnmoTljZXor41cblx0XHRsZXQgd29yZGluZm8gPSBzZWxmLm1hdGNoV29yZCh0ZXh0KTtcblx0XHRpZiAod29yZGluZm8ubGVuZ3RoKVxuXHRcdHtcblx0XHRcdGxldCBsYXN0YyA9IDA7XG5cdFx0XHRmb3IgKGxldCB1aSA9IDAsIGJ3OyBidyA9IHdvcmRpbmZvW3VpXTsgdWkrKylcblx0XHRcdHtcblx0XHRcdFx0aWYgKGJ3LmMgPiBsYXN0Yylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHJldC5wdXNoKHtcblx0XHRcdFx0XHRcdHc6IHRleHQuc3Vic3RyKGxhc3RjLCBidy5jIC0gbGFzdGMpLFxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0bGV0IG53ID0gc2VsZi5jcmVhdGVXaWxkY2FyZFRva2VuKHtcblx0XHRcdFx0XHR3OiBidy53LFxuXHRcdFx0XHRcdHA6IFRBQkxFW2J3LncudG9Mb3dlckNhc2UoKV0ucCxcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0cmV0LnB1c2gobncpO1xuXG5cdFx0XHRcdGxhc3RjID0gYncuYyArIGJ3LncubGVuZ3RoO1xuXHRcdFx0fVxuXG5cdFx0XHRsZXQgbGFzdHdvcmQgPSB3b3JkaW5mb1t3b3JkaW5mby5sZW5ndGggLSAxXTtcblx0XHRcdGlmIChsYXN0d29yZC5jICsgbGFzdHdvcmQudy5sZW5ndGggPCB0ZXh0Lmxlbmd0aClcblx0XHRcdHtcblx0XHRcdFx0cmV0LnB1c2goe1xuXHRcdFx0XHRcdHc6IHRleHQuc3Vic3RyKGxhc3R3b3JkLmMgKyBsYXN0d29yZC53Lmxlbmd0aCksXG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiByZXQubGVuZ3RoID8gcmV0IDogdW5kZWZpbmVkO1xuXHR9XG5cblx0LyoqXG5cdCAqIOWMuemFjeWNleivje+8jOi/lOWbnuebuOWFs+S/oeaBr1xuXHQgKlxuXHQgKiBAcGFyYW0ge3N0cmluZ30gdGV4dCDmlofmnKxcblx0ICogQHBhcmFtIHtpbnR9IGN1ciDlvIDlp4vkvY3nva5cblx0ICogQHJldHVybiB7YXJyYXl9ICDov5Tlm57moLzlvI8gICB7dzogJ+WNleivjScsIGM6IOW8gOWni+S9jee9rn1cblx0ICovXG5cdG1hdGNoV29yZCh0ZXh0OiBzdHJpbmcsIGN1cj86IG51bWJlcilcblx0e1xuXHRcdC8vY29uc3QgUE9TVEFHID0gdGhpcy5fUE9TVEFHO1xuXHRcdGNvbnN0IFRBQkxFID0gdGhpcy5fVEFCTEUyO1xuXG5cdFx0aWYgKGlzTmFOKGN1cikpIGN1ciA9IDA7XG5cblx0XHRsZXQgcmV0OiBJV29yZFtdID0gW107XG5cdFx0Ly9sZXQgc2VsZiA9IHRoaXM7XG5cblx0XHRsZXQgcyA9IGZhbHNlO1xuXG5cdFx0Ly8g5Yy56YWN5Y+v6IO95Ye6546w55qE5Y2V6K+N77yM5Y+W6ZW/5bqm5pyA5aSn55qE6YKj5LiqXG5cdFx0bGV0IGxvd2VydGV4dCA9IHRleHQudG9Mb3dlckNhc2UoKTtcblxuXHRcdHdoaWxlIChjdXIgPCB0ZXh0Lmxlbmd0aClcblx0XHR7XG5cdFx0XHRsZXQgc3RvcHdvcmQ6IElXb3JkID0gbnVsbDtcblx0XHRcdGZvciAobGV0IGkgaW4gVEFCTEUpXG5cdFx0XHR7XG5cdFx0XHRcdGlmIChsb3dlcnRleHQuc3Vic3RyKGN1ciwgaSBhcyBhbnkpIGluIFRBQkxFW2ldKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0c3RvcHdvcmQgPSB7XG5cdFx0XHRcdFx0XHR3OiB0ZXh0LnN1YnN0cihjdXIsIGkgYXMgYW55KSxcblx0XHRcdFx0XHRcdGM6IGN1cixcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRpZiAoc3RvcHdvcmQgIT09IG51bGwpXG5cdFx0XHR7XG5cdFx0XHRcdHJldC5wdXNoKHN0b3B3b3JkKTtcblx0XHRcdFx0Y3VyICs9IHN0b3B3b3JkLncubGVuZ3RoO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZVxuXHRcdFx0e1xuXHRcdFx0XHRjdXIrKztcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHJldDtcblx0fVxuXG59XG5cbmV4cG9ydCBjb25zdCBpbml0ID0gV2lsZGNhcmRUb2tlbml6ZXIuaW5pdC5iaW5kKFdpbGRjYXJkVG9rZW5pemVyKSBhcyBJU3ViVG9rZW5pemVyQ3JlYXRlPFdpbGRjYXJkVG9rZW5pemVyPjtcblxuZXhwb3J0IGRlZmF1bHQgV2lsZGNhcmRUb2tlbml6ZXI7XG4iXX0=