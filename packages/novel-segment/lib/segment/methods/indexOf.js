"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.indexOf = void 0;
/**
 * 在单词数组中查找某一个单词或词性所在的位置
 *
 * @param {Array} words 单词数组
 * @param {Number|String} s 要查找的单词或词性
 * @param {Number} cur 开始位置
 * @return {Number} 找不到，返回-1
 */
function indexOf(words, s, cur, ...argv) {
    cur = isNaN(cur) ? 0 : cur;
    let f = typeof s === 'string' ? 'w' : 'p';
    while (cur < words.length) {
        if (words[cur][f] === s)
            return cur;
        cur++;
    }
    return -1;
}
exports.indexOf = indexOf;
//# sourceMappingURL=indexOf.js.map