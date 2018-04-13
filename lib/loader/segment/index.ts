/**
 * Created by user on 2018/3/14/014.
 */

import { wrapStreamToPromise, IStreamLineWithValue } from '../../fs/line';
import * as Promise from 'bluebird';
import createLoadStream, { ICallback } from '../../fs/stream';
import createLoadStreamSync from '../../fs/sync';

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

	return [str, Number(n), Number(s)];
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
