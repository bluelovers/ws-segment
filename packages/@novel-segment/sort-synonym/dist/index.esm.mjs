import { handleDictLines as e, chkLineType as t, EnumLineType as n, USE_CJK_MODE as i } from "@novel-segment/util-compare";

import { array_unique as r } from "array-hyper-unique";

import { load as o } from "@novel-segment/loader-line";

import { getCjkName as l } from "@novel-segment/util/conv";

import { zhDictCompare as s, EnumSortCompareOrder as u } from "@novel-segment/util/sort";

function sortLines(o, u) {
  return SortList(e(o, function(e, o) {
    o.file = u;
    let [f] = o.data;
    if (o.line_type = t(o.line), o.line_type === n.COMMENT) f = f.replace(/^\/\//, ""); else if (o.line_type === n.BASE) {
      let e = o.data.slice(1);
      if (e = r(e).filter(e => e != f), e.sort(function(e, t) {
        let n = l(e, i), r = l(t, i);
        return s(n, r) || s(e, t);
      }), o.line = [ f ].concat(e).join(","), !e.length) return !1;
    }
    const p = l(f, i);
    return o.cjk_id = p, !0;
  }, {
    parseFn: e => e.split(",")
  }));
}

function loadFile(e) {
  return o(e).then(t => sortLines(t, e));
}

function SortList(e) {
  return e.sort(function(e, t) {
    if (e.line_type === n.COMMENT_TAG || t.line_type === n.COMMENT_TAG) {
      if (t.line_type !== n.COMMENT_TAG) return u.UP;
      if (e.line_type !== n.COMMENT_TAG) return u.DOWN;
      const i = /^\/\/\s+@/.test(e.line), r = /^\/\/\s+@/.test(t.line);
      return i && !r ? u.UP : !i && r ? u.DOWN : e.index - t.index;
    }
    return e.line_type === n.COMMENT && t.line_type === n.COMMENT ? e.index - t.index : s(e.cjk_id, t.cjk_id) || s(e.data[0], t.data[0]) || e.index - t.index || u.KEEP;
  });
}

export { SortList, sortLines as default, loadFile, sortLines };
//# sourceMappingURL=index.esm.mjs.map
