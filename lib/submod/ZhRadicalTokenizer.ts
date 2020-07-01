'use strict';

import { SubSModule, SubSModuleTokenizer, ISubTokenizerCreate } from '../mod';
import { Segment, IWord, IDICT, IDICT2 } from '../Segment';
import { debugToken } from '../util/debug';
import UString from 'uni-string';
import { debug } from '../util';
import { IWordDebugInfo } from '../util/index';

/**
 * 此模組目前無任何用處與效果
 *
 * @todo 部首
 */
export class ZhRadicalTokenizer extends SubSModuleTokenizer
{

	name = 'ZhRadicalTokenizer';

	protected _TABLE: IDICT<IWord>;
	protected _TABLE2: IDICT2<IWord>;

	protected _cache(...argv)
	{
		super._cache(...argv);
	}

	split(words: IWord[]): IWord[]
	{
		return this._splitUnset(words, this.splitZhRadical);
	}

	splitZhRadical(text: string, cur?: number): IWord[]
	{
		let ret: IWord[] = [];
		let self = this;

		let _r = /[\u4136\u4137]/u;

		if (!_r.test(text))
		{
			return null;
		}

		text
			.split(/([\u4136\u4137]+)/u)
			.forEach(function (w, i)
			{
				if (w !== '')
				{
					if (_r.test(w))
					{
						ret.push(self.debugToken({
							w,
						}, {
							[self.name]: true,
						}, true));
					}
					else
					{
						ret.push({
							w,
						});
					}
				}
			})
		;

		return ret.length ? ret : null;
	}

}

export const init = ZhRadicalTokenizer.init.bind(ZhRadicalTokenizer) as ISubTokenizerCreate<ZhRadicalTokenizer>;

export const type = ZhRadicalTokenizer.type;

export default ZhRadicalTokenizer;
