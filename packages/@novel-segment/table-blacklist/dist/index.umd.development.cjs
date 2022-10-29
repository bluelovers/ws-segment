(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@novel-segment/table-line')) :
	typeof define === 'function' && define.amd ? define(['exports', '@novel-segment/table-line'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.NovelSegmentTableBlacklist = {}, global.tableLine));
})(this, (function (exports, tableLine) { 'use strict';

	class TableDictBlacklist extends tableLine.TableDictLine {
	  static type = "BLACKLIST";
	  constructor(type = TableDictBlacklist.type, options, ...argv) {
	    super(type, options, ...argv);
	  }
	}

	exports.TableDictBlacklist = TableDictBlacklist;
	exports.default = TableDictBlacklist;

	Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=index.umd.development.cjs.map
