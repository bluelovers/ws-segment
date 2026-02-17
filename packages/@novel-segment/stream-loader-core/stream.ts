/**
 * 非同步串流載入器模組
 * Asynchronous Stream Loader Module
 *
 * 提供字典檔案的非同步串流載入功能。
 * 此模組是字典載入器的核心元件，用於高效處理大型字典檔案。
 *
 * Provides asynchronous stream loading functionality for dictionary files.
 * This module is a core component of dictionary loaders for efficient handling of large dictionary files.
 *
 * @module @novel-segment/stream-loader-core/stream
 */

import { createStreamLine, IStreamLineWithValue } from './line';

/**
 * 回呼函式介面
 * Callback Interface
 *
 * 定義串流載入完成時的回呼函式類型。
 * 當串流載入完成或發生錯誤時，會呼叫此回呼函式。
 *
 * Defines the callback function type for stream loading completion.
 * This callback is invoked when stream loading completes or an error occurs.
 */
export interface ICallback<T>
{
	/**
	 * 回呼函式
	 * Callback function
	 *
	 * 當串流載入完成或發生錯誤時被呼叫。
	 * Called when stream loading completes or errors.
	 *
	 * @param {Error} err - 錯誤物件，若無錯誤則為 null / Error object if any, null if no error
	 * @param {T} [data] - 已載入的資料 / Loaded data
	 * @param {IStreamLineWithValue<T>} [stream] - 串流實例 / Stream instance
	 */
	(err: Error, data?: T, stream?: IStreamLineWithValue<T>): void
}

/**
 * 建立載入串流
 * Create a load stream
 *
 * 建立一個可讀串流，載入檔案並收集解析後的資料。
 * 此函式是字典載入器的主要進入點，用於非同步載入字典檔案。
 *
 * Creates a readable stream that loads a file and collects parsed data.
 * This function is the main entry point for dictionary loaders to asynchronously load dictionary files.
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
export function createLoadStream<T>(file: string, options: {

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

	let stream: IStreamLineWithValue<any> = createStreamLine(file, options.mapper, {

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
		},
	});

	return stream;
}

export default createLoadStream;