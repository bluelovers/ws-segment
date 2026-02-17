'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var tableSynonymPangu = require('@novel-segment/table-synonym-pangu');

/**
 * 同義詞表格類別
 * Synonym Table Class
 *
 * 請注意：這與原版 node-segment 的格式不同。
 * Note: This format differs from the original node-segment.
 *
 * 原版格式：一對一 => 錯字,正字
 * Original format: One-to-one => wrong_word,correct_word
 *
 * 此類別格式：一對多，順序與原版相反 => 正字,錯字,...以逗號分隔更多字
 * This class format: One-to-many, order reversed from original => correct_word,wrong_word,...more words separated by comma
 *
 * 支援將一個正確詞語對應到多個同義詞/變體詞，適用於：
 * - 簡繁轉換對應
 * - 錯字校正
 * - 同義詞替換
 *
 * Supports mapping one correct word to multiple synonyms/variant words, suitable for:
 * - Simplified/traditional Chinese conversion
 * - Typo correction
 * - Synonym replacement
 *
 * @example
 * ```typescript
 * const synonymTable = new TableDictSynonym();
 * // 正字為「臺灣」，對應到「台灣」、「台湾」等變體
 * // Correct word is "臺灣", mapping to variants like "台灣", "台湾"
 * synonymTable.add(['臺灣', '台灣', '台湾']);
 * ```
 */
class TableDictSynonym extends tableSynonymPangu.TableDictSynonymPanGu {
  /**
   * 建構函式
   * Constructor
   *
   * 初始化同義詞表格實例。
   * Initializes a synonym table instance.
   *
   * @param {string} [type] - 表格類型識別碼，預設為 TableDictSynonym.type / Table type identifier, defaults to TableDictSynonym.type
   * @param {IOptionsTableDictSynonym} [options] - 表格選項 / Table options
   * @param {...any} argv - 其他參數 / Additional arguments
   */
  constructor(type = TableDictSynonym.type, options, ...argv) {
    super(type, options, ...argv);
  }
  /**
   * 新增同義詞對應
   * Add Synonym Mapping
   *
   * 新增一對多的同義詞對應關係。
   * 陣列第一個元素為正字（主鍵），後續元素為變體詞。
   *
   * Adds a one-to-many synonym mapping relationship.
   * The first element of the array is the correct word (main key),
   * subsequent elements are variant words.
   *
   * @param {ArrayTwoOrMore<string>} data - 同義詞對應陣列，至少需兩個元素 / Synonym mapping array, requires at least two elements
   * @param {boolean} [skipExists] - 若變體詞已存在則跳過 / Skip if variant word already exists
   * @param {boolean} [forceOverwrite] - 強制覆寫已存在的對應 / Force overwrite existing mappings
   * @returns {this} 返回實例以支援鏈式呼叫 / Returns instance for method chaining
   * @throws {TypeError} 當輸入格式不正確時拋出錯誤 / Throws error when input format is incorrect
   */
  add(data, skipExists, forceOverwrite) {
    var _self$TABLE, _self$TABLE$w, _this$options$skipExi;
    if (!Array.isArray(data) || data.length < 2) {
      throw new TypeError(JSON.stringify(data));
    }
    const w = this._trim(data.shift());
    if (!w.length) {
      throw new TypeError(JSON.stringify(data));
    }
    const self = this;
    (_self$TABLE$w = (_self$TABLE = self.TABLE2)[w]) !== null && _self$TABLE$w !== void 0 ? _self$TABLE$w : _self$TABLE[w] = [];
    forceOverwrite !== null && forceOverwrite !== void 0 ? forceOverwrite : forceOverwrite = this.options.forceOverwrite;
    skipExists !== null && skipExists !== void 0 ? skipExists : skipExists = (_this$options$skipExi = this.options.skipExists) !== null && _this$options$skipExi !== void 0 ? _this$options$skipExi : true;
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
//# sourceMappingURL=index.cjs.development.cjs.map
