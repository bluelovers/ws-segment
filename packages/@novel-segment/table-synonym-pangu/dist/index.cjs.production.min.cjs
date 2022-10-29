"use strict";

Object.defineProperty(exports, "__esModule", {
  value: !0
});

var t = require("@novel-segment/table-core-abstract");

class TableDictSynonymPanGu extends t.AbstractTableDictCore {
  static type="SYNONYM";
  constructor(t = TableDictSynonymPanGu.type, e, ...r) {
    super(t, e, ...r);
  }
  add(t, e) {
    var r;
    if (!Array.isArray(t) || 2 !== t.length) throw new TypeError(JSON.stringify(t));
    if (t[0] = this._trim(t[0]), null === (r = t[0]) || void 0 === r || !r.length) throw new TypeError(JSON.stringify(t));
    return t[1] = this._trim(t[1]), e && this.exists(t[0]) || this._add(t[0], t[1]), 
    this;
  }
  _add(t, e) {
    t !== e && (this.TABLE[t] = e), this.TABLE[e] === t && delete this.TABLE[e];
  }
  _trim(t) {
    return t.replace(/^\s+|\s+$/g, "").trim();
  }
}

exports.TableDictSynonymPanGu = TableDictSynonymPanGu, exports.default = TableDictSynonymPanGu;
//# sourceMappingURL=index.cjs.production.min.cjs.map
