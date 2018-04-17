/**
 * 分词模块管理器
 *
 * @author 老雷<leizongmin@gmail.com>
 */
'use strict';

import { Segment, IWord } from '../Segment';
import { ISubSModule, SModule, SubSModule } from './mod';

export type ISubTokenizer = ISubSModule & {
	type: 'tokenizer',
	split(words: IWord[], ...argv): IWord[],
}

export class SubSModuleTokenizer extends SubSModule implements ISubTokenizer
{
	public static readonly type = 'tokenizer';
	public readonly type = 'tokenizer';

	public split(words: IWord[], ...argv): IWord[]
	{
		throw new Error();
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
			// 按顺序分别调用各个module来进行分词 ： 各个module仅对没有识别类型的单词进行分词
			let ret = [{ w: text }];
			mods.forEach(function (mod)
			{
				ret = mod.split(ret, ...argv);
			});
			return ret;
		}
	}
}

export default Tokenizer;
