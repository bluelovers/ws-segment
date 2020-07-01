import deepmerge from 'deepmerge-plus/core';
import { debugToken, IWordDebug } from '../../util/debug';
import { IDICT, IDICT_SYNONYM, IWord } from '../types';
import POSTAG from '../../POSTAG';
import { ITSOverwrite } from 'ts-type';

interface IOptions
{
	/**
	 * for debug
	 */
	showcount?: boolean,
	DICT_SYNONYM: IDICT_SYNONYM,
	DICT_TABLE: IDICT<IWord>,
	POSTAG: typeof POSTAG,
}

export interface IConvertSynonymWithShowcount
{
	count: number,
	list: IWordDebug[],
}

/**
 * 转换同义词
 */
export function convertSynonym(ret: IWordDebug[], options: ITSOverwrite<IOptions, {
	showcount: true,
}>): {
	count: number,
	list: IWordDebug[],
}
/**
 * 转换同义词
 */
export function convertSynonym(ret: IWordDebug[], options?: IOptions): IWordDebug[]
export function convertSynonym(ret: IWordDebug[], options: IOptions)
{
	const { showcount, POSTAG, DICT_SYNONYM, DICT_TABLE } = options;

	let total_count = 0;

	//const RAW = Symbol.for('RAW');

	// 转换同义词
	function _convertSynonym(list: IWordDebug[])
	{
		let count = 0;
		list = list.reduce(function (a, item: IWordDebug)
		{
			let bool: boolean;
			let w = item.w;
			let nw: string;

			let debug = debugToken(item);

			if (w in DICT_SYNONYM)
			{
				bool = true;
				nw = DICT_SYNONYM[w];
			}
			else if (debug.autoCreate && !debug.convertSynonym && !item.ow && item.m && item.m.length)
			{
				nw = item.m.reduce(function (a: string[], b)
				{
					if (typeof b === 'string')
					{
						a.push(b);
					}
					else if (b.w in DICT_SYNONYM)
					{
						a.push(DICT_SYNONYM[b.w]);
						bool = true;
					}
					else
					{
						a.push(b.w);
					}

					return a;
				}, []).join('');
			}

			if (bool)
			{
				count++;
				total_count++;
				//return { w: DICT_SYNONYM[item.w], p: item.p };

				let p = item.p;

				if (w in DICT_TABLE)
				{
					p = DICT_TABLE[w].p || p;
				}

				if (p & POSTAG.BAD)
				{
					p = p ^ POSTAG.BAD;
				}

				let item_new = debugToken({
					...item,

					w: nw,
					ow: w,
					p,
					op: item.p,

					//[RAW]: item,

					//source: item,
				}, {
					convertSynonym: true,
					//_source: item,

					/**
					 * JSON.stringify
					 * avoid TypeError: Converting circular structure to JSON
					 */
					_source: deepmerge({}, item) as IWordDebug,

				}, true);

				a.push(item_new);
			}
			else
			{
				a.push(item);
			}

			debug = undefined;

			return a;
		}, [] as IWordDebug[]);
		return { count: count, list: list } as IConvertSynonymWithShowcount;
	}

	let result: IConvertSynonymWithShowcount;
	do
	{
		result = _convertSynonym(ret);
		ret = result.list;

		result.list = undefined;
	}
	while (result.count > 0);

	result = undefined;

	if (showcount)
	{
		return { count: total_count, list: ret };
	}

	return ret;
}
