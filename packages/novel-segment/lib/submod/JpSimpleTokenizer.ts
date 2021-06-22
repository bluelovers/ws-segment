/**
 * Created by user on 2018/4/19/019.
 */

import { SubSModule, SubSModuleTokenizer } from '../mod';
import { Segment, IWord } from '../Segment';
import UString from 'uni-string';
import { IWordDebug, IWordDebugInfo } from '../util';

export const enum EnumJpSimpleTokenizerType
{
	/**
	 * 平仮名
	 * https://en.wikipedia.org/wiki/Hiragana
	 */
	HIRAGANA = 0x1,
	/**
	 * 片仮名
	 * https://en.wikipedia.org/wiki/Katakana
	 */
	KATAKANA = 0x2,
}

export class JpSimpleTokenizer extends SubSModuleTokenizer
{
	static override NAME = 'JpSimpleTokenizer' as const;

	override name = 'JpSimpleTokenizer' as const;

	split(words: IWord[], ...argv): IWord[]
	{
		return this._splitUnset(words, this._splitText);
	}

	protected createJpSimpleToken<T extends IWordDebug>(data: T, type: EnumJpSimpleTokenizerType)
	{
		return super.debugToken(data, {
			[this.name]: type,
		}, true);
	}

	protected _splitText(text: string): IWord[]
	{
		//const POSTAG = this.segment.POSTAG;

		let self = this;

		let b1 = /[ぁ-ん]/.test(text);
		let b2 = /[ァ-ヴーｱ-ﾝﾞｰ]/.test(text);

		if (b1 === false || b2 === false)
		{
			if (b1 === true && /^[ぁ-ん]+$/.test(text) || b2 === true && /^[ァ-ヴーｱ-ﾝﾞｰ]+$/.test(text))
			{
				return [self.createJpSimpleToken({
					w: text,
				}, b1 ? EnumJpSimpleTokenizerType.HIRAGANA : EnumJpSimpleTokenizerType.KATAKANA
				)];
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
					ret.push(self.createJpSimpleToken({
						w,
					}, /[ぁ-ん]/.test(w) ? EnumJpSimpleTokenizerType.HIRAGANA
							: EnumJpSimpleTokenizerType.KATAKANA
					));
				}
			})

		;

		return ret;
	}

}

export const init = JpSimpleTokenizer.init.bind(JpSimpleTokenizer) as typeof JpSimpleTokenizer.init;

export const type = JpSimpleTokenizer.type;

export default JpSimpleTokenizer;

