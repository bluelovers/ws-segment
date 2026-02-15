/**
 * 黑名單表格模組
 * Blacklist Table Module
 */

import { AbstractTableDictCore, IDICT, IDICT2, IOptions } from '@novel-segment/table-core-abstract';
import { TableDictLine } from '@novel-segment/table-line';
import { EnumDictDatabase } from '@novel-segment/types';
import { ITSTypeAndStringLiteral } from 'ts-type/lib/helper/string';

/**
 * 黑名單表格類別
 * Blacklist Table Class
 *
 * 繼承自 TableDictLine，用於儲存需要被過濾或排除的詞語。
 * 黑名單中的詞語在分詞過程中會被標記或移除。
 *
 * Inherits from TableDictLine, used to store words that need to be filtered or excluded.
 * Words in the blacklist will be marked or removed during the segmentation process.
 *
 * @example
 * ```typescript
 * const blacklist = new TableDictBlacklist();
 * blacklist.add(['敏感詞', '不當用語']);
 * if (blacklist.exists('敏感詞')) {
 *   // 處理黑名單詞語 / Handle blacklisted word
 * }
 * ```
 */
export class TableDictBlacklist extends TableDictLine
{
	/**
	 * 表格類型識別碼
	 * Table Type Identifier
	 *
	 * 固定為 EnumDictDatabase.BLACKLIST，用於識別此表格類型。
	 * Fixed as EnumDictDatabase.BLACKLIST, used to identify this table type.
	 */
	static override readonly type: ITSTypeAndStringLiteral<EnumDictDatabase.BLACKLIST> = EnumDictDatabase.BLACKLIST;

	/**
	 * 建構函式
	 * Constructor
	 *
	 * 初始化黑名單表格實例。
	 * Initializes a blacklist table instance.
	 *
	 * @param {string} [type] - 表格類型識別碼，預設為 TableDictBlacklist.type / Table type identifier, defaults to TableDictBlacklist.type
	 * @param {IOptions} [options] - 表格選項 / Table options
	 * @param {...any} argv - 其他參數 / Additional arguments
	 */
	constructor(type: string = TableDictBlacklist.type, options?: IOptions, ...argv)
	{
		super(type, options, ...argv)
	}
}

export default TableDictBlacklist
