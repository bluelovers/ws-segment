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
			a.push(zhTable.auto(c));

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
			f(v, '', 0, arr);
		})
	;

	function f(v: string[], str = '', index, arr)
	{
		return v.reduce(function (a, c)
		{
			let s = str + c;
			let i = index + 1;

			if (i < arr.length)
			{
				let r = f(arr[i], s, i, arr);
			}
			else if ((i) == arr.length)
			{
				aa.push(s)
			}

			return a
		}, [])
	}

	return aa;
}
