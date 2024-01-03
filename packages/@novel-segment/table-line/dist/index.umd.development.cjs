(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@novel-segment/loader-line'), require('@novel-segment/table-core-abstract')) :
	typeof define === 'function' && define.amd ? define(['exports', '@novel-segment/loader-line', '@novel-segment/table-core-abstract'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.NovelSegmentTableLine = {}, global.loaderLine, global.tableCoreAbstract));
})(this, (function (exports, loaderLine, tableCoreAbstract) { 'use strict';

	class TableDictLine extends tableCoreAbstract.AbstractTableDictCore {
	  exists(data, ...argv) {
	    let w = this._exists(data);
	    let bool = this.TABLE[w];
	    return typeof bool === 'boolean' ? bool : null;
	  }
	  add(word) {
	    let self = this;
	    if (Array.isArray(word)) {
	      word.forEach(v => self._add(v));
	    } else {
	      self._add(word);
	    }
	    return this;
	  }
	  _add(word) {
	    word = word.trim();
	    if (word) {
	      this.TABLE[word] = true;
	    }
	  }
	  remove(word) {
	    let self = this;
	    self._remove(word);
	    return this;
	  }
	  _remove(word) {
	    delete this.TABLE[word];
	  }
	  stringify(LF = "\n") {
	    let self = this;
	    return Object.entries(self.TABLE).reduce(function (a, [w, bool]) {
	      if (bool) {
	        let line = loaderLine.stringifyLine(w);
	        a.push(line);
	      }
	      return a;
	    }, []).join(typeof LF === 'string' ? LF : "\n");
	  }
	}

	exports.TableDictLine = TableDictLine;
	exports.default = TableDictLine;

	Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=index.umd.development.cjs.map
