import { SubSModule, SubSModuleOptimizer } from '../mod';
import Segment, { IWord } from '../Segment';

import { COLOR_ALL, COLOR_HAIR } from '../mod/COLORS';
import { IWordDebug } from '../util';

/**
 * 把一些错认为名词的词标注为形容词，或者对名词作定语的情况
 */
export class AdjectiveOptimizer extends SubSModuleOptimizer
{
	override name = 'AdjectiveOptimizer';

	override doOptimize(words: IWordDebug[]): IWordDebug[]
	{
		const POSTAG = this._POSTAG;
		let index = 0;
		while (index < words.length)
		{
			const word = words[index];
			const nextword = words[index + 1];
			if (nextword)
			{
				// 对于<颜色>+<的>，直接判断颜色是形容词（字典里颜色都是名词）
				if (nextword.p & POSTAG.D_U && COLOR_ALL[word.w])
				{
					word.op = word.op || word.p;
					word.p |= POSTAG.D_A;

					this.debugToken(word, {
						[this.name]: true,
					});
				}

				// 如果是连续的两个名词，前一个是颜色，那这个颜色也是形容词
				if (word.p & POSTAG.D_N && this.isNominal(nextword.p) && COLOR_ALL[word.w])
				{
					word.op = word.op || word.p;
					word.p |= POSTAG.D_A;
					word.p |= POSTAG.D_N;

					this.debugToken(word, {
						[this.name]: true,
					});
				}

				if ((word.w === '純' || word.w === '纯') && COLOR_HAIR[nextword.w])
				{
					word.op = word.op || word.p;
					word.p |= POSTAG.D_A;

					this.debugToken(word, {
						[this.name]: true,
					});
				}
			}
			// 移到下一个单词
			index += 1;
		}
		return words;
	}

	isNominal(pos: number | number[]): boolean
	{
		/*
		if (Array.isArray(pos))
		{
			return this.isNominal(pos[0]);
		}
		*/

		const POSTAG = this._POSTAG;
		return (
			pos === POSTAG.D_N ||
			pos === POSTAG.A_NT ||
			pos === POSTAG.A_NX ||
			pos === POSTAG.A_NZ ||
			pos === POSTAG.A_NR ||
			pos === POSTAG.A_NS ||
			pos === POSTAG.URL
		);
	}
}

export const init = AdjectiveOptimizer.init.bind(AdjectiveOptimizer) as typeof AdjectiveOptimizer.init;

export const type = AdjectiveOptimizer.type;

export default AdjectiveOptimizer
