!function(e, t) {
  "object" == typeof exports && "undefined" != typeof module ? t(exports, require("@novel-segment/table-line")) : "function" == typeof define && define.amd ? define([ "exports", "@novel-segment/table-line" ], t) : t((e = "undefined" != typeof globalThis ? globalThis : e || self).NovelSegmentTableStopword = {}, e.tableLine);
}(this, (function(e, t) {
  "use strict";
  class TableDictStopword extends t.TableDictLine {
    static type="STOPWORD";
    constructor(e = TableDictStopword.type, t, ...o) {
      super(e, t, ...o);
    }
  }
  e.TableDictStopword = TableDictStopword, e.default = TableDictStopword, Object.defineProperty(e, "__esModule", {
    value: !0
  });
}));
//# sourceMappingURL=index.umd.production.min.cjs.map
