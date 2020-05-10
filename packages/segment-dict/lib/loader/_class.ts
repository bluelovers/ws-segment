/**
 * Created by user on 2018/4/13/013.
 */

import Promise = require('bluebird');
import { LF } from 'crlf-normalize';
import { wrapStreamToPromise, IStreamLineWithValue } from '../fs/line';
import createLoadStream, { ICallback } from '../fs/stream';
import createLoadStreamSync from '../fs/sync';
import { autobind } from 'core-decorators';

export type IOptions<T, R> = {

	parseLine?(input: string, oldFn?: (input: string) => R): R,

	mapper?(line),

	filter?(line),

	stringifyLine?(data: R): string,

};

@autobind
export class LoaderClass<T, R>
{
	public default = this.load;
	protected defaultOptions: IOptions<T, R>;

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

	static create(options: IOptions<any, any> = {}, ...argv)
	{
		return new this(options, ...argv);
	}

	parseLine(input: string): R
	{
		return input as any as R
	}

	stringifyLine(data: R): string
	{
		return data.toString();
	}

	serialize(data: R[]): string
	{
		let self = this;

		return data.map(function (d)
		{
			return self.stringifyLine(d);
		}).join(LF);
	}

	filter(input: string)
	{
		return input
	}

	load(file: string, options: IOptions<T, R> = {}): Promise<T>
	{
		return wrapStreamToPromise(this.loadStream(file, options))
			.then(function (stream: IStreamLineWithValue<T>)
			{
				return stream.value;
			})
			;
	}

	loadSync(file: string, options: IOptions<T, R> = {})
	{
		let r = this.loadStreamSync(file, options);
		let value = r.value;
		// 試圖手動清除記憶體占用
		r = undefined;
		return value;
	}

	loadStream(file: string, options: IOptions<T, R> = {}, callback?: ICallback<T>)
	{
		return this._createStream(createLoadStream, file, options, callback)
	}

	loadStreamSync(file: string, options: IOptions<T, R> = {}, callback?: ICallback<T>)
	{
		return this._createStream(createLoadStreamSync, file, options, callback)
	}

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
