'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.type = exports.init = exports.SingleTokenizer = void 0;
const tslib_1 = require("tslib");
const mod_1 = require("../mod");
const uni_string_1 = tslib_1.__importDefault(require("uni-string"));
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
            if (typeof word.p === 'undefined' || word.p) {
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
exports.type = SingleTokenizer.type;
exports.default = SingleTokenizer;
//# sourceMappingURL=SingleTokenizer.js.map