"use strict";

Object.defineProperty(exports, "__esModule", {
  value: !0
});

var e = require("@novel-segment/util-compare"), t = require("array-hyper-unique"), i = require("@novel-segment/loader-line"), n = require("@novel-segment/util/conv"), r = require("@novel-segment/util/sort");

function sortLines(i, o) {
  return SortList(e.handleDictLines(i, function(i, l) {
    l.file = o;
    let [s] = l.data;
    if (l.line_type = e.chkLineType(l.line), 1 === l.line_type) s = s.replace(/^\/\//, ""); else if (0 === l.line_type) {
      let i = l.data.slice(1);
      if (i = t.array_unique(i).filter(e => e != s), i.sort(function(t, i) {
        let o = n.getCjkName(t, e.USE_CJK_MODE), l = n.getCjkName(i, e.USE_CJK_MODE);
        return r.zhDictCompare(o, l) || r.zhDictCompare(t, i);
      }), l.line = [ s ].concat(i).join(","), !i.length) return !1;
    }
    const u = n.getCjkName(s, e.USE_CJK_MODE);
    return l.cjk_id = u, !0;
  }, {
    parseFn: e => e.split(",")
  }));
}

function SortList(e) {
  return e.sort(function(e, t) {
    if (2 === e.line_type || 2 === t.line_type) {
      if (2 !== t.line_type) return -1;
      if (2 !== e.line_type) return 1;
      const i = /^\/\/\s+@/.test(e.line), n = /^\/\/\s+@/.test(t.line);
      return i && !n ? -1 : !i && n ? 1 : e.index - t.index;
    }
    return 1 === e.line_type && 1 === t.line_type ? e.index - t.index : r.zhDictCompare(e.cjk_id, t.cjk_id) || r.zhDictCompare(e.data[0], t.data[0]) || e.index - t.index || 0;
  });
}

exports.SortList = SortList, exports.default = sortLines, exports.loadFile = function loadFile(e) {
  return i.load(e).then(t => sortLines(t, e));
}, exports.sortLines = sortLines;
//# sourceMappingURL=index.cjs.production.min.cjs.map
