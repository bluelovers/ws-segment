'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var index = require('@novel-segment/loaders/segment/index');
var loaderLine = require('@novel-segment/loader-line');
var arrayHyperUnique = require('array-hyper-unique');

const USE_CJK_MODE = 2;
exports.EnumLineType = void 0;
(function (EnumLineType) {
  EnumLineType[EnumLineType["BASE"] = 0] = "BASE";
  EnumLineType[EnumLineType["COMMENT"] = 1] = "COMMENT";
  EnumLineType[EnumLineType["COMMENT_TAG"] = 2] = "COMMENT_TAG";
})(exports.EnumLineType || (exports.EnumLineType = {}));
/**
 * 將字典行列表轉換為字串陣列
 * Convert Dictionary Line List to String Array
 *
 * 從行資料中提取原始行字串，並可選擇是否進行唯一化處理。
 * Extracts original line strings from row data, with optional uniqueness processing.
 *
 * @template T - 行資料類型，繼承自 ILoadDictFileRow / Row data type, extends ILoadDictFileRow
 * @param {T[]} list - 要處理的行資料陣列 / Array of row data to process
 * @param {object} [options] - 選項物件 / Options object
 * @param {boolean} [options.disableUnique] - 是否停用唯一化處理 / Whether to disable uniqueness processing
 * @returns {string[]} 行字串陣列 / Array of line strings
 */
function stringifyHandleDictLinesList(list, options) {
  let lines = list.map(v => v.line);
  if (options !== null && options !== void 0 && options.disableUnique) {
    return lines;
  }
  return arrayHyperUnique.array_unique(lines);
}
/**
 * 處理字典行資料
 * Handle Dictionary Line Data
 *
 * 將原始字典行資料解析為結構化格式，並可透過回呼函式進行過濾處理。
 * Parses raw dictionary line data into structured format, with optional filtering through callback function.
 *
 * @template T - 行資料類型，繼承自 ILoadDictFileRow / Row data type, extends ILoadDictFileRow
 * @param {IDict} lines - 字典行資料物件 / Dictionary line data object
 * @param {IFnHandleDictLines<T>} fn - 處理每一行的回呼函式，返回 true 保留該行 / Callback function for each line, return true to keep the line
 * @param {IOptionsHandleDictLines<IUnpackRowData<T>>} options - 處理選項，包含解析函式 / Processing options, containing parse function
 * @returns {T[]} 處理後的行資料陣列 / Processed array of row data
 */
function handleDictLines(lines, fn, options) {
  if (!lines) {
    return [];
  }
  const {
    parseFn
  } = options;
  return lines.reduce(function (a, line, index) {
    let bool;
    let data = parseFn(line);
    let cur = {
      data,
      line,
      index
    };
    if (fn) {
      // @ts-ignore
      bool = fn(a, cur);
    } else {
      bool = true;
    }
    if (bool) {
      a.push(cur);
    }
    return a;
  }, []);
}
/**
 * 載入字典檔案
 * Load Dictionary File
 *
 * 非同步載入字典檔案並解析為結構化的行資料陣列。
 * Asynchronously loads a dictionary file and parses it into a structured array of row data.
 *
 * @template T - 行資料類型，繼承自 ILoadDictFileRow / Row data type, extends ILoadDictFileRow
 * @param {string} file - 字典檔案路徑 / Dictionary file path
 * @param {IFnHandleDictLines<T>} [fn] - 處理每一行的回呼函式 / Callback function for processing each line
 * @param {IOptionsHandleDictLinesPartial<IUnpackRowData<T>>} [options] - 處理選項 / Processing options
 * @returns {BluebirdPromise<T[]>} 解析後的行資料陣列 Promise / Promise of parsed row data array
 */
function loadDictFile(file, fn, options) {
  options = options || {};
  // @ts-ignore
  const parseFn = options.parseFn = options.parseFn || index.parseLine;
  return loaderLine.load(file).then(function (b) {
    return handleDictLines(b, fn, {
      parseFn
    });
  });
}
/**
 * 檢查行類型
 * Check Line Type
 *
 * 分析行字串以判斷其類型（基礎行、註解行或標籤註解行）。
 * Analyzes a line string to determine its type (base, comment, or tagged comment).
 *
 * @param {string} line - 要檢查的行字串 / Line string to check
 * @returns {EnumLineType} 行類型列舉值 / Line type enumeration value
 */
function chkLineType(line) {
  let ret = 0 /* EnumLineType.BASE */;
  if (line.indexOf('//') == 0) {
    ret = 1 /* EnumLineType.COMMENT */;
    if (/^\/\/ +(?:\@todo|格式\:)/i.test(line)) {
      ret = 2 /* EnumLineType.COMMENT_TAG */;
    }
  }
  return ret;
}

exports.USE_CJK_MODE = USE_CJK_MODE;
exports.chkLineType = chkLineType;
exports.handleDictLines = handleDictLines;
exports.loadDictFile = loadDictFile;
exports.stringifyHandleDictLinesList = stringifyHandleDictLinesList;
//# sourceMappingURL=index.cjs.development.cjs.map
