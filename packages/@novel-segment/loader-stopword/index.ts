/**
 * Stopword Loader Module
 * Stopword Loader Module
 *
 * Loader for stopword dictionary files.
 * Each line is trimmed before being added to the dictionary.
 *
 * Created by user on 2018/4/14/014.
 */

import Promise = require('bluebird');
import { wrapStreamToPromise, IStreamLineWithValue } from '@novel-segment/stream-loader-core/line';
import createLoadStream, { ICallback } from '@novel-segment/stream-loader-core/stream';
import createLoadStreamSync from '@novel-segment/stream-loader-core/sync';
import { autobind } from 'core-decorators';
import { LoaderClass } from '@novel-segment/dict-loader-core';

/**
 * Dictionary Row Type
 * Dictionary Row Type
 *
 * Each row is a stopword string.
 */
export type IDictRow = string;

/**
 * Dictionary Type
 * Dictionary Type
 *
 * An array of stopword strings.
 */
export type IDict = IDictRow[];

/**
 * Stopword Loader Instance
 * Stopword Loader Instance
 *
 * Loader instance configured for stopword loading with trimming.
 */
const libLoader = new LoaderClass<IDict, IDictRow>({
	/**
	 * Parse a line
	 * Parse a line
	 *
	 * Returns the line as-is after filtering.
	 */
	parseLine(input: string): IDictRow
	{
		return input;
	},

	/**
	 * Filter a line
	 * Filter a line
	 *
	 * Trims whitespace from the line.
	 */
	filter(input: string)
	{
		return input.trim();
	},
});

/**
 * Load stopword dictionary asynchronously
 * Load stopword dictionary asynchronously
 */
export const load = libLoader.load as typeof libLoader.load;

/**
 * Load stopword dictionary synchronously
 * Load stopword dictionary synchronously
 */
export const loadSync = libLoader.loadSync as typeof libLoader.loadSync;

/**
 * Load stopword dictionary as stream
 * Load stopword dictionary as stream
 */
export const loadStream = libLoader.loadStream as typeof libLoader.loadStream;

/**
 * Load stopword dictionary as stream (synchronous)
 * Load stopword dictionary as stream (synchronous)
 */
export const loadStreamSync = libLoader.loadStreamSync as typeof libLoader.loadStreamSync;

/**
 * Parse a single line
 * Parse a single line
 */
export const parseLine = libLoader.parseLine as typeof libLoader.parseLine;

/**
 * Stringify a data row
 * Stringify a data row
 */
export const stringifyLine = libLoader.stringifyLine as typeof libLoader.stringifyLine;

/**
 * Loader instance
 * Loader instance
 */
export const Loader = libLoader;

export default libLoader.load;