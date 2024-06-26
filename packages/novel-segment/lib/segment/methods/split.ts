import { IWord } from '@novel-segment/types';

/**
 * 根据某个单词或词性来分割单词数组
 *
 * @param {Array} words 单词数组
 * @param {Number|String} s 用于分割的单词或词性
 * @return {Array}
 */
export function split(words: IWord[], s: string | number, ...argv): IWord[]
{
	let ret = [];
	let lasti = 0;
	let i = 0;
	let f = typeof s === 'string' ? 'w' : 'p';

	while (i < words.length)
	{
		if (words[i][f] === s)
		{
			if (lasti < i) ret.push(words.slice(lasti, i));
			ret.push(words.slice(i, i + 1));
			i++;
			lasti = i;
		}
		else
		{
			i++;
		}
	}
	if (lasti < words.length - 1)
	{
		ret.push(words.slice(lasti, words.length));
	}

	words = undefined;

	return ret;
}
