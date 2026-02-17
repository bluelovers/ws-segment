import { crlf as r } from "crlf-normalize";

import { console as t, chalkByConsole as e } from "debug-color2";

import { diffChars as o } from "diff";

import { cn2tw_min as f } from "@lazy-cjk/zh-convert/min";

import { stringify as n } from "@novel-segment/stringify";

function printPrettyDiff(e, o) {
  const i = (e = r(n([ e ].flat()))) !== (o = r(n([ o ].flat())));
  i && t.red(`changed: ${i}`), t.gray("------------------"), i ? t.success(diff_log(e, o)) : t.log(o), 
  t.gray("------------------");
  const l = f(o);
  return o !== l && (t.log(diff_log(o, l)), t.gray("------------------")), {
    text_old: e,
    text_new: o,
    changed: i,
    text_new2: l
  };
}

function diff_log(r, t) {
  let f = o(r, t);
  return e(function(r, t) {
    return f.reduce(function(t, e) {
      let o = r[e.added ? "green" : e.removed ? "red" : "grey"](e.value);
      return t.push(o), t;
    }, []).join("");
  });
}

export { printPrettyDiff as default, diff_log, printPrettyDiff };
//# sourceMappingURL=index.esm.mjs.map
