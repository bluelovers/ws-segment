"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stringify = void 0;
/**
 * 将单词数组连接成字符串
 *
 * @param {Array} words 单词数组
 * @return {String}
 */
function stringify(words, ...argv) {
    return words.map(function (item) {
        if (typeof item === 'string') {
            return item;
        }
        else if ('w' in item) {
            return item.w;
        }
        else {
            throw new TypeError(`not a valid segment result list`);
        }
    }).join('');
}
exports.stringify = stringify;
//# sourceMappingURL=stringify.js.map