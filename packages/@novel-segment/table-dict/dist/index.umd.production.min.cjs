!function(e, t) {
  "object" == typeof exports && "undefined" != typeof module ? t(exports, require("@novel-segment/loaders/segment/index"), require("@lazy-cjk/zh-table-list/list"), require("@novel-segment/table-core-abstract")) : "function" == typeof define && define.amd ? define([ "exports", "@novel-segment/loaders/segment/index", "@lazy-cjk/zh-table-list/list", "@novel-segment/table-core-abstract" ], t) : t((e = "undefined" != typeof globalThis ? globalThis : e || self).NovelSegmentTableDict = {}, e.index, e.list, e.tableCoreAbstract);
}(this, function(e, t, n, i) {
  "use strict";
  function notNum(e) {
    return "number" != typeof e || Number.isNaN(e);
  }
  class TableDict extends i.AbstractTableDictCore {
    exists(e) {
      return super.exists(e);
    }
    __handleInput(e, t) {
      let n, i, s, r;
      if ("string" == typeof e ? n = e : Array.isArray(e) ? [n, i, s, ...r] = e : ({w: n, p: i, f: s} = e), 
      "string" != typeof n || "" === n) throw new TypeError(JSON.stringify(e));
      if (!t && (null === i || null === s)) {
        let e = this.exists(n);
        e && (null === i && (i = e.p), null === s && (s = e.f));
      }
      return i = notNum(i) ? 0 : i, s = notNum(s) ? 0 : s, {
        data: {
          w: n,
          p: i,
          f: s
        },
        plus: r
      };
    }
    add(e, t) {
      let i, s, r;
      {
        let n = this.__handleInput(e, t);
        ({w: i, p: s, f: r} = n.data);
      }
      if (t && this.exists(i)) return this;
      this._add({
        w: i,
        p: s,
        f: r,
        s: !0
      });
      let l = this;
      return this.options.autoCjk && n.textList(i).forEach(function(e) {
        e === i || l.exists(e) || l._add({
          w: e,
          p: s,
          f: r
        });
      }), this;
    }
    _add({w: e, p: t, f: n, s: i}) {
      let s = e.length;
      this.TABLE[e] = {
        p: t,
        f: n,
        s: i
      }, this.TABLE2[s] || (this.TABLE2[s] = {}), this.TABLE2[s][e] = this.TABLE[e];
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
      return Object.entries(this.TABLE).reduce(function(e, [n, {p: i, f: s}]) {
        let r = t.stringifyLine([ n, i, s ]);
        return e.push(r), e;
      }, []).join("string" == typeof e ? e : "\n");
    }
  }
  Object.defineProperty(e, "IDICT", {
    enumerable: !0,
    get: function() {
      return i.IDICT;
    }
  }), Object.defineProperty(e, "IDICT2", {
    enumerable: !0,
    get: function() {
      return i.IDICT2;
    }
  }), Object.defineProperty(e, "IOptions", {
    enumerable: !0,
    get: function() {
      return i.IOptions;
    }
  }), e.TableDict = TableDict, e.default = TableDict, e.notNum = notNum, Object.defineProperty(e, "__esModule", {
    value: !0
  });
});
//# sourceMappingURL=index.umd.production.min.cjs.map
