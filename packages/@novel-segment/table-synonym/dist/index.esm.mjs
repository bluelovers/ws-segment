import { TableDictSynonymPanGu as t } from "@novel-segment/table-synonym-pangu";

class TableDictSynonym extends t {
  constructor(t = TableDictSynonym.type, n, ...i) {
    super(t, n, ...i);
  }
  add(t, n, i) {
    var r, e, o, s, l;
    if (!Array.isArray(t) || t.length < 2) throw new TypeError(JSON.stringify(t));
    const y = this._trim(t.shift());
    if (!y.length) throw new TypeError(JSON.stringify(t));
    const a = this;
    return null !== (e = (r = a.TABLE2)[y]) && void 0 !== e || (r[y] = []), null !== (o = i) && void 0 !== o || (i = this.options.forceOverwrite), 
    null !== (s = n) && void 0 !== s || (n = null === (l = this.options.skipExists) || void 0 === l || l), 
    t.forEach((function(t, r) {
      if ((t = a._trim(t)).length) !i && (n && a.exists(t) || t in a.TABLE2) || (a.TABLE2[y].push(t), 
      a._add(t, y)); else if (0 === r) throw new TypeError;
    })), this;
  }
}

export { TableDictSynonym, TableDictSynonym as default };
//# sourceMappingURL=index.esm.mjs.map
