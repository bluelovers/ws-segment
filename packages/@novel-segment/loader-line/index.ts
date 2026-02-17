/**
 * 行式載入器模組
 * Line Loader Module
 *
 * 用於載入簡單的文字檔案，每行作為獨立的項目。
 * 適用於載入每行一個詞條的簡單字典檔案。
 *
 * Simple loader for text files where each line is a separate entry.
 * Used for loading simple dictionary files with one word per line.
 *
 * Created by user on 2018/4/13/013.
 */

import { LoaderClass } from '@novel-segment/dict-loader-core';

/**
 * 字典行類型
 * Dictionary Row Type
 *
 * 每行為一個簡單字串。
 * Each row is a simple string.
 */
export type IDictRow = string;

/**
 * 字典類型
 * Dictionary Type
 *
 * 字串行陣列。
 * An array of string rows.
 */
export type IDict = IDictRow[];

/**
 * 行式載入器實例
 * Line Loader Instance
 *
 * 已配置為逐行載入的載入器實例。
 * Loader instance configured for simple line-by-line loading.
 */
const libLoader = new LoaderClass<IDict, IDictRow>({
	/**
	 * 解析一行
	 * Parse a Line
	 *
	 * 直接返回該行內容，不進行任何轉換。
	 * Returns the line as-is without any transformation.
	 */
	parseLine(input: string): IDictRow
	{
		return input;
	}
});

/**
 * 非同步載入字典
 * Load Dictionary Asynchronously
 */
export const load = libLoader.load as typeof libLoader.load;

/**
 * 同步載入字典
 * Load Dictionary Synchronously
 */
export const loadSync = libLoader.loadSync as typeof libLoader.loadSync;

/**
 * 以串流方式載入字典
 * Load Dictionary as Stream
 */
export const loadStream = libLoader.loadStream as typeof libLoader.loadStream;

/**
 * 以同步串流方式載入字典
 * Load Dictionary as Stream (Synchronous)
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
 * 序列化資料陣列
 * Serialize Data Array
 */
export const serialize = libLoader.serialize as typeof libLoader.serialize;

/**
 * 載入器實例
 * Loader Instance
 */
export const Loader = libLoader;

export default libLoader.load;
