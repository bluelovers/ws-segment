import { handleDictLines as e, USE_CJK_MODE as n, chkLineType as t, EnumLineType as i } from "@novel-segment/util-compare";

import { load as o } from "@novel-segment/loader-line";

import { getCjkName as r, zhDictCompare as l } from "@novel-segment/util";

import { parseLine as s } from "@novel-segment/loaders/segment/index";

function sortLines(o, l, d) {
  var u;
  const m = null !== (u = null == d ? void 0 : d.cbIgnore) && void 0 !== u ? u : () => {};
  return SortList(e(o, function(e, o) {
    o.file = l;
    let [s, d, u] = o.data, p = r(s, n);
    return o.cjk_id = p, o.line_type = t(o.line), o.line_type !== i.COMMENT || (m(o), 
    !1);
  }, {
    parseFn: s
  }));
}

function loadFile(e, n) {
  return o(e).then(t => sortLines(t, e, n));
}

function SortList(e) {
  return e.sort(function(e, n) {
    return e.line_type === i.COMMENT_TAG || n.line_type === i.COMMENT_TAG || e.line_type === i.COMMENT || n.line_type === i.COMMENT ? e.index - n.index : l(e.cjk_id, n.cjk_id) || e.index - n.index || 0;
  });
}

export { SortList, sortLines as default, loadFile, sortLines };
//# sourceMappingURL=index.esm.mjs.map
