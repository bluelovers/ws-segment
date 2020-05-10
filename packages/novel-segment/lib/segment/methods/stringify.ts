import { IWord } from '../types';

/**
 * 将单词数组连接成字符串
 *
 * @param {Array} words 单词数组
 * @return {String}
 */
export function stringify(words: Array<IWord | string>, ...argv): string
{
	return words.map(function (item)
	{
		if (typeof item === 'string')
		{
			return item;
		}
		else if ('w' in item)
		{
			return item.w;
		}
		else
		{
			throw new TypeError(`not a valid segment result list`)
		}
	}).join('');
}
