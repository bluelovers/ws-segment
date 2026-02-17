/**
 * 斷詞字典載入器模組
 * Segment Dictionary Loader Module
 *
 * 提供斷詞字典檔案的載入功能。
 * 字典格式為：詞語|詞性|詞頻
 *
 * Provides loading functionality for segment dictionary files.
 * File format: word|pos|frequency
 *
 * @module @novel-segment/loaders/segment
 */

import { LoaderClass } from '@novel-segment/dict-loader-core';

/**
 * 字典行類型
 * Dictionary Row Type
 *
 * 每行包含：詞語、詞性、詞頻，以及選擇性的額外資料。
 * Each row contains: word, part of speech, frequency, and optional additional data.
 */
export type IDictRow<T = string> = {
	0: string,
	1: number,
	2: number,
	[index: number]: T | string | number,
	//length: number,
} & Array<string | number>;

/**
 * 字典類型
 * Dictionary Type
 *
 * 字典行的陣列
 * An array of dictionary rows
 */
export type IDict = IDictRow[];

/**
 * 斷詞字典載入器實例
 * Segment Dictionary Loader Instance
 *
 * 使用 LoaderClass 配置的斷詞字典格式載入器。
 * 解析格式：詞語|詞性|詞頻
 *
 * Loader instance configured for segment dictionary format.
 * Parses lines in format: word|pos|frequency
 */
const libLoader = new LoaderClass<IDict, IDictRow>({
	/**
	 * 解析一行字典
	 * Parse a single line
	 *
	 * 將管線分隔的行解析為結構化資料。
	 * 返回陣列 [詞語, 詞性, 詞頻, ...額外資料]。
	 *
	 * Parses a line in format: word|pos|frequency
	 * Returns an array [word, pos, frequency, ...additional].
	 *
	 * @param {string} input - 原始行資料 / Raw line data
	 * @returns {IDictRow} 解析後的行資料 / Parsed row data
	 */
	parseLine(input: string): IDictRow
	{
		// 以管線字元分割並修剪每個部分
		// Split by pipe character and trim each part
		let [str, n, s, ...plus] = input
			.replace(/^\s+|\s+$/, '')
			.split(/\|/g)
			.map(v => v.trim())
		;

		let d1 = Number(n);
		let d2 = Number(s);

		// 處理 NaN 值，預設為 0
		// Handle NaN values, default to 0
		if (Number.isNaN(d1))
		{
			// @ts-ignore
			d1 = 0;
		}
		if (Number.isNaN(d2))
		{
			// @ts-ignore
			d2 = 0;
		}

		// @ts-ignore
		return [str, d1, d2, ...plus];
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

	/**
	 * 將資料行轉換回字串
	 * Stringify a data row
	 *
	 * 將資料行轉換回字串格式。
	 * 詞性會轉換為十六進位格式。
	 *
	 * Converts a data row back to string format.
	 * Part of speech is converted to hex format.
	 *
	 * @param {IDictRow} data - 資料行 / Data row
	 * @returns {string} 字串格式 / String format
	 */
	stringifyLine(data)
	{
		let a: string[] = [];

		// @ts-ignore
		a = data
			.slice()
		;

		if (a.length > 1)
		{
			// @ts-ignore
			if (!a[1] || Number.isNaN(a[1]))
			{
				// @ts-ignore
				a[1] = 0;
			}

			// 將詞性轉換為十六進位格式
			// Convert part of speech to hex format
			// @ts-ignore
			a[1] = '0x' + a[1]
				// @ts-ignore
				.toString(16)
				.padStart(4, '0')
				.toUpperCase()
			;
		}

		if (a.length > 2)
		{
			// @ts-ignore
			if (!a[2] || Number.isNaN(a[2]))
			{
				// @ts-ignore
				a[2] = 0;
			}
		}

		return a.join('|');
	}
});

/**
 * 非同步載入斷詞字典
 * Load segment dictionary asynchronously
 */
export const load = libLoader.load as typeof libLoader.load;

/**
 * 同步載入斷詞字典
 * Load segment dictionary synchronously
 */
export const loadSync = libLoader.loadSync as typeof libLoader.loadSync;

/**
 * 非同步載入斷詞字典串流
 * Load segment dictionary as stream (asynchronous)
 */
export const loadStream = libLoader.loadStream as typeof libLoader.loadStream;

/**
 * 同步載入斷詞字典串流
 * Load segment dictionary as stream (synchronous)
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

export default libLoader.load as typeof libLoader.load;