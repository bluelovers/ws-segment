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
    var r, i, s;
    if (!Array.isArray(t) || t.length < 2) throw new TypeError(JSON.stringify(t));
    const o = this._trim(t.shift());
    if (!o.length) throw new TypeError(JSON.stringify(t));
    const l = this;
    return null !== (i = (r = l.TABLE2)[o]) && void 0 !== i || (r[o] = []), null != n || (n = this.options.forceOverwrite), 
    null != e || (e = null === (s = this.options.skipExists) || void 0 === s || s), 
    t.forEach(function(t, r) {
      if ((t = l._trim(t)).length) !n && (e && l.exists(t) || t in l.TABLE2) || (l.TABLE2[o].push(t), 
      l._add(t, o)); else if (0 === r) throw new TypeError;
    }), this;
  }
}

exports.TableDictSynonym = TableDictSynonym, exports.default = TableDictSynonym;
//# sourceMappingURL=index.cjs.production.min.cjs.map
