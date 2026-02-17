'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var tableLine = require('@novel-segment/table-line');

/**
 * 分隔詞表格類別
 * Stopword (Separator) Table Class
 *
 * 原版 node-segment 的格式，用於儲存分隔詞列表。
 * 分隔詞是用於切割字串、進行簡易斷詞的字元或詞語，
 * 包括標點符號、特殊符號、語義分隔詞等。
 *
 * Original node-segment format, used to store a list of stopwords (separators).
 * Stopwords (separators) are characters or words used for string splitting
 * and simple word segmentation, including punctuation, special symbols, semantic separators, etc.
 *
 * @example
 * ```typescript
 * const stopwordTable = new TableDictStopword();
 * stopwordTable.add(['，', '。', '的', '是']);
 * if (stopwordTable.exists('的')) {
 *   // 跳過分隔詞 / Skip stopword (separator)
 * }
 * ```
 */
class TableDictStopword extends tableLine.TableDictLine {
  static type = "STOPWORD" /* EnumDictDatabase.STOPWORD */;
  /**
   * 建構函式
   * Constructor
   *
   * 初始化分隔詞表格實例。
   * Initializes a stopword (separator) table instance.
   *
   * @param {string} [type] - 表格類型識別碼，預設為 TableDictStopword.type / Table type identifier, defaults to TableDictStopword.type
   * @param {IOptions} [options] - 表格選項 / Table options
   * @param {...any} argv - 其他參數 / Additional arguments
   */
  constructor(type = TableDictStopword.type, options, ...argv) {
    super(type, options, ...argv);
  }
}

exports.TableDictStopword = TableDictStopword;
exports.default = TableDictStopword;
//# sourceMappingURL=index.cjs.development.cjs.map
