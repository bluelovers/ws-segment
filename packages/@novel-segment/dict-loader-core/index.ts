/**
 * 字典載入器核心模組
 * Dictionary Loader Core Module
 *
 * 提供字典載入器的基礎類別與工具函式。
 * Provides base class and utilities for loading dictionary files.
 *
 * Created by user on 2018/4/13/013.
 */

import Bluebird from 'bluebird';
import { LF } from 'crlf-normalize';
import { wrapStreamToPromise, IStreamLineWithValue } from '@novel-segment/stream-loader-core/line';
import createLoadStream, { ICallback } from '@novel-segment/stream-loader-core/stream';
import createLoadStreamSync from '@novel-segment/stream-loader-core/sync';
import { autobind } from 'core-decorators';

/**
 * 載入器選項介面
 * Loader Options Interface
 *
 * 定義字典載入器的設定選項。
 * Defines configuration options for the dictionary loader.
 */
export type IOptions<T, R> = {

	/**
	 * 解析行函式
	 * Parse Line Function
	 *
	 * 自訂解析字典檔案每行的函式。
	 * Custom function to parse each line of the dictionary file.
	 */
	parseLine?(input: string, oldFn?: (input: string) => R): R,

	/**
	 * 映射函式
	 * Mapper Function
	 *
	 * 解析後轉換每行的函式。
	 * Function to transform each line after parsing.
	 */
	mapper?(line),

	/**
	 * 過濾函式
	 * Filter Function
	 *
	 * 解析前過濾行的函式。
	 * 返回 undefined 或 null 可跳過該行。
	 *
	 * Function to filter lines before parsing.
	 * Return undefined or null to skip the line.
	 */
	filter?(line),

	/**
	 * 字串化行函式
	 * Stringify Line Function
	 *
	 * 將資料轉換回字串格式的函式。
	 * Function to convert data back to string format.
	 */
	stringifyLine?(data: R): string,

};

/**
 * 載入器類別
 * Loader Class
 *
 * 字典載入器的基礎類別，提供檔案載入、
 * 行解析與序列化功能。
 *
 * Base class for dictionary loaders, providing file loading,
 * line parsing, and serialization functionality.
 *
 * @template T - 載入資料陣列的類型 / The type of the loaded data array
 * @template R - 每行資料的類型 / The type of each row in the data
 */
@autobind
export class LoaderClass<T, R>
{
	/**
	 * 預設載入方法別名
	 * Default load method alias
	 */
	public default = this.load;

	/**
	 * 預設選項
	 * Default options
	 */
	protected defaultOptions: IOptions<T, R>;

	/**
	 * 建構子
	 * Constructor
	 *
	 * 使用自訂選項初始化載入器。
	 * Initializes the loader with custom options.
	 *
	 * @param {IOptions<T, R>} options - 載入器選項 / Loader options
	 * @param {...any} argv - 額外參數 / Additional arguments
	 */
	constructor(options: IOptions<T, R> = {}, ...argv)
	{
		if (options.parseLine)
		{
			this.parseLine = options.parseLine.bind(this);
		}

		if (options.stringifyLine)
		{
			this.stringifyLine = options.stringifyLine.bind(this);
		}

		if (options.filter)
		{
			this.filter = options.filter.bind(this);
		}

		if (options.mapper)
		{
			this.defaultOptions.mapper = options.mapper.bind(this);
		}
	}

	/**
	 * 建立新的載入器實例
	 * Create a new loader instance
	 *
	 * 建立載入器實例的靜態工廠方法。
	 * Static factory method to create loader instances.
	 *
	 * @param {IOptions<any, any>} options - 載入器選項 / Loader options
	 * @param {...any} argv - 額外參數 / Additional arguments
	 * @returns {LoaderClass<any, any>} 新的載入器實例 / New loader instance
	 */
	static create(options: IOptions<any, any> = {}, ...argv)
	{
		return new this(options, ...argv);
	}

	/**
	 * 解析單行
	 * Parse a single line
	 *
	 * 將字典檔案的一行解析為資料行。
	 * 覆寫此方法以實作自訂解析邏輯。
	 *
	 * Parses a line from the dictionary file into a data row.
	 * Override this method to implement custom parsing logic.
	 *
	 * @param {string} input - 行內容 / Line content
	 * @returns {R} 解析後的資料行 / Parsed data row
	 */
	parseLine(input: string): R
	{
		return input as any as R
	}

	/**
	 * 字串化資料行
	 * Stringify a data row
	 *
	 * 將資料行轉換回字串格式。
	 * Converts a data row back to string format.
	 *
	 * @param {R} data - 要字串化的資料行 / Data row to stringify
	 * @returns {string} 字串表示 / String representation
	 */
	stringifyLine(data: R): string
	{
		return data.toString();
	}

