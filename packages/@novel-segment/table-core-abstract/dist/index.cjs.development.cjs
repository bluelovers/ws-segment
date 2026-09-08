'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var lodash = require('lodash');

/**
 * 字典表格核心抽象類別
 * Abstract Dictionary Table Core Class
 *
 * 所有字典表格的基礎抽象類別，提供共用的儲存結構與操作方法。
 * 子類別需實作 add() 與 _add() 方法，可選實作 remove() 與 stringify()。
 *
 * Base abstract class for all dictionary tables, providing shared storage
 * structures and operations. Subclasses must implement add() and _add() methods,
 * and optionally implement remove() and stringify().
 *
 * @template T - 表格儲存的值類型 / The type of values stored in the table
 */
class AbstractTableDictCore {
  TABLE = Object.create(null);
  TABLE2 = Object.create(null);
  /**
   * 建構函式
   * Constructor
   *
   * 初始化字典表格實例，可傳入現有表格資料以複用。
   *
   * Initializes a dictionary table instance, optionally accepting existing
   * table data for reuse.
   *
   * @param {string} type - 表格類型識別碼 / Table type identifier
   * @param {IOptions} options - 表格選項 / Table options
   * @param {ITableDictExistsTable<T>} existsTable - 現有表格資料 / Existing table data
   * @param {...any} argv - 其他參數 / Additional arguments
   */
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
  /**
   * 內部存在檢查輔助方法
   * Internal Exists Check Helper Method
   *
   * 從各種輸入格式中提取詞語字串。
   * 支援字串、陣列或 IWord 物件格式。
   *
   * Extracts word string from various input formats.
   * Supports string, array, or IWord object formats.
   *
   * @protected
   * @template U - 輸入資料類型 / Input data type
   * @param {U} data - 輸入資料 / Input data
   * @param {...any} argv - 其他參數 / Additional arguments
   * @returns {string} 提取的詞語 / Extracted word
   */
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
  /**
   * 檢查詞語是否存在於表格中
   * Check if Word Exists in Table
   *
   * 查詢主字典表格中是否存在指定的詞語。
   * 若存在則返回對應的值，否則返回 null。
   *
   * Queries the main dictionary table for the specified word.
   * Returns the corresponding value if exists, otherwise returns null.
   *
   * @template U - 輸入資料類型 / Input data type
   * @param {U} data - 輸入資料（字串、陣列或 IWord） / Input data (string, array, or IWord)
   * @param {...any} argv - 其他參數 / Additional arguments
   * @returns {T | null} 存在時返回對應值，否則返回 null / Corresponding value if exists, null otherwise
   */
  exists(data, ...argv) {
    const w = this._exists(data);
    return this.TABLE[w] || null;
  }
  /**
   * 新增詞語到表格
   * Add Word to Table
   *
   * 抽象方法，子類別必須實作。
   * 將詞語及其相關資料加入字典表格。
   *
   * Abstract method that subclasses must implement.
   * Adds a word and its associated data to the dictionary table.
   *
   * @abstract
   * @param {any} data - 要新增的資料 / Data to add
   * @param {...any} argv - 其他參數 / Additional arguments
   * @returns {this} 返回實例以支援鏈式呼叫 / Returns instance for method chaining
   */

  /**
   * 內部新增方法
   * Internal Add Method
   *
   * 抽象方法，子類別必須實作。
   * 實際執行將資料加入表格的邏輯。
   *
   * Abstract method that subclasses must implement.
   * Actually performs the logic of adding data to the table.
   *
   * @abstract
   * @protected
   * @param {any} data - 要新增的資料 / Data to add
   * @param {...any} argv - 其他參數 / Additional arguments
   */

  /**
   * 從表格移除詞語
   * Remove Word from Table
   *
   * 可選方法，子類別可依需求實作。
   * 從字典表格中移除指定的詞語。
   *
   * Optional method that subclasses can implement as needed.
   * Removes the specified word from the dictionary table.
   *
   * @param {any} data - 要移除的資料 / Data to remove
   * @param {...any} argv - 其他參數 / Additional arguments
   * @returns {this} 返回實例以支援鏈式呼叫 / Returns instance for method chaining
   */

  /**
   * 內部移除方法
   * Internal Remove Method
   *
   * 可選方法，子類別可依需求實作。
   * 實際執行從表格移除資料的邏輯。
   *
   * Optional method that subclasses can implement as needed.
   * Actually performs the logic of removing data from the table.
   *
   * @protected
   * @param {any} data - 要移除的資料 / Data to remove
   * @param {...any} argv - 其他參數 / Additional arguments
   */

  /**
   * 匯出表格為 JSON 物件
   * Export Table as JSON Object
   *
   * 返回主字典表格的深拷貝，避免外部修改影響內部資料。
   * Returns a deep copy of the main dictionary table to prevent
   * external modifications from affecting internal data.
   *
   * @param {...any} argv - 其他參數 / Additional arguments
   * @returns {IDICT<T>} 表格的深拷貝 / Deep copy of the table
   */
  json(...argv) {
    return lodash.cloneDeep(this.TABLE);
  }
  /**
   * 將表格序列化為字串
   * Serialize Table to String
   *
   * 可選方法，子類別可依需求實作。
   * 將字典表格轉換為可儲存或傳輸的字串格式。
   *
   * Optional method that subclasses can implement as needed.
   * Converts the dictionary table to a string format for storage or transmission.
   *
   * @param {...any} argv - 其他參數 / Additional arguments
   * @returns {string} 序列化後的字串 / Serialized string
   */

  /**
   * 取得表格中的詞語數量
   * Get Word Count in Table
   *
   * 返回主字典表格中儲存的詞語總數。
   * Returns the total number of words stored in the main dictionary table.
   *
   * @returns {number} 詞語數量 / Word count
   */
  size() {
    return Object.keys(this.TABLE).length;
  }
}

exports.AbstractTableDictCore = AbstractTableDictCore;
exports.default = AbstractTableDictCore;
//# sourceMappingURL=index.cjs.development.cjs.map
