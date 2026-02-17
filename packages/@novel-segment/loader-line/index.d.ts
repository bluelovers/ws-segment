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
declare const libLoader: LoaderClass<IDict, string>;
/**
 * 非同步載入字典
 * Load Dictionary Asynchronously
 */
export declare const load: typeof libLoader.load;
/**
 * 同步載入字典
 * Load Dictionary Synchronously
 */
export declare const loadSync: typeof libLoader.loadSync;
/**
 * 以串流方式載入字典
 * Load Dictionary as Stream
 */
export declare const loadStream: typeof libLoader.loadStream;
/**
 * 以同步串流方式載入字典
 * Load Dictionary as Stream (Synchronous)
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
 * 序列化資料陣列
 * Serialize Data Array
 */
export declare const serialize: typeof libLoader.serialize;
/**
 * 載入器實例
 * Loader Instance
 */
export declare const Loader: LoaderClass<IDict, string>;
declare const _default: (file: string, options?: import("@novel-segment/dict-loader-core").IOptions<IDict, string>) => import("bluebird")<IDict>;
export default _default;
