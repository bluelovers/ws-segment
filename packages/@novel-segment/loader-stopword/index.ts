/**
 * 分隔詞載入器模組
 * Stopword (Separator) Loader Module
 *
 * 用於載入分隔詞字典檔案的載入器。
 * 每行內容會在加入字典前進行修剪。
 *
 * Loader for stopword (separator) dictionary files.
 * Each line is trimmed before being added to the dictionary.
 *
 * Created by user on 2018/4/14/014.
 *
 * @module @novel-segment/loader-stopword
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
 * 每行為一個分隔詞字串。
 * Each row is a stopword (separator) string.
 */
export type IDictRow = string;

/**
 * 字典類型
 * Dictionary Type
 *
 * 分隔詞字串陣列。
 * An array of stopword (separator) strings.
 */
export type IDict = IDictRow[];

/**
 * 分隔詞載入器實例
 * Stopword (Separator) Loader Instance
 *
 * 已配置分隔詞載入功能的載入器實例，包含修剪功能。
 * Loader instance configured for stopword (separator) loading with trimming.
 */
const libLoader = new LoaderClass<IDict, IDictRow>({
	/**
	 * 解析一行
	 * Parse a Line
	 *
	 * 過濾後直接返回該行內容。
	 * Returns the line as-is after filtering.
	 */
	parseLine(input: string): IDictRow
	{
		return input;
	},

	/**
	 * 過濾一行
	 * Filter a Line
	 *
	 * 修剪該行的空白字元。
	 * Trims whitespace from the line.
	 */
	filter(input: string)
	{
		return input.trim();
	},
});

/**
 * 非同步載入分隔詞字典
 * Load Stopword (Separator) Dictionary Asynchronously
 */
export const load = libLoader.load as typeof libLoader.load;

/**
 * 同步載入分隔詞字典
 * Load Stopword (Separator) Dictionary Synchronously
 */
export const loadSync = libLoader.loadSync as typeof libLoader.loadSync;

/**
 * 以串流方式載入分隔詞字典
 * Load Stopword (Separator) Dictionary as Stream
 */
export const loadStream = libLoader.loadStream as typeof libLoader.loadStream;

/**
 * 以同步串流方式載入分隔詞字典
 * Load Stopword (Separator) Dictionary as Stream (Synchronous)
 */
export const loadStreamSync = libLoader.loadStreamSync as typeof libLoader.loadStreamSync;

/**
 * 解析單行
 * Parse a Single Line
 */
export const parseLine = libLoader.parseLine as typeof libLoader.parseLine;

/**
 * 字串化資料行
 * Stringify a Data Row
 */
export const stringifyLine = libLoader.stringifyLine as typeof libLoader.stringifyLine;

/**
 * 載入器實例
 * Loader Instance
 */
export const Loader = libLoader;

export default libLoader.load;