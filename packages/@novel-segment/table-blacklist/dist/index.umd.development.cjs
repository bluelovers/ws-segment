(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@novel-segment/table-line')) :
	typeof define === 'function' && define.amd ? define(['exports', '@novel-segment/table-line'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.NovelSegmentTableBlacklist = {}, global.tableLine));
})(this, (function (exports, tableLine) { 'use strict';

	/**
	 * 黑名單表格類別
	 * Blacklist Table Class
	 *
	 * 繼承自 TableDictLine，用於儲存需要被過濾或排除的詞語。
	 * 黑名單中的詞語在分詞過程中會被標記或移除。
	 *
	 * Inherits from TableDictLine, used to store words that need to be filtered or excluded.
	 * Words in the blacklist will be marked or removed during the segmentation process.
	 *
	 * @example
	 * ```typescript
	 * const blacklist = new TableDictBlacklist();
	 * blacklist.add(['敏感詞', '不當用語']);
	 * if (blacklist.exists('敏感詞')) {
	 *   // 處理黑名單詞語 / Handle blacklisted word
	 * }
	 * ```
	 */
	class TableDictBlacklist extends tableLine.TableDictLine {
	  static type = "BLACKLIST" /* EnumDictDatabase.BLACKLIST */;
	  /**
	   * 建構函式
	   * Constructor
	   *
	   * 初始化黑名單表格實例。
	   * Initializes a blacklist table instance.
	   *
	   * @param {string} [type] - 表格類型識別碼，預設為 TableDictBlacklist.type / Table type identifier, defaults to TableDictBlacklist.type
	   * @param {IOptions} [options] - 表格選項 / Table options
	   * @param {...any} argv - 其他參數 / Additional arguments
	   */
	  constructor(type = TableDictBlacklist.type, options, ...argv) {
	    super(type, options, ...argv);
	  }
	}

	exports.TableDictBlacklist = TableDictBlacklist;
	exports.default = TableDictBlacklist;

	Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=index.umd.development.cjs.map
