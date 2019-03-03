import libTable from 'cjk-conv/lib/zh/table';
import { textList, slugify } from 'cjk-conv/lib/zh/table/list';
import FastGlob from 'fast-glob';
import BluebirdPromise = require('bluebird');
import load, { parseLine, stringifyLine, serialize } from '../lib/loader/line';
import { IDictRow, parseLine as parseLineSegment, serialize as serializeSegment } from '../lib/loader/segment/index';
import { ICUR_WORD } from '../test/sort';
import naturalCompare = require('string-natural-compare');
import { array_unique } from 'array-hyper-unique';
import StrUtil = require('str-util');

export type ILoadDictFileRow2<D extends any = [string, number, number, ...any[]]> = ILoadDictFileRow<D> & {
	file: string,
	cjk_id: string,

	line_type: EnumLineType,
}

export const DEFAULT_IGNORE = [
	//'char*',
	'**/skip',
	'**/jieba',
	'**/lazy',
	'**/synonym',
	'**/names',
];

export function globDict(cwd: string, pattern?: string[], ignore = DEFAULT_IGNORE)
{
	return BluebirdPromise
		.resolve(FastGlob<string>(pattern, {
			cwd,
			absolute: true,
			ignore,
			markDirectories: true,
		}))
		;
}

export interface ILoadDictFileRow<D = [string, number, number, ...any[]]>
{
	data: D,
	line: string,
	index: number,
}

export function loadDictFile<T = ILoadDictFileRow>(file: string,
	fn?: (list: T[], cur: T) => boolean,
	options?: {
		parseFn?: (line: string) => any,
	},
): BluebirdPromise<T[]>
{
	options = options || {};
	const parseFn = options.parseFn = options.parseFn || parseLineSegment;

	return load(file)
		.then(function (b)
		{
			return b.reduce(function (a, line, index, arr)
			{
				let bool: boolean;

				let data = parseFn(line);

				let cur = {
					data,
					line,
					index,
				};

				if (fn)
				{
					// @ts-ignore
					bool = fn(a, cur)
				}
				else
				{
					bool = true;
				}

				if (bool)
				{
					a.push(cur);
				}

				return a;
			}, []);
		})
		;
}

export enum EnumLineType
{
	BASE = 0,
	COMMENT = 1,
	COMMENT_TAG = 2,
}

export function chkLineType(line: string): EnumLineType
{
	let ret = EnumLineType.BASE;

	if (line.indexOf('//') == 0)
	{
		ret = EnumLineType.COMMENT;

		if (/ @todo/i.test(line))
		{
			ret = EnumLineType.COMMENT_TAG;
		}
	}

	return ret;
}

export function baseSortList<T = ILoadDictFileRow2>(ls: T[], bool?: boolean)
{
	return ls.sort(function (a, b)
	{
		// @ts-ignore
		return naturalCompare.caseInsensitive(a.cjk_id, b.cjk_id)
			// @ts-ignore
			|| naturalCompare.caseInsensitive(a.data[1], b.data[1])
			// @ts-ignore
			|| naturalCompare.caseInsensitive(a.data[0], b.data[0])
			// @ts-ignore
			|| naturalCompare.caseInsensitive(a.data[2], b.data[2])
			;
	});
}

export function getCjkName(w: string, USE_CJK_MODE: number)
{
	let cjk_id = w;

	if (1)
	{
		cjk_id = slugify(w, true);
	}
	else if (USE_CJK_MODE > 1)
	{
		let cjk_list = textList(w);
		cjk_list.sort();
		cjk_id = cjk_list[0];
	}
	else if (USE_CJK_MODE)
	{
		let cjk_list = libTable.auto(w);
		cjk_list.sort();
		cjk_id = cjk_list[0];
	}

	return StrUtil.toHalfWidth(cjk_id);
}

let _zhDictCompareTable = ((a: string[][], b: string[][]) =>
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
	['上', '下', '左', '右'],
	['東', '南', '西', '北'],
	['大', '小'],
	['高', '低'],
	['長', '短'],
	['內', '外'],
	['男', '女'],
	['前', '後'],
	['只', '支', '隻'],
	['他', '她', '它', '我', '你', '吾', '汝'],
	['快', '慢'],
	['春', '夏', '秋', '冬'],
	['什', '甚'],
	['侭', '儘', '尽', '盡'],
	['的', '得'],
	['胡', '糊', '鬍'],
	['壹', '貳', '參', '肆', '伍', '陸', '柒', '捌', '玖', '拾', '什'],
	[ '儅', '噹', '当', '當' ]
], [
	['一', '二', '两', '三', '四', '五', '六', '七', '八', '九', '十', '十', '零', '几', '个', '百', '千', '万', '亿'],
	['上', '下', '左', '右'],
	['东', '南', '西', '北'],
	['大', '小'],
	['高', '低'],
	['长', '短'],
	['内', '外'],
	['男', '女'],
	['前', '后'],
	['只', '支', '隻'],
	['他', '她', '它', '我', '你', '吾', '汝'],
	['快', '慢'],
	['春', '夏', '秋', '冬'],
	['什', '甚'],
	['侭', '儘', '尽', '盡'],
	['的', '得'],
	['胡', '糊', '鬍'],
	['壹', '贰', '参', '肆', '伍', '陆', '柒', '捌', '玖', '拾', '什'],
	[ '儅', '噹', '当', '當' ]
]);

let _zhDictCompareTable_chars = array_unique(_zhDictCompareTable.flat());

export function zhDictCompare(a: string, b: string): number
{
	let _c = 0;

	let _a0 = a[0];
	let _b0 = b[0];

	let _a: number;
	let _b: number;

	let aa = /[\u3400-\u4DBF\u4E00-\u9FFF\u{20000}-\u{2FA1F}]/u.test(a[0]);
	let bb = /[\u3400-\u4DBF\u4E00-\u9FFF\u{20000}-\u{2FA1F}]/u.test(b[0]);

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

//console.log(['第', '一', 'Ｔ', '网开一面', '三街六市'].sort(zhDictCompare));
