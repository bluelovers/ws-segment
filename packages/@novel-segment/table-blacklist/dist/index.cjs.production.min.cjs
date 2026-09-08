"use strict";

Object.defineProperty(exports, "__esModule", {
  value: !0
});

var e = require("@novel-segment/table-line"), t = require("@novel-segment/types");

class TableDictBlacklist extends e.TableDictLine {
  static type=t.EnumDictDatabase.BLACKLIST;
  constructor(e = TableDictBlacklist.type, t, ...l) {
    super(e, t, ...l);
  }
}

exports.TableDictBlacklist = TableDictBlacklist, exports.default = TableDictBlacklist;
//# sourceMappingURL=index.cjs.production.min.cjs.map
