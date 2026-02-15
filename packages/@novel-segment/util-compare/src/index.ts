import BluebirdPromise from 'bluebird';
import { parseLine as parseLineSegment } from '@novel-segment/loaders/segment/index';
import { IDict, load } from '@novel-segment/loader-line';
import { array_unique } from 'array-hyper-unique';

/**
 * CJK (中日韓) 模式常數
 * CJK (Chinese, Japanese, Korean) mode constant
 *
 * 用於指定 CJK 字元處理模式，數值 2 代表使用進階模式。
 * Used to specify the CJK character processing mode, value 2 represents advanced mode.
 */
export const USE_CJK_MODE = 2 as const;

/**
 * 行類型列舉
 * Line Type Enumeration
 *
 * 用於識別字典檔案中每一行的類型，以便進行對應的處理。
 * Used to identify the type of each line in dictionary files for appropriate processing.
 */
export const enum EnumLineType
{
	// 基礎行類型，代表正常的字典資料行 / Base line type, representing normal dictionary data line
	BASE = 0,
	// 註解行類型，以 // 開頭的行 / Comment line type, lines starting with //
	COMMENT = 1,
	// 標籤註解行類型，包含特殊標籤如 @todo 或格式說明 / Tagged comment line type, containing special tags like @todo or format descriptions
	COMMENT_TAG = 2,
}

/**
 * 擴展的字典檔案行資料介面
 * Extended Dictionary File Row Data Interface
 *
 * 繼承自 ILoadDictFileRow，額外包含檔案來源、CJK ID 及行類型資訊。
 * Extends ILoadDictFileRow with additional file source, CJK ID, and line type information.
 */
export type ILoadDictFileRow2<D extends any = [string, number, number, ...any[]]> = ILoadDictFileRow<D> & {
	// 來源檔案路徑 / Source file path
	file: string,
	// CJK 字元的標準化識別 ID / Normalized identification ID for CJK characters
	cjk_id: string,

	// 行類型，用於分類處理 / Line type, used for classification processing
	line_type: EnumLineType,
}

/**
 * 字典檔案行資料介面
 * Dictionary File Row Data Interface
 *
 * 定義字典檔案中每一行的標準資料結構，包含解析後的資料、原始行內容及索引位置。
 * Defines the standard data structure for each line in a dictionary file, containing parsed data, original line content, and index position.
 */
export interface ILoadDictFileRow<D = [string, number, number, ...any[]]>
{
	// 解析後的資料陣列 / Parsed data array
	data: D,
	// 原始行字串 / Original line string
	line: string,
	// 在檔案中的行索引 / Line index in the file
	index: number,
}

/**
 * 解包行資料類型
 * Unpack Row Data Type
 *
 * 從 ILoadDictFileRow 類型中提取 data 屬性的類型。
 * Extracts the type of the data property from ILoadDictFileRow type.
 */
export type IUnpackRowData<T extends ILoadDictFileRow<any>> = T extends {
	data: infer D
} ? D : never;

/**
 * 解析函式類型
 * Parse Function Type
 *
 * 定義將原始行字串解析為結構化資料的函式簽名。
 * Defines the function signature for parsing raw line strings into structured data.
 */
export type IParseFn<D = any> = (line: string) => D;

/**
 * 處理字典行的選項介面
 * Options Interface for Handling Dictionary Lines
 *
 * 包含解析函式等處理字典行所需的配置選項。
 * Contains configuration options needed for handling dictionary lines, including the parse function.
 */
export interface IOptionsHandleDictLines<D = any>
{
	// 用於解析每一行的函式 / Function used to parse each line
	parseFn: IParseFn<D>;
}

/**
 * 部分處理字典行的選項介面
 * Partial Options Interface for Handling Dictionary Lines
 *
 * 所有屬性皆為選填的處理選項介面。
 * Options interface where all properties are optional.
 */
export interface IOptionsHandleDictLinesPartial<D = any> extends Partial<IOptionsHandleDictLines<D>>
{

}

/**
 * 處理字典行的回呼函式類型
 * Callback Function Type for Handling Dictionary Lines
 *
 * 定義用於過濾或處理每一行資料的回呼函式簽名。
 * Defines the callback function signature for filtering or processing each line of data.
 */
export type IFnHandleDictLines<T = ILoadDictFileRow> = (list: T[], cur: T) => boolean;

/**
 * 將字典行列表轉換為字串陣列
 * Convert Dictionary Line List to String Array
 *
 * 從行資料中提取原始行字串，並可選擇是否進行唯一化處理。
 * Extracts original line strings from row data, with optional uniqueness processing.
 *
 * @template T - 行資料類型，繼承自 ILoadDictFileRow / Row data type, extends ILoadDictFileRow
 * @param {T[]} list - 要處理的行資料陣列 / Array of row data to process
 * @param {object} [options] - 選項物件 / Options object
 * @param {boolean} [options.disableUnique] - 是否停用唯一化處理 / Whether to disable uniqueness processing
 * @returns {string[]} 行字串陣列 / Array of line strings
 */
