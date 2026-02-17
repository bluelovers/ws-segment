'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var utilCompare = require('@novel-segment/util-compare');
var loaderLine = require('@novel-segment/loader-line');
var util = require('@novel-segment/util');
var index = require('@novel-segment/loaders/segment/index');

/**
 * 排序字典行
 * Sort Dictionary Lines
 *
 * 將原始字典行陣列解析、過濾並排序為結構化的字典表格資料。
 * Parses, filters, and sorts raw dictionary line array into structured dictionary table data.
 *
 * @param {string[]} lines - 原始字典行字串陣列 / Raw dictionary line string array
 * @param {string} [file] - 來源檔案路徑（選填）/ Source file path (optional)
 * @param {IOptions} [options] - 排序選項 / Sort options
 * @returns {IHandleDictTable[]} 排序後的字典表格資料陣列 / Sorted dictionary table data array
 */
function sortLines(lines, file, options) {
  var _options$cbIgnore;
  const cbIgnore = (_options$cbIgnore = options === null || options === void 0 ? void 0 : options.cbIgnore) !== null && _options$cbIgnore !== void 0 ? _options$cbIgnore : () => {};
  const list = utilCompare.handleDictLines(lines, function (list, cur) {
    cur.file = file;
    let [w, p, f] = cur.data;
    let cjk_id = util.getCjkName(w, utilCompare.USE_CJK_MODE);
    cur.cjk_id = cjk_id;
    cur.line_type = utilCompare.chkLineType(cur.line);
    if (cur.line_type === 1 /* EnumLineType.COMMENT */) {
      cbIgnore(cur);
      return false;
    }
    return true;
  }, {
    // @ts-ignore
    parseFn: index.parseLine
  });
  return SortList(list);
}
/**
 * 載入並排序字典檔案
 * Load and Sort Dictionary File
 *
 * 非同步載入字典檔案，並將其內容排序為結構化的字典表格資料。
 * Asynchronously loads a dictionary file and sorts its content into structured dictionary table data.
 *
 * @param {string} file - 字典檔案路徑 / Dictionary file path
 * @param {IOptions} [options] - 排序選項 / Sort options
 * @returns {Promise<IHandleDictTable[]>} 排序後的字典表格資料陣列 Promise / Promise of sorted dictionary table data array
 */
function loadFile(file, options) {
  return loaderLine.load(file).then(lines => sortLines(lines, file, options));
}
/**
 * 排序字典表格列表
 * Sort Dictionary Table List
 *
 * 根據 CJK 字元順序及原始索引位置對字典表格資料進行排序。
 * 排序規則：
 * 1. 標籤註解行（COMMENT_TAG）依原始索引順序排列
 * 2. 一般註解行（COMMENT）依原始索引順序排列
 * 3. 基礎行（BASE）依 CJK 字元順序排序，相同時依原始索引排序
 *
 * Sorts dictionary table data based on CJK character order and original index position.
 * Sorting rules:
 * 1. Tagged comment lines (COMMENT_TAG) are ordered by original index
 * 2. Regular comment lines (COMMENT) are ordered by original index
 * 3. Base lines (BASE) are sorted by CJK character order, with original index as tiebreaker
 *
 * @template T - 行資料類型，繼承自 ILoadDictFileRow2 / Row data type, extends ILoadDictFileRow2
 * @param {T[]} ls - 待排序的列表 / List to be sorted
 * @returns {T[]} 排序後的列表 / Sorted list
 */
function SortList(ls) {
  return ls.sort(function (a, b) {
    if (a.line_type === 2 /* EnumLineType.COMMENT_TAG */ || b.line_type === 2 /* EnumLineType.COMMENT_TAG */) {
      return a.index - b.index;
    } else if (a.line_type === 1 /* EnumLineType.COMMENT */ || b.line_type === 1 /* EnumLineType.COMMENT */) {
      return a.index - b.index;
    }
    let ret = util.zhDictCompare(a.cjk_id, b.cjk_id) || a.index - b.index || 0;
    return ret;
  });
}

exports.SortList = SortList;
exports.default = sortLines;
exports.loadFile = loadFile;
exports.sortLines = sortLines;
//# sourceMappingURL=index.cjs.development.cjs.map
