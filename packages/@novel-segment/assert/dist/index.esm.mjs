import { inspect as e } from "util";

import { fail as n } from "assert";

function _handleLazyMatchOptions(n = {}) {
  var t, r;
  return null !== (t = n) && void 0 !== t || (n = {}), {
    ...n,
    inspectFn: null !== (r = n.inspectFn) && void 0 !== r ? r : e
  };
}

function lazyMatch(e, t, r = {}) {
  let i = null;
  const {inspectFn: o, firstOne: a} = _handleLazyMatchOptions(r);
  let l = t.every((function(n, t, r) {
    let o = -1, l = i;
    if (null == i && (i = -1), Array.isArray(n) ? a ? n.some((function(n) {
      let t = e.indexOf(n, l);
      if (t > -1 && t > i) return o = t, !0;
    })) : o = n.reduce((function(n, t) {
      let r = e.indexOf(t, l);
      return r > -1 && r > i ? -1 == n ? r : Math.min(r, n) : n;
    }), -1) : o = e.indexOf(n, l), o > -1 && o > i) return i = o, !0;
  }));
  return -1 === i && (l = !1), !l && n(`expected ${o(e)} to have includes ordered members ${o(t)}`), 
  l;
}

function lazyMatch002(e, t, r = {}) {
  let i;
  r = _handleLazyMatchOptions(r);
  for (let n of t) try {
    if (i = lazyMatch(e, n, r), i) break;
  } catch (e) {}
  !i && n(`expected ${r.inspectFn(e)} to have includes one of ordered members in ${r.inspectFn(t)}`);
}

function lazyMatchSynonym001(e, t, r = {}) {
  let i, o;
  const {inspectFn: a} = _handleLazyMatchOptions(r);
  i = t.every((function(t) {
    let r = o;
    null == o && (o = -1);
    let i = -1;
    if (Array.isArray(t) ? t.some((n => {
      let o = e.indexOf(n, r);
      if (o > -1) return i = o, t = n, !0;
    })) : i = e.indexOf(t, r), i > -1 && i >= o) return o = i + t.length, !0;
    o > -1 && n(`expected ${a(e)} to have have ${a(t)} on index > ${o}, but got ${i}`);
  })), -1 === o && (i = !1), !i && n(`expected ${a(e)} to have index of ordered members in ${a(t)}`);
}

function lazyMatchSynonym001Not(e, t, r = {}) {
  let i;
  const {inspectFn: o} = _handleLazyMatchOptions(r);
  t.every((function(t) {
    let r = i;
    null == i && (i = -1);
    let a = -1;
    if (Array.isArray(t) ? t.some((n => {
      let i = e.indexOf(n, r);
      if (i > -1) return a = i, t = n, !0;
    })) : a = e.indexOf(t, r), a > -1 && a > i) return n(`expected ${o(e)} to not have ${o(t)} on index > ${i}, but got ${a}`), 
    !0;
    i++;
  }));
}

function lazyMatchNot(e, t, r = {}) {
  let i = null;
  const {inspectFn: o} = _handleLazyMatchOptions(r);
  let a = t.every((function(n, t, o) {
    let a = -1, l = i;
    return null == i && (i = -1), Array.isArray(n) ? r.firstOne ? n.some((function(n) {
      let t = e.indexOf(n, l);
      if (t > -1 && t > i) return a = t, !0;
    })) : a = n.reduce((function(n, t) {
      let r = e.indexOf(t, l);
      return r > -1 && r > i ? -1 == n ? r : Math.min(r, n) : n;
    }), -1) : a = e.indexOf(n, l), !(a > -1 && (i = a, 1));
  }));
  return -1 === i && (a = !0), !a && n(`expected ${o(e)} should not have includes ordered members ${o(t)}`), 
  a;
}

export { _handleLazyMatchOptions, lazyMatch, lazyMatch002, lazyMatchNot, lazyMatchSynonym001, lazyMatchSynonym001Not };
//# sourceMappingURL=index.esm.mjs.map
