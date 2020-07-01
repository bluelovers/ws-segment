"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.split = void 0;
/**
 * 根据某个单词或词性来分割单词数组
 *
 * @param {Array} words 单词数组
 * @param {Number|String} s 用于分割的单词或词性
 * @return {Array}
 */
function split(words, s, ...argv) {
    let ret = [];
    let lasti = 0;
    let i = 0;
    let f = typeof s === 'string' ? 'w' : 'p';
    while (i < words.length) {
        if (words[i][f] === s) {
            if (lasti < i)
                ret.push(words.slice(lasti, i));
            ret.push(words.slice(i, i + 1));
            i++;
            lasti = i;
        }
        else {
            i++;
        }
    }
    if (lasti < words.length - 1) {
        ret.push(words.slice(lasti, words.length));
    }
    words = undefined;
    return ret;
}
exports.split = split;
//# sourceMappingURL=split.js.map