/**
 * Stream Loader Module
 * Stream Loader Module
 *
 * Provides asynchronous stream loading functionality for dictionary files.
 *
 * Created by user on 2018/4/11/011.
 */

import { createStreamLine, IStreamLineWithValue } from './line';

/**
 * Callback Interface
 * Callback Interface
 *
 * Callback function type for stream loading completion.
 */
export interface ICallback<T>
{
	/**
	 * Callback function
	 * Callback function
	 *
	 * Called when stream loading completes or errors.
	 *
	 * @param {Error} err - Error object if any / Error object if any
	 * @param {T} [data] - Loaded data / Loaded data
	 * @param {IStreamLineWithValue<T>} [stream] - Stream instance / Stream instance
	 */
	(err: Error, data?: T, stream?: IStreamLineWithValue<T>): void
}

/**
 * Create a load stream
 * Create a load stream
 *
 * Creates a readable stream that loads a file and collects parsed data.
 *
 * @template T - Data type / Data type
 * @param {string} file - File path / File path
 * @param {Object} options - Stream options / Stream options
 * @param {Function} [options.mapper] - Line mapper function / Line mapper function
 * @param {Function} [options.ondata] - Data event handler / Data event handler
 * @param {ICallback<T>} [options.callback] - Completion callback / Completion callback
 * @param {Function} [options.onready] - Ready event handler / Ready event handler
 * @returns {IStreamLineWithValue<T>} Stream with value / Stream with value
 */
export function createLoadStream<T>(file: string, options: {

	mapper?(line: string),
	ondata?(data),

	callback?: ICallback<T>,

	onready?(...argv),

} = {}): IStreamLineWithValue<T>
{

	// Default ready handler: initialize value array
	// Default ready handler: initialize value array
	options.onready = options.onready || function (src, ...argv)
	{
		// @ts-ignore
		this.value = this.value || [];
	};

	// Default mapper: return line as-is
	// Default mapper: return line as-is
	options.mapper = options.mapper || function (data)
	{
		return data;
	};

	// Default data handler: push to value array
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
		 * Close handler: call callback with loaded data
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