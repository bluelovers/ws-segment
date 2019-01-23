/**
 * Created by user on 2018/4/17/017.
 */

import { $enum, EnumWrapper, } from "ts-enum-util";
import { POSTAG } from '../POSTAG';
import { IWord } from '../Segment';
import * as util from 'util';
export * from './core';

import { IWordDebug, IWordDebugInfo, debug_token, toHex, token_add_info } from './debug';
export { IWordDebug, IWordDebugInfo, debug_token, toHex, token_add_info }

export function debug_inspect(argv: any[], options: util.InspectOptions = {})
{
	options = Object.assign({
		colors: true,
	}, options);

	return argv.map(function (b)
	{
		return util.inspect(b, options);
	}, []);
}

export function debug(...argv)
{
	return console.log(...debug_inspect(argv));
}

export function debug_options(argv: any[], options?: util.InspectOptions)
{
	return console.log(...debug_inspect(argv, options));
}

export function hexAndAny(n: number, p?: number, ...argv: number[]): number
export function hexAndAny(n: number, ...argv: number[])
{
	if (!argv.length)
	{
		return n;
	}

	for (let v of argv)
	{
		let r = (n & v);

		if (r)
		{
			return r;
		}
	}

	return 0;
}

export function hexAnd(n: number, p?: number, ...argv: number[]): number
export function hexAnd(n: number, ...argv: number[])
{
	if (argv.length)
	{
		let r = 0;

		for (let v of argv)
		{
			let p = n & v;

			if (!p)
			{
				return 0;
			}

			r |= v;
		}

		return r;
	}

	return n;
}

export function hexOr(n: number, p?: number, ...argv: number[]): number
export function hexOr(n: number, ...argv: number[])
{
	for (let v of argv)
	{
		n |= v;
	}

	return n;
}

export declare function cloneDeep<T extends object | Array<any>>(data: T): T

// @ts-ignore
exports.cloneDeep = require('lodash.clonedeep');

//let p = hexAnd(0x6000 | 0x8000, 0x2000, 0x4000)
//debug(p, toHex(p));

export default exports as typeof import('./index');
