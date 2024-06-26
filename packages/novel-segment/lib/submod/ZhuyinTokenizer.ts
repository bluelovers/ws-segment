'use strict';

import { ISubTokenizerCreate, SubSModuleTokenizer } from '../mod';
import { IDICT, IDICT2, IWord } from '../Segment';

/**
 * 注音
 */
export class ZhuyinTokenizer extends SubSModuleTokenizer
{

	override name = 'ZhuyinTokenizer';

	protected override _TABLE: IDICT<IWord>;
	protected _TABLE2: IDICT2<IWord>;

	protected override _cache(...argv)
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

export const type = ZhuyinTokenizer.type;

export default ZhuyinTokenizer;
