/**
 * 同步串流載入器模組
 * Synchronous Stream Loader Module
 *
 * 提供字典檔案的同步串流載入功能。
 * 使用自訂的同步可讀串流實作，允許在需要同步操作的場景下使用串流 API。
 *
 * Provides synchronous stream loading functionality for dictionary files.
 * Uses a custom synchronous readable stream implementation, allowing the stream API to be used in scenarios requiring synchronous operations.
 *
 * @module @novel-segment/stream-loader-core/sync
 */
import { Readable } from 'stream';
import { IOptions, IStreamLine, IStreamLineWithValue } from './line';
import { ICallback } from './stream';
/**
 * 建立同步載入串流
 * Create a synchronous load stream
 *
 * 建立一個可讀串流，同步載入檔案並收集解析後的資料。
 * 此函式是字典載入器的同步版本，適用於需要阻塞式載入的場景。
 *
 * Creates a readable stream that loads a file synchronously and collects parsed data.
 * This function is the synchronous version of the dictionary loader, suitable for scenarios requiring blocking loads.
 *
 * @template T - 資料類型 / Data type
 * @param {string} file - 檔案路徑 / File path
 * @param {Object} options - 串流選項 / Stream options
 * @param {Function} [options.mapper] - 每行轉換函式 / Line mapper function
 * @param {Function} [options.ondata] - 資料事件處理器 / Data event handler
 * @param {ICallback<T>} [options.callback] - 完成回呼函式 / Completion callback
 * @param {Function} [options.onready] - 就緒事件處理器 / Ready event handler
 * @returns {IStreamLineWithValue<T>} 帶值的串流 / Stream with value
 */
export declare function createLoadStreamSync<T>(file: string, options?: {
    mapper?(line: string): any;
    ondata?(data: any): any;
    callback?: ICallback<T>;
    onready?(...argv: any[]): any;
}): IStreamLineWithValue<T>;
/**
 * 建立同步逐行串流讀取器
 * Create a synchronous stream line reader
 *
 * @param {string} file - 檔案路徑 / File path
 * @param {IOptions} options - 串流選項 / Stream options
 * @returns {IStreamLine} 逐行串流 / Line stream
 */
export declare function createStreamLineSync(file: string, options: IOptions): IStreamLine;
/**
 * 建立同步逐行串流讀取器
 * Create a synchronous stream line reader
 *
 * @param {string} file - 檔案路徑 / File path
 * @param {Function} [fn] - 選擇性的每行轉換函式 / Optional mapper function
 * @param {IOptions} [options] - 串流選項 / Stream options
 * @returns {IStreamLine} 逐行串流 / Line stream
 */
export declare function createStreamLineSync(file: string, fn?: (data: string) => any, options?: IOptions): IStreamLine;
/**
 * 建立同步可讀串流
 * Create a synchronous readable stream
 *
 * @param {string} file - 檔案路徑 / File path
 * @returns {ReadableSync} 同步可讀串流 / Synchronous readable stream
 */
export declare function createReadStreamSync(file: string): ReadableSync;
/**
 * 同步可讀串流類別
 * Synchronous Readable Stream Class
 *
 * 自訂的 Readable 串流實作，以同步方式讀取檔案。
 * 這允許在需要同步操作的場景下使用串流 API 處理檔案。
 *
 * A custom Readable stream implementation that reads files synchronously.
 * This allows for synchronous file processing using the stream API.
 */
export declare class ReadableSync extends Readable {
    /**
     * 檔案描述符
     * File descriptor
     */
    protected fd: number;
    /**
     * 檔案開啟旗標
     * File open flags
     */
    protected flags: string | number;
    /**
     * 已讀取的總位元組數
     * Total bytes read
     */
    bytesRead: number;
    /**
     * 檔案路徑
     * File path
     */
    path: string;
    /**
     * 檔案結尾旗標
     * End of file flag
     */
    protected fdEnd: boolean;
    /**
     * 串流選項
     * Stream options
     */
    protected options: {
        /**
         * 每次讀取操作的區塊大小
         * Chunk size for each read operation
         */
        readChunk: number;
    };
    /**
     * 建構子
     * Constructor
     *
     * 初始化同步可讀串流。
     * Initializes the synchronous readable stream.
     *
     * @param {string} file - 檔案路徑或檔案描述符 / File path or file descriptor
     */
    constructor(file: string);
    /**
     * 內部讀取方法
     * Internal read method
     *
     * 同步讀取檔案中的所有資料。
     * 此方法會被串流機制呼叫，將資料推入串流佇列。
     *
     * Reads all data from the file synchronously.
     * This method is called by the stream mechanism to push data into the stream queue.
     *
     * @override
     * @param {number} size - 建議的讀取大小 / Suggested read size
     * @returns {Buffer} 讀取的資料 / Read data
     */
    _read(size: number): Buffer;
    /**
     * 低階讀取方法
     * Low-level read method
     *
     * 從檔案讀取單一區塊的資料。
     * 此方法執行實際的檔案讀取操作。
     *
     * Reads a single chunk from the file.
     * This method performs the actual file read operation.
     *
     * @param {number} size - 建議的讀取大小 / Suggested read size
     * @returns {Buffer | null} 讀取的資料，若到達 EOF 則返回 null / Read data or null at EOF
     */
    __read(size: number): Buffer;
    /**
     * 執行串流
     * Run the stream
     *
     * 啟動同步讀取程序。
     * 發出 'ready' 事件並讀取所有資料直到 EOF。
     *
     * Starts the synchronous reading process.
     * Emits 'ready' event and reads all data until EOF.
     *
     * @returns {this} 返回此實例 / Returns this instance
     */
    run(): this;
}
export default createLoadStreamSync;
