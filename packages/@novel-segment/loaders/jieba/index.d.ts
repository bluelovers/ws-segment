/**
 * 結巴格式字典載入器模組
 * Jieba Format Dictionary Loader Module
 *
 * 提供結巴（jieba）格式字典檔案的載入功能。
 * 結巴字典格式為：詞語 [詞頻] [詞性標記]
 *
 * Provides loading functionality for jieba format dictionary files.
 * Jieba dictionary format: word [frequency] [pos_tag]
 *
 * 格式範例 / Format Examples:
 * - 云计算          （僅詞語 / word only）
 * - 蓝翔 nz         （詞語 + 詞性 / word + pos）
 * - 区块链 10 nz    （詞語 + 詞頻 + 詞性 / word + frequency + pos）
 *
 * @module @novel-segment/loaders/jieba
 */
import { IStreamLineWithValue } from '@novel-segment/stream-loader-core/line';
import Bluebird from 'bluebird';
import createLoadStream, { ICallback } from '@novel-segment/stream-loader-core/stream';
/**
 * 字典行類型
 * Dictionary Row Type
 *
 * 每行包含：詞語、詞頻、詞性標記
 * Each row contains: word, frequency, pos tag
 */
export type IDictRow = [string, number, string];
/**
 * 字典類型
 * Dictionary Type
 *
 * 字典行的陣列
 * An array of dictionary rows
 */
export type IDict = IDictRow[];
/**
 * 解析結巴格式的一行字典
 * Parse a single line of jieba format dictionary
 *
 * 將結巴格式的字典行解析為結構化資料。
 * 支援三種格式：詞語、詞語+詞性、詞語+詞頻+詞性。
 *
 * Parses a jieba format dictionary line into structured data.
 * Supports three formats: word, word+pos, word+frequency+pos.
 *
 * @param {string} input - 原始行資料 / Raw line data
 * @returns {IDictRow} 解析後的行資料 / Parsed row data
 * @throws {ReferenceError} 當行格式無效時 / When line format is invalid
 *
 * @example
 * parseLine('云计算');        // ['云计算', undefined, undefined]
 * parseLine('蓝翔 nz');       // ['蓝翔', undefined, 'nz']
 * parseLine('区块链 10 nz');  // ['区块链', 10, 'nz']
 */
export declare function parseLine(input: string): IDictRow;
/**
 * 非同步載入結巴格式字典
 * Load jieba format dictionary asynchronously
 *
 * @param {string} file - 字典檔案路徑 / Dictionary file path
 * @returns {Bluebird<IDict>} Promise 包裝的字典資料 / Promise-wrapped dictionary data
 */
export declare function load(file: string): Bluebird<IDict>;
/**
 * 同步載入結巴格式字典
 * Load jieba format dictionary synchronously
 *
 * @param {string} file - 字典檔案路徑 / Dictionary file path
 * @returns {IDict} 字典資料 / Dictionary data
 */
export declare function loadSync(file: string): IDict;
/**
 * 建立載入串流的內部實作
 * Internal implementation for creating load stream
 *
 * @template T - 字典類型 / Dictionary type
 * @param {typeof createLoadStream} fnStream - 串流建立函式 / Stream creation function
 * @param {string} file - 檔案路徑 / File path
 * @param {ICallback<T>} [callback] - 完成回呼 / Completion callback
 * @returns {IStreamLineWithValue<T>} 帶值的串流 / Stream with value
 */
export declare function _createStream<IDict>(fnStream: typeof createLoadStream, file: string, callback?: ICallback<IDict>): IStreamLineWithValue<IDict>;
/**
 * 非同步載入結巴格式字典串流
 * Load jieba format dictionary as stream (asynchronous)
 *
 * @param {string} file - 字典檔案路徑 / Dictionary file path
 * @param {ICallback<IDict>} [callback] - 完成回呼 / Completion callback
 * @returns {IStreamLineWithValue<IDict>} 帶值的串流 / Stream with value
 */
export declare function loadStream(file: string, callback?: ICallback<IDict>): IStreamLineWithValue<IDict>;
/**
 * 同步載入結巴格式字典串流
 * Load jieba format dictionary as stream (synchronous)
 *
 * @param {string} file - 字典檔案路徑 / Dictionary file path
 * @param {ICallback<IDict>} [callback] - 完成回呼 / Completion callback
 * @returns {IStreamLineWithValue<IDict>} 帶值的串流 / Stream with value
 */
export declare function loadStreamSync(file: string, callback?: ICallback<IDict>): IStreamLineWithValue<IDict>;
export default load;
