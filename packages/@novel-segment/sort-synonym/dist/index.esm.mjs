import { handleDictLines as e, chkLineType as t, USE_CJK_MODE as n } from "@novel-segment/util-compare";

import { array_unique as i } from "array-hyper-unique";

import { load as r } from "@novel-segment/loader-line";

import { getCjkName as o, zhDictCompare as l } from "@novel-segment/util";

function sortLines(r, s) {
  return SortList(e(r, (function(e, r) {
    r.file = s;
    let [a] = r.data;
    if (r.line_type = t(r.line), 1 == r.line_type) a = a.replace(/^\/\//, ""); else if (0 == r.line_type) {
      let e = r.data.slice(1);
      if (e = i(e).filter((e => e != a)), e.sort((function(e, t) {
        let i = o(e, n), r = o(t, n);
        return l(i, r) || l(e, t);
      })), r.line = [ a ].concat(e).join(","), !e.length) return !1;
    }
    const u = o(a, n);
    return r.cjk_id = u, !0;
  }), {
    parseFn: e => e.split(",")
  }));
}

function loadFile(e) {
  return r(e).then((t => sortLines(t, e)));
}

function SortList(e) {
  return e.sort((function(e, t) {
    return 2 == e.line_type || 2 == t.line_type || 1 == e.line_type || 1 == t.line_type ? e.index - t.index : l(e.cjk_id, t.cjk_id) || l(t.data[0], e.data[0]) || e.index - t.index || 0;
  }));
}

export { SortList, sortLines as default, loadFile, sortLines };
//# sourceMappingURL=index.esm.mjs.map
