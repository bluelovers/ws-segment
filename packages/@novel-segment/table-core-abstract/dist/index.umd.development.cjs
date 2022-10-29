(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('lodash-es')) :
	typeof define === 'function' && define.amd ? define(['exports', 'lodash-es'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.NovelSegmentTableCoreAbstract = {}, global.lodashEs));
})(this, (function (exports, lodashEs) { 'use strict';

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
	    return lodashEs.cloneDeep(this.TABLE);
	  }
	  size() {
	    return Object.keys(this.TABLE).length;
	  }
	}

	exports.AbstractTableDictCore = AbstractTableDictCore;
	exports.default = AbstractTableDictCore;

	Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=index.umd.development.cjs.map
