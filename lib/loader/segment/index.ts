/**
 * Created by user on 2018/3/14/014.
 */

import { wrapStreamToPromise, IStreamLineWithValue } from '../../fs/line';
import * as Promise from 'bluebird';
import createLoadStream, { ICallback } from '../../fs/stream';

export type IDictRow = [string, number, number];
export type IDict = IDictRow[];

/**
 * 爱|0x1000|323
 */
export function parseLine(input: string): IDictRow
{
	let [str, n, s] = input
		.replace(/^\s+|\s+$/, '')
		.split(/\|/g)
	;

	return [str, parseInt(n), parseInt(s)];
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

		ondata(data)
		{
			if (data)
			{
				stream.value = stream.value || [];
				stream.value.push(data);
			}
		},

	});

	return stream;
}

export default load;
