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
import { openSync, readSync } from 'fs';
import { resolve } from 'path';
import EventEmitter from 'events';
import { byLine, IOptions, IStreamLine, IStreamLineWithValue } from './line';
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
export function createLoadStreamSync<T>(file: string, options: {

	mapper?(line: string),
	ondata?(data),

	callback?: ICallback<T>,

	onready?(...argv),

} = {}): IStreamLineWithValue<T>
{
	// 預設的就緒處理器：初始化值陣列
	// Default ready handler: initialize value array
	options.onready = options.onready || function (src, ...argv)
	{
		// @ts-ignore
		this.value = this.value || [];
	};

	// 預設的轉換函式：原樣返回每行資料
	// Default mapper: return line as-is
	options.mapper = options.mapper || function (data)
	{
		return data;
	};

	// 預設的資料處理器：將資料推入值陣列
	// Default data handler: push to value array
	options.ondata = options.ondata || function (data)
	{
		// @ts-ignore
		this.value = this.value || [];
		// @ts-ignore
		this.value.push(data);
	};

	let stream: IStreamLineWithValue<any> = createStreamLineSync(file, options.mapper, {

		onready: options.onready,

		ondata: options.ondata,

		/**
		 * 關閉處理器：以已載入的資料呼叫回呼函式
		 * Close handler: call callback with loaded data
		 */
		onclose()
		{
			if (options.callback)
			{
				options.callback.call(this, null, stream.value, stream)
			}
		}
	});

	// 執行同步串流，開始讀取檔案
	// Run the synchronous stream to start reading the file
	// @ts-ignore
	stream.pipeFrom.run();

	return stream;
}

/**
 * 建立同步逐行串流讀取器
 * Create a synchronous stream line reader
 *
 * @param {string} file - 檔案路徑 / File path
 * @param {IOptions} options - 串流選項 / Stream options
 * @returns {IStreamLine} 逐行串流 / Line stream
 */
export function createStreamLineSync(file: string, options: IOptions): IStreamLine

/**
 * 建立同步逐行串流讀取器
 * Create a synchronous stream line reader
 *
 * @param {string} file - 檔案路徑 / File path
 * @param {Function} [fn] - 選擇性的每行轉換函式 / Optional mapper function
 * @param {IOptions} [options] - 串流選項 / Stream options
 * @returns {IStreamLine} 逐行串流 / Line stream
 */
export function createStreamLineSync(file: string, fn?: (data: string) => any, options?: IOptions): IStreamLine

export function createStreamLineSync(file: string, fn?, options?: IOptions)
{
	return createReadStreamSync(file)
		.pipe(byLine(fn, options))
		;
}

/**
 * 建立同步可讀串流
 * Create a synchronous readable stream
 *
 * @param {string} file - 檔案路徑 / File path
 * @returns {ReadableSync} 同步可讀串流 / Synchronous readable stream
 */
export function createReadStreamSync(file: string)
{
	return new ReadableSync(file);
}

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
export class ReadableSync extends Readable
{
	/**
	 * 檔案描述符
	 * File descriptor
	 */
	protected fd: number = null;

	/**
	 * 檔案開啟旗標
	 * File open flags
	 */
	protected flags: string | number = 'r';

	/**
	 * 已讀取的總位元組數
	 * Total bytes read
	 */
	public bytesRead: number = 0;

	/**
	 * 檔案路徑
	 * File path
	 */
	public path: string;

	/**
	 * 檔案結尾旗標
	 * End of file flag
	 */
	protected fdEnd: boolean;

	/**
	 * 串流選項
	 * Stream options
	 */
	protected options = {
		/**
		 * 每次讀取操作的區塊大小
		 * Chunk size for each read operation
		 */
		readChunk: 1024,
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
	constructor(file: string)
	{
		super();

		this.path = file;

		if (typeof file === 'number')
		{
			this.fd = file;
		}
		else
		{
			if (typeof file == 'string')
			{
				this.path = resolve(file);
			}

			this.fd = openSync(this.path, this.flags);
		}

		// 以暫停狀態啟動，等待 run() 方法被呼叫
		// Start in paused state, waiting for run() to be called
		this.pause();
	}

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
	override _read(size: number): Buffer
	{
		let buffers: Buffer[] = [];
		let bytesRead: Buffer;

		// 以區塊為單位讀取所有資料
		// Read all data in chunks
		do
		{
			bytesRead = this.__read(size);

			if (bytesRead !== null)
			{
				buffers.push(bytesRead);
			}
		}
		while (bytesRead !== null);

		let bufferData = Buffer.concat(buffers);

		this.push(bufferData);
		//this._destroy(null, () => undefined);

		return bufferData;
	}

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
	__read(size: number): Buffer
	{
		// 建立讀取用的緩衝區
		// Create buffer for reading
		//let readBuffer = new Buffer(this.options.readChunk);
		let readBuffer = Buffer.alloc(this.options.readChunk);

		let bytesRead = readSync(this.fd, readBuffer, 0, this.options.readChunk, this.bytesRead);

		// 檢查是否到達檔案結尾
		// Check for end of file
		if (bytesRead === 0)
		{
			this.fdEnd = true;
			return null;
		}

		this.bytesRead += bytesRead;

		// 若為部分讀取，裁切緩衝區至實際讀取大小
		// Trim buffer if partial read
		if (bytesRead < this.options.readChunk) {
			this.fdEnd = true;
			readBuffer = readBuffer.slice(0, bytesRead);
		}

		return readBuffer;
	}

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
	run()
	{
		this.resume();

		this.emit('ready', this);

		let i = 0;

		// 持續讀取直到檔案結尾
		// Read until end of file
		while (!this.fdEnd)
		{
			let k = this.read();
		}

		//let bufferData = this.__read(this.options.readChunk);
		//this.emit('data', bufferData);

		return this;
	}
}

export default createLoadStreamSync;