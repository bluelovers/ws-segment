"use strict";

Object.defineProperty(exports, "__esModule", {
  value: !0
});

var t = require("@novel-segment/table-synonym-pangu");

class TableDictSynonym extends t.TableDictSynonymPanGu {
  constructor(t = TableDictSynonym.type, e, ...n) {
    super(t, e, ...n);
  }
  add(t, e, n) {
    var r, i, o, s, l;
    if (!Array.isArray(t) || t.length < 2) throw new TypeError(JSON.stringify(t));
    const y = this._trim(t.shift());
    if (!y.length) throw new TypeError(JSON.stringify(t));
    const a = this;
    return null !== (i = (r = a.TABLE2)[y]) && void 0 !== i || (r[y] = []), null !== (o = n) && void 0 !== o || (n = this.options.forceOverwrite), 
    null !== (s = e) && void 0 !== s || (e = null === (l = this.options.skipExists) || void 0 === l || l), 
    t.forEach((function(t, r) {
      if ((t = a._trim(t)).length) !n && (e && a.exists(t) || t in a.TABLE2) || (a.TABLE2[y].push(t), 
      a._add(t, y)); else if (0 === r) throw new TypeError;
    })), this;
  }
}

exports.TableDictSynonym = TableDictSynonym, exports.default = TableDictSynonym;
//# sourceMappingURL=index.cjs.production.min.cjs.map
