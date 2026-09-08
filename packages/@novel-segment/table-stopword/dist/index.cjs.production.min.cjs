"use strict";

Object.defineProperty(exports, "__esModule", {
  value: !0
});

var e = require("@novel-segment/table-line"), t = require("@novel-segment/types");

class TableDictStopword extends e.TableDictLine {
  static type=t.EnumDictDatabase.STOPWORD;
  constructor(e = TableDictStopword.type, t, ...o) {
    super(e, t, ...o);
  }
}

exports.TableDictStopword = TableDictStopword, exports.default = TableDictStopword;
//# sourceMappingURL=index.cjs.production.min.cjs.map
