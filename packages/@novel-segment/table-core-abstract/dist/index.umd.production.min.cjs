!function(t, e) {
  "object" == typeof exports && "undefined" != typeof module ? e(exports, require("lodash-es")) : "function" == typeof define && define.amd ? define([ "exports", "lodash-es" ], e) : e((t = "undefined" != typeof globalThis ? globalThis : t || self).NovelSegmentTableCoreAbstract = {}, t.lodashEs);
}(this, (function(t, e) {
  "use strict";
  class AbstractTableDictCore {
    TABLE=Object.create(null);
    TABLE2=Object.create(null);
    constructor(t, e = {}, s, ...i) {
      this.type = t, this.options = Object.assign({}, this.options, e), s && (s.TABLE && (this.TABLE = s.TABLE), 
      s.TABLE2 && (this.TABLE2 = s.TABLE2)), this._init();
    }
    _init() {
      Object.setPrototypeOf(this.TABLE, null), Object.setPrototypeOf(this.TABLE2, null);
    }
    _exists(t, ...e) {
      let s;
      return "string" == typeof t ? s = t : Array.isArray(t) ? [s] = t : ({w: s} = t), 
      s;
    }
    exists(t, ...e) {
      const s = this._exists(t);
      return this.TABLE[s] || null;
    }
    json(...t) {
      return e.cloneDeep(this.TABLE);
    }
    size() {
      return Object.keys(this.TABLE).length;
    }
  }
  t.AbstractTableDictCore = AbstractTableDictCore, t.default = AbstractTableDictCore, 
  Object.defineProperty(t, "__esModule", {
    value: !0
  });
}));
//# sourceMappingURL=index.umd.production.min.cjs.map
