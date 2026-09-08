!function(e, t) {
  "object" == typeof exports && "undefined" != typeof module ? t(exports, require("@novel-segment/table-line"), require("@novel-segment/types")) : "function" == typeof define && define.amd ? define([ "exports", "@novel-segment/table-line", "@novel-segment/types" ], t) : t((e = "undefined" != typeof globalThis ? globalThis : e || self).NovelSegmentTableBlacklist = {}, e.tableLine, e.types);
}(this, function(e, t, l) {
  "use strict";
  class TableDictBlacklist extends t.TableDictLine {
    static type=l.EnumDictDatabase.BLACKLIST;
    constructor(e = TableDictBlacklist.type, t, ...l) {
      super(e, t, ...l);
    }
  }
  e.TableDictBlacklist = TableDictBlacklist, e.default = TableDictBlacklist, Object.defineProperty(e, "__esModule", {
    value: !0
  });
});
//# sourceMappingURL=index.umd.production.min.cjs.map
