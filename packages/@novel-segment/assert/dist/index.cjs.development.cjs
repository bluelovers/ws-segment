'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var util = require('util');
var assert = require('assert');

/**
 * 斷言工具模組
 * Assertion Utility Module
 *
 * 提供用於測試斷詞結果的匹配 (Lazy Match) 功能。
 * 支援有序匹配、多重選項匹配及同義詞匹配等測試場景。
 *
 * Provides lazy match functionality for testing word segmentation results.
 * Supports ordered matching, multi-option matching, and synonym matching test scenarios.
 *
 * @module @novel-segment/assert
 */
/**
 * 處理匹配選項
 * Handle Lazy Match Options
 *
 * 將傳入的選項參數進行標準化處理，填補預設值。
 * Normalizes the passed options and fills in default values.
 *
 * @param {IOptionsLazyMatch} [options={}] - 匹配選項 / Lazy match options
 * @returns {Required<IOptionsLazyMatch>} 標準化後的選項 / Normalized options
 */
function _handleLazyMatchOptions(options = {}) {
  var _options$inspectFn;
  options !== null && options !== void 0 ? options : options = {};
  return {
    ...options,
    inspectFn: (_options$inspectFn = options.inspectFn) !== null && _options$inspectFn !== void 0 ? _options$inspectFn : util.inspect
  };
}
/**
 * 有序匹配核心函數
 * Lazy Ordered Match Core Function
 *
 * 驗證斷詞結果是否按順序包含指定的詞彙，並回傳匹配結果與失敗詞彙。
 * 此函數為 lazyMatch 的核心實作，支援 notThrowError 選項。
 *
 * Verifies if segmentation results contain specified words in order,
 * and returns match result with failed words.
 * This is the core implementation of lazyMatch, supporting notThrowError option.
 *
 * @param {string[]} a - 斷詞結果陣列 / Segmentation result array
 * @param {string[] | (string | string[])[]} b - 預期包含的詞彙 / Expected words
 * @param {IOptionsLazyMatch} [options={}] - 匹配選項 / Match options
 * @returns {ILazyMatchCoreResult} 匹配結果與失敗詞彙 / Match result with failed words
 */
function _lazyMatchCore(a, b, options = {}) {
  let i = null;
  const {
    firstOne
  } = _handleLazyMatchOptions(options);
  const failedWords = [];
  let bool = b.every(function (value, index, array) {
    let j = -1;
    let ii = i;
    if (i == null) {
      i = -1;
    }
    if (Array.isArray(value)) {
      if (firstOne) {
        value.some(function (bb) {
          let jj = a.indexOf(bb, ii);
          if (jj > -1 && jj > i) {
            j = jj;
            return true;
          }
        });
      } else {
        j = value.reduce(function (aa, bb) {
          let jj = a.indexOf(bb, ii);
          if (jj > -1 && jj > i) {
            if (aa == -1) {
              return jj;
            }
            return Math.min(jj, aa);
          }
          return aa;
        }, -1);
      }
    } else {
      j = a.indexOf(value, ii);
    }
    if (j > -1 && j > i) {
      i = j;
      return true;
    } else {
      failedWords.push(Array.isArray(value) ? value.join('/') : value);
      return false;
    }
  });
  if (i === -1) {
    bool = false;
  }
  return {
    matched: bool,
    failedWords
  };
}
/**
 * 有序匹配
 * Lazy Ordered Match
 *
 * 分析後應該要符合以下結果，驗證斷詞結果是否按順序包含指定的詞彙。
 * 適用於測試斷詞器是否正確識別並排序關鍵詞。
 *
 * 此函數採用貪心匹配策略，從左到右依次查找每個預期詞彙，
 * 並確保每個詞彙出現在陣列中的位置是遞增的。
 *
 * After analysis, should match the following result.
 * Verifies if segmentation results contain specified words in order.
 * Suitable for testing if the segmenter correctly identifies and orders keywords.
 *
 * This function uses a greedy matching strategy, iterating through each expected word
 * from left to right and ensuring each word appears at an increasing position in the array.
 *
 * @example
 * // 基本用法 / Basic usage
 * const result = ['胡锦涛', '出席', 'APEC', '领导人', '会议', '后', '回京'];
 * lazyMatch(result, ['会议', '回京']); // true
 *
 * @example
 * // 多選一用法 / Multiple choices
 * const result = ['在', '這裡', '有', '兩具', '自動', '人偶', '隨侍', '在', '側', '的', '烏列爾'];
 * lazyMatch(result, [['會議', '议'], '回京']); // 支援混合陣列
 *
 * @example
 * // 使用 notThrowError 選項 / Using notThrowError option
 * const result = lazyMatch(['a', 'b'], ['c'], { notThrowError: true });
 * // result: { matched: false, failedWords: ['c'] }
 *
 * @see lazyMatch002 - 用於多組結果的匹配
 * @see lazyMatchNot - 用於反向匹配（不應包含）
 * @see _lazyMatchCore - 核心函數，回傳失敗詞彙
 * @throws {AssertionError} 當匹配失敗時拋出 / Throws when match fails
 *
 * @param {string[]} a - 斷詞結果陣列 / Segmentation result array
 * @param {string[] | (string | string[])[]} b - 預期包含的詞彙（支援陣列表示多選一）/ Expected words (array for multiple choices)
 * @param {IOptionsLazyMatch} [options={}] - 匹配選項 / Match options
 * @returns {boolean | ILazyMatchCoreResult} 是否匹配成功，或完整結果物件 / Whether match succeeded, or full result object
 */
