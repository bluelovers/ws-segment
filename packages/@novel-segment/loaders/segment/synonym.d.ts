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
import Promise = require('bluebird');
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
declare const libLoader: LoaderClass<IDict, IDictRow>;
/**
 * 非同步載入同義詞字典
 * Load synonym dictionary asynchronously
 */
export declare const load: typeof libLoader.load;
/**
 * 同步載入同義詞字典
 * Load synonym dictionary synchronously
 */
export declare const loadSync: typeof libLoader.loadSync;
/**
 * 非同步載入同義詞字典串流
 * Load synonym dictionary as stream (asynchronous)
 */
export declare const loadStream: typeof libLoader.loadStream;
/**
 * 同步載入同義詞字典串流
 * Load synonym dictionary as stream (synchronous)
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
export declare const Loader: LoaderClass<IDict, IDictRow>;
declare const _default: (file: string, options?: import("@novel-segment/dict-loader-core").IOptions<IDict, IDictRow>) => Promise<IDict>;
export default _default;
