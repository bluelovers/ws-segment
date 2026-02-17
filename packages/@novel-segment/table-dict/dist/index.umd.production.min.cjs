!function(e, t) {
  "object" == typeof exports && "undefined" != typeof module ? t(exports, require("@novel-segment/loaders/segment/index"), require("@lazy-cjk/zh-table-list/list"), require("@novel-segment/table-core-abstract")) : "function" == typeof define && define.amd ? define([ "exports", "@novel-segment/loaders/segment/index", "@lazy-cjk/zh-table-list/list", "@novel-segment/table-core-abstract" ], t) : t((e = "undefined" != typeof globalThis ? globalThis : e || self).NovelSegmentTableDict = {}, e.index, e.list, e.tableCoreAbstract);
}(this, function(e, t, i, s) {
  "use strict";
  function notNum(e) {
    return "number" != typeof e || Number.isNaN(e);
  }
  class TableDict extends s.AbstractTableDictCore {
    exists(e) {
      return super.exists(e);
    }
    __handleInput(e, t) {
      let i, s, n, r;
      if ("string" == typeof e ? i = e : Array.isArray(e) ? [i, s, n, ...r] = e : ({w: i, p: s, f: n} = e), 
      "string" != typeof i || "" === i) throw new TypeError(JSON.stringify(e));
      if (!t && (null === s || null === n)) {
        let e = this.exists(i);
        e && (null === s && (s = e.p), null === n && (n = e.f));
      }
      return s = notNum(s) ? 0 : s, n = notNum(n) ? 0 : n, {
        data: {
          w: i,
          p: s,
          f: n
        },
        plus: r
      };
    }
    add(e, t) {
      let s, n, r;
      {
        let i = this.__handleInput(e, t);
        ({w: s, p: n, f: r} = i.data);
      }
      if (t && this.exists(s)) return this;
      this._add({
        w: s,
        p: n,
        f: r,
        s: !0
      });
      let l = this;
      return this.options.autoCjk && i.textList(s).forEach(function(e) {
        e === s || l.exists(e) || l._add({
          w: e,
          p: n,
          f: r
        });
      }), this;
    }
    _add({w: e, p: t, f: i, s}) {
      let n = e.length;
      this.TABLE[e] = {
        p: t,
        f: i,
        s
      }, this.TABLE2[n] || (this.TABLE2[n] = {}), this.TABLE2[n][e] = this.TABLE[e];
    }
    remove(e) {
      let {data: t} = this.__handleInput(e);
      return this._remove(t), this;
    }
    _remove({w: e}) {
      let t = e.length;
      return delete this.TABLE[e], this.TABLE2[t] && delete this.TABLE2[t][e], this;
    }
    stringify(e = "\n") {
      return Object.entries(this.TABLE).reduce(function(e, [i, {p: s, f: n}]) {
        let r = t.stringifyLine([ i, s, n ]);
        return e.push(r), e;
      }, []).join("string" == typeof e ? e : "\n");
    }
  }
  e.TableDict = TableDict, e.default = TableDict, e.notNum = notNum, Object.defineProperty(e, "__esModule", {
    value: !0
  });
});
//# sourceMappingURL=index.umd.production.min.cjs.map
