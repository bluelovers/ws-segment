!function(e, t) {
  "object" == typeof exports && "undefined" != typeof module ? t(exports, require("@novel-segment/loaders/segment/index"), require("@lazy-cjk/zh-table-list/list"), require("@novel-segment/table-core-abstract")) : "function" == typeof define && define.amd ? define([ "exports", "@novel-segment/loaders/segment/index", "@lazy-cjk/zh-table-list/list", "@novel-segment/table-core-abstract" ], t) : t((e = "undefined" != typeof globalThis ? globalThis : e || self).NovelSegmentTableDict = {}, e.index, e.list, e.tableCoreAbstract);
}(this, (function(e, t, i, s) {
  "use strict";
  function notNum(e) {
    return "number" != typeof e || Number.isNaN(e);
  }
  class TableDict extends s.AbstractTableDictCore {
    exists(e) {
      return super.exists(e);
    }
    __handleInput(e) {
      let t, i, s, n;
      if ("string" == typeof e ? t = e : Array.isArray(e) ? [t, i, s, ...n] = e : ({w: t, p: i, f: s} = e), 
      "string" != typeof t || "" === t) throw new TypeError(JSON.stringify(e));
      return i = notNum(i) ? 0 : i, s = notNum(s) ? 0 : s, {
        data: {
          w: t,
          p: i,
          f: s
        },
        plus: n
      };
    }
    add(e, t) {
      let s, n, r;
      {
        let t = this.__handleInput(e);
        ({w: s, p: n, f: r} = t.data);
      }
      if (t && this.exists(s)) return this;
      this._add({
        w: s,
        p: n,
        f: r,
        s: !0
      });
      let l = this;
      return this.options.autoCjk && i.textList(s).forEach((function(e) {
        e === s || l.exists(e) || l._add({
          w: e,
          p: n,
          f: r
        });
      })), this;
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
      return Object.entries(this.TABLE).reduce((function(e, [i, {p: s, f: n}]) {
        let r = t.stringifyLine([ i, s, n ]);
        return e.push(r), e;
      }), []).join("string" == typeof e ? e : "\n");
    }
  }
  e.TableDict = TableDict, e.default = TableDict, e.notNum = notNum, Object.defineProperty(e, "__esModule", {
    value: !0
  });
}));
//# sourceMappingURL=index.umd.production.min.cjs.map
