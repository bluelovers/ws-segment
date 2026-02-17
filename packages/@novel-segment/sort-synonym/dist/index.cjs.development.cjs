'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var utilCompare = require('@novel-segment/util-compare');
var arrayHyperUnique = require('array-hyper-unique');
var loaderLine = require('@novel-segment/loader-line');
var conv = require('@novel-segment/util/conv');
var sort = require('@novel-segment/util/sort');

/**
 * 排序同義詞行
 * Sort Synonym Lines
 *
 * 將原始同義詞字典行陣列解析、過濾並排序為結構化的同義詞資料。
 * 每行格式為：主詞,同義詞1,同義詞2,...
 *
 * Parses, filters, and sorts raw synonym dictionary line array into structured synonym data.
 * Each line format: main_word,synonym1,synonym2,...
 *
 * @param {string[]} lines - 原始同義詞字典行字串陣列 / Raw synonym dictionary line string array
 * @param {string} [file] - 來源檔案路徑（選填）/ Source file path (optional)
 * @returns {IHandleDictSynonym[]} 排序後的同義詞資料陣列 / Sorted synonym data array
 */
function sortLines(lines, file) {
  const list = utilCompare.handleDictLines(lines, function (list, cur) {
    cur.file = file;
    let [w] = cur.data;
    cur.line_type = utilCompare.chkLineType(cur.line);
    if (cur.line_type === 1 /* EnumLineType.COMMENT */) {
      w = w.replace(/^\/\//, '');
    } else if (cur.line_type === 0 /* EnumLineType.BASE */) {
      let ls = cur.data.slice(1);
      ls = arrayHyperUnique.array_unique(ls).filter(v => v != w);
      ls.sort(function (a, b) {
        let ca = conv.getCjkName(a, utilCompare.USE_CJK_MODE);
        let cb = conv.getCjkName(b, utilCompare.USE_CJK_MODE);
        return sort.zhDictCompare(ca, cb) || sort.zhDictCompare(a, b);
      });
      cur.line = [w].concat(ls).join(',');
      if (!ls.length) {
        return false;
      }
    }
    const cjk_id = conv.getCjkName(w, utilCompare.USE_CJK_MODE);
    cur.cjk_id = cjk_id;
    return true;
  }, {
    parseFn(line) {
      return line.split(',');
    }
  });
  return SortList(list);
}
/**
 * 載入並排序同義詞字典檔案
 * Load and Sort Synonym Dictionary File
 *
 * 非同步載入同義詞字典檔案，並將其內容排序為結構化的同義詞資料。
 * Asynchronously loads a synonym dictionary file and sorts its content into structured synonym data.
 *
 * @param {string} file - 同義詞字典檔案路徑 / Synonym dictionary file path
 * @returns {Promise<IHandleDictSynonym[]>} 排序後的同義詞資料陣列 Promise / Promise of sorted synonym data array
 */
function loadFile(file) {
  return loaderLine.load(file).then(lines => sortLines(lines, file));
}
/**
 * 排序同義詞列表
 * Sort Synonym List
 *
 * 根據 CJK 字元順序及原始索引位置對同義詞資料進行排序。
 * 排序規則：
 * 1. 標籤註解行（COMMENT_TAG）優先處理，@ 開頭的標籤排在前面
 * 2. 一般註解行（COMMENT）依原始索引順序排列
 * 3. 基礎行（BASE）依 CJK 字元順序排序，相同時依原始索引排序
 *
 * Sorts synonym data based on CJK character order and original index position.
 * Sorting rules:
 * 1. Tagged comment lines (COMMENT_TAG) are processed first, @-prefixed tags come first
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
      if (b.line_type !== 2 /* EnumLineType.COMMENT_TAG */) {
        return -1 /* EnumSortCompareOrder.UP */;
      } else if (a.line_type !== 2 /* EnumLineType.COMMENT_TAG */) {
        return 1 /* EnumSortCompareOrder.DOWN */;
      }
      const aa = /^\/\/\s+@/.test(a.line);
      const ba = /^\/\/\s+@/.test(b.line);
      if (aa && !ba) {
        return -1 /* EnumSortCompareOrder.UP */;
      } else if (!aa && ba) {
        return 1 /* EnumSortCompareOrder.DOWN */;
      }
      return a.index - b.index;
    } else if (a.line_type === 1 /* EnumLineType.COMMENT */ && b.line_type === 1 /* EnumLineType.COMMENT */) {
      return a.index - b.index;
    }
    let ret = sort.zhDictCompare(a.cjk_id, b.cjk_id) || sort.zhDictCompare(a.data[0], b.data[0]) || a.index - b.index || 0 /* EnumSortCompareOrder.KEEP */;
    return ret;
  });
}

exports.SortList = SortList;
exports.default = sortLines;
exports.loadFile = loadFile;
exports.sortLines = sortLines;
//# sourceMappingURL=index.cjs.development.cjs.map
