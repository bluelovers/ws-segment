/**
 * Created by user on 2018/3/14/014.
 */

import { wrapStreamToPromise, IStreamLineWithValue } from '../../fs/line';
import * as Promise from 'bluebird';
import createLoadStream, { ICallback } from '../../fs/stream';

export type IDictRow = string[];
export type IDict = IDictRow[];

/**
 * 揭穿,戳穿
 */
export function parseLine(input: string): IDictRow
{
	let ret = input
		.replace(/^\s+|\s+$/, '')
		.split(',')
	;

	if (ret.length < 2)
	{
		throw new ReferenceError(`${input}`);
	}

	return ret;
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

export function loadStream(file: string, callback?: ICallback<IDict>)
{
	let stream = createLoadStream<IDict>(file, {

		callback,

		mapper(line)
		{
			if (line)
			{
				return parseLine(line);
			}
		},

	});

	return stream;
}

export default load;
