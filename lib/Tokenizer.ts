/**
 * 分词模块管理器
 *
 * @author 老雷<leizongmin@gmail.com>
 */
'use strict';

import { Segment, IWord } from './Segment';
import { ISubSModule, SModule } from './module';

export type ISubTokenizer = ISubSModule & {
	type: 'tokenizer',
	split(words: IWord[]): IWord[],
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
	split(text: string, modules: ISubTokenizer[])
	{
		if (modules.length < 1)
		{
			throw Error('No tokenizer module!');
		}
		else
		{
			// 按顺序分别调用各个module来进行分词 ： 各个module仅对没有识别类型的单词进行分词
			let ret = [{ w: text }];
			modules.forEach(function (module)
			{
				ret = module.split(ret);
			});
			return ret;
		}
	}
}

export default Tokenizer;
