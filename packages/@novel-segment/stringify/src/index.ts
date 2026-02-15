/**
 * 字串化模組
 * Stringify Module
 *
 * 提供將斷詞結果轉換為字串的功能。
 * 支援將詞詞物件 (IWord) 陣列或字串陣列轉換為純文字。
 *
 * Provides functionality to convert segmentation results to strings.
 * Supports converting word object (IWord) arrays or string arrays to plain text.
 *
 * @module @novel-segment/stringify
 */

import { IWord } from '@novel-segment/types';
import { ITSArrayListMaybeReadonly } from 'ts-type/lib/type/base';

/**
 * 字串化輸入類型
 * Stringify Input Type
 *
 * 定義可被字串化的輸入資料類型。
 * 支援詞詞物件 (IWord) 或字串的陣列（可為唯讀）。
 *
 * Defines input data types that can be stringified.
 * Supports arrays of word objects (IWord) or strings (can be readonly).
 */
export type IStringifyWordInput = ITSArrayListMaybeReadonly<IWord | string>;

/**
 * 將詞詞陣列轉換為字串陣列
 * Convert Word Array to String Array
 *
 * 將斷詞結果中的每個項目轉換為對應的字串。
 * 若項目為字串則直接返回；若為詞詞物件則取其 w 屬性（詞彙內容）。
 *
 * Converts each item in the segmentation result to its corresponding string.
 * If the item is a string, returns it directly; if it's a word object, takes its w property (word content).
 *
 * @param {IStringifyWordInput} words - 斷詞結果陣列 / Segmentation result array
 * @param {...any[]} argv - 額外參數（保留供擴充使用）/ Additional parameters (reserved for extension)
 * @returns {string[]} 字串陣列 / String array
 * @throws {TypeError} 當項目不是有效的斷詞結果時拋出 / Throws when item is not a valid segmentation result
 */
export function stringifyList(words: IStringifyWordInput, ...argv: any[]): string[]
{
	return words.map(function (item)
	{
		// 若為字串直接返回 / If string, return directly
		if (typeof item === 'string')
		{
			return item;
		}
		// 若為詞詞物件，取其詞彙內容 / If word object, take its word content
		else if ('w' in item)
		{
			return item.w;
		}
		else
		{
			// 無效的斷詞結果格式 / Invalid segmentation result format
			throw new TypeError(`not a valid segment result list`)
		}
	});
}

/**
 * 將斷詞陣列連接成字串
 * Join Word Array into String
 *
 * 将单词数组连接成字符串。
 * 將斷詞結果轉換為連續的文字字串，用於顯示或比對。
 *
 * Joins word array into a string.
 * Converts segmentation result to continuous text string for display or comparison.
 *
 * @param {IStringifyWordInput} words - 断词结果数组 / Segmentation result array
 * @param {...any[]} argv - 額外參數（保留供擴充使用）/ Additional parameters (reserved for extension)
 * @returns {string} 連接後的字串 / Joined string
 */
export function stringify(words: IStringifyWordInput, ...argv: any[]): string
{
	return stringifyList(words, ...argv).join('');
}

export default stringify
