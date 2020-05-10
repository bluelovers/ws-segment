/**
 * Created by user on 2018/4/13/013.
 */

import Promise = require('bluebird');
import { wrapStreamToPromise, IStreamLineWithValue } from '@novel-segment/stream-loader-core/line';
import createLoadStream, { ICallback } from '@novel-segment/stream-loader-core/stream';
import createLoadStreamSync from '@novel-segment/stream-loader-core/sync';
import { autobind } from 'core-decorators';
import { LoaderClass } from '../_class';

export type IDictRow = [string, string[], string] | [string, string[]];
export type IDict = IDictRow[];

const libLoader = new LoaderClass<IDict, IDictRow>({
	parseLine(input: string): IDictRow
	{
		let data = input
			.replace(/^\s+|\s+$/, '')
			.split(/\t/) as any as IDictRow
		;

		if (data.length > 1)
		{
			// @ts-ignore
			data[1] = (data[1] || '').trim().split(/\s+/);
		}

		if (data.length > 2)
		{
			data[2] = (data[2] || '').toString().trim();
		}

		return data;
	},
	filter(input: string)
	{
		return input.trim().replace(/^\s+|\s+$/, '');
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
