"use strict";

Object.defineProperty(exports, "__esModule", {
  value: !0
});

var e = require("@novel-segment/loader-line"), t = require("@novel-segment/table-core-abstract");

class TableDictLine extends t.AbstractTableDictCore {
  exists(e, ...t) {
    let r = this._exists(e), i = this.TABLE[r];
    return "boolean" == typeof i ? i : null;
  }
  add(e) {
    let t = this;
    return Array.isArray(e) ? e.forEach((e => t._add(e))) : t._add(e), this;
  }
  _add(e) {
    (e = e.trim()) && (this.TABLE[e] = !0);
  }
  remove(e) {
    return this._remove(e), this;
  }
  _remove(e) {
    delete this.TABLE[e];
  }
  stringify(t = "\n") {
    return Object.entries(this.TABLE).reduce((function(t, [r, i]) {
      if (i) {
        let i = e.stringifyLine(r);
        t.push(i);
      }
      return t;
    }), []).join("string" == typeof t ? t : "\n");
  }
}

exports.TableDictLine = TableDictLine, exports.default = TableDictLine;
//# sourceMappingURL=index.cjs.production.min.cjs.map
