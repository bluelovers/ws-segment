import BluebirdPromise from 'bluebird';
import { parseLine as parseLineSegment } from '@novel-segment/loaders/segment/index';
import { IDict, load } from '@novel-segment/loader-line';
import { array_unique } from 'array-hyper-unique';

export const USE_CJK_MODE = 2 as const;

export const enum EnumLineType
{
	BASE = 0,
	COMMENT = 1,
	COMMENT_TAG = 2,
}

export type ILoadDictFileRow2<D extends any = [string, number, number, ...any[]]> = ILoadDictFileRow<D> & {
	file: string,
	cjk_id: string,

	line_type: EnumLineType,
}

export interface ILoadDictFileRow<D = [string, number, number, ...any[]]>
{
	data: D,
	line: string,
	index: number,
}

export type IUnpackRowData<T extends ILoadDictFileRow<any>> = T extends {
	data: infer D
} ? D : never;

export type IParseFn<D = any> = (line: string) => D;

export interface IOptionsHandleDictLines<D = any>
{
	parseFn: IParseFn<D>;
}

export interface IOptionsHandleDictLinesPartial<D = any> extends Partial<IOptionsHandleDictLines<D>>
{

}

export type IFnHandleDictLines<T = ILoadDictFileRow> = (list: T[], cur: T) => boolean;

export function stringifyHandleDictLinesList<T extends ILoadDictFileRow<any> = ILoadDictFileRow>(list: T[], options?: {
	disableUnique?: boolean
})
{
	let lines = list.map(v => v.line);

	if (options?.disableUnique)
	{
		return lines
	}

	return array_unique(lines)
}

export function handleDictLines<T extends ILoadDictFileRow<any> = ILoadDictFileRow>(lines: IDict,
	fn: IFnHandleDictLines<T>,
	options: IOptionsHandleDictLines<IUnpackRowData<T>>,
): T[]
{
	if (!lines)
	{
		return [] as T[]
	}

	const { parseFn } = options;

	return lines.reduce(function (a, line, index)
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
			a.push(cur as any);
		}

		return a;
	}, [] as T[]);
}

export function loadDictFile<T extends ILoadDictFileRow<any> = ILoadDictFileRow>(file: string,
	fn?: IFnHandleDictLines<T>,
	options?: IOptionsHandleDictLinesPartial<IUnpackRowData<T>>,
): BluebirdPromise<T[]>
{
	options = options || {};
	// @ts-ignore
	const parseFn: IParseFn<IUnpackRowData<T>> = options.parseFn = options.parseFn || parseLineSegment;

	return load(file)
		.then(function (b)
		{
			return handleDictLines(b, fn, {
				parseFn,
			})
		})
		;
}

export function chkLineType(line: string): EnumLineType
{
	let ret = EnumLineType.BASE;

	if (line.indexOf('//') == 0)
	{
		ret = EnumLineType.COMMENT;

		if (/^\/\/ +(?:\@todo|格式\:)/i.test(line))
		{
			ret = EnumLineType.COMMENT_TAG;
		}
	}

	return ret;
}
