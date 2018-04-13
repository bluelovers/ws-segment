/**
 * Created by user on 2018/3/14/014.
 */

import { wrapStreamToPromise, IStreamLineWithValue } from '../../fs/line';
import * as Promise from 'bluebird';
import createLoadStream, { ICallback } from '../../fs/stream';
import createLoadStreamSync from '../../fs/sync';
import { LoaderClass } from '../_class';

export type IDictRow = [string, number, number];
export type IDict = IDictRow[];

const libLoader = new LoaderClass<IDict, IDictRow>({
	parseLine(input: string): IDictRow
	{
		let [str, n, s] = input
			.replace(/^\s+|\s+$/, '')
			.split(/\|/g)
			.map(v => v.trim())
		;

		return [str, Number(n), Number(s)];
	},

	filter(line: string)
	{
		if (line && line.indexOf('//') != 0)
		{
			return line;
		}
	}
});

export const load = libLoader.load as typeof libLoader.load;
export const loadSync = libLoader.loadSync as typeof libLoader.loadSync;

export const loadStream = libLoader.loadStream as typeof libLoader.loadStream;
export const loadStreamSync = libLoader.loadStreamSync as typeof libLoader.loadStreamSync;

export const parseLine = libLoader.parseLine as typeof libLoader.parseLine;

export const Loader = libLoader;

export default libLoader.load;
