/**
 * Created by user on 2018/3/14/014.
 */

import { wrapStreamToPromise, IStreamLineWithValue } from '../../fs/line';
import * as Promise from 'bluebird';
import createLoadStream, { ICallback } from '../../fs/stream';
import createLoadStreamSync from '../../fs/sync';
import LoaderClass from '../_class';

export type IDictRow<T = string> = {
	0: string,
	1: number,
	2: number,
	[index: number]: T | string | number,
	//length: number,
} & Array<string | number>;

export type IDict = IDictRow[];

const libLoader = new LoaderClass<IDict, IDictRow>({
	parseLine(input: string): IDictRow
	{
		let [str, n, s, ...plus] = input
			.replace(/^\s+|\s+$/, '')
			.split(/\|/g)
			.map(v => v.trim())
		;

		let d1 = Number(n);
		let d2 = Number(s);

		if (Number.isNaN(d1))
		{
			// @ts-ignore
			d1 = 0;
		}
		if (Number.isNaN(d2))
		{
			// @ts-ignore
			d2 = 0;
		}

		// @ts-ignore
		return [str, d1, d2, ...plus];
	},

	filter(line: string)
	{
		line = line
			.replace(/\uFEFF/g, '')
			.trim()
			.replace(/^\s+|\s+$/, '')
		;

		if (line && line.indexOf('\/\/') != 0)
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

		if (a.length > 1)
		{
			// @ts-ignore
			if (!a[1] || Number.isNaN(a[1]))
			{
				// @ts-ignore
				a[1] = 0;
			}

			// @ts-ignore
			a[1] = '0x' + a[1]
				.toString(16)
				.padStart(4, '0')
				.toUpperCase()
			;
		}

		if (a.length > 2)
		{
			// @ts-ignore
			if (!a[2] || Number.isNaN(a[2]))
			{
				// @ts-ignore
				a[2] = 0;
			}
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

export default libLoader.load as typeof libLoader.load;