function lazyMatch(a, b, options = {}) {
  const {
    inspectFn,
    notThrowError
  } = _handleLazyMatchOptions(options);
  const result = _lazyMatchCore(a, b, options);
  if (notThrowError) {
    return result;
  }
  !result.matched && assert.fail(`expected ${inspectFn(a)} to have includes ordered members ${inspectFn(b)}`);
  return result.matched;
}
/**
 * 多選匹配
 * Lazy Multi-Choice Match
 *
 * 分析後應該要符合以下其中一個結果。
 * 適用於測試同一句子的多種可能斷詞結果。
 *
 * 此函數會逐一嘗試每組預期結果，直到找到匹配為止。
 * 如果所有組合都不匹配，則拋出錯誤。
 *
 * After analysis, should match one of the following results.
 * Suitable for testing multiple possible segmentation results of the same sentence.
 *
 * This function tries each expected result set in order until a match is found.
 * If no combination matches, an error is thrown.
 *
 * @example
 * // 基本用法 / Basic usage
 * const result = ['在', '這裡', '有', '兩具', '自動', '人偶', '隨侍', '在', '側', '的', '烏列爾'];
 * lazyMatch002(result, [
 *   ['兩具', '自動', '人偶', '隨侍'],
 *   ['兩具', '自動人偶', '隨侍']
 * ]); // true - 兩種組合都接受
 *
 * @see lazyMatch - 用於單一結果的匹配
 * @see lazyMatchNot - 用於反向匹配
 * @throws {AssertionError} 當所有組合都不匹配時拋出 / Throws when no combination matches
 *
 * @param {string[]} a - 斷詞結果陣列 / Segmentation result array
 * @param {Parameters<typeof lazyMatch>['1'][]} b_arr - 多組預期結果陣列 / Multiple expected result arrays
 * @param {IOptionsLazyMatch} [options={}] - 匹配選項 / Match options
 */
function lazyMatch002(a, b_arr, options = {}) {
  let bool;
  options = _handleLazyMatchOptions(options);
  let result;
  let entryIndex = -1;
  for (let b of b_arr) {
    result = _lazyMatchCore(a, b, options);
    bool = result.matched;
    entryIndex++;
    if (bool) {
      break;
    }
  }
  if (options.notThrowError) {
    let entryMatched;
    if (bool) {
      entryMatched = entryIndex >= 0 && b_arr[entryIndex];
    } else {
      entryIndex = -1;
    }
    return {
      ...result,
      entryIndex,
      entryMatched
    };
  }
  !bool && assert.fail(`expected ${options.inspectFn(a)} to have includes one of ordered members in ${options.inspectFn(b_arr)}`);
  return bool;
}
/**
 * 同義詞匹配核心函數
 * Lazy Synonym Match Core Function
 *
 * 驗證同義詞轉換後的字串是否包含預期的詞彙，並回傳匹配結果與失敗詞彙。
 * 此函數為 lazyMatchSynonym001 的核心實作，支援 notThrowError 選項。
 *
 * Verifies if the string after synonym transformation contains expected words,
 * and returns match result with failed words.
 * This is the core implementation of lazyMatchSynonym001, supporting notThrowError option.
 *
 * @param {string} a - 轉換後的字串 / Transformed string
 * @param {(string | string[])[]} b_arr - 預期包含的詞彙 / Expected words to contain
 * @param {IOptionsLazyMatch} [options={}] - 匹配選項 / Match options
 * @returns {ILazyMatchCoreResult} 匹配結果與失敗詞彙 / Match result with failed words
 */
