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
declare const libLoader: LoaderClass<IDict, string>;
/**
 * 非同步載入分隔詞字典
 * Load Stopword (Separator) Dictionary Asynchronously
 */
export declare const load: typeof libLoader.load;
/**
 * 同步載入分隔詞字典
 * Load Stopword (Separator) Dictionary Synchronously
 */
export declare const loadSync: typeof libLoader.loadSync;
/**
 * 以串流方式載入分隔詞字典
 * Load Stopword (Separator) Dictionary as Stream
 */
export declare const loadStream: typeof libLoader.loadStream;
/**
 * 以同步串流方式載入分隔詞字典
 * Load Stopword (Separator) Dictionary as Stream (Synchronous)
 */
export declare const loadStreamSync: typeof libLoader.loadStreamSync;
/**
 * 解析單行
 * Parse a Single Line
 */
export declare const parseLine: typeof libLoader.parseLine;
/**
 * 字串化資料行
 * Stringify a Data Row
 */
export declare const stringifyLine: typeof libLoader.stringifyLine;
/**
 * 載入器實例
 * Loader Instance
 */
export declare const Loader: LoaderClass<IDict, string>;
declare const _default: (file: string, options?: import("@novel-segment/dict-loader-core").IOptions<IDict, string>) => Promise<IDict>;
export default _default;
