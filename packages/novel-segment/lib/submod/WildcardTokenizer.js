'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.type = exports.init = exports.WildcardTokenizer = void 0;
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
        var _a;
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
                    p: (_a = TABLE[bw.w.toLowerCase()]) === null || _a === void 0 ? void 0 : _a.p,
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
exports.type = WildcardTokenizer.type;
exports.default = WildcardTokenizer;
//# sourceMappingURL=WildcardTokenizer.js.map