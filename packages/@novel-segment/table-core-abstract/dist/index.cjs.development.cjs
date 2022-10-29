'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var lodash = require('lodash');

class AbstractTableDictCore {
  TABLE = Object.create(null);
  TABLE2 = Object.create(null);
  constructor(type, options = {}, existsTable, ...argv) {
    this.type = type;
    this.options = Object.assign({}, this.options, options);
    if (existsTable) {
      if (existsTable.TABLE) {
        this.TABLE = existsTable.TABLE;
      }
      if (existsTable.TABLE2) {
        this.TABLE2 = existsTable.TABLE2;
      }
    }
    this._init();
  }
  _init() {
    Object.setPrototypeOf(this.TABLE, null);
    Object.setPrototypeOf(this.TABLE2, null);
  }
  _exists(data, ...argv) {
    let w;
    if (typeof data === 'string') {
      w = data;
    } else if (Array.isArray(data)) {
      [w] = data;
    } else {
      ({
        w
      } = data);
    }
    return w;
  }
  exists(data, ...argv) {
    const w = this._exists(data);
    return this.TABLE[w] || null;
  }
  json(...argv) {
    return lodash.cloneDeep(this.TABLE);
  }
  size() {
    return Object.keys(this.TABLE).length;
  }
}

exports.AbstractTableDictCore = AbstractTableDictCore;
exports.default = AbstractTableDictCore;
//# sourceMappingURL=index.cjs.development.cjs.map
