import { AbstractTableDictCore } from '@novel-segment/table-core-abstract';
/**
 * 行式字典表格抽象類別
 * Abstract Line-based Dictionary Table Class
 *
 * 原版 node-segment 的格式，以行為單位儲存詞語。
 * 每個詞語對應一個布林值，表示該詞語是否存在於表格中。
 * 適用於停用詞、黑名單等只需判斷是否存在的場景。
 *
 * Original node-segment format, storing words line by line.
 * Each word corresponds to a boolean value indicating whether the word exists in the table.
 * Suitable for scenarios like stopwords and blacklists where only existence checking is needed.
 */
export declare abstract class TableDictLine extends AbstractTableDictCore<boolean> {
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
    exists(data: any, ...argv: any[]): boolean;
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
    add(word: string | string[]): this;
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
    _add(word: string): void;
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
    remove(word: string): this;
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
    _remove(word: string): void;
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
    stringify(LF?: string): string;
}
export default TableDictLine;
