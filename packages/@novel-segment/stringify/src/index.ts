import { IWord } from '@novel-segment/types';
import { ITSArrayListMaybeReadonly } from 'ts-type/lib/type/base';

export type IStringifyWordInput = ITSArrayListMaybeReadonly<IWord | string>;

export function stringifyList(words: IStringifyWordInput, ...argv: any[]): string[]
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
	});
}

/**
 * 将单词数组连接成字符串
 *
 * @param {Array} words 单词数组
 * @return {String}
 */
export function stringify(words: IStringifyWordInput, ...argv: any[]): string
{
	return stringifyList(words, ...argv).join('');
}

export default stringify
