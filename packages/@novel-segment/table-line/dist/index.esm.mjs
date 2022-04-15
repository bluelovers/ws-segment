import { stringifyLine as e } from "@novel-segment/loader-line";

import { AbstractTableDictCore as t } from "@novel-segment/table-core-abstract";

class TableDictLine extends t {
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
        let i = e(r);
        t.push(i);
      }
      return t;
    }), []).join("string" == typeof t ? t : "\n");
  }
}

export { TableDictLine, TableDictLine as default };
//# sourceMappingURL=index.esm.mjs.map
