import { handleDictLines as e, USE_CJK_MODE as n, chkLineType as t } from "@novel-segment/util-compare";

import { load as i } from "@novel-segment/loader-line";

import { getCjkName as o, zhDictCompare as r } from "@novel-segment/util";

import { parseLine as l } from "@novel-segment/loaders/segment/index";

function sortLines(i, r, s) {
  var d;
  const u = null !== (d = null == s ? void 0 : s.cbIgnore) && void 0 !== d ? d : () => {};
  return SortList(e(i, function(e, i) {
    i.file = r;
    let [l, s, d] = i.data, m = o(l, n);
    return i.cjk_id = m, i.line_type = t(i.line), 1 !== i.line_type || (u(i), !1);
  }, {
    parseFn: l
  }));
}

function loadFile(e, n) {
  return i(e).then(t => sortLines(t, e, n));
}

function SortList(e) {
  return e.sort(function(e, n) {
    return 2 === e.line_type || 2 === n.line_type || 1 === e.line_type || 1 === n.line_type ? e.index - n.index : r(e.cjk_id, n.cjk_id) || e.index - n.index || 0;
  });
}

export { SortList, sortLines as default, loadFile, sortLines };
//# sourceMappingURL=index.esm.mjs.map
