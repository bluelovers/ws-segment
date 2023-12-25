(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@novel-segment/table-synonym-pangu')) :
	typeof define === 'function' && define.amd ? define(['exports', '@novel-segment/table-synonym-pangu'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.NovelSegmentTableSynonym = {}, global.tableSynonymPangu));
})(this, (function (exports, tableSynonymPangu) { 'use strict';

	class TableDictSynonym extends tableSynonymPangu.TableDictSynonymPanGu {
	  constructor(type = TableDictSynonym.type, options, ...argv) {
	    super(type, options, ...argv);
	  }
	  add(data, skipExists, forceOverwrite) {
	    var _self$TABLE, _self$TABLE$w, _forceOverwrite, _skipExists, _this$options$skipExi;
	    if (!Array.isArray(data) || data.length < 2) {
	      throw new TypeError(JSON.stringify(data));
	    }
	    const w = this._trim(data.shift());
	    if (!w.length) {
	      throw new TypeError(JSON.stringify(data));
	    }
	    const self = this;
	    (_self$TABLE$w = (_self$TABLE = self.TABLE2)[w]) !== null && _self$TABLE$w !== void 0 ? _self$TABLE$w : _self$TABLE[w] = [];
	    (_forceOverwrite = forceOverwrite) !== null && _forceOverwrite !== void 0 ? _forceOverwrite : forceOverwrite = this.options.forceOverwrite;
	    (_skipExists = skipExists) !== null && _skipExists !== void 0 ? _skipExists : skipExists = (_this$options$skipExi = this.options.skipExists) !== null && _this$options$skipExi !== void 0 ? _this$options$skipExi : true;
	    data.forEach(function (bw, index) {
	      bw = self._trim(bw);
	      if (!bw.length) {
	        if (index === 0) {
	          throw new TypeError();
	        }
	        return;
	      }
	      if (!forceOverwrite && (skipExists && self.exists(bw) || bw in self.TABLE2)) {
	        return;
	      }
	      self.TABLE2[w].push(bw);
	      self._add(bw, w);
	    });
	    return this;
	  }
	}

	exports.TableDictSynonym = TableDictSynonym;
	exports.default = TableDictSynonym;

	Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=index.umd.development.cjs.map
