/**
 * 串流逐行讀取模組
 * Stream Line Reader Module
 *
 * 提供使用串流逐行讀取檔案的工具函式，支援非同步與同步操作。
 * 此模組是字典載入器的核心元件，用於高效處理大型字典檔案。
 *
 * Provides utilities for reading files line by line using streams.
 * Supports both asynchronous and synchronous operations.
 * This module is a core component of dictionary loaders for efficient handling of large dictionary files.
 *
 * @module @novel-segment/stream-loader-core/line
 */

import { fstatSync, statSync, Stats } from 'fs';
import split2 from 'split2';
import { isAbsolute, resolve } from 'path';
import Bluebird from 'bluebird';
import stream from 'stream';
import { createReadStream, IPipe } from 'stream-pipe';
import { ReadStream } from 'stream-pipe/fs';

/**
 * 串流逐行選項介面
 * Stream Line Options Interface
 *
 * 定義逐行讀取串流的設定選項，包含事件處理器與資料轉換函式。
 * Defines configuration options for line-by-line stream reading, including event handlers and data transformation functions.
 */
export type IOptions = {

	/**
	 * 每行資料的轉換函式
	 * Mapper function for each line
	 *
	 * 用於將每行原始字串轉換為目標格式。
	 * 若未提供，則保留原始字串格式。
	 *
	 * Used to transform each raw line string into the target format.
	 * If not provided, the raw string format is preserved.
	 *
	 * @param {string} data - 原始行資料 / Raw line data
	 * @returns {any} 轉換後的資料 / Transformed data
	 */
	mapper?(data: string),

	/**
	 * pipe 事件處理器
	 * Pipe event handler
	 *
	 * 當來源串流連接到此串流時觸發。
	 * Triggered when a source stream is piped to this stream.
	 *
	 * @param {*} src - 來源串流 / Source stream
	 */
	onpipe?(src),

	/**
	 * close 事件處理器
	 * Close event handler
	 *
	 * 當串流關閉時觸發，表示資源已釋放。
	 * Triggered when the stream closes, indicating resources have been released.
	 *
	 * @param {...any[]} argv - 事件參數 / Event arguments
	 */
	onclose?(...argv),

	/**
	 * finish 事件處理器
	 * Finish event handler
	 *
	 * 當所有資料已刷新到底層系統時觸發。
	 * Triggered when all data has been flushed to the underlying system.
	 *
	 * @param {...any[]} argv - 事件參數 / Event arguments
	 */
	onfinish?(...argv),

	/**
	 * ready 事件處理器
	 * Ready event handler
	 *
	 * 當串流準備好開始處理資料時觸發。
	 * Triggered when the stream is ready to start processing data.
	 *
	 * @param {...any[]} argv - 事件參數 / Event arguments
	 */
	onready?(...argv),

	/**
	 * data 事件處理器
	 * Data event handler
	 *
	 * 當有新資料可用時觸發，每筆資料代表一行。
	 * Triggered when new data is available, each piece of data represents a line.
	 *
	 * @param {...any[]} argv - 事件參數 / Event arguments
	 */
	ondata?(...argv),

}

/**
 * 建立逐行轉換串流
 * Create a line-by-line transform stream
 *
 * 建立一個轉換串流，將輸入資料按行分割。
 * 這是處理文字檔案的基礎函式，可與任何可讀串流搭配使用。
 *
 * Creates a transform stream that splits input by lines.
 * This is a fundamental function for processing text files, usable with any readable stream.
 *
 * @param {Function} [fn] - 選擇性的每行轉換函式 / Optional mapper function for each line
 * @param {IOptions} [options] - 串流選項 / Stream options
 * @returns {IStreamLine} 逐行串流 / Line stream
 *
 * @example
 * // 基本使用 / Basic usage
 * createReadStream('file.txt')
 *   .pipe(byLine())
 *   .on('data', line => console.log(line));
 *
 * @example
 * // 使用轉換函式 / With mapper function
 * createReadStream('file.txt')
 *   .pipe(byLine(line => line.trim()))
 *   .on('data', line => console.log(line));
 */
