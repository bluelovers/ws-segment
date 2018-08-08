/**
 * Created by user on 2018/4/19/019.
 */

import { POSTAG } from '../POSTAG';
import { IWord } from '../Segment';
import sortObjectKeys from 'sort-object-keys2';

//export const SYMBOL_DEBUG_KEY = Symbol.for('_debug');
export const SYMBOL_DEBUG_KEY = '_debug';

export type IWordDebugInfo<T extends IWordDebug = IWordDebug> = {
	ZhtSynonymOptimizer?: boolean,
	convertSynonym?: boolean,
	autoCreate?: boolean,

	_source?: T & IWordDebug,

	index?: number,
	ps_en?: string,

	[key: string]: any,
	[key: number]: any,
}

export type IWordDebug = IWord & {

	m?: Array<IWordDebug | string>,

	ps?: string,
	pp?: string,

	ow?: string,
	op?: number,
	ops?: string,
	opp?: string,

	os?: boolean,

	[SYMBOL_DEBUG_KEY]?: IWordDebugInfo<IWordDebug>,
}

// @ts-ignore
export function clearTokemDebug(data: IWordDebugInfo, returnClone?: false): data is IWord
export function clearTokemDebug(data: IWordDebugInfo, returnClone?: true): IWord
export function clearTokemDebug(data: IWordDebugInfo, returnClone?: boolean): IWord
{
	if (returnClone)
	{
		return {
			w: data.w,
			p: data.p,
			f: data.f,
		};
	}

	for (let k in data)
	{
		if (k != 'w' && k != 'p' && k != 'f')
		{
			delete data[k];
		}
	}

	delete data[SYMBOL_DEBUG_KEY];

	return data as IWord;
}

export function debugToken<T extends IWordDebug, U extends IWordDebugInfo>(data: T,
	attr: U & IWordDebugInfo,
	returnToken: true, ...argv
): T
export function debugToken<T extends IWordDebug, U extends IWordDebugInfo>(data: T,
	attr?: U & IWordDebugInfo,
	returnToken?: boolean, ...argv
): U & IWordDebugInfo
export function debugToken<T extends IWordDebug, U extends IWordDebugInfo>(data: T,
	attr?: U & IWordDebugInfo,
	returnToken?: boolean, ...argv
)
{
	if (attr)
	{
		data[SYMBOL_DEBUG_KEY] = Object.assign(data[SYMBOL_DEBUG_KEY] || {}, attr);
	}

	if (returnToken)
	{
		return data;
	}

	return (data[SYMBOL_DEBUG_KEY] || {}) as IWordDebugInfo;
}

export function debug_token<T extends IWordDebug>(ks: Array<T>, returnSource?: boolean): Array<T | IWordDebug>
{
	let ks2: Array<T | IWordDebug> = [];

	ks.map(function (v, index)
	{
		//v.index = index;

		debugToken(v, {
			index,
		});

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
		//v.ps_en = POSTAG.enName(v.p);

		let debug = debugToken(v, {
			ps_en: POSTAG.enName(v.p),
		});

		v.pp = toHex(v.p);

		if (v.op)
		{
			v.ops = POSTAG.zhName(v.op);
			v.opp = toHex(v.op);
		}

		if (v.m)
		{
			v.m.map(token_add_info);
		}

		if (debug._source)
		{
			token_add_info(debug._source);
		}
	}

	if (v)
	{
		sortObjectKeys(v, {
			keys: [
				'w',
				'p',
				'f',

				'ps',
				'pp',

				'ow',
				'op',
				'ops',
				'opp',

				'os',
			],

			useSource: true,
		});
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

import * as self from './debug';

export default self;

