"use strict";

Object.defineProperty(exports, "__esModule", {
  value: !0
});

var e = require("@novel-segment/util-compare"), n = require("array-hyper-unique"), t = require("@novel-segment/loader-line"), r = require("@novel-segment/util/conv"), i = require("@novel-segment/util/sort");

function sortLines(t, o) {
  return SortList(e.handleDictLines(t, function(t, u) {
    u.file = o;
    let [l] = u.data;
    if (u.line_type = e.chkLineType(u.line), u.line_type === e.EnumLineType.COMMENT) l = l.replace(/^\/\//, ""); else if (u.line_type === e.EnumLineType.BASE) {
      let t = u.data.slice(1);
      if (t = n.array_unique(t).filter(e => e != l), t.sort(function(n, t) {
        let o = r.getCjkName(n, e.USE_CJK_MODE), u = r.getCjkName(t, e.USE_CJK_MODE);
        return i.zhDictCompare(o, u) || i.zhDictCompare(n, t);
      }), u.line = [ l ].concat(t).join(","), !t.length) return !1;
    }
    const s = r.getCjkName(l, e.USE_CJK_MODE);
    return u.cjk_id = s, !0;
  }, {
    parseFn: e => e.split(",")
  }));
}

function SortList(n) {
  return n.sort(function(n, t) {
    if (n.line_type === e.EnumLineType.COMMENT_TAG || t.line_type === e.EnumLineType.COMMENT_TAG) {
      if (t.line_type !== e.EnumLineType.COMMENT_TAG) return i.EnumSortCompareOrder.UP;
      if (n.line_type !== e.EnumLineType.COMMENT_TAG) return i.EnumSortCompareOrder.DOWN;
      const r = /^\/\/\s+@/.test(n.line), o = /^\/\/\s+@/.test(t.line);
      return r && !o ? i.EnumSortCompareOrder.UP : !r && o ? i.EnumSortCompareOrder.DOWN : n.index - t.index;
    }
    return n.line_type === e.EnumLineType.COMMENT && t.line_type === e.EnumLineType.COMMENT ? n.index - t.index : i.zhDictCompare(n.cjk_id, t.cjk_id) || i.zhDictCompare(n.data[0], t.data[0]) || n.index - t.index || i.EnumSortCompareOrder.KEEP;
  });
}

exports.SortList = SortList, exports.default = sortLines, exports.loadFile = function loadFile(e) {
  return t.load(e).then(n => sortLines(n, e));
}, exports.sortLines = sortLines;
//# sourceMappingURL=index.cjs.production.min.cjs.map
