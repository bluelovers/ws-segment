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
