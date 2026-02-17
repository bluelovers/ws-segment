"use strict";

Object.defineProperty(exports, "__esModule", {
  value: !0
});

var e = require("crlf-normalize"), r = require("debug-color2"), t = require("diff"), n = require("@lazy-cjk/zh-convert/min"), o = require("@novel-segment/stringify");

function printPrettyDiff(t, f) {
  const i = (t = e.crlf(o.stringify([ t ].flat()))) !== (f = e.crlf(o.stringify([ f ].flat())));
  i && r.console.red(`changed: ${i}`), r.console.gray("------------------"), i ? r.console.success(diff_log(t, f)) : r.console.log(f), 
  r.console.gray("------------------");
  const l = n.cn2tw_min(f);
  return f !== l && (r.console.log(diff_log(f, l)), r.console.gray("------------------")), 
  {
    text_old: t,
    text_new: f,
    changed: i,
    text_new2: l
  };
}

function diff_log(e, n) {
  let o = t.diffChars(e, n);
  return r.chalkByConsole(function(e, r) {
    return o.reduce(function(r, t) {
      let n = e[t.added ? "green" : t.removed ? "red" : "grey"](t.value);
      return r.push(n), r;
    }, []).join("");
  });
}

exports.default = printPrettyDiff, exports.diff_log = diff_log, exports.printPrettyDiff = printPrettyDiff;
//# sourceMappingURL=index.cjs.production.min.cjs.map
