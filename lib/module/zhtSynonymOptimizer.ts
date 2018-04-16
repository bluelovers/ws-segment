/**
 * Created by user on 2018/4/16/016.
 */
import { SubSModule } from '../module';
import Segment, { IWord } from '../Segment';

export class ZhtSynonymOptimizer extends SubSModule
{
	static readonly type = 'optimizer';
	readonly type = 'optimizer';
	segment: Segment;

	init(_segment: Segment)
	{
		this.segment = _segment;

		return this;
	}

	doOptimize(words: IWord[]): IWord[]
	{
		const self = this;
		const POSTAG = self.segment.POSTAG;

		let i = 0;

		while (i < words.length)
		{
			let w0: IWord = words[i - 1] || null;
			let w1 = words[i];
			let w2: IWord = words[i + 1] || null;

			if (w1.w == '裏' || w1.w == '里')
			{
				if (w0 && (w0.p & POSTAG.D_N || w0.p & POSTAG.D_S))
				{
					// @ts-ignore
					w1.ow = w1.w;
					w1.w = '裡';
				}
			}
			else if (w1.p & POSTAG.D_F)
			{
				let nw = w1.w
					.replace(/(.)[裏里]|[裏里](.)/, '$1裡$2')
					.replace(/.[后]|[后]./, '後')
				;

				if (nw != w1.w)
				{
					// @ts-ignore
					w1.ow = w1.w;
					w1.w = nw;
				}
			}
			else if (w1.p & POSTAG.D_S)
			{
				let nw = w1.w
					.replace(/(.)[裏里]$/, '$1裡')
				;

				if (nw != w1.w)
				{
					// @ts-ignore
					w1.ow = w1.w;
					w1.w = nw;
				}
			}

			i++;
		}

		return words;
	}
}

export function init(segment: Segment)
{
	let mod = new ZhtSynonymOptimizer();

	mod.init(segment);

	return mod;
}
