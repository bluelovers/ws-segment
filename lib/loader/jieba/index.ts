/**
 * Created by user on 2018/3/14/014.
 */

import * as fs from 'fs';
import crlf, { LF, lineSplit } from 'crlf-normalize';
import ReadlineStream from '../../stream';

export type IDictRow = [string, number, string];
export type IDict = IDictRow[];

export function parse(input: string): IDict
{
	return lineSplit(input)
		.reduce(function (a, input)
		{
			if (input.trim() !== '')
			{
				let row = parseLine(input);

				a.push(row)
			}

			return a;
		}, [] as IDict) as IDict
		;
}

export function parseLine(input: string): IDictRow
{
	let [str, n, s] = input
		.replace(/^\s+|\s+$/, '')
		.split(/\s+/g)
	;

	return [str, parseInt(n), s];
}

export function loadSync(file: string): IDict
{
	let input = fs.readFileSync(file);

	return parse(input.toString());
}

export interface ICallback extends Function
{
	(err: Error, dict?: IDict, stream?: ReadlineStream): void
}

export function load(file: string): Promise<IDict>
{
	return new Promise(function (resolve, reject)
	{
		loadStream(file, function (err, dict, stream)
		{
			if (err)
			{
				reject(err);
			}
			else
			{
				resolve(dict);
			}
		})
	})
}

export function loadStream(file: string, cb?: ICallback)
{
	let stream = ReadlineStream.createReadStream(file, {
		trailing: true,
		allowEmptyLine: false,
	});

	let i = 0;

	let dict: IDict = [];

	try
	{
		stream.on('data', function (line, ...argv)
		{
			//console.log('data', i++, line);
			dict.push(parseLine(line as string));
		});

		stream.on('close', function (line, ...argv)
		{

			if (typeof line == 'string')
			{
				//console.log('close', i++, line, argv);
				dict.push(parseLine(line as string));
			}
		});

		stream.on('end', function ()
		{
			if (cb)
			{
				cb(null, dict, stream);
			}
		});
	}
	catch (e)
	{
		stream.emit('error', e, dict);

		if (cb)
		{
			cb(e, dict, stream);
		}
	}

	return stream;
}

import * as self from './index';
export default self;
