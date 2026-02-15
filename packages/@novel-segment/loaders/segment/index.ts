/**
 * Segment Dictionary Loader Module
 * Segment Dictionary Loader Module
 *
 * Loader for segment dictionary files with word, part of speech, and frequency.
 * File format: word|pos|frequency
 *
 * Created by user on 2018/3/14/014.
 */

import { LoaderClass } from '@novel-segment/dict-loader-core';

/**
 * Dictionary Row Type
 * Dictionary Row Type
 *
 * Each row contains word, part of speech, frequency, and optional additional data.
 */
export type IDictRow<T = string> = {
	0: string,
	1: number,
	2: number,
	[index: number]: T | string | number,
	//length: number,
} & Array<string | number>;

/**
 * Dictionary Type
 * Dictionary Type
 *
 * An array of dictionary rows.
 */
export type IDict = IDictRow[];

/**
 * Segment Dictionary Loader Instance
 * Segment Dictionary Loader Instance
 *
 * Loader instance configured for segment dictionary format.
 * Parses lines in format: word|pos|frequency
 */
const libLoader = new LoaderClass<IDict, IDictRow>({
	/**
	 * Parse a line
	 * Parse a line
	 *
	 * Parses a line in format: word|pos|frequency
	 * Returns an array [word, pos, frequency, ...additional].
	 */
	parseLine(input: string): IDictRow
	{
		// Split by pipe character and trim each part
		// Split by pipe character and trim each part
		let [str, n, s, ...plus] = input
			.replace(/^\s+|\s+$/, '')
			.split(/\|/g)
			.map(v => v.trim())
		;

		let d1 = Number(n);
		let d2 = Number(s);

		// Handle NaN values, default to 0
		// Handle NaN values, default to 0
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

	/**
	 * Filter a line
	 * Filter a line
	 *
	 * Removes BOM, trims whitespace, and skips comment lines.
	 */
	filter(line: string)
	{
		line = line
			.replace(/\uFEFF/g, '')
			.trim()
			.replace(/^\s+|\s+$/, '')
		;

		// Skip empty lines and comment lines (starting with //)
		// Skip empty lines and comment lines (starting with //)
		if (line && line.indexOf('\/\/') != 0)
		{
			return line;
		}
	},

	/**
	 * Stringify a data row
	 * Stringify a data row
	 *
	 * Converts a data row back to string format.
	 * Part of speech is converted to hex format.
	 */
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

			// Convert part of speech to hex format
			// Convert part of speech to hex format
			// @ts-ignore
			a[1] = '0x' + a[1]
				// @ts-ignore
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

/**
 * Load segment dictionary asynchronously
 * Load segment dictionary asynchronously
 */
export const load = libLoader.load as typeof libLoader.load;

/**
 * Load segment dictionary synchronously
 * Load segment dictionary synchronously
 */
export const loadSync = libLoader.loadSync as typeof libLoader.loadSync;

/**
 * Load segment dictionary as stream
 * Load segment dictionary as stream
 */
export const loadStream = libLoader.loadStream as typeof libLoader.loadStream;

/**
 * Load segment dictionary as stream (synchronous)
 * Load segment dictionary as stream (synchronous)
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

export default libLoader.load as typeof libLoader.load;