export function byLine(fn?, options: IOptions = {})
{
	if (typeof fn == 'object')
	{
		[options, fn] = [fn, undefined];
	}

	fn = fn || options.mapper;

	// @ts-ignore
	let wts = split2(fn) as IStreamLine;

	wts.on('pipe', function (src)
	{
		// @ts-ignore
		const self = this;

		// 儲存來源串流的參考，用於後續追蹤與控制
		// Store reference to source stream for later tracking and control
		// @ts-ignore
		this.pipeFrom = src;
		let pipeStat = null as Stats;

		// 判斷檔案大小以支援進度追蹤功能
		// 依序嘗試不同方式取得檔案大小：bytesTotal 屬性、檔案描述符、檔案路徑
		// Determine file size for progress tracking
		// Try different methods to get file size: bytesTotal property, file descriptor, file path
		if (typeof src.bytesTotal == 'number')
		{
			self.bytesSize = src.bytesTotal;
		}
		else if (src.fd)
		{
			pipeStat = fstatSync(src.fd);

			self.bytesSize = pipeStat.size;
		}
		else if (src.path)
		{
			let p: string = src.path;

			if (src.cwd && !isAbsolute(src.path))
			{
				p = resolve(src.cwd, src.path);
			}

			pipeStat = statSync(p);

			self.bytesSize = pipeStat.size;
		}
		else
		{
			// 無法取得檔案大小，設為 null
			// Unable to determine file size, set to null
			self.bytesSize = null;
		}

		// @ts-ignore
		this.pipeStat = pipeStat;

		// 轉發來源串流的事件，確保外部可以監聽這些事件
		// Forward events from source stream to ensure external listeners can receive them
		src
			.on('close', function (...argv)
			{
				self.emit('close', ...argv);
			})
			.on('ready', function (...argv)
			{
				self.emit('ready', ...argv);
			})
		;
	});

	// 根據選項註冊事件處理器，支援 on* 格式的選項
	// Register event handlers from options, supporting on* format options
	Object.keys(options)
		.forEach(function (key)
		{
			if (key.indexOf('on') == 0 && options[key])
			{
				wts.on(key.slice(2), options[key]);
			}
		})
	;

	return wts;
}

/**
 * 建立逐行串流讀取器
 * Create a stream line reader
 *
 * 建立一個可讀串流，從檔案逐行輸出內容。
 * 這是讀取文字檔案的便利函式，內部使用 createReadStream 與 byLine。
 *
 * Creates a readable stream that outputs lines from a file.
 * This is a convenience function for reading text files, using createReadStream and byLine internally.
 *
 * @param {string} file - 檔案路徑 / File path
 * @param {IOptions} options - 串流選項 / Stream options
 * @returns {IStreamLine} 逐行串流 / Line stream
 */
export function createStreamLine(file: string, options: IOptions): IStreamLine

/**
 * 建立逐行串流讀取器
 * Create a stream line reader
 *
 * @param {string} file - 檔案路徑 / File path
 * @param {Function} [fn] - 選擇性的每行轉換函式 / Optional mapper function
 * @param {IOptions} [options] - 串流選項 / Stream options
 * @returns {IStreamLine} 逐行串流 / Line stream
 */
export function createStreamLine(file: string, fn?: (data: string) => any, options?: IOptions): IStreamLine

export function createStreamLine(file: string, fn?, options?: IOptions)
{
	return createReadStream(file)
		.pipe(byLine(fn, options))
		;
}

/**
 * 使用 Promise 讀取檔案行
 * Read file lines with promise support
 *
 * 建立一個包裝為 Promise 的串流，用於讀取檔案行。
 * Promise 會在串流關閉或完成時解析，適合需要等待處理完成的場景。
 *
 * Creates a promise-wrapped stream for reading file lines.
 * The promise resolves when the stream closes or finishes, suitable for scenarios requiring completion notification.
 *
 * @param {string} file - 檔案路徑 / File path
 * @param {IOptions} options - 串流選項 / Stream options
 * @returns {IPromiseStream<IStreamLine>} Promise 包裝的串流 / Promise-wrapped stream
 */
export function readFileLine(file: string, options: IOptions): IPromiseStream<IStreamLine>

