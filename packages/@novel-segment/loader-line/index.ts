/**
 * Line Loader Module
 * Line Loader Module
 *
 * Simple loader for text files where each line is a separate entry.
 * Used for loading simple dictionary files with one word per line.
 *
 * Created by user on 2018/4/13/013.
 */

import { LoaderClass } from '@novel-segment/dict-loader-core';

/**
 * Dictionary Row Type
 * Dictionary Row Type
 *
 * Each row is a simple string.
 */
export type IDictRow = string;

/**
 * Dictionary Type
 * Dictionary Type
 *
 * An array of string rows.
 */
export type IDict = IDictRow[];

/**
 * Line Loader Instance
 * Line Loader Instance
 *
 * Loader instance configured for simple line-by-line loading.
 */
const libLoader = new LoaderClass<IDict, IDictRow>({
	/**
	 * Parse a line
	 * Parse a line
	 *
	 * Returns the line as-is without any transformation.
	 */
	parseLine(input: string): IDictRow
	{
		return input;
	}
});

/**
 * Load dictionary asynchronously
 * Load dictionary asynchronously
 */
export const load = libLoader.load as typeof libLoader.load;

/**
 * Load dictionary synchronously
 * Load dictionary synchronously
 */
export const loadSync = libLoader.loadSync as typeof libLoader.loadSync;

/**
 * Load dictionary as stream
 * Load dictionary as stream
 */
export const loadStream = libLoader.loadStream as typeof libLoader.loadStream;

/**
 * Load dictionary as stream (synchronous)
 * Load dictionary as stream (synchronous)
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
 * Serialize data array
 * Serialize data array
 */
export const serialize = libLoader.serialize as typeof libLoader.serialize;

/**
 * Loader instance
 * Loader instance
 */
export const Loader = libLoader;

export default libLoader.load;