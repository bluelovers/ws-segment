import { ILoadDictFileRow2 } from '@novel-segment/util-compare';
import { ArrayTwoOrMore } from '@novel-segment/types';
/**
 * 字典同義詞行資料類型
 * Dictionary Synonym Row Data Type
 *
 * 繼承自 ILoadDictFileRow2，專門用於處理同義詞字典資料。
 * 資料陣列至少包含兩個字串元素（主詞與同義詞）。
 *
 * Extends ILoadDictFileRow2, specifically for handling synonym dictionary data.
 * Data array contains at least two string elements (main word and synonym).
 */
export type IHandleDictSynonym = ILoadDictFileRow2<ArrayTwoOrMore<string>>;
/**
 * 排序同義詞行
 * Sort Synonym Lines
 *
 * 將原始同義詞字典行陣列解析、過濾並排序為結構化的同義詞資料。
 * 每行格式為：主詞,同義詞1,同義詞2,...
 *
 * Parses, filters, and sorts raw synonym dictionary line array into structured synonym data.
 * Each line format: main_word,synonym1,synonym2,...
 *
 * @param {string[]} lines - 原始同義詞字典行字串陣列 / Raw synonym dictionary line string array
 * @param {string} [file] - 來源檔案路徑（選填）/ Source file path (optional)
 * @returns {IHandleDictSynonym[]} 排序後的同義詞資料陣列 / Sorted synonym data array
 */
export declare function sortLines(lines: string[], file?: string): IHandleDictSynonym[];
/**
 * 載入並排序同義詞字典檔案
 * Load and Sort Synonym Dictionary File
 *
 * 非同步載入同義詞字典檔案，並將其內容排序為結構化的同義詞資料。
 * Asynchronously loads a synonym dictionary file and sorts its content into structured synonym data.
 *
 * @param {string} file - 同義詞字典檔案路徑 / Synonym dictionary file path
 * @returns {Promise<IHandleDictSynonym[]>} 排序後的同義詞資料陣列 Promise / Promise of sorted synonym data array
 */
export declare function loadFile(file: string): import("bluebird")<IHandleDictSynonym[]>;
/**
 * 排序同義詞列表
 * Sort Synonym List
 *
 * 根據 CJK 字元順序及原始索引位置對同義詞資料進行排序。
 * 排序規則：
 * 1. 標籤註解行（COMMENT_TAG）優先處理，@ 開頭的標籤排在前面
 * 2. 一般註解行（COMMENT）依原始索引順序排列
 * 3. 基礎行（BASE）依 CJK 字元順序排序，相同時依原始索引排序
 *
 * Sorts synonym data based on CJK character order and original index position.
 * Sorting rules:
 * 1. Tagged comment lines (COMMENT_TAG) are processed first, @-prefixed tags come first
 * 2. Regular comment lines (COMMENT) are ordered by original index
 * 3. Base lines (BASE) are sorted by CJK character order, with original index as tiebreaker
 *
 * @template T - 行資料類型，繼承自 ILoadDictFileRow2 / Row data type, extends ILoadDictFileRow2
 * @param {T[]} ls - 待排序的列表 / List to be sorted
 * @returns {T[]} 排序後的列表 / Sorted list
 */
export declare function SortList<T extends ILoadDictFileRow2<any> = ILoadDictFileRow2>(ls: T[]): T[];
export default sortLines;
