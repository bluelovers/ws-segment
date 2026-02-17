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
    0: string;
    1: number;
    2: number;
    [index: number]: T | string | number;
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
declare const libLoader: LoaderClass<IDict, IDictRow<string>>;
/**
 * 非同步載入斷詞字典
 * Load segment dictionary asynchronously
 */
export declare const load: typeof libLoader.load;
/**
 * 同步載入斷詞字典
 * Load segment dictionary synchronously
 */
export declare const loadSync: typeof libLoader.loadSync;
/**
 * 非同步載入斷詞字典串流
 * Load segment dictionary as stream (asynchronous)
 */
export declare const loadStream: typeof libLoader.loadStream;
/**
 * 同步載入斷詞字典串流
 * Load segment dictionary as stream (synchronous)
 */
export declare const loadStreamSync: typeof libLoader.loadStreamSync;
/**
 * 解析單行
 * Parse a single line
 */
export declare const parseLine: typeof libLoader.parseLine;
/**
 * 將資料行轉換回字串
 * Stringify a data row
 */
export declare const stringifyLine: typeof libLoader.stringifyLine;
/**
 * 序列化資料陣列
 * Serialize data array
 */
export declare const serialize: typeof libLoader.serialize;
/**
 * 載入器實例
 * Loader instance
 */
export declare const Loader: LoaderClass<IDict, IDictRow<string>>;
declare const _default: typeof libLoader.load;
export default _default;
