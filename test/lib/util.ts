import libTable from 'cjk-conv/lib/zh/table';
import { textList } from 'cjk-conv/lib/zh/table/list';
import FastGlob from 'fast-glob';
import BluebirdPromise = require('bluebird');
import load, { parseLine, stringifyLine, serialize } from '../../lib/loader/line';
import { IDictRow, parseLine as parseLineSegment, serialize as serializeSegment } from '../../lib/loader/segment';
import { ICUR_WORD } from '../sort';
import naturalCompare = require('string-natural-compare');

export type ILoadDictFileRow2 = ILoadDictFileRow & {
	file: string,
	cjk_id: string,

	line_type: EnumLineType,
}

export const DEFAULT_IGNORE = [
	'char*',
	'**/skip',
	'**/jieba',
	'**/lazy',
	'**/synonym',
	'**/names',
];

export function globDict(cwd: string, pattern?: string[], ignore = DEFAULT_IGNORE)
{
	return BluebirdPromise
		.resolve(FastGlob<string>([

			'dict_synonym/*.txt',

		], {
			cwd,
			absolute: true,
			ignore,
			markDirectories: true,
		}))
		;
}

export interface ILoadDictFileRow
{
	data: [string, number, number, ...any[]],
	line: string,
	index: number,
}

export function loadDictFile<T = ILoadDictFileRow>(file: string,
	fn?: (list: T[], cur: T) => boolean,
): BluebirdPromise<T[]>
{
	return load(file)
		.then(function (b)
		{
			return b.reduce(function (a, line, index, arr)
			{
				let bool: boolean;

				let data = parseLineSegment(line) as [string, number, number, ...any[]];

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

		if (/ @todo /i.test(line))
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
			|| naturalCompare.caseInsensitive(b.data[1], a.data[1])
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

	if (USE_CJK_MODE > 1)
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

	return cjk_id;
}
