!function(e, n) {
  "object" == typeof exports && "undefined" != typeof module ? n(exports, require("@novel-segment/table-synonym-pangu")) : "function" == typeof define && define.amd ? define([ "exports", "@novel-segment/table-synonym-pangu" ], n) : n((e = "undefined" != typeof globalThis ? globalThis : e || self).NovelSegmentTableSynonym = {}, e.tableSynonymPangu);
}(this, (function(e, n) {
  "use strict";
  class TableDictSynonym extends n.TableDictSynonymPanGu {
    constructor(e = TableDictSynonym.type, n, ...t) {
      super(e, n, ...t);
    }
    add(e, n, t) {
      var o, i, s, r, l;
      if (!Array.isArray(e) || e.length < 2) throw new TypeError(JSON.stringify(e));
      const y = this._trim(e.shift());
      if (!y.length) throw new TypeError(JSON.stringify(e));
      const a = this;
      return null !== (i = (o = a.TABLE2)[y]) && void 0 !== i || (o[y] = []), null !== (s = t) && void 0 !== s || (t = this.options.forceOverwrite), 
      null !== (r = n) && void 0 !== r || (n = null === (l = this.options.skipExists) || void 0 === l || l), 
      e.forEach((function(e, o) {
        if ((e = a._trim(e)).length) !t && (n && a.exists(e) || e in a.TABLE2) || (a.TABLE2[y].push(e), 
        a._add(e, y)); else if (0 === o) throw new TypeError;
      })), this;
    }
  }
  e.TableDictSynonym = TableDictSynonym, e.default = TableDictSynonym, Object.defineProperty(e, "__esModule", {
    value: !0
  });
}));
//# sourceMappingURL=index.umd.production.min.cjs.map
