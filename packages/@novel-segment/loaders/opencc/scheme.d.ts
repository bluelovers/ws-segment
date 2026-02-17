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
declare const libLoader: LoaderClass<IDict, IDictRow>;
/**
 * 非同步載入 OpenCC 方案字典
 * Load OpenCC scheme dictionary asynchronously
 */
export declare const load: typeof libLoader.load;
/**
 * 同步載入 OpenCC 方案字典
 * Load OpenCC scheme dictionary synchronously
 */
export declare const loadSync: typeof libLoader.loadSync;
/**
 * 非同步載入 OpenCC 方案字典串流
 * Load OpenCC scheme dictionary as stream (asynchronous)
 */
export declare const loadStream: typeof libLoader.loadStream;
/**
 * 同步載入 OpenCC 方案字典串流
 * Load OpenCC scheme dictionary as stream (synchronous)
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
