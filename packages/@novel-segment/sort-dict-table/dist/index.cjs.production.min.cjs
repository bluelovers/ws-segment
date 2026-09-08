"use strict";

Object.defineProperty(exports, "__esModule", {
  value: !0
});

var e = require("@novel-segment/util-compare"), n = require("@novel-segment/loader-line"), t = require("@novel-segment/util"), i = require("@novel-segment/loaders/segment/index");

function sortLines(n, r, o) {
  var s;
  const l = null !== (s = null == o ? void 0 : o.cbIgnore) && void 0 !== s ? s : () => {};
  return SortList(e.handleDictLines(n, function(n, i) {
    i.file = r;
    let [o, s, u] = i.data, p = t.getCjkName(o, e.USE_CJK_MODE);
    return i.cjk_id = p, i.line_type = e.chkLineType(i.line), i.line_type !== e.EnumLineType.COMMENT || (l(i), 
    !1);
  }, {
    parseFn: i.parseLine
  }));
}

function SortList(n) {
  return n.sort(function(n, i) {
    return n.line_type === e.EnumLineType.COMMENT_TAG || i.line_type === e.EnumLineType.COMMENT_TAG || n.line_type === e.EnumLineType.COMMENT || i.line_type === e.EnumLineType.COMMENT ? n.index - i.index : t.zhDictCompare(n.cjk_id, i.cjk_id) || n.index - i.index || 0;
  });
}

exports.SortList = SortList, exports.default = sortLines, exports.loadFile = function loadFile(e, t) {
  return n.load(e).then(n => sortLines(n, e, t));
}, exports.sortLines = sortLines;
//# sourceMappingURL=index.cjs.production.min.cjs.map
