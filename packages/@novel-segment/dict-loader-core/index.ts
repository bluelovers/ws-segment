/**
 * dictionary Loader Core Module
 * dictionary Loader Core Module
 *
 * dictionary Loader Core Module
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
 * Loader Options Interface
 * Loader Options Interface
 *
 * Defines configuration options for the dictionary loader.
 */
export type IOptions<T, R> = {

	/**
	 * Parse Line Function
	 * Parse Line Function
	 *
	 * Custom function to parse each line of the dictionary file.
	 */
	parseLine?(input: string, oldFn?: (input: string) => R): R,

	/**
	 * Mapper Function
	 * Mapper Function
	 *
	 * Function to transform each line after parsing.
	 */
	mapper?(line),

	/**
	 * Filter Function
	 * Filter Function
	 *
	 * Function to filter lines before parsing.
	 * Return undefined or null to skip the line.
	 */
	filter?(line),

	/**
	 * Stringify Line Function
	 * Stringify Line Function
	 *
	 * Function to convert data back to string format.
	 */
	stringifyLine?(data: R): string,

};

/**
 * Loader Class
 * Loader Class
 *
 * Base class for dictionary loaders, providing file loading,
 * line parsing, and serialization functionality.
 *
 * @template T - The type of the loaded data array / The type of the loaded data array
 * @template R - The type of each row in the data / The type of each row in the data
 */
@autobind
export class LoaderClass<T, R>
{
	/**
	 * Default load method alias
	 * Default load method alias
	 */
	public default = this.load;

	/**
	 * Default options
	 * Default options
	 */
	protected defaultOptions: IOptions<T, R>;

	/**
	 * Constructor
	 * Constructor
	 *
	 * Initializes the loader with custom options.
	 *
	 * @param {IOptions<T, R>} options - Loader options / Loader options
	 * @param {...any} argv - Additional arguments / Additional arguments
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
	 * Create a new loader instance
	 * Create a new loader instance
	 *
	 * Static factory method to create loader instances.
	 *
	 * @param {IOptions<any, any>} options - Loader options / Loader options
	 * @param {...any} argv - Additional arguments / Additional arguments
	 * @returns {LoaderClass<any, any>} New loader instance / New loader instance
	 */
	static create(options: IOptions<any, any> = {}, ...argv)
	{
		return new this(options, ...argv);
	}

	/**
	 * Parse a single line
	 * Parse a single line
	 *
	 * Parses a line from the dictionary file into a data row.
	 * Override this method to implement custom parsing logic.
	 *
	 * @param {string} input - Line content / Line content
	 * @returns {R} Parsed data row / Parsed data row
	 */
	parseLine(input: string): R
	{
		return input as any as R
	}

	/**
	 * Stringify a data row
	 * Stringify a data row
	 *
	 * Converts a data row back to string format.
	 *
	 * @param {R} data - Data row to stringify / Data row to stringify
	 * @returns {string} String representation / String representation
	 */
	stringifyLine(data: R): string
	{
		return data.toString();
	}

	/**
	 * Serialize data array
	 * Serialize data array
	 *
	 * Converts an array of data rows to a string.
	 *
	 * @param {R[]} data - Data array to serialize / Data array to serialize
	 * @returns {string} Serialized string / Serialized string
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
	 * Filter a line
	 * Filter a line
	 *
	 * Filters a line before parsing.
	 * Return undefined or null to skip the line.
	 *
	 * @param {string} input - Line content / Line content
	 * @returns {string | undefined | null} Filtered line or undefined to skip / Filtered line or undefined to skip
	 */
	filter(input: string)
	{
		return input
	}

	/**
	 * Load dictionary asynchronously
	 * Load dictionary asynchronously
	 *
	 * Loads a dictionary file and returns a promise.
	 *
	 * @param {string} file - File path / File path
	 * @param {IOptions<T, R>} options - Loader options / Loader options
	 * @returns {Bluebird<T>} Promise resolving to loaded data / Promise resolving to loaded data
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
	 * Load dictionary synchronously
	 * Load dictionary synchronously
	 *
	 * Loads a dictionary file synchronously.
	 *
	 * @param {string} file - File path / File path
	 * @param {IOptions<T, R>} options - Loader options / Loader options
	 * @returns {T} Loaded data / Loaded data
	 */
	loadSync(file: string, options: IOptions<T, R> = {})
	{
		let r = this.loadStreamSync(file, options);
		let value = r.value;
		// Try to manually clear memory usage
		// Try to manually clear memory usage
		r = undefined;
		return value;
	}

	/**
	 * Load dictionary as stream
	 * Load dictionary as stream
	 *
	 * Creates a readable stream for loading a dictionary file.
	 *
	 * @param {string} file - File path / File path
	 * @param {IOptions<T, R>} options - Loader options / Loader options
	 * @param {ICallback<T>} callback - Completion callback / Completion callback
	 * @returns {IStreamLineWithValue<T>} Stream with value / Stream with value
	 */
	loadStream(file: string, options: IOptions<T, R> = {}, callback?: ICallback<T>)
	{
		return this._createStream(createLoadStream, file, options, callback)
	}

	/**
	 * Load dictionary as stream (synchronous)
	 * Load dictionary as stream (synchronous)
	 *
	 * Creates a readable stream for loading a dictionary file synchronously.
	 *
	 * @param {string} file - File path / File path
	 * @param {IOptions<T, R>} options - Loader options / Loader options
	 * @param {ICallback<T>} callback - Completion callback / Completion callback
	 * @returns {IStreamLineWithValue<T>} Stream with value / Stream with value
	 */
	loadStreamSync(file: string, options: IOptions<T, R> = {}, callback?: ICallback<T>)
	{
		return this._createStream(createLoadStreamSync, file, options, callback)
	}

	/**
	 * Internal method: Create stream
	 * Internal method: Create stream
	 *
	 * Creates a stream using the provided stream factory function.
	 *
	 * @protected
	 * @template T
	 * @param {typeof createLoadStream} fnStream - Stream factory function / Stream factory function
	 * @param {string} file - File path / File path
	 * @param {IOptions<T, R>} options - Loader options / Loader options
	 * @param {ICallback<T>} callback - Completion callback / Completion callback
	 * @returns {IStreamLineWithValue<T>} Stream with value / Stream with value
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