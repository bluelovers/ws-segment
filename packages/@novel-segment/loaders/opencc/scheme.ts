/**
 * OpenCC 方案字典載入器模組
 * OpenCC Scheme Dictionary Loader Module
 *
 * 提供 OpenCC 方案格式字典檔案的載入功能。
 * 方案格式支援一對多的詞彙對應，並可包含額外的方案資訊。
 *
 * Provides loading functionality for OpenCC scheme format dictionary files.
 * Scheme format supports one-to-many word mappings and can include additional scheme information.
 *
 * 格式範例 / Format Example:
 * - 詞彙	對應詞1 對應詞2	方案名稱
 * - 詞彙	對應詞1 對應詞2
 *
 * @module @novel-segment/loaders/opencc/scheme
 */

import Promise = require('bluebird');
import { wrapStreamToPromise, IStreamLineWithValue } from '@novel-segment/stream-loader-core/line';
import createLoadStream, { ICallback } from '@novel-segment/stream-loader-core/stream';
import createLoadStreamSync from '@novel-segment/stream-loader-core/sync';
import { autobind } from 'core-decorators';
import { LoaderClass } from '@novel-segment/dict-loader-core';

/**
 * 字典行類型
 * Dictionary Row Type
 *
 * 每行包含：原始詞彙、對應詞彙陣列、選擇性方案名稱。
 * Each row contains: original word, mapped words array, optional scheme name.
 */
export type IDictRow = [string, string[], string] | [string, string[]];

/**
 * 字典類型
 * Dictionary Type
 *
 * 字典行的陣列
 * An array of dictionary rows
 */
export type IDict = IDictRow[];

/**
 * OpenCC 方案字典載入器實例
 * OpenCC Scheme Dictionary Loader Instance
 *
 * 使用 LoaderClass 配置的 OpenCC 方案格式載入器。
 * Loader instance configured for OpenCC scheme format.
 */
const libLoader = new LoaderClass<IDict, IDictRow>({
	/**
	 * 解析一行字典
	 * Parse a single line
	 *
	 * 將 Tab 分隔的行解析為結構化資料。
	 * 第二欄位以空白分隔為陣列。
	 *
	 * Parses a tab-separated line into structured data.
	 * The second field is split by whitespace into an array.
	 *
	 * @param {string} input - 原始行資料 / Raw line data
	 * @returns {IDictRow} 解析後的行資料 / Parsed row data
	 */
	parseLine(input: string): IDictRow
	{
		let data = input
			.replace(/^\s+|\s+$/, '')
			.split(/\t/) as any as IDictRow
		;

		if (data.length > 1)
		{
			// 將第二欄位以空白分隔為陣列
			// Split the second field by whitespace into an array
			// @ts-ignore
			data[1] = (data[1] || '').trim().split(/\s+/);
		}

		if (data.length > 2)
		{
			// 保留第三欄位作為方案名稱
			// Keep the third field as scheme name
			data[2] = (data[2] || '').toString().trim();
		}

		return data;
	},
	/**
	 * 過濾行
	 * Filter a line
	 *
	 * 移除行首尾空白。
	 * Removes leading and trailing whitespace.
	 *
	 * @param {string} input - 原始行資料 / Raw line data
	 * @returns {string} 過濾後的行 / Filtered line
	 */
	filter(input: string)
	{
		return input.trim().replace(/^\s+|\s+$/, '');
	},
});

/**
 * 非同步載入 OpenCC 方案字典
 * Load OpenCC scheme dictionary asynchronously
 */
export const load = libLoader.load as typeof libLoader.load;

/**
 * 同步載入 OpenCC 方案字典
 * Load OpenCC scheme dictionary synchronously
 */
export const loadSync = libLoader.loadSync as typeof libLoader.loadSync;

/**
 * 非同步載入 OpenCC 方案字典串流
 * Load OpenCC scheme dictionary as stream (asynchronous)
 */
export const loadStream = libLoader.loadStream as typeof libLoader.loadStream;

/**
 * 同步載入 OpenCC 方案字典串流
 * Load OpenCC scheme dictionary as stream (synchronous)
 */
export const loadStreamSync = libLoader.loadStreamSync as typeof libLoader.loadStreamSync;

/**
 * 解析單行
 * Parse a single line
 */
export const parseLine = libLoader.parseLine as typeof libLoader.parseLine;

/**
 * 將資料行轉換回字串
 * Stringify a data row
 */
export const stringifyLine = libLoader.stringifyLine as typeof libLoader.stringifyLine;

/**
 * 序列化資料陣列
 * Serialize data array
 */
export const serialize = libLoader.serialize as typeof libLoader.serialize;

/**
 * 載入器實例
 * Loader instance
 */
export const Loader = libLoader;

export default libLoader.load;
