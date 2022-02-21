import { AbstractTableDictCore } from '@novel-segment/table-core-abstract';

class TableDictSynonymPanGu extends AbstractTableDictCore {
  static type = 'SYNONYM';

  constructor(type = TableDictSynonymPanGu.type, options = {}, ...argv) {
    super(type, options, ...argv);
  }

  add(data, skipExists) {
    var _data$;

    if (!Array.isArray(data) || data.length !== 2) {
      throw new TypeError(JSON.stringify(data));
    }

    data[0] = this._trim(data[0]);

    if (!((_data$ = data[0]) !== null && _data$ !== void 0 && _data$.length)) {
      throw new TypeError(JSON.stringify(data));
    }

    data[1] = this._trim(data[1]);

    if (skipExists && this.exists(data[0])) {
      return this;
    }

    this._add(data[0], data[1]);

    return this;
  }

  _add(n1, n2) {
    if (n1 !== n2) {
      this.TABLE[n1] = n2;
    }

    if (this.TABLE[n2] === n1) {
      delete this.TABLE[n2];
    }
  }

  _trim(s) {
    return s.replace(/^\s+|\s+$/g, '').trim();
  }

}

export { TableDictSynonymPanGu, TableDictSynonymPanGu as default };
//# sourceMappingURL=index.esm.mjs.map
