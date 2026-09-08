import { parseLine as n } from "@novel-segment/loaders/segment/index";

import { load as e } from "@novel-segment/loader-line";

import { array_unique as t } from "array-hyper-unique";

const i = 2;

let r = /*#__PURE__*/ function(n) {
  return n[n.BASE = 0] = "BASE", n[n.COMMENT = 1] = "COMMENT", n[n.COMMENT_TAG = 2] = "COMMENT_TAG", 
  n;
}({});

function stringifyHandleDictLinesList(n, e) {
  let i = n.map(n => n.line);
  return null != e && e.disableUnique ? i : t(i);
}

function handleDictLines(n, e, t) {
  if (!n) return [];
  const {parseFn: i} = t;
  return n.reduce(function(n, t, r) {
    let o, l = {
      data: i(t),
      line: t,
      index: r
    };
    return o = !e || e(n, l), o && n.push(l), n;
  }, []);
}

function loadDictFile(t, i, r) {
  const o = (r = r || {}).parseFn = r.parseFn || n;
  return e(t).then(function(n) {
    return handleDictLines(n, i, {
      parseFn: o
    });
  });
}

function chkLineType(n) {
  let e = r.BASE;
  return 0 == n.indexOf("//") && (e = r.COMMENT, /^\/\/ +(?:\@todo|格式\:)/i.test(n) && (e = r.COMMENT_TAG)), 
  e;
}

export { r as EnumLineType, i as USE_CJK_MODE, chkLineType, handleDictLines, loadDictFile, stringifyHandleDictLinesList };
//# sourceMappingURL=index.esm.mjs.map