	/**
	 * 序列化資料陣列
	 * Serialize data array
	 *
	 * 將資料行陣列轉換為字串。
	 * Converts an array of data rows to a string.
	 *
	 * @param {R[]} data - 要序列化的資料陣列 / Data array to serialize
	 * @returns {string} 序列化後的字串 / Serialized string
	 */
	serialize(data: R[]): string
	{
		let self = this;

		return data.map(function (d)
		{
			return self.stringifyLine(d);
		}).join(LF);
	}

	/**
	 * 過濾行
	 * Filter a line
	 *
	 * 解析前過濾行。
	 * 返回 undefined 或 null 可跳過該行。
	 *
	 * Filters a line before parsing.
	 * Return undefined or null to skip the line.
	 *
	 * @param {string} input - 行內容 / Line content
	 * @returns {string | undefined | null} 過濾後的行或 undefined 以跳過 / Filtered line or undefined to skip
	 */
	filter(input: string)
	{
		return input
	}

	/**
	 * 非同步載入字典
	 * Load dictionary asynchronously
	 *
	 * 載入字典檔案並返回 Promise。
	 * Loads a dictionary file and returns a promise.
	 *
	 * @param {string} file - 檔案路徑 / File path
	 * @param {IOptions<T, R>} options - 載入器選項 / Loader options
	 * @returns {Bluebird<T>} 解析為載入資料的 Promise / Promise resolving to loaded data
	 */
	load(file: string, options: IOptions<T, R> = {}): Bluebird<T>
	{
		return wrapStreamToPromise(this.loadStream(file, options))
			.then(function (stream: IStreamLineWithValue<T>)
			{
				return stream.value;
			})
			;
	}

	/**
	 * 同步載入字典
	 * Load dictionary synchronously
	 *
	 * 同步載入字典檔案。
	 * Loads a dictionary file synchronously.
	 *
	 * @param {string} file - 檔案路徑 / File path
	 * @param {IOptions<T, R>} options - 載入器選項 / Loader options
	 * @returns {T} 載入的資料 / Loaded data
	 */
	loadSync(file: string, options: IOptions<T, R> = {})
	{
		let r = this.loadStreamSync(file, options);
		let value = r.value;
		// 嘗試手動清除記憶體使用
		// Try to manually clear memory usage
		r = undefined;
		return value;
	}

	/**
	 * 以串流方式載入字典
	 * Load dictionary as stream
	 *
	 * 建立可讀取串流以載入字典檔案。
	 * Creates a readable stream for loading a dictionary file.
	 *
	 * @param {string} file - 檔案路徑 / File path
	 * @param {IOptions<T, R>} options - 載入器選項 / Loader options
	 * @param {ICallback<T>} callback - 完成回呼 / Completion callback
	 * @returns {IStreamLineWithValue<T>} 帶有值的串流 / Stream with value
	 */
	loadStream(file: string, options: IOptions<T, R> = {}, callback?: ICallback<T>)
	{
		return this._createStream(createLoadStream, file, options, callback)
	}

	/**
	 * 以同步串流方式載入字典
	 * Load dictionary as stream (synchronous)
	 *
	 * 建立可讀取串流以同步載入字典檔案。
	 * Creates a readable stream for loading a dictionary file synchronously.
	 *
	 * @param {string} file - 檔案路徑 / File path
	 * @param {IOptions<T, R>} options - 載入器選項 / Loader options
	 * @param {ICallback<T>} callback - 完成回呼 / Completion callback
	 * @returns {IStreamLineWithValue<T>} 帶有值的串流 / Stream with value
	 */
	loadStreamSync(file: string, options: IOptions<T, R> = {}, callback?: ICallback<T>)
	{
		return this._createStream(createLoadStreamSync, file, options, callback)
	}

	/**
	 * 內部方法：建立串流
	 * Internal method: Create stream
	 *
	 * 使用提供的串流工廠函式建立串流。
	 * Creates a stream using the provided stream factory function.
	 *
	 * @protected
	 * @template T
	 * @param {typeof createLoadStream} fnStream - 串流工廠函式 / Stream factory function
	 * @param {string} file - 檔案路徑 / File path
	 * @param {IOptions<T, R>} options - 載入器選項 / Loader options
	 * @param {ICallback<T>} callback - 完成回呼 / Completion callback
	 * @returns {IStreamLineWithValue<T>} 帶有值的串流 / Stream with value
	 */
	protected _createStream<T>(fnStream: typeof createLoadStream,
		file: string,
		options: IOptions<T, R> = {},
		callback?: ICallback<T>
	)
	{
		let self = this;

		let opts = Object.assign({}, this.defaultOptions, options);

		let parseLine = opts.parseLine || self.parseLine;
		let filter = opts.filter || self.filter;

		opts.parseLine = parseLine;

		let stream = fnStream<T>(file, {

			callback,

			mapper: opts.mapper || function mapper(line)
			{
				if (filter)
				{
					line = filter(line);
				}

				if (line)
				{
					// @ts-ignore
					return parseLine(line, self.parseLine);
				}
			},

		});

		// @ts-ignore
		stream.pipeLoader = self;
		// @ts-ignore
		stream.pipeRuntimeOptions = opts;

		return stream;
	}
}

export default LoaderClass;
