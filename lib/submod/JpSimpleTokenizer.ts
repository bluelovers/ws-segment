/**
 * Created by user on 2018/4/19/019.
 */

import { SubSModule, SubSModuleTokenizer } from '../mod';
import { Segment, IWord } from '../Segment';
import UString = require('uni-string');

export class JpSimpleTokenizer extends SubSModuleTokenizer
{

	name = 'JpSimpleTokenizer';

	split(words: IWord[], ...argv): IWord[]
	{
		return this._splitUnset(words, this._splitText);
	}

	protected _splitText(text: string): IWord[]
	{
		//const POSTAG = this.segment.POSTAG;

		let self = this;

		let b1 = /[ぁ-ん]/.test(text);
		let b2 = /[ァ-ヴーｱ-ﾝﾞｰ]/.test(text);

		if (!b1 || !b2)
		{
			if (b1 && /^[ぁ-ん]+$/.test(text) || b2 && /^[ァ-ヴーｱ-ﾝﾞｰ]+$/.test(text))
			{
				return [self.debugToken({
					w: text,
				}, {
					[self.name]: b1 ? 0x1 : 0x2,
				}, true)];
			}

			return null;
		}

		let ret: IWord[] = [];

		text
			.split(/((?:[^ァ-ヴーｱ-ﾝﾞｰ]+)?[ぁ-ん]+(?=[ァ-ヴーｱ-ﾝﾞｰ])|(?:[^ぁ-ん]+)?[ァ-ヴーｱ-ﾝﾞｰ]+(?=[ぁ-ん]))/)
			.forEach(function (w, i)
			{
				if (w !== '')
				{
					ret.push(self.debugToken({
						w,
					}, {
						[self.name]: /[ぁ-ん]/.test(w) ? 0x1 : 0x2,
					}, true));
				}
			})
		;

		return ret;
	}

}

export const init = JpSimpleTokenizer.init.bind(JpSimpleTokenizer) as typeof JpSimpleTokenizer.init;

export default JpSimpleTokenizer;