function _lazyMatchSynonym001Core(a, b_arr, options = {}) {
  let i = undefined;
  const failedWords = [];
  let bool = b_arr.every(function (bb) {
    let ii = i;
    if (i == null) {
      i = -1;
    }
    let j = -1;
    let matchedWord = null;
    if (Array.isArray(bb)) {
      bb.some(v => {
        let jj = a.indexOf(v, ii);
        if (jj > -1) {
          j = jj;
          matchedWord = v;
          return true;
        }
      });
    } else {
      j = a.indexOf(bb, ii);
      matchedWord = bb;
    }
    if (j > -1 && j >= i) {
      var _matchedWord;
      i = j + (((_matchedWord = matchedWord) === null || _matchedWord === void 0 ? void 0 : _matchedWord.length) || 0);
      return true;
    } else {
      failedWords.push(Array.isArray(bb) ? bb.join('/') : bb);
      return false;
    }
  });
  if (i === -1) {
    bool = false;
  }
  return {
    matched: bool,
    failedWords
  };
}
/**
 * 同義詞匹配
 * Lazy Synonym Match
 *
 * 分析轉換後應該要具有以下字詞。
 * 用於驗證同義詞轉換後的字串是否包含預期的詞彙。
 *
 * 與 lazyMatch 不同，此函數操作於字串而非陣列，
 * 並且在匹配時會跳過已匹配的詞彙長度（基於字元位置而非陣列索引）。
 *
 * After analysis and transformation, should have the following words.
 * Used to verify if the string after synonym transformation contains expected words.
 *
 * Unlike lazyMatch, this function operates on a string rather than an array,
 * and when matching, it skips the length of matched words (based on character position, not array index).
 *
 * @example
 * // 基本用法 / Basic usage
 * const transformed = '大家干的好'; // 原始: '大家幹的好'
 * lazyMatchSynonym001(transformed, ['幹']); // true
 *
 * @example
 * // 多選一用法 / Multiple choices
 * lazyMatchSynonym001('大家干的好', [['幹', '干']]); // true - 兩者皆可
 *
 * @example
 * // 使用 notThrowError 選項 / Using notThrowError option
 * const result = lazyMatchSynonym001('abc', ['d'], { notThrowError: true });
 * // result: { matched: false, failedWords: ['d'] }
 *
 * @see lazyMatchSynonym001Not - 用於反向匹配（不應包含）
 * @see _lazyMatchSynonym001Core - 核心函數，回傳失敗詞彙
 * @throws {AssertionError} 當匹配失敗時拋出 / Throws when match fails
 *
 * @param {string} a - 轉換後的字串 / Transformed string
 * @param {(string | string[])[]} b_arr - 預期包含的詞彙 / Expected words to contain
 * @param {IOptionsLazyMatch} [options={}] - 匹配選項 / Match options
 * @returns {boolean | ILazyMatchCoreResult} 是否匹配成功，或完整結果物件 / Whether match succeeded, or full result object
 */
function lazyMatchSynonym001(a, b_arr, options = {}) {
  const {
    inspectFn,
    notThrowError
  } = _handleLazyMatchOptions(options);
  const result = _lazyMatchSynonym001Core(a, b_arr, options);
  if (notThrowError) {
    return result;
  }
  !result.matched && assert.fail(`expected ${inspectFn(a)} to have index of ordered members in ${inspectFn(b_arr)}`);
  return result.matched;
}
/**
 * 同義詞反向匹配核心函數
 * Lazy Synonym Negative Match Core Function
 *
 * 驗證同義詞轉換後的字串不應包含特定的詞彙，並回傳匹配結果與失敗詞彙。
 * 此函數為 lazyMatchSynonym001Not 的核心實作，支援 notThrowError 選項。
 *
 * Verifies that the string after synonym transformation does not contain specific words,
 * and returns match result with failed words (words found that should not exist).
 * This is the core implementation of lazyMatchSynonym001Not, supporting notThrowError option.
 *
 * @param {string} a - 轉換後的字串 / Transformed string
 * @param {(string | string[])[]} b_arr - 不應包含的詞彙 / Words that should not be contained
 * @param {IOptionsLazyMatch} [options={}] - 匹配選項 / Match options
 * @returns {ILazyMatchNotCoreResult} 匹配結果與失敗詞彙 / Match result with failed words
 */
