import { cloneDeep as t } from "lodash-es";

class AbstractTableDictCore {
  TABLE=Object.create(null);
  TABLE2=Object.create(null);
  constructor(t, s = {}, e, ...i) {
    this.type = t, this.options = Object.assign({}, this.options, s), e && (e.TABLE && (this.TABLE = e.TABLE), 
    e.TABLE2 && (this.TABLE2 = e.TABLE2)), this._init();
  }
  _init() {
    Object.setPrototypeOf(this.TABLE, null), Object.setPrototypeOf(this.TABLE2, null);
  }
  _exists(t, ...s) {
    let e;
    return "string" == typeof t ? e = t : Array.isArray(t) ? [e] = t : ({w: e} = t), 
    e;
  }
  exists(t, ...s) {
    const e = this._exists(t);
    return this.TABLE[e] || null;
  }
  json(...s) {
    return t(this.TABLE);
  }
  size() {
    return Object.keys(this.TABLE).length;
  }
}

export { AbstractTableDictCore, AbstractTableDictCore as default };
//# sourceMappingURL=index.esm.mjs.map
