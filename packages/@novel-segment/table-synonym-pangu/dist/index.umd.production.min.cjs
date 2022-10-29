!function(e, t) {
  "object" == typeof exports && "undefined" != typeof module ? t(exports, require("@novel-segment/table-core-abstract")) : "function" == typeof define && define.amd ? define([ "exports", "@novel-segment/table-core-abstract" ], t) : t((e = "undefined" != typeof globalThis ? globalThis : e || self).NovelSegmentTableSynonymPangu = {}, e.tableCoreAbstract);
}(this, (function(e, t) {
  "use strict";
  class TableDictSynonymPanGu extends t.AbstractTableDictCore {
    static type="SYNONYM";
    constructor(e = TableDictSynonymPanGu.type, t, ...n) {
      super(e, t, ...n);
    }
    add(e, t) {
      var n;
      if (!Array.isArray(e) || 2 !== e.length) throw new TypeError(JSON.stringify(e));
      if (e[0] = this._trim(e[0]), null === (n = e[0]) || void 0 === n || !n.length) throw new TypeError(JSON.stringify(e));
      return e[1] = this._trim(e[1]), t && this.exists(e[0]) || this._add(e[0], e[1]), 
      this;
    }
    _add(e, t) {
      e !== t && (this.TABLE[e] = t), this.TABLE[t] === e && delete this.TABLE[t];
    }
    _trim(e) {
      return e.replace(/^\s+|\s+$/g, "").trim();
    }
  }
  e.TableDictSynonymPanGu = TableDictSynonymPanGu, e.default = TableDictSynonymPanGu, 
  Object.defineProperty(e, "__esModule", {
    value: !0
  });
}));
//# sourceMappingURL=index.umd.production.min.cjs.map
