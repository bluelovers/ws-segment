/**
 * 停用詞表格模組
 * Stopword Table Module
 */

import { AbstractTableDictCore, IDICT, IDICT2, IOptions } from '@novel-segment/table-core-abstract';
import { TableDictLine } from '@novel-segment/table-line';
import { ITSTypeAndStringLiteral } from 'ts-type/lib/helper/string';
import { EnumDictDatabase } from '@novel-segment/types';

/**
 * 停用詞表格類別
 * Stopword Table Class
 *
 * 原版 node-segment 的格式，用於儲存停用詞列表。
 * 停用詞是在文字處理中需要被過濾掉的常見詞語，如「的」、「是」、「在」等。
 * 這些詞語通常對語意分析貢獻較小，移除後可提升處理效率。
 *
 * Original node-segment format, used to store a list of stopwords.
 * Stopwords are common words that need to be filtered out during text processing,
 * such as "的" (of), "是" (is), "在" (at), etc.
 * These words typically contribute less to semantic analysis, and removing them
 * can improve processing efficiency.
 *
 * @example
 * ```typescript
 * const stopwordTable = new TableDictStopword();
 * stopwordTable.add(['的', '是', '在', '了']);
 * if (stopwordTable.exists('的')) {
 *   // 跳過停用詞 / Skip stopword
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
	 * 初始化停用詞表格實例。
	 * Initializes a stopword table instance.
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