export function stringifyHandleDictLinesList<T extends ILoadDictFileRow<any> = ILoadDictFileRow>(list: T[], options?: {
	disableUnique?: boolean
})
{
	// 從每個行資料中提取原始行字串 / Extract original line strings from each row data
	let lines = list.map(v => v.line);

	// 如果停用唯一化，直接返回原始陣列 / If uniqueness is disabled, return the original array
	if (options?.disableUnique)
	{
		return lines
	}

	// 對行字串進行唯一化處理，移除重複項 / Perform uniqueness processing on line strings, removing duplicates
	return array_unique(lines)
}

/**
 * 處理字典行資料
 * Handle Dictionary Line Data
 *
 * 將原始字典行資料解析為結構化格式，並可透過回呼函式進行過濾處理。
 * Parses raw dictionary line data into structured format, with optional filtering through callback function.
 *
 * @template T - 行資料類型，繼承自 ILoadDictFileRow / Row data type, extends ILoadDictFileRow
 * @param {IDict} lines - 字典行資料物件 / Dictionary line data object
 * @param {IFnHandleDictLines<T>} fn - 處理每一行的回呼函式，返回 true 保留該行 / Callback function for each line, return true to keep the line
 * @param {IOptionsHandleDictLines<IUnpackRowData<T>>} options - 處理選項，包含解析函式 / Processing options, containing parse function
 * @returns {T[]} 處理後的行資料陣列 / Processed array of row data
 */
export function handleDictLines<T extends ILoadDictFileRow<any> = ILoadDictFileRow>(lines: IDict,
	fn: IFnHandleDictLines<T>,
	options: IOptionsHandleDictLines<IUnpackRowData<T>>,
): T[]
{
	// 如果沒有傳入行資料，返回空陣列 / If no line data is provided, return empty array
	if (!lines)
	{
		return [] as T[]
	}

	const { parseFn } = options;

	// 使用 reduce 迭代處理每一行 / Use reduce to iteratively process each line
	return lines.reduce(function (a, line, index)
	{
		let bool: boolean;

		// 使用解析函式將原始行轉換為結構化資料 / Use parse function to convert raw line to structured data
		let data = parseFn(line);

		// 建構當前行的資料物件 / Construct the data object for current line
		let cur = {
			data,
			line,
			index,
		};

		// 如果有傳入回呼函式，呼叫以決定是否保留該行 / If callback function is provided, call it to decide whether to keep the line
		if (fn)
		{
			// @ts-ignore
			bool = fn(a, cur)
		}
		else
		{
			// 沒有回呼函式時，預設保留所有行 / When no callback function, keep all lines by default
			bool = true;
		}

		// 如果回呼函式返回 true，將當前行加入結果陣列 / If callback returns true, add current line to result array
		if (bool)
		{
			a.push(cur as any);
		}

		return a;
	}, [] as T[]);
}

/**
 * 載入字典檔案
 * Load Dictionary File
 *
 * 非同步載入字典檔案並解析為結構化的行資料陣列。
 * Asynchronously loads a dictionary file and parses it into a structured array of row data.
 *
 * @template T - 行資料類型，繼承自 ILoadDictFileRow / Row data type, extends ILoadDictFileRow
 * @param {string} file - 字典檔案路徑 / Dictionary file path
 * @param {IFnHandleDictLines<T>} [fn] - 處理每一行的回呼函式 / Callback function for processing each line
 * @param {IOptionsHandleDictLinesPartial<IUnpackRowData<T>>} [options] - 處理選項 / Processing options
 * @returns {BluebirdPromise<T[]>} 解析後的行資料陣列 Promise / Promise of parsed row data array
 */
export function loadDictFile<T extends ILoadDictFileRow<any> = ILoadDictFileRow>(file: string,
	fn?: IFnHandleDictLines<T>,
	options?: IOptionsHandleDictLinesPartial<IUnpackRowData<T>>,
): BluebirdPromise<T[]>
{
	options = options || {};
	// 如果未提供解析函式，使用預設的分段解析函式 / If no parse function provided, use default segment parse function
	// @ts-ignore
	const parseFn: IParseFn<IUnpackRowData<T>> = options.parseFn = options.parseFn || parseLineSegment;

	// 載入檔案並處理每一行 / Load file and process each line
	return load(file)
		.then(function (b)
		{
			return handleDictLines(b, fn, {
				parseFn,
			})
		})
		;
}

/**
 * 檢查行類型
 * Check Line Type
 *
 * 分析行字串以判斷其類型（基礎行、註解行或標籤註解行）。
 * Analyzes a line string to determine its type (base, comment, or tagged comment).
 *
 * @param {string} line - 要檢查的行字串 / Line string to check
 * @returns {EnumLineType} 行類型列舉值 / Line type enumeration value
 */
export function chkLineType(line: string): EnumLineType
{
	// 預設為基礎行類型 / Default to base line type
	let ret = EnumLineType.BASE;

	// 檢查是否以 // 開頭，判斷為註解行 / Check if starts with //, identify as comment line
	if (line.indexOf('//') == 0)
	{
		ret = EnumLineType.COMMENT;

		// 檢查是否包含特殊標籤如 @todo 或格式說明 / Check if contains special tags like @todo or format descriptions
		if (/^\/\/ +(?:\@todo|格式\:)/i.test(line))
		{
			ret = EnumLineType.COMMENT_TAG;
		}
	}

	return ret;
}
