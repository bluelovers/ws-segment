import { ILoadDictFileRow2 } from '@novel-segment/util-compare';
/**
 * 字典表格行資料類型
 * Dictionary Table Row Data Type
 *
 * 繼承自 ILoadDictFileRow2，用於處理字典表格資料。
 * Extends ILoadDictFileRow2 for handling dictionary table data.
 */
export type IHandleDictTable = ILoadDictFileRow2;
/**
 * 排序選項介面
 * Sort Options Interface
 *
 * 提供排序過程中可選的回呼函式配置。
 * Provides optional callback function configuration during sorting process.
 */
export interface IOptions {
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
    cbIgnore?(cur: IHandleDictTable): any;
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
export declare function sortLines(lines: string[], file?: string, options?: IOptions): IHandleDictTable[];
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
export declare function loadFile(file: string, options?: IOptions): import("bluebird")<IHandleDictTable[]>;
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
export declare function SortList<T extends ILoadDictFileRow2<any> = ILoadDictFileRow2>(ls: T[]): T[];
export default sortLines;
