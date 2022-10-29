'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var utilCompare = require('@novel-segment/util-compare');
var arrayHyperUnique = require('array-hyper-unique');
var loaderLine = require('@novel-segment/loader-line');
var conv = require('@novel-segment/util/conv');
var sort = require('@novel-segment/util/sort');

function sortLines(lines, file) {
  const list = utilCompare.handleDictLines(lines, function (list, cur) {
    cur.file = file;
    let [w] = cur.data;
    cur.line_type = utilCompare.chkLineType(cur.line);
    if (cur.line_type === 1) {
      w = w.replace(/^\/\//, '');
    } else if (cur.line_type === 0) {
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
function loadFile(file) {
  return loaderLine.load(file).then(lines => sortLines(lines, file));
}
function SortList(ls) {
  return ls.sort(function (a, b) {
    if (a.line_type === 2 || b.line_type === 2) {
      if (b.line_type !== 2) {
        return -1;
      } else if (a.line_type !== 2) {
        return 1;
      }
      const aa = /^\/\/\s+@/.test(a.line);
      const ba = /^\/\/\s+@/.test(b.line);
      if (aa && !ba) {
        return -1;
      } else if (!aa && ba) {
        return 1;
      }
      return a.index - b.index;
    } else if (a.line_type === 1 && b.line_type === 1) {
      return a.index - b.index;
    }
    let ret = sort.zhDictCompare(a.cjk_id, b.cjk_id) || sort.zhDictCompare(a.data[0], b.data[0]) || a.index - b.index || 0;
    return ret;
  });
}

exports.SortList = SortList;
exports.default = sortLines;
exports.loadFile = loadFile;
exports.sortLines = sortLines;
//# sourceMappingURL=index.cjs.development.cjs.map
