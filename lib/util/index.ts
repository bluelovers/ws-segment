/**
 * Created by user on 2018/4/17/017.
 */

export function debug(...argv)
{
	return console.log(...argv);
}

export function enumIsNaN(v)
{
	return isNaN(Number(v));
}

export function enumList(varEnum, byValue?: boolean)
{
	let keys = Object.keys(varEnum);

	if (byValue)
	{
		return keys.filter(key => isNaN(Number(varEnum[key])));
	}
	else
	{
		return keys.filter(key => !isNaN(Number(varEnum[key])));
	}
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
//console.log(p, toHex(p));

import * as self from './index';
export default self;