/**
 * 使用 Promise 讀取檔案行
 * Read file lines with promise support
 *
 * @param {string} file - 檔案路徑 / File path
 * @param {Function} [fn] - 選擇性的每行轉換函式 / Optional mapper function
 * @param {IOptions} [options] - 串流選項 / Stream options
 * @returns {IPromiseStream<IStreamLine>} Promise 包裝的串流 / Promise-wrapped stream
 */
export function readFileLine(file: string, fn?: (data: string) => any, options?: IOptions): IPromiseStream<IStreamLine>

export function readFileLine(file: string, fn?, options?: IOptions)
{
	return wrapStreamToPromise(createStreamLine(file, fn, options));
}

/**
 * 將串流包裝為 Promise
 * Wrap a stream to a promise
 *
 * 將串流包裝在 Promise 中，當串流關閉或完成時解析。
 * 這允許使用 async/await 語法等待串流處理完成。
 *
 * Wraps a stream in a promise that resolves when the stream closes or finishes.
 * This allows using async/await syntax to wait for stream processing completion.
 *
 * @template T - 串流類型 / Stream type
 * @param {T} stream - 要包裝的串流 / Stream to wrap
 * @returns {IPromiseStream<T>} Promise 包裝的串流 / Promise-wrapped stream
 *
 * @example
 * const promiseStream = wrapStreamToPromise(createReadStream('file.txt'));
 * promiseStream.stream.on('data', chunk => console.log(chunk));
 * await promiseStream;
 */
export function wrapStreamToPromise<T extends NodeJS.WritableStream>(stream: T): IPromiseStream<T>
{
	let resolve, reject;

	let promise = new Bluebird(function ()
	{
		resolve = arguments[0];
		reject = arguments[1];
	}) as IPromiseStream<T>;

	stream
		.on('close', function (...argv)
		{
			// @ts-ignore
			resolve(this);
			//console.log('d.close', ...argv);
		})
		.on('finish', function (...argv)
		{
			// @ts-ignore
			resolve(this);
			//console.log('d.close', ...argv);
		})
		.on('error', function (...argv)
		{
			reject(...argv);
		})
	;

	promise.stream = stream;
	// @ts-ignore
	promise = promise.bind(stream);
	promise.stream = stream;

	return promise;
}

/**
 * 逐行串流類型
 * Stream Line Type
 *
 * 從檔案輸出行的串流類型定義。
 * 這是 IPipe 的特化類型，表示從 ReadStream 到 WritableStream 的管道。
 *
 * A stream type that outputs lines from a file.
 * This is a specialized type of IPipe, representing a pipe from ReadStream to WritableStream.
 */
export type IStreamLine = IPipe<ReadStream, NodeJS.WritableStream>;

/**
 * 帶值的逐行串流類型
 * Stream Line with Value Type
 *
 * 擴展 IStreamLine，增加 value 屬性用於儲存已載入的資料。
 * 這在字典載入器中用於收集所有行資料。
 *
 * Extends IStreamLine with a value property for storing loaded data.
 * Used in dictionary loaders to collect all line data.
 *
 * @template T - 值的類型 / Value type
 */
export type IStreamLineWithValue<T> = IStreamLine & {
	/**
	 * 已載入的資料
	 * Loaded data
	 */
	value?: T,
};

/**
 * Promise 串流類型
 * Promise Stream Type
 *
 * 具有 stream 屬性的 Promise 類型。
 * 允許同時使用 Promise 介面等待完成，以及透過 stream 屬性監聽事件。
 *
 * A promise type that also has a stream property.
 * Allows using both the Promise interface to wait for completion and the stream property to listen for events.
 *
 * @template T - 串流類型 / Stream type
 */
export type IPromiseStream<T> = Bluebird<T> & {
	/**
	 * 關聯的串流實例
	 * Associated stream instance
	 */
	stream: T,
};

/*
 * 使用範例 / Usage Example:

let p = readFileLine('../.gitignore', {

	mapper(data: string)
	{
		return data;
	},

});

p.stream.on('data', function (data)
{
	console.log(data);
});

p.then(function (d: IPipe<ReadStream, NodeJS.WritableStream>)
{
	console.log(this === p.stream, d === this);
});
*/

export default exports as typeof import('./line');
