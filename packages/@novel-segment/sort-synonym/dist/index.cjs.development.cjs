'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var utilCompare = require('@novel-segment/util-compare');
var arrayHyperUnique = require('array-hyper-unique');
var loaderLine = require('@novel-segment/loader-line');
var util = require('@novel-segment/util');

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
        let ca = util.getCjkName(a, utilCompare.USE_CJK_MODE);
        let cb = util.getCjkName(b, utilCompare.USE_CJK_MODE);
        return util.zhDictCompare(ca, cb) || util.zhDictCompare(a, b);
      });
      cur.line = [w].concat(ls).join(',');

      if (!ls.length) {
        return false;
      }
    }

    const cjk_id = util.getCjkName(w, utilCompare.USE_CJK_MODE);
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

      let aa = /^\/\/\s+@/.test(a.line);
      let ba = /^\/\/\s+@/.test(b.line);

      if (aa || ba) {
        if (!ba) {
          return -1;
        } else if (!aa) {
          return 1;
        }
      }

      return a.index - b.index;
    } else if (a.line_type === 1 && b.line_type === 1) {
      return a.index - b.index;
    }

    let ret = util.zhDictCompare(a.cjk_id, b.cjk_id) || util.zhDictCompare(b.data[0], a.data[0]) || a.index - b.index || 0;
    return ret;
  });
}

exports.SortList = SortList;
exports["default"] = sortLines;
exports.loadFile = loadFile;
exports.sortLines = sortLines;
//# sourceMappingURL=index.cjs.development.cjs.map
