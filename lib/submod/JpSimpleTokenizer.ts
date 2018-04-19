/**
 * Created by user on 2018/4/19/019.
 */

import { SubSModule, SubSModuleTokenizer } from '../mod';
import { Segment, IWord } from '../Segment';
import { UString } from 'uni-string';

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

		if (!/[ぁ-ん]/.test(text) || !/[ァ-ヴーｱ-ﾝﾞｰ]/.test(text))
		{
			return null;
		}

		let self = this;

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

