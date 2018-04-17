/**
 * Created by user on 2018/4/17/017.
 */

import { $enum, EnumWrapper, } from "ts-enum-util";
import { POSTAG } from '../POSTAG';
import { IWord } from '../Segment';
import * as util from 'util';
export * from './core';

export type IWordDebug = IWord & {

	m?: Array<IWordDebug | string>,

	ps?: string,
	ps_en?: string,

	ow?: string,
	op?: number,

	pp?: string,

	index?: number,
}

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

export function debug_token<T extends IWordDebug>(ks: Array<T>, returnSource?: boolean): Array<T | IWordDebug>
{
	let ks2: Array<T | IWordDebug> = [];

	ks.map(function (v, index)
	{
		v.index = index;

		if (v.p)
		{
			token_add_info(v);
		}
		else if (v.m)
		{
			v.m.map(token_add_info);
		}
		else
		{
			ks2.push(v);
		}
	});

	return returnSource ? ks : ks2;
}

export function token_add_info<T extends IWordDebug>(v: T)
{
	if (v.p)
	{
		v.ps = POSTAG.zhName(v.p);
		v.ps_en = POSTAG.enName(v.p);

		v.pp = '0x' + toHex(v.p);

		if (v.m)
		{
			v.m.map(token_add_info);
		}
	}

	return v;
}

export function toHex(p: number)
{
	return '0x' + p
		.toString(16)
		.padStart(4, '0')
		.toUpperCase()
		;
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

//let p = hexAnd(0x6000 | 0x8000, 0x2000, 0x4000)
//debug(p, toHex(p));

import * as self from './index';
export default self;
