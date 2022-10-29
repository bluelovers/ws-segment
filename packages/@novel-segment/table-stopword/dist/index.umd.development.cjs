(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@novel-segment/table-line')) :
	typeof define === 'function' && define.amd ? define(['exports', '@novel-segment/table-line'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.NovelSegmentTableStopword = {}, global.tableLine));
})(this, (function (exports, tableLine) { 'use strict';

	class TableDictStopword extends tableLine.TableDictLine {
	  static type = "STOPWORD";
	  constructor(type = TableDictStopword.type, options, ...argv) {
	    super(type, options, ...argv);
	  }
	}

	exports.TableDictStopword = TableDictStopword;
	exports.default = TableDictStopword;

	Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=index.umd.development.cjs.map
