import { parseLine as n } from "@novel-segment/loaders/segment/index";

import { load as e } from "@novel-segment/loader-line";

import { array_unique as i } from "array-hyper-unique";

const t = 2;

var r;

function stringifyHandleDictLinesList(n, e) {
  let t = n.map(n => n.line);
  return null != e && e.disableUnique ? t : i(t);
}

function handleDictLines(n, e, i) {
  if (!n) return [];
  const {parseFn: t} = i;
  return n.reduce(function(n, i, r) {
    let o, s = {
      data: t(i),
      line: i,
      index: r
    };
    return o = !e || e(n, s), o && n.push(s), n;
  }, []);
}

function loadDictFile(i, t, r) {
  const o = (r = r || {}).parseFn = r.parseFn || n;
  return e(i).then(function(n) {
    return handleDictLines(n, t, {
      parseFn: o
    });
  });
}

function chkLineType(n) {
  let e = 0;
  return 0 == n.indexOf("//") && (e = 1, /^\/\/ +(?:\@todo|格式\:)/i.test(n) && (e = 2)), 
  e;
}

!function(n) {
  n[n.BASE = 0] = "BASE", n[n.COMMENT = 1] = "COMMENT", n[n.COMMENT_TAG = 2] = "COMMENT_TAG";
}(r || (r = {}));

export { r as EnumLineType, t as USE_CJK_MODE, chkLineType, handleDictLines, loadDictFile, stringifyHandleDictLinesList };
//# sourceMappingURL=index.esm.mjs.map
