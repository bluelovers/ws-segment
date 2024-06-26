import { compareCaseInsensitive } from '@bluelovers/string-natural-compare';
import { array_unique } from 'array-hyper-unique';
import UString from 'uni-string';
import { _re_cjk_conv } from 'regexp-helper/lib/cjk-conv';

export const enum EnumSortCompareOrder
{
	KEEP = 0,
	DOWN = 1,
	UP = -1,
}

/**
 * @private
 */
export let _zhDictCompareTable = ((a: string[][], b: string[][]) =>
{
	return array_unique(a.map((value, index, array) =>
	{
		return array_unique(value.reduce(function (c, d, currentIndex)
		{
			c.push(d);
			c.push(b[index][currentIndex]);

			return c;
		}, [] as string[]))
	}));
})([
	['一', '二', '两', '三', '四', '五', '六', '七', '八', '九', '十', '十', '零', '幾', '個', '百', '千', '萬', '億'],
	['初', '上', '中', '下', '左', '右'],
	['東', '南', '西', '北'],
	['大', '小'],
	['高', '低'],
	['長', '短', '粗', '細'],
	['內', '外'],
	['男', '女'],
	['前', '後'],
	['他', '她', '它', '我', '你', '吾', '汝'],
	['快', '慢'],
	['春', '夏', '秋', '冬'],
	['壹', '貳', '參', '肆', '伍', '陸', '柒', '捌', '玖', '拾', '什'],
	['劣', '優'],
], [
	['一', '二', '两', '三', '四', '五', '六', '七', '八', '九', '十', '十', '零', '几', '个', '百', '千', '万', '亿'],
	['初', '上', '中', '下', '左', '右'],
	['东', '南', '西', '北'],
	['大', '小'],
	['高', '低'],
	['长', '短', '粗', '细'],
	['内', '外'],
	['男', '女'],
	['前', '后'],
	['他', '她', '它', '我', '你', '吾', '汝'],
	['快', '慢'],
	['春', '夏', '秋', '冬'],
	['壹', '贰', '参', '肆', '伍', '陆', '柒', '捌', '玖', '拾', '什'],
	['劣', '优'],
]);

export let _zhDictCompareTable_chars = array_unique(_zhDictCompareTable.flat());

//export const RE_ZH = /[\u3400-\u4DBF\u4E00-\u9FFF\u{20000}-\u{2FA1F}]/u;
export const RE_ZH = _re_cjk_conv('u', 'のと㊥㊦㊤');

export interface IFnCompare
{
	(a: string, b: string): number
}

/**
 * 包裝排序比較函數
 */
export function zhDictCompareNew(failback?: IFnCompare): IFnCompare
export function zhDictCompareNew(options?: {
	failback?: IFnCompare
	fallback?: IFnCompare
}): IFnCompare
export function zhDictCompareNew(options?: IFnCompare | {
	failback?: IFnCompare
	fallback?: IFnCompare
}): IFnCompare
{
	if (typeof options === 'function')
	{
		options = { fallback: options };
	}

	options ??= {} as {
		failback?: IFnCompare
		fallback?: IFnCompare
	};

	const fallback = options.fallback ??
	options.failback ?? compareCaseInsensitive;

	return function zhDictCompare(a: string, b: string): number
	{
		const ra = UString.toArray(a);
		const rb = UString.toArray(b);

		const len01 = ra.length;
		const len02 = rb.length;

		/**
		 * 優先排序單一字元
		 */
		if ((len01 !== len02) && (len01 === 1 || len02 === 1))
		{
			return len01 - len02
		}

		let _c = 0;

		let _a0 = ra[0];
		let _b0 = rb[0];

		let aa = RE_ZH.test(_a0);
		let bb = RE_ZH.test(_b0);

		if (aa && bb)
		{
			if (len01 !== len02 && (len01 === 1 || len02 === 1))
			{
				return len01 - len02
			}

			aa = _zhDictCompareTable[0].indexOf(_a0) !== -1;
			bb = _zhDictCompareTable[0].indexOf(_b0) !== -1;

			if (aa && !bb)
			{
				return EnumSortCompareOrder.UP
			}
			else if (!aa && bb)
			{
				return EnumSortCompareOrder.DOWN
			}
		}
		else
		{
			if (!aa && bb)
			{
				return EnumSortCompareOrder.UP
			}
			else if (aa && !bb)
			{
				return EnumSortCompareOrder.DOWN
			}
		}

		if (typeof _a0 !== 'undefined')
		{
			for (let i = 0; i < len01; i++)
			{
				if (typeof ra[i] === 'undefined' || typeof rb[i] === 'undefined')
				{
					break;
				}
				else if (ra[i] !== rb[i])
				{
					_a0 = ra[i];
					_b0 = rb[i];

					break;
				}
			}

			if (_zhDictCompareTable_chars.includes(_a0) && _zhDictCompareTable_chars.includes(_b0))
			{
				let _a: number;
				let _b: number;

				for (let _arr of _zhDictCompareTable)
				{
					_a = _arr.indexOf(_a0);
					_b = _arr.indexOf(_b0);

					if (_a !== -1 && _b !== -1)
					{
						_c = (_a - _b);

						break;
					}
				}
			}
		}

		return _c || fallback(a, b);
	}
}

/**
 * 排序字典專用的比較函數
 */
export const zhDictCompare = zhDictCompareNew();

/*
export function zhDictCompare(a: string, b: string): number
{
	let _c = 0;

	let _a0 = a[0];
	let _b0 = b[0];

	let _a: number;
	let _b: number;

	let aa = RE_ZH.test(a[0]);
	let bb = RE_ZH.test(b[0]);

	if (aa && bb)
	{
		if (a.length != b.length && (a.length == 1 || b.length == 1))
		{
			return a.length - b.length
		}

		_a = _zhDictCompareTable[0].indexOf(a[0]);
		_b = _zhDictCompareTable[0].indexOf(b[0]);

		aa = _a != -1;
		bb = _b != -1;

		if (aa && !bb)
		{
			return -1
		}
		else if (!aa && bb)
		{
			return 1
		}
	}
	else
	{
		if (aa && !bb)
		{
			return 0
		}
		else if (!aa && bb)
		{
			return -1
		}
	}

	if (_a0 != null)
	{
		let len = a.length;

		for (let i = 0; i < len; i++)
		{
			if (!a[i] || !b[i] || a[i] == null || b[i] == null)
			{
				break;
			}
			else if (a[i] !== b[i])
			{
				_a0 = a[i];
				_b0 = b[i];

				break;
			}
		}
	}

	if (_zhDictCompareTable_chars.includes(_a0) && _zhDictCompareTable_chars.includes(_b0))
	{
		for (let _arr of _zhDictCompareTable)
		{
			_a = _arr.indexOf(_a0);
			_b = _arr.indexOf(_b0);

			if (_a > -1 && _b > -1)
			{
				_c = (_a - _b) || 0;

				break;
			}
		}
	}

	return _c || naturalCompare.caseInsensitive(a, b);
}
*/

export default exports as typeof import('./sort');
