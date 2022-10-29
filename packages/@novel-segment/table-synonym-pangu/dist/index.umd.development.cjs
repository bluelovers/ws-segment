(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@novel-segment/table-core-abstract')) :
	typeof define === 'function' && define.amd ? define(['exports', '@novel-segment/table-core-abstract'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.NovelSegmentTableSynonymPangu = {}, global.tableCoreAbstract));
})(this, (function (exports, tableCoreAbstract) { 'use strict';

	class TableDictSynonymPanGu extends tableCoreAbstract.AbstractTableDictCore {
	  static type = "SYNONYM";
	  constructor(type = TableDictSynonymPanGu.type, options, ...argv) {
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

	exports.TableDictSynonymPanGu = TableDictSynonymPanGu;
	exports.default = TableDictSynonymPanGu;

	Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=index.umd.development.cjs.map
