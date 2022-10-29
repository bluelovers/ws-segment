"use strict";

Object.defineProperty(exports, "__esModule", {
  value: !0
});

var t = require("lodash");

class AbstractTableDictCore {
  TABLE=Object.create(null);
  TABLE2=Object.create(null);
  constructor(t, e = {}, s, ...r) {
    this.type = t, this.options = Object.assign({}, this.options, e), s && (s.TABLE && (this.TABLE = s.TABLE), 
    s.TABLE2 && (this.TABLE2 = s.TABLE2)), this._init();
  }
  _init() {
    Object.setPrototypeOf(this.TABLE, null), Object.setPrototypeOf(this.TABLE2, null);
  }
  _exists(t, ...e) {
    let s;
    return "string" == typeof t ? s = t : Array.isArray(t) ? [s] = t : ({w: s} = t), 
    s;
  }
  exists(t, ...e) {
    const s = this._exists(t);
    return this.TABLE[s] || null;
  }
  json(...e) {
    return t.cloneDeep(this.TABLE);
  }
  size() {
    return Object.keys(this.TABLE).length;
  }
}

exports.AbstractTableDictCore = AbstractTableDictCore, exports.default = AbstractTableDictCore;
//# sourceMappingURL=index.cjs.production.min.cjs.map