function _lazyMatchSynonym001NotCore(a, b_arr, options = {}) {
  let i = undefined;
  const failedWords = [];
  let bool = b_arr.every(function (bb) {
    let ii = i;
    if (i == null) {
      i = -1;
    }
    let j = -1;
    if (Array.isArray(bb)) {
      bb.some(v => {
        let jj = a.indexOf(v, ii);
        if (jj > -1) {
          j = jj;
          return true;
        }
      });
    } else {
      j = a.indexOf(bb, ii);
    }
    if (j > -1 && j > i) {
      failedWords.push(Array.isArray(bb) ? bb.join('/') : bb);
      return false;
    } else {
      i++;
      return true;
    }
  });
  return {
    matched: bool,
    failedWords
  };
}
/**
 * 同義詞反向匹配
 * Lazy Synonym Negative Match
 *
 * 分析轉換後不應該具有以下字詞。
 * 用於驗證同義詞轉換後的字串不應包含特定的詞彙。
 *
 * 此函數是 lazyMatchSynonym001 的反向版本，
 * 用於確保轉換後的字串不包含特定的同義詞。
 *
 * After analysis and transformation, should NOT have the following words.
 * Used to verify that the string after synonym transformation does not contain specific words.
 *
 * This function is the reverse version of lazyMatchSynonym001,
 * used to ensure the transformed string does not contain specific synonyms.
 *
 * @example
 * // 基本用法 / Basic usage
 * const transformed = '那是里靈魂的世界。';
 * lazyMatchSynonym001Not(transformed, ['裡']); // true - 不應包含 '裡'
 *
 * @example
 * // 多選一用法 / Multiple choices
 * lazyMatchSynonym001Not('那是里靈魂的世界。', [['裡', '里']]); // true - 兩者都不應包含
 *
 * @example
 * // 使用 notThrowError 選項 / Using notThrowError option
 * const result = lazyMatchSynonym001Not('abc', ['a'], { notThrowError: true });
 * // result: { matched: false, failedWords: ['a'] }
 *
 * @see lazyMatchSynonym001 - 用於正向匹配（應該包含）
 * @see _lazyMatchSynonym001NotCore - 核心函數，回傳失敗詞彙
 * @throws {AssertionError} 當找到不應有的詞彙時拋出 / Throws when finding unexpected words
 *
 * @param {string} a - 轉換後的字串 / Transformed string
 * @param {(string | string[])[]} b_arr - 不應包含的詞彙 / Words that should not be contained
 * @param {IOptionsLazyMatch} [options={}] - 匹配選項 / Match options
 * @returns {boolean | ILazyMatchNotCoreResult} 是否通過測試，或完整結果物件 / Whether test passed, or full result object
 */
function lazyMatchSynonym001Not(a, b_arr, options = {}) {
  const {
    inspectFn,
    notThrowError
  } = _handleLazyMatchOptions(options);
  const result = _lazyMatchSynonym001NotCore(a, b_arr, options);
  if (notThrowError) {
    return result;
  }
  !result.matched && assert.fail(`expected ${inspectFn(a)} to not have index of ordered members in ${inspectFn(b_arr)}`);
  return result.matched;
}
/**
 * 反向匹配核心函數
 * Lazy Negative Match Core Function
 *
 * 驗證斷詞結果不應按順序包含指定的詞彙組合，並回傳匹配結果與失敗詞彙。
 * 此函數為 lazyMatchNot 的核心實作，支援 notThrowError 選項。
 *
 * Verifies that segmentation results should not contain specified word combinations in order,
 * and returns match result with failed words (words found that should not exist).
 * This is the core implementation of lazyMatchNot, supporting notThrowError option.
 *
 * @param {string[]} a - 斷詞結果陣列 / Segmentation result array
 * @param {string[] | (string | string[])[]} b - 不應包含的詞彙組合 / Word combinations that should not be contained
 * @param {IOptionsLazyMatch} [options={}] - 匹配選項 / Match options
 * @returns {ILazyMatchNotCoreResult} 匹配結果與失敗詞彙 / Match result with failed words
 */
