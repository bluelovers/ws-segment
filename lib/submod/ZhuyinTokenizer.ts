'use strict';

import { SubSModule, SubSModuleTokenizer, ISubTokenizerCreate } from '../mod';
import { Segment, IWord, IDICT, IDICT2 } from '../Segment';
import { debugToken } from '../util/debug';
import UString = require('uni-string');
import { debug } from '../util';
import { IWordDebugInfo } from '../util/index';

/**
 * 注音
 */
export class ZhuyinTokenizer extends SubSModuleTokenizer
{

	name = 'ZhuyinTokenizer';

	protected _TABLE: IDICT<IWord>;
	protected _TABLE2: IDICT2<IWord>;

	protected _cache(...argv)
	{
		super._cache(...argv);
	}

	split(words: IWord[]): IWord[]
	{
		return this._splitUnset(words, this.splitZhuyin);
	}

	splitZhuyin(text: string, cur?: number): IWord[]
	{
		let ret: IWord[] = [];
		let self = this;

		let _r = /[\u31A0-\u31BA\u3105-\u312E]/u;

		if (!_r.test(text))
		{
			return null;
		}

		text
			.split(/([\u31A0-\u31BA\u3105-\u312E]+)/u)
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

export const init = ZhuyinTokenizer.init.bind(ZhuyinTokenizer) as ISubTokenizerCreate<ZhuyinTokenizer>;

export default ZhuyinTokenizer;
