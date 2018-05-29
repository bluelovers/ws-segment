/**
 * Created by user on 2018/4/15/015.
 */

import CjkConv, { zhTable } from 'cjk-conv';
import UString from 'uni-string';

export function char_table(text: string)
{
	let a = UString.split(text, '');

	return a
		.reduce(function (a, c)
		{
			// @ts-ignore
			a.push(zhTable.auto(c, {
				// @ts-ignore
				safe: true,
			}));

			return a;
		}, [])
	;
}

export function text_list(text: string): string[]
{
	let aa = [];

	let arr = char_table(text);

	if (arr.length <= 1)
	{
		return arr;
	}

	arr
		.forEach(function (v, index, arr)
		{
			f(v, '', index, arr);
		})
	;

	function f(v: string[], str = '', index, arr, depth = 0)
	{
		return v.reduce(function (a, c)
		{
			let s = str + c;
			let i = index + 1;

			if (i < arr.length)
			{
				let r = f(arr[i], s, i, arr, depth + 1);
			}
			else if ((depth + 1) == arr.length)
			{
				//console.log(777, s, [str, c], index, depth);

				aa.push(s);
			}

			return a
		}, [])
	}

	aa.sort();

	return aa;
}

export function arr_cjk(arr: string[]): string[]
{
	return arr
	// @ts-ignore
		.concat(arr.map(CjkConv.cjk2zht))
		// @ts-ignore
		.concat(arr.map(CjkConv.cn2tw))
		// @ts-ignore
		.concat(arr.map(CjkConv.cjk2zhs))
		// @ts-ignore
		.concat(arr.map(CjkConv.cjk2jp))
		.filter(function (value, index, array)
		{
			return array.indexOf(value) == index;
		})
		;
}
