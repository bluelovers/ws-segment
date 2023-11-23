'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var utilCompare = require('@novel-segment/util-compare');
var loaderLine = require('@novel-segment/loader-line');
var util = require('@novel-segment/util');
var index = require('@novel-segment/loaders/segment/index');

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
function loadFile(file, options) {
  return loaderLine.load(file).then(lines => sortLines(lines, file, options));
}
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
