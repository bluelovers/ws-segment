/**
 * Created by user on 2018/3/14/014.
 */

import { wrapStreamToPromise, IStreamLineWithValue } from '../../fs/line';
import Promise = require('bluebird');
import createLoadStream, { ICallback } from '../../fs/stream';
import createLoadStreamSync from '../../fs/sync';

export type IDictRow = [string, number, string];
export type IDict = IDictRow[];

/**
 * 云计算
 * 蓝翔 nz
 * 区块链 10 nz
*/
export function parseLine(input: string): IDictRow
{
	let [str, n, s] = input
		.replace(/^\s+|\s+$/, '')
		.split(/\s+/g)
	;

	if (n === '')
	{
		n = undefined;
	}
	if (s === '')
	{
		s = undefined;
	}

	if (typeof s == 'undefined' || s == '')
	{
		if (typeof n == 'string' && !/^\d+(?:\.\d+)?$/.test(n))
		{
			[n, s] = [undefined, n];
		}
	}

	if (typeof n == 'string')
	{
		// @ts-ignore
		n = Number(n);
	}

	if (!str)
	{
		throw new ReferenceError(`${input}`);
	}

	return [str, n as any as number, s];
}

export function load(file: string): Promise<IDict>
{
	return wrapStreamToPromise(loadStream(file))
		.then(function (stream: IStreamLineWithValue<IDict>)
		{
			return stream.value;
		})
		;
}

export function loadSync(file: string)
{
	return loadStreamSync(file).value;
}

export function _createStream<IDict>(fnStream: typeof createLoadStream, file: string, callback?: ICallback<IDict>)
{
	return fnStream<IDict>(file, {

		callback,

		mapper(line)
		{
			if (line)
			{
				return parseLine(line);
			}
		},

	});
}

export function loadStream(file: string, callback?: ICallback<IDict>)
{
	return _createStream(createLoadStream, file, callback)
}

export function loadStreamSync(file: string, callback?: ICallback<IDict>)
{
	return _createStream(createLoadStreamSync, file, callback)
}

export default load;
