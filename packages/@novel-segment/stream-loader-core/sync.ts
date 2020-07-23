/**
 * Created by user on 2018/4/13/013.
 */

import { Readable } from 'stream';
import { openSync, readSync } from 'fs';
import { resolve } from 'path';
import EventEmitter from 'events';
import { byLine, IOptions, IStreamLine, IStreamLineWithValue } from './line';
import { ICallback } from './stream';

export function createLoadStreamSync<T>(file: string, options: {

	mapper?(line: string),
	ondata?(data),

	callback?: ICallback<T>,

	onready?(...argv),

} = {}): IStreamLineWithValue<T>
{
	options.onready = options.onready || function (src, ...argv)
	{
		// @ts-ignore
		this.value = this.value || [];
	};

	options.mapper = options.mapper || function (data)
	{
		return data;
	};

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
		onclose()
		{
			if (options.callback)
			{
				options.callback.call(this, null, stream.value, stream)
			}
		}
	});

	// @ts-ignore
	stream.pipeFrom.run();

	return stream;
}

export function createStreamLineSync(file: string, options: IOptions): IStreamLine
export function createStreamLineSync(file: string, fn?: (data: string) => any, options?: IOptions): IStreamLine
export function createStreamLineSync(file: string, fn?, options?: IOptions)
{
	return createReadStreamSync(file)
		.pipe(byLine(fn, options))
		;
}

export function createReadStreamSync(file: string)
{
	return new ReadableSync(file);
}

export class ReadableSync extends Readable
{
	protected fd: number = null;
	protected flags: string | number = 'r';
	public bytesRead: number = 0;
	public path: string;

	protected fdEnd: boolean;

	protected options = {
		readChunk: 1024,
	};

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

		this.pause();
	}

	_read(size: number): Buffer
	{
		let buffers: Buffer[] = [];
		let bytesRead: Buffer;

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

	__read(size: number): Buffer
	{
		//let readBuffer = new Buffer(this.options.readChunk);
		let readBuffer = Buffer.alloc(this.options.readChunk);

		let bytesRead = readSync(this.fd, readBuffer, 0, this.options.readChunk, this.bytesRead);

		if (bytesRead === 0)
		{
			this.fdEnd = true;
			return null;
		}

		this.bytesRead += bytesRead;

		if (bytesRead < this.options.readChunk) {
			this.fdEnd = true;
			readBuffer = readBuffer.slice(0, bytesRead);
		}

		return readBuffer;
	}

	run()
	{
		this.resume();

		this.emit('ready', this);

		let i = 0;

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
