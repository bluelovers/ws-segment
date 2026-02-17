"use strict";

Object.defineProperty(exports, "__esModule", {
  value: !0
});

var e = require("util"), t = require("assert");

function _handleLazyMatchOptions(t = {}) {
  var n;
  return null != t || (t = {}), {
    ...t,
    inspectFn: null !== (n = t.inspectFn) && void 0 !== n ? n : e.inspect
  };
}

function _lazyMatchCore(e, t, n = {}) {
  let r = null;
  const {firstOne: o} = _handleLazyMatchOptions(n), a = [];
  let c = t.every(function(t, n, c) {
    let l = -1, i = r;
    return null == r && (r = -1), Array.isArray(t) ? o ? t.some(function(t) {
      let n = e.indexOf(t, i);
      if (n > -1 && n > r) return l = n, !0;
    }) : l = t.reduce(function(t, n) {
      let o = e.indexOf(n, i);
      return o > -1 && o > r ? -1 == t ? o : Math.min(o, t) : t;
    }, -1) : l = e.indexOf(t, i), l > -1 && l > r ? (r = l, !0) : (a.push(Array.isArray(t) ? t.join("/") : t), 
    !1);
  });
  return -1 === r && (c = !1), {
    matched: c,
    failedWords: a
  };
}

function _lazyMatchSynonym001Core(e, t, n = {}) {
  let r;
  const o = [];
  let a = t.every(function(t) {
    let n = r;
    null == r && (r = -1);
    let a = -1, c = null;
    var l;
    return Array.isArray(t) ? t.some(t => {
      let r = e.indexOf(t, n);
      if (r > -1) return a = r, c = t, !0;
    }) : (a = e.indexOf(t, n), c = t), a > -1 && a >= r ? (r = a + ((null === (l = c) || void 0 === l ? void 0 : l.length) || 0), 
    !0) : (o.push(Array.isArray(t) ? t.join("/") : t), !1);
  });
  return -1 === r && (a = !1), {
    matched: a,
    failedWords: o
  };
}

function _lazyMatchSynonym001NotCore(e, t, n = {}) {
  let r;
  const o = [];
  return {
    matched: t.every(function(t) {
      let n = r;
      null == r && (r = -1);
      let a = -1;
      return Array.isArray(t) ? t.some(t => {
        let r = e.indexOf(t, n);
        if (r > -1) return a = r, !0;
      }) : a = e.indexOf(t, n), a > -1 && a > r ? (o.push(Array.isArray(t) ? t.join("/") : t), 
      !1) : (r++, !0);
    }),
    failedWords: o
  };
}

function _lazyMatchNotCore(e, t, n = {}) {
  let r = null;
  const {firstOne: o} = _handleLazyMatchOptions(n), a = [];
  let c = t.every(function(t, n, c) {
    let l = -1, i = r;
    return null == r && (r = -1), Array.isArray(t) ? o ? t.some(function(t) {
      let n = e.indexOf(t, i);
      if (n > -1 && n > r) return l = n, !0;
    }) : l = t.reduce(function(t, n) {
      let o = e.indexOf(n, i);
      return o > -1 && o > r ? -1 == t ? o : Math.min(o, t) : t;
    }, -1) : l = e.indexOf(t, i), !(l > -1 && (r = l, a.push(Array.isArray(t) ? t.join("/") : t), 
    1));
  });
  return -1 === r && (c = !0), {
    matched: c,
    failedWords: a
  };
}

exports._handleLazyMatchOptions = _handleLazyMatchOptions, exports._lazyMatchCore = _lazyMatchCore, 
exports._lazyMatchNotCore = _lazyMatchNotCore, exports._lazyMatchSynonym001Core = _lazyMatchSynonym001Core, 
exports._lazyMatchSynonym001NotCore = _lazyMatchSynonym001NotCore, exports.lazyMatch = function lazyMatch(e, n, r = {}) {
  const {inspectFn: o, notThrowError: a} = _handleLazyMatchOptions(r), c = _lazyMatchCore(e, n, r);
  return a ? c : (!c.matched && t.fail(`expected ${o(e)} to have includes ordered members ${o(n)}`), 
  c.matched);
}, exports.lazyMatch002 = function lazyMatch002(e, n, r = {}) {
  let o, a;
  r = _handleLazyMatchOptions(r);
  let c = -1;
  for (let t of n) if (a = _lazyMatchCore(e, t, r), o = a.matched, c++, o) break;
  if (r.notThrowError) {
    let e;
    return o ? e = c >= 0 && n[c] : c = -1, {
      ...a,
      entryIndex: c,
      entryMatched: e
    };
  }
  return !o && t.fail(`expected ${r.inspectFn(e)} to have includes one of ordered members in ${r.inspectFn(n)}`), 
  o;
}, exports.lazyMatchNot = function lazyMatchNot(e, n, r = {}) {
  const {inspectFn: o, notThrowError: a} = _handleLazyMatchOptions(r), c = _lazyMatchNotCore(e, n, r);
  return a ? c : (!c.matched && t.fail(`expected ${o(e)} should not have includes ordered members ${o(n)}`), 
  c.matched);
}, exports.lazyMatchSynonym001 = function lazyMatchSynonym001(e, n, r = {}) {
  const {inspectFn: o, notThrowError: a} = _handleLazyMatchOptions(r), c = _lazyMatchSynonym001Core(e, n, r);
  return a ? c : (!c.matched && t.fail(`expected ${o(e)} to have index of ordered members in ${o(n)}`), 
  c.matched);
}, exports.lazyMatchSynonym001Not = function lazyMatchSynonym001Not(e, n, r = {}) {
  const {inspectFn: o, notThrowError: a} = _handleLazyMatchOptions(r), c = _lazyMatchSynonym001NotCore(e, n, r);
  return a ? c : (!c.matched && t.fail(`expected ${o(e)} to not have index of ordered members in ${o(n)}`), 
  c.matched);
};
//# sourceMappingURL=index.cjs.production.min.cjs.map
