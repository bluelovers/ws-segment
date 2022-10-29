!function(e, t) {
  "object" == typeof exports && "undefined" != typeof module ? t(exports, require("@novel-segment/loader-line"), require("@novel-segment/table-core-abstract")) : "function" == typeof define && define.amd ? define([ "exports", "@novel-segment/loader-line", "@novel-segment/table-core-abstract" ], t) : t((e = "undefined" != typeof globalThis ? globalThis : e || self).NovelSegmentTableLine = {}, e.loaderLine, e.tableCoreAbstract);
}(this, (function(e, t, i) {
  "use strict";
  class TableDictLine extends i.AbstractTableDictCore {
    exists(e, ...t) {
      let i = this._exists(e), n = this.TABLE[i];
      return "boolean" == typeof n ? n : null;
    }
    add(e) {
      let t = this;
      return Array.isArray(e) ? e.forEach((e => t._add(e))) : t._add(e), this;
    }
    _add(e) {
      (e = e.trim()) && (this.TABLE[e] = !0);
    }
    remove(e) {
      return this._remove(e), this;
    }
    _remove(e) {
      delete this.TABLE[e];
    }
    stringify(e = "\n") {
      return Object.entries(this.TABLE).reduce((function(e, [i, n]) {
        if (n) {
          let n = t.stringifyLine(i);
          e.push(n);
        }
        return e;
      }), []).join("string" == typeof e ? e : "\n");
    }
  }
  e.TableDictLine = TableDictLine, e.default = TableDictLine, Object.defineProperty(e, "__esModule", {
    value: !0
  });
}));
//# sourceMappingURL=index.umd.production.min.cjs.map
