import { TableDictSynonymPanGu as t } from "@novel-segment/table-synonym-pangu";

class TableDictSynonym extends t {
  constructor(t = TableDictSynonym.type, n, ...r) {
    super(t, n, ...r);
  }
  add(t, n, r) {
    var i, e, o;
    if (!Array.isArray(t) || t.length < 2) throw new TypeError(JSON.stringify(t));
    const s = this._trim(t.shift());
    if (!s.length) throw new TypeError(JSON.stringify(t));
    const l = this;
    return null !== (e = (i = l.TABLE2)[s]) && void 0 !== e || (i[s] = []), null != r || (r = this.options.forceOverwrite), 
    null != n || (n = null === (o = this.options.skipExists) || void 0 === o || o), 
    t.forEach(function(t, i) {
      if ((t = l._trim(t)).length) !r && (n && l.exists(t) || t in l.TABLE2) || (l.TABLE2[s].push(t), 
      l._add(t, s)); else if (0 === i) throw new TypeError;
    }), this;
  }
}

export { TableDictSynonym, TableDictSynonym as default };
//# sourceMappingURL=index.esm.mjs.map
