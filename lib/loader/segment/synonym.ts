/**
 * Created by user on 2018/3/14/014.
 */

import { wrapStreamToPromise, IStreamLineWithValue } from '../../fs/line';
import * as Promise from 'bluebird';
import createLoadStream, { ICallback } from '../../fs/stream';
import createLoadStreamSync from '../../fs/sync';
import { LoaderClass } from '../_class';

export type IDictRow = string[];
export type IDict = IDictRow[];

const libLoader = new LoaderClass<IDict, IDictRow>({
	parseLine(input: string): IDictRow
	{
		let ret = input
			.replace(/^\s+|\s+$/, '')
			.split(',')
		;

		if (ret.length < 2)
		{
			throw new ReferenceError(`${input}`);
		}

		return ret.map(function (s: string)
		{
			s = s
				.replace(/^\s+|\s+$/, '')
				.trim()
			;

			if (s == '')
			{
				throw new ReferenceError(`${input}`);
			}

			return s;
		});
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

});

export const load = libLoader.load as typeof libLoader.load;
export const loadSync = libLoader.loadSync as typeof libLoader.loadSync;

export const loadStream = libLoader.loadStream as typeof libLoader.loadStream;
export const loadStreamSync = libLoader.loadStreamSync as typeof libLoader.loadStreamSync;

export const parseLine = libLoader.parseLine as typeof libLoader.parseLine;
export const stringifyLine = libLoader.stringifyLine as typeof libLoader.stringifyLine;

export const serialize = libLoader.serialize as typeof libLoader.serialize;

export const Loader = libLoader;

export default libLoader.load;
