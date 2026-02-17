(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@novel-segment/loaders/segment/index'), require('@lazy-cjk/zh-table-list/list'), require('@novel-segment/table-core-abstract')) :
	typeof define === 'function' && define.amd ? define(['exports', '@novel-segment/loaders/segment/index', '@lazy-cjk/zh-table-list/list', '@novel-segment/table-core-abstract'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.NovelSegmentTableDict = {}, global.index, global.list, global.tableCoreAbstract));
})(this, (function (exports, index, list, tableCoreAbstract) { 'use strict';

	/**
	 * 檢查值是否非數字
	 * Check if Value is Not a Number
	 *
	 * 型別守衛函式，判斷值是否為非數字類型或 NaN。
	 * Type guard function that determines if a value is not a number type or is NaN.
	 *
	 * @template T - 輸入值的類型 / Type of input value
	 * @param {T} val - 要檢查的值 / Value to check
	 * @returns {boolean} 若非數字或 NaN 則返回 true / Returns true if not a number or NaN
	 */
	function notNum(val) {
	  return typeof val !== 'number' || Number.isNaN(val);
	}
	/**
	 * 字典表格類別
	 * Dictionary Table Class
	 *
	 * 主要的字典表格實作，用於儲存詞語及其詞性、詞頻等資訊。
	 * 支援自動簡繁轉換功能，可自動為詞語建立簡體、繁體、日文漢字等變體。
	 *
	 * Main dictionary table implementation for storing words along with
	 * their part of speech, frequency, and other information.
	 * Supports automatic CJK conversion, automatically creating variants
	 * for simplified/traditional Chinese and Japanese kanji.
	 *
	 * @todo 掛接其他 dict / Connect to other dictionaries
	 */
	class TableDict extends tableCoreAbstract.AbstractTableDictCore {
	  /**
	   * 檢查詞語是否存在於表格中
	   * Check if Word Exists in Table
	   *
	   * 覆寫父類別方法，返回 ITableDictRow 類型。
	   * Overrides parent method to return ITableDictRow type.
	   *
	   * @override
	   * @param {IWord | IDictRow | string} data - 輸入資料 / Input data
	   * @returns {ITableDictRow} 詞條資料 / Entry data
	   */
	  exists(data) {
	    return super.exists(data);
	  }
	  /**
	   * 內部輸入處理方法
	   * Internal Input Handler Method
	   *
	   * 將各種格式的輸入資料統一轉換為標準格式。
	   * 支援字串、陣列或 IWord 物件格式。
	   *
	   * Unifies various input formats into a standard format.
	   * Supports string, array, or IWord object formats.
	   *
	   * @protected
	   * @param {IWord | IDictRow | string} data - 輸入資料 / Input data
	   * @param {boolean} [skipExists] - 是否跳過查詢現有詞條以填充預設值 / Whether to skip querying existing entries to fill default values
	   * @returns {{ data: { w: string, p: number, f: number }, plus: Array<string | number> }} 處理後的資料物件，包含詞語資料與額外欄位 / Processed data object containing word data and additional fields
	   */
	  __handleInput(data, skipExists) {
	    let w, p, f;
	    let plus;
	    if (typeof data === 'string') {
	      w = data;
	    } else if (Array.isArray(data)) {
	      [w, p, f, ...plus] = data;
	    } else {
	      ({
	        w,
	        p,
	        f
	      } = data);
	    }
	    if (typeof w !== 'string' || w === '') {
	      throw new TypeError(JSON.stringify(data));
	    }
	    if (!skipExists && (p === null || f === null)) {
	      let _orig = this.exists(w);
	      if (_orig) {
	        if (p === null) p = _orig.p;
	        if (f === null) f = _orig.f;
	      }
	    }
	    p = notNum(p) ? 0 : p;
	    f = notNum(f) ? 0 : f;
	    return {
	      data: {
	        w,
	        p,
	        f
	      },
	      plus
	    };
	  }
	  /**
	   * 新增詞語到表格
	   * Add Word to Table
	   *
	   * 將詞語及其詞性、詞頻加入字典表格。
	   * 若啟用 autoCjk 選項，會自動建立簡繁轉換變體。
	   *
	   * Adds a word along with its part of speech and frequency to the dictionary table.
	   * If autoCjk option is enabled, automatically creates simplified/traditional variants.
	   *
	   * 若未跳過查詢且詞性或詞頻為 null，則嘗試從現有詞條繼承值
	   * 此邏輯用於更新現有詞條時保留原有的詞性或詞頻值。
	   *
	   * If not skipping lookup and POS or frequency is null, try to inherit from existing entry
	   * This logic preserves existing POS or frequency values when updating an entry.
	   *
	   * 條件說明：
	   * - !skipExists: 允許查詢現有詞條（skipExists 為 false 或 undefined）
	   * - p === null: 詞性未提供（明確傳入 null）
	   * - f === null: 詞頻未提供（明確傳入 null）
	   *
	   * @param {IWord | IDictRow | string} data - 輸入資料 / Input data
	   * @param {boolean} [skipExists] - 若詞語已存在則跳過 / Skip if word already exists
	   * @returns {this} 返回實例以支援鏈式呼叫 / Returns instance for method chaining
	   */
	  add(data, skipExists) {
	    let w, p, f;
	    {
	      let ret = this.__handleInput(data, skipExists);
	      ({
	        w,
	        p,
	        f
	      } = ret.data);
	    }
	    if (skipExists && this.exists(w)) {
	      return this;
	    }
	    this._add({
	      w,
	      p,
	      f,
	      s: true
	    });
	    let self = this;
	    /**
	     * 自動建立中日韓字元變體
	     * Automatically Create CJK Character Variants
	     *
	     * @todo 需要更聰明的作法 目前的做法實在太蠢
	     *       Need a smarter approach, current implementation is too inefficient
	     *
	     * @BUG 在不明原因下 似乎不會正確的添加每個項目 如果遇到這種情形請手動添加簡繁項目
	     *      Under unknown circumstances, some items may not be added correctly.
	     *      If this occurs, please manually add simplified/traditional variants.
	     */
	    if (this.options.autoCjk) {
	      let wa = list.textList(w);
	      wa.forEach(function (w2) {
	        if (w2 !== w && !self.exists(w2)) {
	          self._add({
	            w: w2,
	            p,
	            f
	          });
	        }
	      });
	    }
	    return this;
	  }
	  /**
	   * 內部新增方法
	   * Internal Add Method
	   *
	   * 實際執行將詞語加入表格的邏輯。
	   * 同時更新主字典表格與二維字典表格。
	   *
	   * Actually performs the logic of adding a word to the table.
	   * Updates both the main dictionary table and the two-dimensional table.
	   *
	   * @protected
	   * @param {Object} param0 - 詞條參數 / Entry parameters
	   * @param {string} param0.w - 詞語 / Word
	   * @param {number} param0.p - 詞性 / Part of speech
	   * @param {number} param0.f - 詞頻 / Frequency
	   * @param {boolean} [param0.s] - 同步標記 / Sync flag
	   */
	  _add({
	    w,
	    p,
	    f,
	    s
	  }) {
	    let len = w.length;
	    this.TABLE[w] = {
	      p,
	      f,
	      s
	    };
	    if (!this.TABLE2[len]) this.TABLE2[len] = {};
	    this.TABLE2[len][w] = this.TABLE[w];
	  }
	  /**
	   * 從表格移除詞語
	   * Remove Word from Table
	   *
	   * 從字典表格中移除指定的詞語。
	   * 同時從主字典表格與二維字典表格中移除。
	   *
	   * Removes the specified word from the dictionary table.
	   * Removes from both the main dictionary table and the two-dimensional table.
	   *
	   * @override
	   * @param {IWord | IDictRow | string} target - 要移除的詞語 / Word to remove
	   * @returns {this} 返回實例以支援鏈式呼叫 / Returns instance for method chaining
	   */
	  remove(target) {
	    let {
	      data,
	      plus
	    } = this.__handleInput(target);
	    this._remove(data);
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
	   * @param {IWord} param0 - 詞條參數 / Entry parameters
	   * @param {string} param0.w - 詞語 / Word
	   * @param {number} [param0.p] - 詞性 / Part of speech
	   * @param {number} [param0.f] - 詞頻 / Frequency
	   * @param {boolean} [param0.s] - 同步標記 / Sync flag
	   * @returns {this} 返回實例以支援鏈式呼叫 / Returns instance for method chaining
	   */
	  _remove({
	    w,
	    p,
	    f,
	    s
	  }) {
	    let len = w.length;
	    delete this.TABLE[w];
	    if (this.TABLE2[len]) {
	      delete this.TABLE2[len][w];
	    }
	    return this;
	  }
	  /**
	   * 將表格序列化為字串
	   * Serialize Table to String
	   *
	   * 將目前的字典表格匯出為行格式的字串。
	   * 每行格式為：詞語 詞性 詞頻
	   *
	   * Exports the current dictionary table to a line-format string.
	   * Each line format: word part_of_speech frequency
	   *
	   * @override
	   * @param {string} [LF="\n"] - 換行符號 / Line feed character
	   * @returns {string} 序列化後的字串 / Serialized string
	   */
	  stringify(LF = "\n") {
	    let self = this;
	    return Object.entries(self.TABLE).reduce(function (a, [w, {
	      p,
	      f
	    }]) {
	      let line = index.stringifyLine([w, p, f]);
	      a.push(line);
	      return a;
	    }, []).join(typeof LF === 'string' ? LF : "\n");
	  }
	}

	exports.TableDict = TableDict;
	exports.default = TableDict;
	exports.notNum = notNum;

	Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=index.umd.development.cjs.map
