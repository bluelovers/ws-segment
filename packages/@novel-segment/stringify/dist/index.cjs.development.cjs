'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/**
 * 將詞詞陣列轉換為字串陣列
 * Convert Word Array to String Array
 *
 * 將斷詞結果中的每個項目轉換為對應的字串。
 * 若項目為字串則直接返回；若為詞詞物件則取其 w 屬性（詞彙內容）。
 *
 * Converts each item in the segmentation result to its corresponding string.
 * If the item is a string, returns it directly; if it's a word object, takes its w property (word content).
 *
 * @param {IStringifyWordInput} words - 斷詞結果陣列 / Segmentation result array
 * @param {...any[]} argv - 額外參數（保留供擴充使用）/ Additional parameters (reserved for extension)
 * @returns {string[]} 字串陣列 / String array
 * @throws {TypeError} 當項目不是有效的斷詞結果時拋出 / Throws when item is not a valid segmentation result
 */
function stringifyList(words, ...argv) {
  return words.map(function (item) {
    if (typeof item === 'string') {
      return item;
    } else if ('w' in item) {
      return item.w;
    } else {
      throw new TypeError(`not a valid segment result list`);
    }
  });
}
/**
 * 將斷詞陣列連接成字串
 * Join Word Array into String
 *
 * 将单词数组连接成字符串。
 * 將斷詞結果轉換為連續的文字字串，用於顯示或比對。
 *
 * Joins word array into a string.
 * Converts segmentation result to continuous text string for display or comparison.
 *
 * @param {IStringifyWordInput} words - 断词结果数组 / Segmentation result array
 * @param {...any[]} argv - 額外參數（保留供擴充使用）/ Additional parameters (reserved for extension)
 * @returns {string} 連接後的字串 / Joined string
 */
function stringify(words, ...argv) {
  return stringifyList(words, ...argv).join('');
}

exports.default = stringify;
exports.stringify = stringify;
exports.stringifyList = stringifyList;
//# sourceMappingURL=index.cjs.development.cjs.map
