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

	char_table(text)
		.forEach(function (v, index, arr)
		{
			f(v, '', index, arr);
		})
	;

	function f(v: string[], str = '', index, arr, depth?)
	{
		return v.reduce(function (a, c)
		{
			let s = str + c;
			let i = index + 1;

			if (i < arr.length)
			{
				let r = f(arr[i], s, i, arr, (depth || 0) + 1);
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
