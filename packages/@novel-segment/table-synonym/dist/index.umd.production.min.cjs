!function(e, n) {
  "object" == typeof exports && "undefined" != typeof module ? n(exports, require("@novel-segment/table-synonym-pangu")) : "function" == typeof define && define.amd ? define([ "exports", "@novel-segment/table-synonym-pangu" ], n) : n((e = "undefined" != typeof globalThis ? globalThis : e || self).NovelSegmentTableSynonym = {}, e.tableSynonymPangu);
}(this, function(e, n) {
  "use strict";
  class TableDictSynonym extends n.TableDictSynonymPanGu {
    constructor(e = TableDictSynonym.type, n, ...t) {
      super(e, n, ...t);
    }
    add(e, n, t) {
      var o, i, s;
      if (!Array.isArray(e) || e.length < 2) throw new TypeError(JSON.stringify(e));
      const r = this._trim(e.shift());
      if (!r.length) throw new TypeError(JSON.stringify(e));
      const l = this;
      return null !== (i = (o = l.TABLE2)[r]) && void 0 !== i || (o[r] = []), null != t || (t = this.options.forceOverwrite), 
      null != n || (n = null === (s = this.options.skipExists) || void 0 === s || s), 
      e.forEach(function(e, o) {
        if ((e = l._trim(e)).length) !t && (n && l.exists(e) || e in l.TABLE2) || (l.TABLE2[r].push(e), 
        l._add(e, r)); else if (0 === o) throw new TypeError;
      }), this;
    }
  }
  e.TableDictSynonym = TableDictSynonym, e.default = TableDictSynonym, Object.defineProperty(e, "__esModule", {
    value: !0
  });
});
//# sourceMappingURL=index.umd.production.min.cjs.map
