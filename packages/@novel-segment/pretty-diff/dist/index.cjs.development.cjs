'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var crlfNormalize = require('crlf-normalize');
var debugColor2 = require('debug-color2');
var diff = require('diff');
var min = require('@lazy-cjk/zh-convert/min');
var stringify = require('@novel-segment/stringify');

/**
 * 美化差異比較模組
 * Pretty Diff Module
 *
 * 提供斷詞結果的視覺化差異比較功能。
 * 使用色彩標記新增（綠色）、刪除（紅色）和未變更（灰色）的部分，
 * 便於直觀地比較斷詞或轉換前後的差異。
 *
 * Provides visual diff comparison functionality for segmentation results.
 * Uses color coding to mark additions (green), removals (red), and unchanged (gray) parts,
 * making it easy to intuitively compare differences before and after segmentation or transformation.
 *
 * @module @novel-segment/pretty-diff
 */
/**
 * 列印美化差異比較結果
 * Print Pretty Diff Result
 *
 * 比較新舊文字內容，以色彩標記差異並輸出至主控台。
 * 同時會進行簡繁轉換比較，顯示簡體轉繁體後的差異。
 *
 * Compares old and new text content, marks differences with colors and outputs to console.
 * Also performs Simplified-to-Traditional conversion comparison, showing differences after conversion.
 *
 * @param {ITextInput} text_old - 原始文字或斷詞結果 / Original text or segmentation result
 * @param {ITextInput} text_new - 新文字或斷詞結果 / New text or segmentation result
 * @returns {Object} 包含比較結果的物件 / Object containing comparison results
 * @returns {string} .text_old - 標準化後的原始文字 / Normalized original text
 * @returns {string} .text_new - 標準化後的新文字 / Normalized new text
 * @returns {boolean} .changed - 是否有變更 / Whether there are changes
 * @returns {string} .text_new2 - 簡轉繁後的新文字 / New text after Simplified-to-Traditional conversion
 */
function printPrettyDiff(text_old, text_new) {
  text_old = crlfNormalize.crlf(stringify.stringify([text_old].flat()));
  text_new = crlfNormalize.crlf(stringify.stringify([text_new].flat()));
  const changed = text_old !== text_new;
  if (changed) {
    debugColor2.console.red(`changed: ${changed}`);
  }
  debugColor2.console.gray("------------------");
  if (changed) {
    debugColor2.console.success(diff_log(text_old, text_new));
  } else {
    debugColor2.console.log(text_new);
  }
  debugColor2.console.gray("------------------");
  const text_new2 = min.cn2tw_min(text_new);
  if (text_new !== text_new2) {
    debugColor2.console.log(diff_log(text_new, text_new2));
    debugColor2.console.gray("------------------");
  }
  return {
    text_old,
    text_new,
    changed,
    text_new2
  };
}
/**
 * 產生差異日誌字串
 * Generate Diff Log String
 *
 * 比較兩個字串的差異，產生帶有色彩標記的字串。
 * 使用 diff 套件進行字元級別的差異比對。
 *
 * Compares two strings and generates a string with color coding.
 * Uses the diff package for character-level diff comparison.
 *
 * @param {string} src_text - 來源文字 / Source text
 * @param {string} new_text - 新文字 / New text
 * @returns {string} 帶有 ANSI 色彩碼的差異字串 / Diff string with ANSI color codes
 */
function diff_log(src_text, new_text) {
  let diff$1 = diff.diffChars(src_text, new_text);
  return debugColor2.chalkByConsole(function (chalk, _console) {
    let diff_arr = diff$1.reduce(function (a, part) {
      let color = part.added ? 'green' : part.removed ? 'red' : 'grey';
      let t = chalk[color](part.value);
      a.push(t);
      return a;
    }, []);
    return diff_arr.join('');
  });
}

exports.default = printPrettyDiff;
exports.diff_log = diff_log;
exports.printPrettyDiff = printPrettyDiff;
//# sourceMappingURL=index.cjs.development.cjs.map
