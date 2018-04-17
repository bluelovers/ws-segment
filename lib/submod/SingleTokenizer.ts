'use strict';

import { SubSModule, SubSModuleTokenizer } from '../mod';
import { IWord } from '../Segment';
import { UString } from 'uni-string';

/**
 * 单字切分模块
 * 此模組不包含模組列表內 需要手動指定
 *
 * @author 老雷<leizongmin@gmail.com>
 */
export class SingleTokenizer extends SubSModuleTokenizer
{

	/**
	 * 对未识别的单词进行分词
	 *
	 * @param {array} words 单词数组
	 * @return {array}
	 */
	split(words: IWord[]): IWord[]
	{
		const POSTAG = this.segment.POSTAG;

		let ret = [];
		for (let i = 0, word; word = words[i]; i++)
		{
			if (typeof word.p == 'undefined' || word.p)
			{
				ret.push(word);
			}
			else
			{
				// 仅对未识别的词进行匹配
				ret = ret.concat(this.splitSingle(word.w));
			}
		}
		return ret;
	}

	/**
	 * 单字切分
	 *
	 * @param {string} text 要切分的文本
	 * @param {int} cur 开始位置
	 * @return {array}
	 */
	splitSingle(text, cur?: number): IWord[]
	{
		const POSTAG = this.segment.POSTAG;

		if (isNaN(cur)) cur = 0;

		if (cur > 0)
		{
			text = text.slice(cur);
		}

		let ret: IWord[] = [];

		UString
			.split(text, '')
			.forEach(function (w, i)
			{
				ret.push({
					w,
					p: POSTAG.UNK,
				});
			})
		;

		return ret;
	}
}

export const init = SingleTokenizer.init.bind(SingleTokenizer) as typeof SingleTokenizer.init;

export default SingleTokenizer;
