/**
 * Created by user on 2018/4/11/011.
 */

import fs from 'fs';
import split2 from 'split2';
import path from 'path';
import Bluebird from 'bluebird';
import stream from 'stream';

import { createReadStream, IPipe } from 'stream-pipe';
import { ReadStream } from 'stream-pipe/fs';

export type IOptions = {

	mapper?(data: string),

	onpipe?(src),
	onclose?(...argv),
	onfinish?(...argv),
	onready?(...argv),
	ondata?(...argv),

}

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

		// @ts-ignore
		this.pipeFrom = src;
		let pipeStat = null as fs.Stats;

		if (typeof src.bytesTotal == 'number')
		{
			self.bytesSize = src.bytesTotal;
		}
		else if (src.fd)
		{
			pipeStat = fs.fstatSync(src.fd);

			self.bytesSize = pipeStat.size;
		}
		else if (src.path)
		{
			let p: string = src.path;

			if (src.cwd && !path.isAbsolute(src.path))
			{
				p = path.resolve(src.cwd, src.path);
			}

			pipeStat = fs.statSync(p);

			self.bytesSize = pipeStat.size;
		}
		else
		{
			self.bytesSize = null;
		}

		// @ts-ignore
		this.pipeStat = pipeStat;

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

export function createStreamLine(file: string, options: IOptions): IStreamLine
export function createStreamLine(file: string, fn?: (data: string) => any, options?: IOptions): IStreamLine
export function createStreamLine(file: string, fn?, options?: IOptions)
{
	return createReadStream(file)
		.pipe(byLine(fn, options))
		;
}

export function readFileLine(file: string, options: IOptions): IPromiseStream<IStreamLine>
export function readFileLine(file: string, fn?: (data: string) => any, options?: IOptions): IPromiseStream<IStreamLine>
export function readFileLine(file: string, fn?, options?: IOptions)
{
	return wrapStreamToPromise(createStreamLine(file, fn, options));
}

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

export type IStreamLine = IPipe<ReadStream, NodeJS.WritableStream>;

export type IStreamLineWithValue<T> = IStreamLine & {
	value?: T,
};

export type IPromiseStream<T> = Bluebird<T> & {
	stream: T,
};

/*
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
