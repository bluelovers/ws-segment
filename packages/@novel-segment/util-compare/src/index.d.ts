import BluebirdPromise from 'bluebird';
import { IDict } from '@novel-segment/loader-line';
/**
 * CJK (中日韓) 模式常數
 * CJK (Chinese, Japanese, Korean) mode constant
 *
 * 用於指定 CJK 字元處理模式，數值 2 代表使用進階模式。
 * Used to specify the CJK character processing mode, value 2 represents advanced mode.
 */
export declare const USE_CJK_MODE: 2;
/**
 * 行類型列舉
 * Line Type Enumeration
 *
 * 用於識別字典檔案中每一行的類型，以便進行對應的處理。
 * Used to identify the type of each line in dictionary files for appropriate processing.
 */
export declare const enum EnumLineType {
    BASE = 0,
    COMMENT = 1,
    COMMENT_TAG = 2
}
/**
 * 擴展的字典檔案行資料介面
 * Extended Dictionary File Row Data Interface
 *
 * 繼承自 ILoadDictFileRow，額外包含檔案來源、CJK ID 及行類型資訊。
 * Extends ILoadDictFileRow with additional file source, CJK ID, and line type information.
 */
export type ILoadDictFileRow2<D extends any = [string, number, number, ...any[]]> = ILoadDictFileRow<D> & {
    file: string;
    cjk_id: string;
    line_type: EnumLineType;
};
/**
 * 字典檔案行資料介面
 * Dictionary File Row Data Interface
 *
 * 定義字典檔案中每一行的標準資料結構，包含解析後的資料、原始行內容及索引位置。
 * Defines the standard data structure for each line in a dictionary file, containing parsed data, original line content, and index position.
 */
export interface ILoadDictFileRow<D = [string, number, number, ...any[]]> {
    data: D;
    line: string;
    index: number;
}
/**
 * 解包行資料類型
 * Unpack Row Data Type
 *
 * 從 ILoadDictFileRow 類型中提取 data 屬性的類型。
 * Extracts the type of the data property from ILoadDictFileRow type.
 */
export type IUnpackRowData<T extends ILoadDictFileRow<any>> = T extends {
    data: infer D;
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
export interface IOptionsHandleDictLines<D = any> {
    parseFn: IParseFn<D>;
}
/**
 * 部分處理字典行的選項介面
 * Partial Options Interface for Handling Dictionary Lines
 *
 * 所有屬性皆為選填的處理選項介面。
 * Options interface where all properties are optional.
 */
export interface IOptionsHandleDictLinesPartial<D = any> extends Partial<IOptionsHandleDictLines<D>> {
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
export declare function stringifyHandleDictLinesList<T extends ILoadDictFileRow<any> = ILoadDictFileRow>(list: T[], options?: {
    disableUnique?: boolean;
}): string[];
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
export declare function handleDictLines<T extends ILoadDictFileRow<any> = ILoadDictFileRow>(lines: IDict, fn: IFnHandleDictLines<T>, options: IOptionsHandleDictLines<IUnpackRowData<T>>): T[];
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
export declare function loadDictFile<T extends ILoadDictFileRow<any> = ILoadDictFileRow>(file: string, fn?: IFnHandleDictLines<T>, options?: IOptionsHandleDictLinesPartial<IUnpackRowData<T>>): BluebirdPromise<T[]>;
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
export declare function chkLineType(line: string): EnumLineType;
