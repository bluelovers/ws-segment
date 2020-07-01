'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.type = exports.init = exports.PunctuationTokenizer = void 0;
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
exports.type = PunctuationTokenizer.type;
exports.default = PunctuationTokenizer;
//# sourceMappingURL=PunctuationTokenizer.js.map