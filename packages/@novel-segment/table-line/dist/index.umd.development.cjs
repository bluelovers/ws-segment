(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@novel-segment/loader-line'), require('@novel-segment/table-core-abstract')) :
	typeof define === 'function' && define.amd ? define(['exports', '@novel-segment/loader-line', '@novel-segment/table-core-abstract'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.NovelSegmentTableLine = {}, global.loaderLine, global.tableCoreAbstract));
})(this, (function (exports, loaderLine, tableCoreAbstract) { 'use strict';

	class TableDictLine extends tableCoreAbstract.AbstractTableDictCore {
	  /**
	   * 檢查詞語是否存在於表格中
	   * Check if Word Exists in Table
	   *
	   * 覆寫父類別方法，返回布林值而非資料物件。
	   * 若詞語存在且值為布林類型，則返回該布林值；否則返回 null。
	   *
	   * Overrides parent method to return a boolean value instead of a data object.
	   * Returns the boolean value if the word exists and the value is of boolean type; otherwise returns null.
	   *
	   * @param {any} data - 輸入資料 / Input data
	   * @param {...any} argv - 其他參數 / Additional arguments
	   * @returns {boolean | null} 存在時返回布林值，否則返回 null / Boolean value if exists, null otherwise
	   */
	  exists(data, ...argv) {
	    let w = this._exists(data);
	    let bool = this.TABLE[w];
	    return typeof bool === 'boolean' ? bool : null;
	  }
	  /**
	   * 新增詞語到表格
	   * Add Word to Table
	   *
	   * 支援單一字串或字串陣列作為輸入。
	   * 將詞語加入表格並設為 true。
	   *
	   * Supports a single string or an array of strings as input.
	   * Adds words to the table and sets them to true.
	   *
	   * @param {string | string[]} word - 要新增的詞語或詞語陣列 / Word or array of words to add
	   * @returns {this} 返回實例以支援鏈式呼叫 / Returns instance for method chaining
	   */
	  add(word) {
	    let self = this;
	    if (Array.isArray(word)) {
	      word.forEach(v => self._add(v));
	    } else {
	      self._add(word);
	    }
	    return this;
	  }
	  /**
	   * 內部新增方法
	   * Internal Add Method
	   *
	   * 實際執行將詞語加入表格的邏輯。
	   * 會自動去除詞語前後空白，並忽略空字串。
	   *
	   * Actually performs the logic of adding a word to the table.
	   * Automatically trims whitespace from the word and ignores empty strings.
	   *
	   * @protected
	   * @param {string} word - 要新增的詞語 / Word to add
	   */
	  _add(word) {
	    word = word.trim();
	    if (word) {
	      this.TABLE[word] = true;
	    }
	  }
	  /**
	   * 從表格移除詞語
	   * Remove Word from Table
	   *
	   * 從字典表格中移除指定的詞語。
	   * Removes the specified word from the dictionary table.
	   *
	   * @override
	   * @param {string} word - 要移除的詞語 / Word to remove
	   * @returns {this} 返回實例以支援鏈式呼叫 / Returns instance for method chaining
	   */
	  remove(word) {
	    let self = this;
	    self._remove(word);
	    return this;
	  }
	  /**
	   * 內部移除方法
	   * Internal Remove Method
	   *
	   * 實際執行從表格移除詞語的邏輯。
	   * Actually performs the logic of removing a word from the table.
	   *
	   * @override
	   * @protected
	   * @param {string} word - 要移除的詞語 / Word to remove
	   */
	  _remove(word) {
	    delete this.TABLE[word];
	  }
	  /**
	   * 將表格序列化為字串
	   * Serialize Table to String
	   *
	   * 將字典表格轉換為行格式的字串，每行一個詞語。
	   * 只輸出值為 true 的詞語。
	   *
	   * Converts the dictionary table to a line-format string, one word per line.
	   * Only outputs words with a value of true.
	   *
	   * @override
	   * @param {string} [LF="\n"] - 換行符號 / Line feed character
	   * @returns {string} 序列化後的字串 / Serialized string
	   */
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