function _lazyMatchNotCore(a, b, options = {}) {
  let i = null;
  const {
    firstOne
  } = _handleLazyMatchOptions(options);
  const failedWords = [];
  let bool = b.every(function (value, index, array) {
    let j = -1;
    let ii = i;
    if (i == null) {
      i = -1;
    }
    if (Array.isArray(value)) {
      if (firstOne) {
        value.some(function (bb) {
          let jj = a.indexOf(bb, ii);
          if (jj > -1 && jj > i) {
            j = jj;
            return true;
          }
        });
      } else {
        j = value.reduce(function (aa, bb) {
          let jj = a.indexOf(bb, ii);
          if (jj > -1 && jj > i) {
            if (aa == -1) {
              return jj;
            }
            return Math.min(jj, aa);
          }
          return aa;
        }, -1);
      }
    } else {
      j = a.indexOf(value, ii);
    }
    if (j > -1) {
      i = j;
      failedWords.push(Array.isArray(value) ? value.join('/') : value);
      return false;
    } else {
      return true;
    }
  });
  if (i === -1) {
    bool = true;
  }
  return {
    matched: bool,
    failedWords
  };
}
/**
 * 反向匹配
 * Lazy Negative Match
 *
 * 分析後不應該存在符合以下結果。
 * 用於驗證斷詞結果不應按順序包含指定的詞彙組合。
 *
 * 此函數是 lazyMatch 的反向版本，用於確保斷詞結果
 * 不按順序包含指定的詞彙組合。
 *
 * After analysis, should NOT have the following result.
 * Used to verify that segmentation results should not contain specified word combinations in order.
 *
 * This function is the reverse version of lazyMatch, used to ensure that
 * segmentation results do not contain specified word combinations in order.
 *
 * @example用法 / Basic usage
 * const result = ['這', '份', '毫不', '守舊', '的', '率直'];
 * lazyMatchNot(result, ['份', '毫']); // true - 不應按順序出現
 *
 * @example
 * // 多選一用法 / Multiple choices
 * lazyMatchNot(['這', '份', '毫不', '守舊', '的', '率直'], [['份毫', '份', '毫']]); // true
 *
 * @example
 * // 使用 notThrowError 選項 / Using notThrowError option
 * const result = lazyMatchNot(['a', 'b', 'c'], ['a', 'b'], { notThrowError: true });
 * // result: { matched: false, failedWords: ['a', 'b'] }
 *
 * @see lazyMatch - 用於正向匹配（應該包含）
 * @see lazyMatch002 - 用於多組結果的匹配
 * @see _lazyMatchNotCore - 核心函數，回傳失敗詞彙
 * @throws {AssertionError} 當找到不應有的組合時拋出 / Throws when finding unexpected combinations
 *
 * @param {string[]} a - 斷詞結果陣列 / Segmentation result array
 * @param {string[] | (string | string[])[]} b - 不應包含的詞彙組合 / Word combinations that should not be contained
 * @param {IOptionsLazyMatch} [options={}] - 匹配選項 / Match options
 * @returns {boolean | ILazyMatchNotCoreResult} 是否通過測試，或完整結果物件 / Whether test passed, or full result object
 */
function lazyMatchNot(a, b, options = {}) {
  const {
    inspectFn,
    notThrowError
  } = _handleLazyMatchOptions(options);
  const result = _lazyMatchNotCore(a, b, options);
  if (notThrowError) {
    return result;
  }
  !result.matched && assert.fail(`expected ${inspectFn(a)} should not have includes ordered members ${inspectFn(b)}`);
  return result.matched;
}

exports._handleLazyMatchOptions = _handleLazyMatchOptions;
exports._lazyMatchCore = _lazyMatchCore;
exports._lazyMatchNotCore = _lazyMatchNotCore;
exports._lazyMatchSynonym001Core = _lazyMatchSynonym001Core;
exports._lazyMatchSynonym001NotCore = _lazyMatchSynonym001NotCore;
exports.lazyMatch = lazyMatch;
exports.lazyMatch002 = lazyMatch002;
exports.lazyMatchNot = lazyMatchNot;
exports.lazyMatchSynonym001 = lazyMatchSynonym001;
exports.lazyMatchSynonym001Not = lazyMatchSynonym001Not;
//# sourceMappingURL=index.cjs.development.cjs.map
