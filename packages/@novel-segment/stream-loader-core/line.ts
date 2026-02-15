/**
 * Stream Line Reader Module
 * Stream Line Reader Module
 *
 * Provides utilities for reading files line by line using streams.
 * Supports both asynchronous and synchronous operations.
 *
 * Created by user on 2018/4/11/011.
 */

import { fstatSync, statSync, Stats } from 'fs';
import split2 from 'split2';
import { isAbsolute, resolve } from 'path';
import Bluebird from 'bluebird';
import stream from 'stream';
import { createReadStream, IPipe } from 'stream-pipe';
import { ReadStream } from 'stream-pipe/fs';

/**
 * Stream Line Options Interface
 * Stream Line Options Interface
 */
export type IOptions = {

	/**
	 * Mapper function for each line
	 * Mapper function for each line
	 */
	mapper?(data: string),

	/**
	 * Pipe event handler
	 * Pipe event handler
	 */
	onpipe?(src),

	/**
	 * Close event handler
	 * Close event handler
	 */
	onclose?(...argv),

	/**
	 * Finish event handler
	 * Finish event handler
	 */
	onfinish?(...argv),

	/**
	 * Ready event handler
	 * Ready event handler
	 */
	onready?(...argv),

	/**
	 * Data event handler
	 * Data event handler
	 */
	ondata?(...argv),

}

/**
 * Create a line-by-line transform stream
 * Create a line-by-line transform stream
 *
 * Creates a transform stream that splits input by lines.
 *
 * @param {Function} [fn] - Optional mapper function for each line / Optional mapper function for each line
 * @param {IOptions} [options] - Stream options / Stream options
 * @returns {IStreamLine} Line stream / Line stream
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

		// Store reference to source stream
		// Store reference to source stream
		// @ts-ignore
		this.pipeFrom = src;
		let pipeStat = null as Stats;

		// Determine file size for progress tracking
		// Determine file size for progress tracking
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
			self.bytesSize = null;
		}

		// @ts-ignore
		this.pipeStat = pipeStat;

		// Forward events from source
		// Forward events from source
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

	// Register event handlers from options
	// Register event handlers from options
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
 * Create a stream line reader
 * Create a stream line reader
 *
 * Creates a readable stream that outputs lines from a file.
 *
 * @param {string} file - File path / File path
 * @param {IOptions} options - Stream options / Stream options
 * @returns {IStreamLine} Line stream / Line stream
 */
export function createStreamLine(file: string, options: IOptions): IStreamLine

/**
 * Create a stream line reader
 * Create a stream line reader
 *
 * @param {string} file - File path / File path
 * @param {Function} [fn] - Optional mapper function / Optional mapper function
 * @param {IOptions} [options] - Stream options / Stream options
 * @returns {IStreamLine} Line stream / Line stream
 */
export function createStreamLine(file: string, fn?: (data: string) => any, options?: IOptions): IStreamLine

export function createStreamLine(file: string, fn?, options?: IOptions)
{
	return createReadStream(file)
		.pipe(byLine(fn, options))
		;
}

/**
 * Read file lines with promise support
 * Read file lines with promise support
 *
 * Creates a promise-wrapped stream for reading file lines.
 *
 * @param {string} file - File path / File path
 * @param {IOptions} options - Stream options / Stream options
 * @returns {IPromiseStream<IStreamLine>} Promise-wrapped stream / Promise-wrapped stream
 */
export function readFileLine(file: string, options: IOptions): IPromiseStream<IStreamLine>

/**
 * Read file lines with promise support
 * Read file lines with promise support
 *
 * @param {string} file - File path / File path
 * @param {Function} [fn] - Optional mapper function / Optional mapper function
 * @param {IOptions} [options] - Stream options / Stream options
 * @returns {IPromiseStream<IStreamLine>} Promise-wrapped stream / Promise-wrapped stream
 */
export function readFileLine(file: string, fn?: (data: string) => any, options?: IOptions): IPromiseStream<IStreamLine>

export function readFileLine(file: string, fn?, options?: IOptions)
{
	return wrapStreamToPromise(createStreamLine(file, fn, options));
}

/**
 * Wrap a stream to a promise
 * Wrap a stream to a promise
 *
 * Wraps a stream in a promise that resolves when the stream closes or finishes.
 *
 * @template T - Stream type / Stream type
 * @param {T} stream - Stream to wrap / Stream to wrap
 * @returns {IPromiseStream<T>} Promise-wrapped stream / Promise-wrapped stream
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
 * Stream Line Type
 * Stream Line Type
 *
 * A stream that outputs lines from a file.
 */
export type IStreamLine = IPipe<ReadStream, NodeJS.WritableStream>;

/**
 * Stream Line with Value Type
 * Stream Line with Value Type
 *
 * A stream line that also stores a value (e.g., loaded data).
 */
export type IStreamLineWithValue<T> = IStreamLine & {
	value?: T,
};

/**
 * Promise Stream Type
 * Promise Stream Type
 *
 * A promise that also has a stream property.
 */
export type IPromiseStream<T> = Bluebird<T> & {
	stream: T,
};

/*
 * Usage Example / Usage Example:

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