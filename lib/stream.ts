/**
 * Created by user on 2018/3/14/014.
 */

import { ReadStream, Stats } from "fs";
import * as fs from 'fs';
import { Transform, TransformOptions } from 'stream';

export type IOptions = TransformOptions & {
	trailing?: boolean,
	bytesSize?: number,
	allowEmptyLine?: boolean,
};

export class ReadlineStream extends Transform
{
	_readableState;
	lineBuffer: string;

	pipeStream: ReadStream;

	isFlushEnd: boolean;
	isFinalEnd: boolean;
	fileEnd: string;

	options: IOptions;

	bytesSize?: number;
	bytesRead?: number;
	pos?: number;

	currentLine?: string;

	constructor(options: IOptions = {})
	{
		options = Object.assign({
			trailing: true,
		} as IOptions, options);

		super(options);

		this.lineBuffer = '';

		this._setup(options);
	}

	protected _setup(options: IOptions)
	{
		const self = this;

		this.options = options;

		this._readableState.objectMode = true;

		this.on('pipe', function (src)
		{
			if (!this.encoding)
			{
				this.encoding = src._readableState.encoding;
			}

			self.pipeStream = src;

			if (options.bytesSize)
			{
				self.bytesSize = options.bytesSize;
			}
			else if (typeof src.bytesTotal == 'number')
			{
				self.bytesSize = src.bytesTotal;
			}
			else if (src.fd)
			{
				self.bytesSize = fs.fstatSync(src.fd).size;
			}
			else if (src.path)
			{
				self.bytesSize = fs.statSync(src.path).size;
			}
			else
			{
				self.bytesSize = null;
			}
		});
	}

	static createReadStream(file, options?: IOptions)
	{
		let stream = fs.createReadStream(file);
		return stream.pipe(this.create(options));
	}

	static create(options?: IOptions)
	{
		return new this(options);
	}

	_transform(chunk, encoding, done)
	{
		if (Buffer.isBuffer(chunk))
		{
			if (!encoding || encoding == 'buffer') encoding = 'utf8';

			chunk = chunk.toString(encoding);
		}

		this.lineBuffer += chunk;
		let lines = this.lineBuffer.split(/(?:\r\n|\r|\n)/g);

		// @ts-ignore
		this.pos = this.pipeStream.pos;
		this.bytesRead = this.pipeStream.bytesRead;

		while (lines.length > 1)
		{
			let row = lines.shift();

			if (this.options.trailing)
			{
				row = row.replace(/\s+$/g, '');
			}

			if (row !== '' || this.options.allowEmptyLine)
			{
				this.currentLine = row;

				this.push(row);
			}
		}

		this.lineBuffer = '';

		if (lines.length)
		{
			let row = lines.shift();
			this.lineBuffer = row;

			if (this.bytesSize === this.pipeStream.bytesRead)
			{
				this.isFinalEnd = true;
				this.fileEnd = row;
			}

			if (this.options.trailing)
			{
				row = row.replace(/\s+$/g, '');
			}

			if (this.isFinalEnd && row !== '' || this.options.allowEmptyLine)
			{
				this.currentLine = row;
				this.push(row);
				this.lineBuffer = '';
			}
		}

		done();
	}

	_flush(done)
	{
		let row = this.lineBuffer;

		if (this.options.trailing)
		{
			row = row.replace(/\s+$/g, '');
		}

		if (typeof this.lineBuffer == 'string' && (this.lineBuffer !== '' || this.options.allowEmptyLine))
		{
			this.currentLine = row;

			this.isFlushEnd = true;
			this.push(row);
			this.lineBuffer = '';
		}

		this.emit('close');

		done();
	}
}

export default ReadlineStream;
