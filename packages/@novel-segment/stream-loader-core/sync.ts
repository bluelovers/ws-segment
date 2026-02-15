/**
 * Synchronous Stream Loader Module
 * Synchronous Stream Loader Module
 *
 * Provides synchronous stream loading functionality for dictionary files.
 * Uses a custom synchronous readable stream implementation.
 *
 * Created by user on 2018/4/13/013.
 */

import { Readable } from 'stream';
import { openSync, readSync } from 'fs';
import { resolve } from 'path';
import EventEmitter from 'events';
import { byLine, IOptions, IStreamLine, IStreamLineWithValue } from './line';
import { ICallback } from './stream';

/**
 * Create a synchronous load stream
 * Create a synchronous load stream
 *
 * Creates a readable stream that loads a file synchronously and collects parsed data.
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
export function createLoadStreamSync<T>(file: string, options: {

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

	let stream: IStreamLineWithValue<any> = createStreamLineSync(file, options.mapper, {

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
		}
	});

	// Run the synchronous stream
	// Run the synchronous stream
	// @ts-ignore
	stream.pipeFrom.run();

	return stream;
}

/**
 * Create a synchronous stream line reader
 * Create a synchronous stream line reader
 *
 * @param {string} file - File path / File path
 * @param {IOptions} options - Stream options / Stream options
 * @returns {IStreamLine} Line stream / Line stream
 */
export function createStreamLineSync(file: string, options: IOptions): IStreamLine

/**
 * Create a synchronous stream line reader
 * Create a synchronous stream line reader
 *
 * @param {string} file - File path / File path
 * @param {Function} [fn] - Optional mapper function / Optional mapper function
 * @param {IOptions} [options] - Stream options / Stream options
 * @returns {IStreamLine} Line stream / Line stream
 */
export function createStreamLineSync(file: string, fn?: (data: string) => any, options?: IOptions): IStreamLine

export function createStreamLineSync(file: string, fn?, options?: IOptions)
{
	return createReadStreamSync(file)
		.pipe(byLine(fn, options))
		;
}

/**
 * Create a synchronous readable stream
 * Create a synchronous readable stream
 *
 * @param {string} file - File path / File path
 * @returns {ReadableSync} Synchronous readable stream / Synchronous readable stream
 */
export function createReadStreamSync(file: string)
{
	return new ReadableSync(file);
}

/**
 * Synchronous Readable Stream Class
 * Synchronous Readable Stream Class
 *
 * A custom Readable stream implementation that reads files synchronously.
 * This allows for synchronous file processing using the stream API.
 */
export class ReadableSync extends Readable
{
	/**
	 * File descriptor
	 * File descriptor
	 */
	protected fd: number = null;

	/**
	 * File open flags
	 * File open flags
	 */
	protected flags: string | number = 'r';

	/**
	 * Total bytes read
	 * Total bytes read
	 */
	public bytesRead: number = 0;

	/**
	 * File path
	 * File path
	 */
	public path: string;

	/**
	 * End of file flag
	 * End of file flag
	 */
	protected fdEnd: boolean;

	/**
	 * Stream options
	 * Stream options
	 */
	protected options = {
		/**
		 * Chunk size for each read operation
		 * Chunk size for each read operation
		 */
		readChunk: 1024,
	};

	/**
	 * Constructor
	 * Constructor
	 *
	 * Initializes the synchronous readable stream.
	 *
	 * @param {string} file - File path or file descriptor / File path or file descriptor
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

		// Start in paused state
		// Start in paused state
		this.pause();
	}

	/**
	 * Internal read method
	 * Internal read method
	 *
	 * Reads all data from the file synchronously.
	 *
	 * @override
	 * @param {number} size - Suggested read size / Suggested read size
	 * @returns {Buffer} Read data / Read data
	 */
	override _read(size: number): Buffer
	{
		let buffers: Buffer[] = [];
		let bytesRead: Buffer;

		// Read all data in chunks
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
	 * Low-level read method
	 * Low-level read method
	 *
	 * Reads a single chunk from the file.
	 *
	 * @param {number} size - Suggested read size / Suggested read size
	 * @returns {Buffer | null} Read data or null at EOF / Read data or null at EOF
	 */
	__read(size: number): Buffer
	{
		// Create buffer for reading
		// Create buffer for reading
		//let readBuffer = new Buffer(this.options.readChunk);
		let readBuffer = Buffer.alloc(this.options.readChunk);

		let bytesRead = readSync(this.fd, readBuffer, 0, this.options.readChunk, this.bytesRead);

		// Check for end of file
		// Check for end of file
		if (bytesRead === 0)
		{
			this.fdEnd = true;
			return null;
		}

		this.bytesRead += bytesRead;

		// Trim buffer if partial read
		// Trim buffer if partial read
		if (bytesRead < this.options.readChunk) {
			this.fdEnd = true;
			readBuffer = readBuffer.slice(0, bytesRead);
		}

		return readBuffer;
	}

	/**
	 * Run the stream
	 * Run the stream
	 *
	 * Starts the synchronous reading process.
	 * Emits 'ready' event and reads all data until EOF.
	 *
	 * @returns {this} Returns this instance / Returns this instance
	 */
	run()
	{
		this.resume();

		this.emit('ready', this);

		let i = 0;

		// Read until end of file
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