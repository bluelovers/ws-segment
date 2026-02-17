/**
 * 盤古同義詞表格模組
 * Pangu Synonym Table Module
 *
 * Created by user on 2018/4/19/019.
 */
import { AbstractTableDictCore, IOptions } from '@novel-segment/table-core-abstract';
import { ITSTypeAndStringLiteral } from 'ts-type/lib/helper/string';
import { EnumDictDatabase } from '@novel-segment/types';
/**
 * 盤古同義詞表格類別
 * Pangu Synonym Table Class
 *
 * 原版 node-segment 的格式，實作一對一的同義詞對應。
 * 格式為 [錯字, 正字]，將錯字對應到正確的字詞。
 *
 * 此類別已標記為廢棄，建議使用 TableDictSynonym 類別，
 * 其支援一對多的同義詞對應，功能更為完整。
 *
 * Original node-segment format, implementing one-to-one synonym mapping.
 * Format is [wrong_word, correct_word], mapping wrong words to correct ones.
 *
 * This class is marked as deprecated. It is recommended to use the TableDictSynonym class,
 * which supports one-to-many synonym mapping with more complete functionality.
 *
 * @deprecated 建議使用 TableDictSynonym 類別 / Recommend using TableDictSynonym class
 *
 * @example
 * ```typescript
 * const synonymTable = new TableDictSynonymPanGu();
 * synonymTable.add(['台灣', '臺灣']); // 台灣 -> 臺灣
 * ```
 */
export declare class TableDictSynonymPanGu extends AbstractTableDictCore<string> {
    /**
     * 表格類型識別碼
     * Table Type Identifier
     *
     * 固定為 EnumDictDatabase.SYNONYM，用於識別此表格類型。
     * Fixed as EnumDictDatabase.SYNONYM, used to identify this table type.
     */
    static readonly type: ITSTypeAndStringLiteral<EnumDictDatabase.SYNONYM>;
    /**
     * 建構函式
     * Constructor
     *
     * 初始化盤古同義詞表格實例。
     * Initializes a Pangu synonym table instance.
     *
     * @param {string} [type] - 表格類型識別碼，預設為 TableDictSynonymPanGu.type / Table type identifier, defaults to TableDictSynonymPanGu.type
     * @param {IOptions} [options] - 表格選項 / Table options
     * @param {...any} argv - 其他參數 / Additional arguments
     */
    constructor(type?: string, options?: IOptions, ...argv: any[]);
    /**
     * 新增同義詞對應
     * Add Synonym Mapping
     *
     * 新增一對一的同義詞對應關係。
     * 輸入格式為 [原詞, 對應詞]，長度必須為 2。
     *
     * Adds a one-to-one synonym mapping relationship.
     * Input format is [original_word, mapped_word], length must be 2.
     *
     * @param {[string, string] & string[]} data - 同義詞對應陣列 / Synonym mapping array
     * @param {boolean} [skipExists] - 若原詞已存在則跳過 / Skip if original word already exists
     * @returns {this} 返回實例以支援鏈式呼叫 / Returns instance for method chaining
     * @throws {TypeError} 當輸入格式不正確時拋出錯誤 / Throws error when input format is incorrect
     */
    add(data: [string, string] & string[], skipExists?: boolean): this;
    /**
     * 內部新增方法
     * Internal Add Method
     *
     * 實際執行將同義詞對應加入表格的邏輯。
     * 若原詞與對應詞相同，則不加入。
     * 若存在雙向對應（A->B 且 B->A），則移除反向對應以避免循環。
     *
     * Actually performs the logic of adding synonym mapping to the table.
     * If original word and mapped word are the same, do not add.
     * If bidirectional mapping exists (A->B and B->A), remove reverse mapping to avoid cycles.
     *
     * @protected
     * @param {string} n1 - 原詞 / Original word
     * @param {string} n2 - 對應詞 / Mapped word
     */
    _add(n1: string, n2: string): void;
    /**
     * 內部字串修剪方法
     * Internal String Trim Method
     *
     * 移除字串前後的空白字元。
     * Removes leading and trailing whitespace from a string.
     *
     * @protected
     * @param {string} s - 要修剪的字串 / String to trim
     * @returns {string} 修剪後的字串 / Trimmed string
     */
    protected _trim(s: string): string;
}
export default TableDictSynonymPanGu;
