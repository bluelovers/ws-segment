/**
 * OpenCC 字典載入器模組
 * OpenCC Dictionary Loader Module
 *
 * 提供 OpenCC（開放中文轉換）格式字典檔案的載入功能。
 * OpenCC 字典格式為以 Tab 分隔的詞彙對應表。
 *
 * Provides loading functionality for OpenCC (Open Chinese Convert) format dictionary files.
 * OpenCC dictionary format is a tab-separated vocabulary mapping table.
 *
 * 格式範例 / Format Example:
 * - 詞彙1	詞彙2	（以 Tab 分隔 / Tab-separated）
 *
 * @module @novel-segment/loaders/opencc
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
 * 每行為字串陣列，包含對應的詞彙。
 * Each row is a string array containing mapped words.
 */
export type IDictRow = string[];

/**
 * 字典類型
 * Dictionary Type
 *
 * 字典行的陣列
 * An array of dictionary rows
 */
export type IDict = IDictRow[];

/**
 * OpenCC 字典載入器實例
 * OpenCC Dictionary Loader Instance
 *
 * 使用 LoaderClass 配置的 OpenCC 格式載入器。
 * Loader instance configured for OpenCC format.
 */
const libLoader = new LoaderClass<IDict, IDictRow>({
	/**
	 * 解析一行字典
	 * Parse a single line
	 *
	 * 將 Tab 分隔的行解析為字串陣列。
	 * Parses a tab-separated line into a string array.
	 *
	 * @param {string} input - 原始行資料 / Raw line data
	 * @returns {IDictRow} 解析後的行資料 / Parsed row data
	 * @throws {Error} 當行格式無效（少於 2 個元素）時 / When line format is invalid (less than 2 elements)
	 */
	parseLine(input: string): IDictRow
	{
		let data = input.split(/\t/);

		if (data.length < 2)
		{
			throw new Error();
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
		return input.trim();
	},
});

/**
 * 非同步載入 OpenCC 字典
 * Load OpenCC dictionary asynchronously
 */
export const load = libLoader.load as typeof libLoader.load;

/**
 * 同步載入 OpenCC 字典
 * Load OpenCC dictionary synchronously
 */
export const loadSync = libLoader.loadSync as typeof libLoader.loadSync;

/**
 * 非同步載入 OpenCC 字典串流
 * Load OpenCC dictionary as stream (asynchronous)
 */
export const loadStream = libLoader.loadStream as typeof libLoader.loadStream;

/**
 * 同步載入 OpenCC 字典串流
 * Load OpenCC dictionary as stream (synchronous)
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
