import { AbstractTableDictCore as t } from "@novel-segment/table-core-abstract";

class TableDictSynonymPanGu extends t {
  static type="SYNONYM";
  constructor(t = TableDictSynonymPanGu.type, r, ...e) {
    super(t, r, ...e);
  }
  add(t, r) {
    var e;
    if (!Array.isArray(t) || 2 !== t.length) throw new TypeError(JSON.stringify(t));
    if (t[0] = this._trim(t[0]), null === (e = t[0]) || void 0 === e || !e.length) throw new TypeError(JSON.stringify(t));
    return t[1] = this._trim(t[1]), r && this.exists(t[0]) || this._add(t[0], t[1]), 
    this;
  }
  _add(t, r) {
    t !== r && (this.TABLE[t] = r), this.TABLE[r] === t && delete this.TABLE[r];
  }
  _trim(t) {
    return t.replace(/^\s+|\s+$/g, "").trim();
  }
}

export { TableDictSynonymPanGu, TableDictSynonymPanGu as default };
//# sourceMappingURL=index.esm.mjs.map
