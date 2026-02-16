/**
 * 分隔詞表格模組
 * Stopword (Separator) Table Module
 */

import { AbstractTableDictCore, IDICT, IDICT2, IOptions } from '@novel-segment/table-core-abstract';
import { TableDictLine } from '@novel-segment/table-line';
import { ITSTypeAndStringLiteral } from 'ts-type/lib/helper/string';
import { EnumDictDatabase } from '@novel-segment/types';

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
export class TableDictStopword extends TableDictLine
{
	/**
	 * 表格類型識別碼
	 * Table Type Identifier
	 *
	 * 固定為 EnumDictDatabase.STOPWORD，用於識別此表格類型。
	 * Fixed as EnumDictDatabase.STOPWORD, used to identify this table type.
	 */
	static override readonly type: ITSTypeAndStringLiteral<EnumDictDatabase.STOPWORD> = EnumDictDatabase.STOPWORD;

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
	constructor(type: string = TableDictStopword.type, options?: IOptions, ...argv)
	{
		super(type, options, ...argv)
	}
}

export default TableDictStopword
