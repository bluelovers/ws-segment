'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 外文字符、数字识别模块
 *
 * @author 老雷<leizongmin@gmail.com>
 */
const mod_1 = require("../mod");
class ForeignTokenizer extends mod_1.SubSModuleTokenizer {
    /**
     * 对未识别的单词进行分词
     *
     * @param {array} words 单词数组
     * @return {array}
     */
    split(words) {
        return this._splitUnknow(words, this.splitForeign);
        /*
        const POSTAG = this.segment.POSTAG;

        let ret = [];
        for (let i = 0, word; word = words[i]; i++)
        {
            if (word.p)
            {
                ret.push(word);
            }
            else
            {
                // 仅对未识别的词进行匹配
                ret = ret.concat(this.splitForeign(word.w));
            }
        }
        return ret;
        */
    }
    /**
     * 匹配包含的英文字符和数字，并分割
     *
     * @param {string} text 文本
     * @param {int} cur 开始位置
     * @return {array}  返回格式   {w: '单词', c: 开始位置}
     */
    splitForeign(text, cur) {
        const POSTAG = this.segment.POSTAG;
        if (isNaN(cur))
            cur = 0;
        let ret = [];
        // 取第一个字符的ASCII码
        let lastcur = 0;
        let lasttype = 0;
        let c = text.charCodeAt(0);
        // 全角数字或字母
        if (c >= 65296 && c <= 65370)
            c -= 65248;
        // 数字  lasttype = POSTAG.A_M
        if (c >= 48 && c <= 57) {
            lasttype = POSTAG.A_M;
        } // 字母 lasttype = POSTAG.A_NX
        else if ((c >= 65 && c <= 90) || (c >= 97 && c <= 122)) {
            lasttype = POSTAG.A_NX;
        }
        else {
            lasttype = POSTAG.UNK;
        }
        let i;
        for (i = 1; i < text.length; i++) {
            let c = text.charCodeAt(i);
            // 全角数字或字母
            if (c >= 65296 && c <= 65370)
                c -= 65248;
            // 数字  lasttype = POSTAG.A_M
            if (c >= 48 && c <= 57) {
                if (lasttype !== POSTAG.A_M) {
                    let nw = { w: text.substr(lastcur, i - lastcur) };
                    if (lasttype !== POSTAG.UNK)
                        nw.p = lasttype;
                    ret.push(nw);
                    lastcur = i;
                }
                lasttype = POSTAG.A_M;
            }
            else if ((c >= 65 && c <= 90) || (c >= 97 && c <= 122)) {
                // 字母 lasttype = POSTAG.A_NX
                if (lasttype !== POSTAG.A_NX) {
                    let nw = { w: text.substr(lastcur, i - lastcur) };
                    if (lasttype !== POSTAG.UNK)
                        nw.p = lasttype;
                    ret.push(nw);
                    lastcur = i;
                }
                lasttype = POSTAG.A_NX;
            }
            else {
                // 其他
                if (lasttype !== POSTAG.UNK) {
                    ret.push({
                        w: text.substr(lastcur, i - lastcur),
                        p: lasttype
                    });
                    lastcur = i;
                }
                lasttype = POSTAG.UNK;
            }
        }
        // 剩余部分
        let nw = { w: text.substr(lastcur, i - lastcur) };
        if (lasttype !== POSTAG.UNK)
            nw.p = lasttype;
        ret.push(nw);
        // debug(ret);
        return ret;
    }
}
exports.ForeignTokenizer = ForeignTokenizer;
exports.init = ForeignTokenizer.init.bind(ForeignTokenizer);
exports.default = ForeignTokenizer;
