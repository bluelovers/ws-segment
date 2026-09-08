"use strict";

Object.defineProperty(exports, "__esModule", {
  value: !0
});

var e = require("@novel-segment/loaders/segment/index"), n = require("@novel-segment/loader-line"), t = require("array-hyper-unique");

let i = /*#__PURE__*/ function(e) {
  return e[e.BASE = 0] = "BASE", e[e.COMMENT = 1] = "COMMENT", e[e.COMMENT_TAG = 2] = "COMMENT_TAG", 
  e;
}({});

function handleDictLines(e, n, t) {
  if (!e) return [];
  const {parseFn: i} = t;
  return e.reduce(function(e, t, r) {
    let s, u = {
      data: i(t),
      line: t,
      index: r
    };
    return s = !n || n(e, u), s && e.push(u), e;
  }, []);
}

exports.EnumLineType = i, exports.USE_CJK_MODE = 2, exports.chkLineType = function chkLineType(e) {
  let n = i.BASE;
  return 0 == e.indexOf("//") && (n = i.COMMENT, /^\/\/ +(?:\@todo|格式\:)/i.test(e) && (n = i.COMMENT_TAG)), 
  n;
}, exports.handleDictLines = handleDictLines, exports.loadDictFile = function loadDictFile(t, i, r) {
  const s = (r = r || {}).parseFn = r.parseFn || e.parseLine;
  return n.load(t).then(function(e) {
    return handleDictLines(e, i, {
      parseFn: s
    });
  });
}, exports.stringifyHandleDictLinesList = function stringifyHandleDictLinesList(e, n) {
  let i = e.map(e => e.line);
  return null != n && n.disableUnique ? i : t.array_unique(i);
};
//# sourceMappingURL=index.cjs.production.min.cjs.map
