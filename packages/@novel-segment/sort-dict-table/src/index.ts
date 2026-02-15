import {
	chkLineType,
	EnumLineType,
	handleDictLines,
	ILoadDictFileRow2,
	USE_CJK_MODE,
} from '@novel-segment/util-compare';
import { load } from '@novel-segment/loader-line';
import { getCjkName, zhDictCompare } from '@novel-segment/util';
import { parseLine as parseFn } from '@novel-segment/loaders/segment/index';

/**
 * 字典表格行資料類型
 * Dictionary Table Row Data Type
 *
 * 繼承自 ILoadDictFileRow2，用於處理字典表格資料。
 * Extends ILoadDictFileRow2 for handling dictionary table data.
 */
export type IHandleDictTable = ILoadDictFileRow2

/**
 * 排序選項介面
 * Sort Options Interface
 *
 * 提供排序過程中可選的回呼函式配置。
 * Provides optional callback function configuration during sorting process.
 */
export interface IOptions
{
	/**
	 * 忽略行的回呼函式
	 * Callback function for ignored lines
	 *
	 * 當某行被判定為應忽略（如註解行）時呼叫。
	 * Called when a line is determined to be ignored (e.g., comment lines).
	 *
	 * @param {IHandleDictTable} cur - 當前被忽略的行資料 / Current ignored line data
	 * @returns {any} 任意返回值 / Any return value
	 */
	cbIgnore?(cur: IHandleDictTable): any
}

/**
 * 排序字典行
 * Sort Dictionary Lines
 *
 * 將原始字典行陣列解析、過濾並排序為結構化的字典表格資料。
 * Parses, filters, and sorts raw dictionary line array into structured dictionary table data.
 *
 * @param {string[]} lines - 原始字典行字串陣列 / Raw dictionary line string array
 * @param {string} [file] - 來源檔案路徑（選填）/ Source file path (optional)
 * @param {IOptions} [options] - 排序選項 / Sort options
 * @returns {IHandleDictTable[]} 排序後的字典表格資料陣列 / Sorted dictionary table data array
 */
export function sortLines(lines: string[], file?: string, options?: IOptions): IHandleDictTable[]
{
	// 取得忽略行的回呼函式，若未提供則使用空函式 / Get ignore callback, use empty function if not provided
	const cbIgnore = options?.cbIgnore ?? (() => {});

	const list = handleDictLines<IHandleDictTable>(lines, function (list, cur)
	{
		// 記錄來源檔案路徑 / Record source file path
		cur.file = file;

		// 解構解析後的資料：詞語、詞性、頻率 / Destructure parsed data: word, part-of-speech, frequency
		let [w, p, f] = cur.data;

		// 取得 CJK 字元的標準化識別 ID / Get normalized CJK character identification ID
		let cjk_id = getCjkName(w, USE_CJK_MODE);

		cur.cjk_id = cjk_id;
		// 檢查並設定行類型 / Check and set line type
		cur.line_type = chkLineType(cur.line);

		// 如果是註解行，呼叫忽略回呼並排除該行 / If comment line, call ignore callback and exclude the line
		if (cur.line_type === EnumLineType.COMMENT)
		{
			cbIgnore(cur);

			return false;
		}

		// 如果頻率超過 15000，保留原始行格式（目前未實作轉換）/ If frequency exceeds 15000, keep original line format (conversion not implemented)
		if (f > 15000)
		{
			//cur.line = [w, toHex(p), 0].join('|');
		}

		return true;
	}, {
		// @ts-ignore
		parseFn,
	});

	// 對處理後的列表進行排序 / Sort the processed list
	return SortList(list)
}

/**
 * 載入並排序字典檔案
 * Load and Sort Dictionary File
 *
 * 非同步載入字典檔案，並將其內容排序為結構化的字典表格資料。
 * Asynchronously loads a dictionary file and sorts its content into structured dictionary table data.
 *
 * @param {string} file - 字典檔案路徑 / Dictionary file path
 * @param {IOptions} [options] - 排序選項 / Sort options
 * @returns {Promise<IHandleDictTable[]>} 排序後的字典表格資料陣列 Promise / Promise of sorted dictionary table data array
 */
export function loadFile(file: string, options?: IOptions)
{
	return load(file).then(lines => sortLines(lines, file, options))
}

/**
 * 排序字典表格列表
 * Sort Dictionary Table List
 *
 * 根據 CJK 字元順序及原始索引位置對字典表格資料進行排序。
 * 排序規則：
 * 1. 標籤註解行（COMMENT_TAG）依原始索引順序排列
 * 2. 一般註解行（COMMENT）依原始索引順序排列
 * 3. 基礎行（BASE）依 CJK 字元順序排序，相同時依原始索引排序
 *
 * Sorts dictionary table data based on CJK character order and original index position.
 * Sorting rules:
 * 1. Tagged comment lines (COMMENT_TAG) are ordered by original index
 * 2. Regular comment lines (COMMENT) are ordered by original index
 * 3. Base lines (BASE) are sorted by CJK character order, with original index as tiebreaker
 *
 * @template T - 行資料類型，繼承自 ILoadDictFileRow2 / Row data type, extends ILoadDictFileRow2
 * @param {T[]} ls - 待排序的列表 / List to be sorted
 * @returns {T[]} 排序後的列表 / Sorted list
 */
export function SortList<T extends ILoadDictFileRow2<any> = ILoadDictFileRow2>(ls: T[])
{
	return ls.sort(function (a: ILoadDictFileRow2, b: ILoadDictFileRow2)
	{
		// 如果任一行為標籤註解行，依原始索引排序 / If either line is a tagged comment, sort by original index
		if (
			a.line_type === EnumLineType.COMMENT_TAG
			|| b.line_type === EnumLineType.COMMENT_TAG
		)
		{
			return (a.index - b.index);
		}
		// 如果任一行為一般註解行，依原始索引排序 / If either line is a regular comment, sort by original index
		else if (
			a.line_type === EnumLineType.COMMENT
			|| b.line_type === EnumLineType.COMMENT
		)
		{
			return (a.index - b.index);
		}

		// 基礎行依 CJK 字元順序排序，相同時依原始索引排序 / Base lines sorted by CJK order, with index as tiebreaker
		let ret = zhDictCompare(a.cjk_id, b.cjk_id)
			|| (a.index - b.index)
			|| 0
		;

		return ret;
	})
}

export default sortLines
