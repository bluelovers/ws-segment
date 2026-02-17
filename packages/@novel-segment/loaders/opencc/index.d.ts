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
declare const libLoader: LoaderClass<IDict, IDictRow>;
/**
 * 非同步載入 OpenCC 字典
 * Load OpenCC dictionary asynchronously
 */
export declare const load: typeof libLoader.load;
/**
 * 同步載入 OpenCC 字典
 * Load OpenCC dictionary synchronously
 */
export declare const loadSync: typeof libLoader.loadSync;
/**
 * 非同步載入 OpenCC 字典串流
 * Load OpenCC dictionary as stream (asynchronous)
 */
export declare const loadStream: typeof libLoader.loadStream;
/**
 * 同步載入 OpenCC 字典串流
 * Load OpenCC dictionary as stream (synchronous)
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
