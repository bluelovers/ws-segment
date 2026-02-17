/**
 * 同義詞字典載入器模組
 * Synonym Dictionary Loader Module
 *
 * 提供同義詞字典檔案的載入功能。
 * 字典格式為以逗號分隔的同義詞列表。
 *
 * Provides loading functionality for synonym dictionary files.
 * Dictionary format is a comma-separated list of synonyms.
 *
 * 格式範例 / Format Example:
 * - 詞彙1,詞彙2,詞彙3
 *
 * @module @novel-segment/loaders/segment/synonym
 */

import { wrapStreamToPromise, IStreamLineWithValue } from '@novel-segment/stream-loader-core/line';
import Promise = require('bluebird');
import createLoadStream, { ICallback } from '@novel-segment/stream-loader-core/stream';
import createLoadStreamSync from '@novel-segment/stream-loader-core/sync';
import { LoaderClass } from '@novel-segment/dict-loader-core';
import { ArrayTwoOrMore } from '@novel-segment/types';

/**
 * 字典行類型
 * Dictionary Row Type
 *
 * 每行為包含兩個或更多同義詞的陣列。
 * Each row is an array containing two or more synonyms.
 */
export type IDictRow = ArrayTwoOrMore<string>;

/**
 * 字典類型
 * Dictionary Type
 *
 * 字典行的陣列
 * An array of dictionary rows
 */
export type IDict = IDictRow[];

/**
 * 同義詞字典載入器實例
 * Synonym Dictionary Loader Instance
 *
 * 使用 LoaderClass 配置的同義詞字典格式載入器。
 * Loader instance configured for synonym dictionary format.
 */
const libLoader = new LoaderClass<IDict, IDictRow>({
	/**
	 * 解析一行字典
	 * Parse a single line
	 *
	 * 將逗號分隔的行解析為同義詞陣列。
	 * 每行必須包含至少兩個詞彙。
	 *
	 * Parses a comma-separated line into a synonym array.
	 * Each line must contain at least two words.
	 *
	 * @param {string} input - 原始行資料 / Raw line data
	 * @returns {IDictRow} 解析後的行資料 / Parsed row data
	 * @throws {ReferenceError} 當行格式無效時 / When line format is invalid
	 */
	parseLine(input: string): IDictRow
	{
		let ret = input
			.replace(/^\s+|\s+$/, '')
			.split(',')
		;

		if (ret.length < 2)
		{
			throw new ReferenceError(`${input}`);
		}

		return ret.map(function (s: string)
		{
			s = s
				.replace(/^\s+|\s+$/, '')
				.trim()
			;

			if (s == '')
			{
				throw new ReferenceError(`${input}`);
			}

			return s;
		}) as any;
	},

	/**
	 * 過濾行
	 * Filter a line
	 *
	 * 移除 BOM、修剪空白，並跳過註解行。
	 * Removes BOM, trims whitespace, and skips comment lines.
	 *
	 * @param {string} line - 原始行資料 / Raw line data
	 * @returns {string | undefined} 過濾後的行，或 undefined 表示跳過 / Filtered line, or undefined to skip
	 */
	filter(line: string)
	{
		line = line
			.replace(/\uFEFF/g, '')
			.trim()
			.replace(/^\s+|\s+$/, '')
		;

		// 跳過空行與註解行（以 // 開頭）
		// Skip empty lines and comment lines (starting with //)
		if (line && line.indexOf('\/\/') != 0)
		{
			return line;
		}
	},

});

/**
 * 非同步載入同義詞字典
 * Load synonym dictionary asynchronously
 */
export const load = libLoader.load as typeof libLoader.load;

/**
 * 同步載入同義詞字典
 * Load synonym dictionary synchronously
 */
export const loadSync = libLoader.loadSync as typeof libLoader.loadSync;

/**
 * 非同步載入同義詞字典串流
 * Load synonym dictionary as stream (asynchronous)
 */
export const loadStream = libLoader.loadStream as typeof libLoader.loadStream;

/**
 * 同步載入同義詞字典串流
 * Load synonym dictionary as stream (synchronous)
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
