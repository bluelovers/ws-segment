/**
 * Created by user on 2018/3/14/014.
 */

import { wrapStreamToPromise, IStreamLineWithValue } from '../../fs/line';
import * as Promise from 'bluebird';
import createLoadStream, { ICallback } from '../../fs/stream';
import createLoadStreamSync from '../../fs/sync';
import LoaderClass from '../_class';

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
	},

	stringifyLine(data)
	{
		let a: string[] = [];

		// @ts-ignore
		a = data
			.slice()
		;

		if (data.length > 1)
		{
			// @ts-ignore
			a[1] = '0x' + a[1].toString(16).padStart(4, '0');
		}

		return a.join('|');
	}
});

export const load = libLoader.load as typeof libLoader.load;
export const loadSync = libLoader.loadSync as typeof libLoader.loadSync;

export const loadStream = libLoader.loadStream as typeof libLoader.loadStream;
export const loadStreamSync = libLoader.loadStreamSync as typeof libLoader.loadStreamSync;

export const parseLine = libLoader.parseLine as typeof libLoader.parseLine;
export const stringifyLine = libLoader.stringifyLine as typeof libLoader.stringifyLine;

export const serialize = libLoader.serialize as typeof libLoader.serialize;

export const Loader = libLoader;

export default Loader.load;
