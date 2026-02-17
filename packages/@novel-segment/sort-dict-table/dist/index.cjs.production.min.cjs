"use strict";

Object.defineProperty(exports, "__esModule", {
  value: !0
});

var e = require("@novel-segment/util-compare"), t = require("@novel-segment/loader-line"), n = require("@novel-segment/util"), i = require("@novel-segment/loaders/segment/index");

function sortLines(t, r, o) {
  var s;
  const l = null !== (s = null == o ? void 0 : o.cbIgnore) && void 0 !== s ? s : () => {};
  return SortList(e.handleDictLines(t, function(t, i) {
    i.file = r;
    let [o, s, u] = i.data, d = n.getCjkName(o, e.USE_CJK_MODE);
    return i.cjk_id = d, i.line_type = e.chkLineType(i.line), 1 !== i.line_type || (l(i), 
    !1);
  }, {
    parseFn: i.parseLine
  }));
}

function SortList(e) {
  return e.sort(function(e, t) {
    return 2 === e.line_type || 2 === t.line_type || 1 === e.line_type || 1 === t.line_type ? e.index - t.index : n.zhDictCompare(e.cjk_id, t.cjk_id) || e.index - t.index || 0;
  });
}

exports.SortList = SortList, exports.default = sortLines, exports.loadFile = function loadFile(e, n) {
  return t.load(e).then(t => sortLines(t, e, n));
}, exports.sortLines = sortLines;
//# sourceMappingURL=index.cjs.production.min.cjs.map
