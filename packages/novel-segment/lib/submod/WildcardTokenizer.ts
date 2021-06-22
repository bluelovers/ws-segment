'use strict';

/**
 * 通配符识别模块
 *
 * @author 老雷<leizongmin@gmail.com>
 */
import { SubSModule, SubSModuleTokenizer, ISubTokenizerCreate } from '../mod';
import { Segment, IWord, IDICT, IDICT2 } from '../Segment';
import { debugToken } from '../util/debug';
import UString from 'uni-string';
import { debug } from '../util';
import { IWordDebugInfo } from '../util/index';

export class WildcardTokenizer extends SubSModuleTokenizer
{

	override name = 'WildcardTokenizer';

	protected override _TABLE: IDICT<IWord>;
	protected _TABLE2: IDICT2<IWord>;

	override _cache()
	{
		super._cache();
		this._TABLE = this.segment.getDict('WILDCARD');
		this._TABLE2 = this.segment.getDict('WILDCARD2');
	}

	/**
	 * 对未识别的单词进行分词
	 *
	 * @param {array} words 单词数组
	 * @return {array}
	 */
	split(words: IWord[]): IWord[]
	{
		//return this._splitUnknow(words, this.splitForeign);
		return this._splitUnknow(words, this.splitWildcard);
	}

	createWildcardToken(word: IWord, lasttype?: number, attr?: IWordDebugInfo)
	{
		let nw = this.createToken<IWord>(word, true, attr);

		return nw;
	}

	splitWildcard(text: string, cur?: number): IWord[]
	{
		//const POSTAG = this._POSTAG;
		const TABLE = this._TABLE;

		let ret: IWord[] = [];
		let self = this;

		// 分离出已识别的单词
		let wordinfo = self.matchWord(text);
		if (wordinfo.length)
		{
			let lastc = 0;
			for (let ui = 0, bw; bw = wordinfo[ui]; ui++)
			{
				if (bw.c > lastc)
				{
					ret.push({
						w: text.substr(lastc, bw.c - lastc),
					});
				}

				let nw = self.createWildcardToken({
					w: bw.w,
					p: TABLE[bw.w.toLowerCase()].p,
				});

				ret.push(nw);

				lastc = bw.c + bw.w.length;
			}

			let lastword = wordinfo[wordinfo.length - 1];
			if (lastword.c + lastword.w.length < text.length)
			{
				ret.push({
					w: text.substr(lastword.c + lastword.w.length),
				});
			}
		}

		return ret.length ? ret : undefined;
	}

	/**
	 * 匹配单词，返回相关信息
	 *
	 * @param {string} text 文本
	 * @param {int} cur 开始位置
	 * @return {array}  返回格式   {w: '单词', c: 开始位置}
	 */
	matchWord(text: string, cur?: number)
	{
		//const POSTAG = this._POSTAG;
		const TABLE = this._TABLE2;

		if (isNaN(cur)) cur = 0;

		let ret: IWord[] = [];
		//let self = this;

		let s = false;

		// 匹配可能出现的单词，取长度最大的那个
		let lowertext = text.toLowerCase();

		while (cur < text.length)
		{
			let stopword: IWord = null;
			for (let i in TABLE)
			{
				if (lowertext.substr(cur, i as any) in TABLE[i])
				{
					stopword = {
						w: text.substr(cur, i as any),
						c: cur,
					};
				}
			}
			if (stopword !== null)
			{
				ret.push(stopword);
				cur += stopword.w.length;
			}
			else
			{
				cur++;
			}
		}
		return ret;
	}

}

export const init = WildcardTokenizer.init.bind(WildcardTokenizer) as ISubTokenizerCreate<WildcardTokenizer>;

export const type = WildcardTokenizer.type;

export default WildcardTokenizer;
