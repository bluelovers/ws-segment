/**
 * 分词模块管理器
 *
 * @author 老雷<leizongmin@gmail.com>
 */

'use strict';

import { autobind } from 'core-decorators';
import { Segment, IWord } from '../Segment';
import { IModuleStatic, ISubSModule, SModule, SubSModule, ISubSModuleCreate } from './mod';

export type ISubTokenizer = ISubSModule & {
	type: 'tokenizer',
	split(words: IWord[], ...argv): IWord[],
}

export type ISubTokenizerCreate<T extends SubSModuleTokenizer, R extends SubSModuleTokenizer = SubSModuleTokenizer> = {
	(segment: Segment, ...argv): T & R,
};

@autobind
// @ts-ignore
export abstract class SubSModuleTokenizer extends SubSModule implements ISubTokenizer
{
	public static readonly type = 'tokenizer';
	public readonly type = 'tokenizer';

	public abstract split(words: IWord[], ...argv): IWord[]

	public init(segment: Segment, ...argv)
	{
		super.init(segment, ...argv);

		return this;
	}

	public static init<T extends SubSModuleTokenizer = SubSModuleTokenizer>(segment: Segment, ...argv): T
	{
		// @ts-ignore
		return super.init<T>(segment, ...argv);
	}

	/**
	 * 仅对未识别的词进行匹配
	 * 不包含 p 為 0
	 */
	protected _splitUnset<T extends IWord, U extends IWord = T>(words: T[], fn: (text: string, ...argv) => U[]): U[]
	{
		//const POSTAG = this.segment.POSTAG;

		fn = fn.bind(this);

		let ret = [];
		for (let i = 0, word; word = words[i]; i++)
		{
			if (typeof word.p == 'number')
			{
				ret.push(word);
			}
			else
			{
				let words_new = fn(word.w);

				if (typeof words_new == 'undefined' || words_new === null)
				{
					ret.push(word);
				}
				else
				{
					ret = ret.concat(words_new);
				}
			}
		}

		return ret;
	}

	/**
	 * 仅对未识别的词进行匹配
	 * 包含已存在 但 p 為 0
	 */
	protected _splitUnknow<T extends IWord, U extends IWord = T>(words: T[], fn: (text: string, ...argv) => U[]): U[]
	{
		//const POSTAG = this.segment.POSTAG;

		fn = fn.bind(this);

		let ret = [];
		for (let i = 0, word; word = words[i]; i++)
		{
			if (word.p)
			{
				ret.push(word);
			}
			else
			{
				//let words_new = fn.call(this, word.w);
				let words_new = fn(word.w);

				if (typeof words_new == 'undefined' || words_new === null)
				{
					ret.push(word);
				}
				else
				{
					ret = ret.concat(words_new);
				}

			}
		}

		return ret;
	}
}

/**
 * 分词模块管理器
 */
export class Tokenizer extends SModule
{
	type = 'tokenizer';

	/**
	 * 对一段文本进行分词
	 *
	 * @param {string} text 文本
	 * @param {array} modules 分词模块数组
	 * @return {array}
	 */
	split(text: string, mods: ISubTokenizer[], ...argv)
	{
		if (mods.length < 1)
		{
			throw Error('No tokenizer module!');
		}
		else
		{
			let ret: IWord[] = [{ w: text }];

			return this._doMethod('split', ret, mods, ...argv);

			/*
			// 按顺序分别调用各个module来进行分词 ： 各个module仅对没有识别类型的单词进行分词
			mods.forEach(function (mod)
			{
				// @ts-ignore
				if (typeof mod._cache == 'function')
				{
					// @ts-ignore
					mod._cache();
				}

				ret = mod.split(ret, ...argv);
			});
			return ret;
			*/
		}
	}
}

export default Tokenizer;
