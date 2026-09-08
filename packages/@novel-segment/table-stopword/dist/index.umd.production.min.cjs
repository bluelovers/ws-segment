!function(e, t) {
  "object" == typeof exports && "undefined" != typeof module ? t(exports, require("@novel-segment/table-line"), require("@novel-segment/types")) : "function" == typeof define && define.amd ? define([ "exports", "@novel-segment/table-line", "@novel-segment/types" ], t) : t((e = "undefined" != typeof globalThis ? globalThis : e || self).NovelSegmentTableStopword = {}, e.tableLine, e.types);
}(this, function(e, t, o) {
  "use strict";
  class TableDictStopword extends t.TableDictLine {
    static type=o.EnumDictDatabase.STOPWORD;
    constructor(e = TableDictStopword.type, t, ...o) {
      super(e, t, ...o);
    }
  }
  e.TableDictStopword = TableDictStopword, e.default = TableDictStopword, Object.defineProperty(e, "__esModule", {
    value: !0
  });
});
//# sourceMappingURL=index.umd.production.min.cjs.map
