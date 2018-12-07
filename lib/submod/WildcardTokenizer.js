'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiV2lsZGNhcmRUb2tlbml6ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJXaWxkY2FyZFRva2VuaXplci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7O0FBRWI7Ozs7R0FJRztBQUNILGdDQUE4RTtBQU85RSxNQUFhLGlCQUFrQixTQUFRLHlCQUFtQjtJQUExRDs7UUFHQyxTQUFJLEdBQUcsbUJBQW1CLENBQUM7SUEySDVCLENBQUM7SUF0SEEsTUFBTTtRQUVMLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUNmLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDL0MsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUNsRCxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCxLQUFLLENBQUMsS0FBYztRQUVuQixxREFBcUQ7UUFDckQsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDckQsQ0FBQztJQUVELG1CQUFtQixDQUFDLElBQVcsRUFBRSxRQUFpQixFQUFFLElBQXFCO1FBRXhFLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQVEsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztRQUVuRCxPQUFPLEVBQUUsQ0FBQztJQUNYLENBQUM7SUFFRCxhQUFhLENBQUMsSUFBWSxFQUFFLEdBQVk7UUFFdkMsOEJBQThCO1FBQzlCLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7UUFFMUIsSUFBSSxHQUFHLEdBQVksRUFBRSxDQUFDO1FBQ3RCLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQztRQUVoQixZQUFZO1FBQ1osSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJ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SSxHQUFHLGlCQUFpQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQTJDLENBQUM7QUFFN0csa0JBQWUsaUJBQWlCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbi8qKlxuICog6YCa6YWN56ym6K+G5Yir5qih5Z2XXG4gKlxuICogQGF1dGhvciDogIHpm7c8bGVpem9uZ21pbkBnbWFpbC5jb20+XG4gKi9cbmltcG9ydCB7IFN1YlNNb2R1bGUsIFN1YlNNb2R1bGVUb2tlbml6ZXIsIElTdWJUb2tlbml6ZXJDcmVhdGUgfSBmcm9tICcuLi9tb2QnO1xuaW1wb3J0IHsgU2VnbWVudCwgSVdvcmQsIElESUNULCBJRElDVDIgfSBmcm9tICcuLi9TZWdtZW50JztcbmltcG9ydCB7IGRlYnVnVG9rZW4gfSBmcm9tICcuLi91dGlsL2RlYnVnJztcbmltcG9ydCBVU3RyaW5nID0gcmVxdWlyZSgndW5pLXN0cmluZycpO1xuaW1wb3J0IHsgZGVidWcgfSBmcm9tICcuLi91dGlsJztcbmltcG9ydCB7IElXb3JkRGVidWdJbmZvIH0gZnJvbSAnLi4vdXRpbC9pbmRleCc7XG5cbmV4cG9ydCBjbGFzcyBXaWxkY2FyZFRva2VuaXplciBleHRlbmRzIFN1YlNNb2R1bGVUb2tlbml6ZXJcbntcblxuXHRuYW1lID0gJ1dpbGRjYXJkVG9rZW5pemVyJztcblxuXHRwcm90ZWN0ZWQgX1RBQkxFOiBJRElDVDxJV29yZD47XG5cdHByb3RlY3RlZCBfVEFCTEUyOiBJRElDVDI8SVdvcmQ+O1xuXG5cdF9jYWNoZSgpXG5cdHtcblx0XHRzdXBlci5fY2FjaGUoKTtcblx0XHR0aGlzLl9UQUJMRSA9IHRoaXMuc2VnbWVudC5nZXREaWN0KCdXSUxEQ0FSRCcpO1xuXHRcdHRoaXMuX1RBQkxFMiA9IHRoaXMuc2VnbWVudC5nZXREaWN0KCdXSUxEQ0FSRDInKTtcblx0fVxuXG5cdC8qKlxuXHQgKiDlr7nmnKror4bliKvnmoTljZXor43ov5vooYzliIbor41cblx0ICpcblx0ICogQHBhcmFtIHthcnJheX0gd29yZHMg5Y2V6K+N5pWw57uEXG5cdCAqIEByZXR1cm4ge2FycmF5fVxuXHQgKi9cblx0c3BsaXQod29yZHM6IElXb3JkW10pOiBJV29yZFtdXG5cdHtcblx0XHQvL3JldHVybiB0aGlzLl9zcGxpdFVua25vdyh3b3JkcywgdGhpcy5zcGxpdEZvcmVpZ24pO1xuXHRcdHJldHVybiB0aGlzLl9zcGxpdFVua25vdyh3b3JkcywgdGhpcy5zcGxpdFdpbGRjYXJkKTtcblx0fVxuXG5cdGNyZWF0ZVdpbGRjYXJkVG9rZW4od29yZDogSVdvcmQsIGxhc3R0eXBlPzogbnVtYmVyLCBhdHRyPzogSVdvcmREZWJ1Z0luZm8pXG5cdHtcblx0XHRsZXQgbncgPSB0aGlzLmNyZWF0ZVRva2VuPElXb3JkPih3b3JkLCB0cnVlLCBhdHRyKTtcblxuXHRcdHJldHVybiBudztcblx0fVxuXG5cdHNwbGl0V2lsZGNhcmQodGV4dDogc3RyaW5nLCBjdXI/OiBudW1iZXIpOiBJV29yZFtdXG5cdHtcblx0XHQvL2NvbnN0IFBPU1RBRyA9IHRoaXMuX1BPU1RBRztcblx0XHRjb25zdCBUQUJMRSA9IHRoaXMuX1RBQkxFO1xuXG5cdFx0bGV0IHJldDogSVdvcmRbXSA9IFtdO1xuXHRcdGxldCBzZWxmID0gdGhpcztcblxuXHRcdC8vIOWIhuemu+WHuuW3suivhuWIq+eahOWNleivjVxuXHRcdGxldCB3b3JkaW5mbyA9IHNlbGYubWF0Y2hXb3JkKHRleHQpO1xuXHRcdGlmICh3b3JkaW5mby5sZW5ndGgpXG5cdFx0e1xuXHRcdFx0bGV0IGxhc3RjID0gMDtcblx0XHRcdGZvciAobGV0IHVpID0gMCwgYnc7IGJ3ID0gd29yZGluZm9bdWldOyB1aSsrKVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAoYncuYyA+IGxhc3RjKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cmV0LnB1c2goe1xuXHRcdFx0XHRcdFx0dzogdGV4dC5zdWJzdHIobGFzdGMsIGJ3LmMgLSBsYXN0YyksXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRsZXQgbncgPSBzZWxmLmNyZWF0ZVdpbGRjYXJkVG9rZW4oe1xuXHRcdFx0XHRcdHc6IGJ3LncsXG5cdFx0XHRcdFx0cDogVEFCTEVbYncudy50b0xvd2VyQ2FzZSgpXS5wLFxuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHRyZXQucHVzaChudyk7XG5cblx0XHRcdFx0bGFzdGMgPSBidy5jICsgYncudy5sZW5ndGg7XG5cdFx0XHR9XG5cblx0XHRcdGxldCBsYXN0d29yZCA9IHdvcmRpbmZvW3dvcmRpbmZvLmxlbmd0aCAtIDFdO1xuXHRcdFx0aWYgKGxhc3R3b3JkLmMgKyBsYXN0d29yZC53Lmxlbmd0aCA8IHRleHQubGVuZ3RoKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXQucHVzaCh7XG5cdFx0XHRcdFx0dzogdGV4dC5zdWJzdHIobGFzdHdvcmQuYyArIGxhc3R3b3JkLncubGVuZ3RoKSxcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHJldC5sZW5ndGggPyByZXQgOiB1bmRlZmluZWQ7XG5cdH1cblxuXHQvKipcblx0ICog5Yy56YWN5Y2V6K+N77yM6L+U5Zue55u45YWz5L+h5oGvXG5cdCAqXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0IOaWh+acrFxuXHQgKiBAcGFyYW0ge2ludH0gY3VyIOW8gOWni+S9jee9rlxuXHQgKiBAcmV0dXJuIHthcnJheX0gIOi/lOWbnuagvOW8jyAgIHt3OiAn5Y2V6K+NJywgYzog5byA5aeL5L2N572ufVxuXHQgKi9cblx0bWF0Y2hXb3JkKHRleHQ6IHN0cmluZywgY3VyPzogbnVtYmVyKVxuXHR7XG5cdFx0Ly9jb25zdCBQT1NUQUcgPSB0aGlzLl9QT1NUQUc7XG5cdFx0Y29uc3QgVEFCTEUgPSB0aGlzLl9UQUJMRTI7XG5cblx0XHRpZiAoaXNOYU4oY3VyKSkgY3VyID0gMDtcblxuXHRcdGxldCByZXQ6IElXb3JkW10gPSBbXTtcblx0XHQvL2xldCBzZWxmID0gdGhpcztcblxuXHRcdGxldCBzID0gZmFsc2U7XG5cblx0XHQvLyDljLnphY3lj6/og73lh7rnjrDnmoTljZXor43vvIzlj5bplb/luqbmnIDlpKfnmoTpgqPkuKpcblx0XHRsZXQgbG93ZXJ0ZXh0ID0gdGV4dC50b0xvd2VyQ2FzZSgpO1xuXG5cdFx0d2hpbGUgKGN1ciA8IHRleHQubGVuZ3RoKVxuXHRcdHtcblx0XHRcdGxldCBzdG9wd29yZDogSVdvcmQgPSBudWxsO1xuXHRcdFx0Zm9yIChsZXQgaSBpbiBUQUJMRSlcblx0XHRcdHtcblx0XHRcdFx0aWYgKGxvd2VydGV4dC5zdWJzdHIoY3VyLCBpIGFzIGFueSkgaW4gVEFCTEVbaV0pXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRzdG9wd29yZCA9IHtcblx0XHRcdFx0XHRcdHc6IHRleHQuc3Vic3RyKGN1ciwgaSBhcyBhbnkpLFxuXHRcdFx0XHRcdFx0YzogY3VyLFxuXHRcdFx0XHRcdH07XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGlmIChzdG9wd29yZCAhPT0gbnVsbClcblx0XHRcdHtcblx0XHRcdFx0cmV0LnB1c2goc3RvcHdvcmQpO1xuXHRcdFx0XHRjdXIgKz0gc3RvcHdvcmQudy5sZW5ndGg7XG5cdFx0XHR9XG5cdFx0XHRlbHNlXG5cdFx0XHR7XG5cdFx0XHRcdGN1cisrO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gcmV0O1xuXHR9XG5cbn1cblxuZXhwb3J0IGNvbnN0IGluaXQgPSBXaWxkY2FyZFRva2VuaXplci5pbml0LmJpbmQoV2lsZGNhcmRUb2tlbml6ZXIpIGFzIElTdWJUb2tlbml6ZXJDcmVhdGU8V2lsZGNhcmRUb2tlbml6ZXI+O1xuXG5leHBvcnQgZGVmYXVsdCBXaWxkY2FyZFRva2VuaXplcjtcbiJdfQ==