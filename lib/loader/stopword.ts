/**
 * Created by user on 2018/4/14/014.
 */

import * as Promise from 'bluebird';
import { wrapStreamToPromise, IStreamLineWithValue } from '../fs/line';
import createLoadStream, { ICallback } from '../fs/stream';
import createLoadStreamSync from '../fs/sync';
import { autobind } from 'core-decorators';
import { LoaderClass } from './_class';

export type IDictRow = string;
export type IDict = IDictRow[];

const libLoader = new LoaderClass<IDict, IDictRow>({
	parseLine(input: string): IDictRow
	{
		return input;
	},
	filter(input: string)
	{
		return input.trim();
	},
});

export const load = libLoader.load as typeof libLoader.load;
export const loadSync = libLoader.loadSync as typeof libLoader.loadSync;

export const loadStream = libLoader.loadStream as typeof libLoader.loadStream;
export const loadStreamSync = libLoader.loadStreamSync as typeof libLoader.loadStreamSync;

export const parseLine = libLoader.parseLine as typeof libLoader.parseLine;

export const Loader = libLoader;

export default libLoader.load;
