import { handleDictLines as e, chkLineType as t, USE_CJK_MODE as n } from "@novel-segment/util-compare";

import { array_unique as i } from "array-hyper-unique";

import { load as r } from "@novel-segment/loader-line";

import { getCjkName as o } from "@novel-segment/util/conv";

import { zhDictCompare as l } from "@novel-segment/util/sort";

function sortLines(r, s) {
  return SortList(e(r, (function(e, r) {
    r.file = s;
    let [u] = r.data;
    if (r.line_type = t(r.line), 1 === r.line_type) u = u.replace(/^\/\//, ""); else if (0 === r.line_type) {
      let e = r.data.slice(1);
      if (e = i(e).filter((e => e != u)), e.sort((function(e, t) {
        let i = o(e, n), r = o(t, n);
        return l(i, r) || l(e, t);
      })), r.line = [ u ].concat(e).join(","), !e.length) return !1;
    }
    const f = o(u, n);
    return r.cjk_id = f, !0;
  }), {
    parseFn: e => e.split(",")
  }));
}

function loadFile(e) {
  return r(e).then((t => sortLines(t, e)));
}

function SortList(e) {
  return e.sort((function(e, t) {
    if (2 === e.line_type || 2 === t.line_type) {
      if (2 !== t.line_type) return -1;
      if (2 !== e.line_type) return 1;
      const n = /^\/\/\s+@/.test(e.line), i = /^\/\/\s+@/.test(t.line);
      return n && !i ? -1 : !n && i ? 1 : e.index - t.index;
    }
    return 1 === e.line_type && 1 === t.line_type ? e.index - t.index : l(e.cjk_id, t.cjk_id) || l(e.data[0], t.data[0]) || e.index - t.index || 0;
  }));
}

export { SortList, sortLines as default, loadFile, sortLines };
//# sourceMappingURL=index.esm.mjs.map
