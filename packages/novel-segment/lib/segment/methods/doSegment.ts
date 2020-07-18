import { IWordDebug } from '../../util/debug';
import { POSTAG } from '@novel-segment/postag/lib/postag/ids';

export function _doSegmentStripPOSTAG(ret: IWordDebug[], postag: POSTAG)
{
	return ret.filter(function (item)
	{
		return item.p !== postag;
	});
}

/**
 * 去除停止符
 */
export function _doSegmentStripStopword(ret: IWordDebug[], STOPWORD)
{
	return ret.filter(function (item)
	{
		return !(item.w in STOPWORD);
	});
}

export function _doSegmentStripSpace(ret: IWordDebug[])
{
	return ret.filter(function (item)
	{
		return !/^\s+$/g.test(item.w);
	});
}

/**
 * 仅返回单词内容
 */
export function _doSegmentSimple(ret: IWordDebug[]): string[]
{
	return ret.map(function (item)
	{
		return item.w;
	});
}

