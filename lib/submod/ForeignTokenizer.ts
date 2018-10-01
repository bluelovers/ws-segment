'use strict';

/**
 * 外文字符、数字识别模块
 *
 * @author 老雷<leizongmin@gmail.com>
 */
import { SubSModule, SubSModuleTokenizer, ISubTokenizerCreate } from '../mod';
import { Segment, IWord } from '../Segment';
import { debugToken } from '../util/debug';
import UString = require('uni-string');
import { debug } from '../util';
import { IWordDebugInfo } from '../util/index';

export class ForeignTokenizer extends SubSModuleTokenizer
{

	name = 'ForeignTokenizer';

	/**
	 * 分詞用(包含中文)
	 */
	_REGEXP_SPLIT_1: RegExp;
	/**
	 * 分詞用(不包含中文的全詞符合)
	 */
	_REGEXP_SPLIT_2: RegExp;

	_cache()
	{
		super._cache();
		this._TABLE = this.segment.getDict('TABLE');

		let arr = [
			/[\w０-９Ａ-Ｚａ-ｚ\u0100-\u017F\u00A1-\u00FF]+/,
			/[\u0600-\u06FF\u0750-\u077F]+/,
			/[\u0400-\u04FF]+/,
		];

		this._REGEXP_SPLIT_1 = new RegExp('(' +_join([
			/[\u4E00-\u9FFF]+/,
		].concat(arr)) + ')', 'iu');

		this._REGEXP_SPLIT_2 = new RegExp('(' +_join(arr) + ')', 'iu');

		function _join(arr: Array<string | RegExp>)
		{
			return arr.reduce(function (a, b)
			{
				if (b instanceof RegExp)
				{
					a.push(b.source);
				}
				else
				{
					a.push(b);
				}

				return a;
			}, []).join('|')
		}
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
		return this._splitUnknow(words, this.splitForeign2);

		/*
		const POSTAG = this.segment.POSTAG;

		let ret = [];
		for (let i = 0, word; word = words[i]; i++)
		{
			if (word.p)
			{
				ret.push(word);
			}
			else
			{
				// 仅对未识别的词进行匹配
				ret = ret.concat(this.splitForeign(word.w));
			}
		}
		return ret;
		*/
	}

	/**
	 * 支援更多外文判定(但可能會降低效率)
	 *
	 * 並且避免誤切割 例如 latīna Русский
	 */
	splitForeign2(text: string, cur?: number): IWord[]
	{
		const POSTAG = this.segment.POSTAG;
		const TABLE = this._TABLE;

		//console.time('splitForeign2');

		let ret: IWord[] = [];
		let self = this;

		let ls = text
			.split(this._REGEXP_SPLIT_1)
		;

		for (let w of ls)
		{
			if (w !== '')
			{
				if (this._REGEXP_SPLIT_2.test(w))
				{
					let cw = TABLE[w];

					if (cw)
					{
						let nw = this.createRawToken({
							w,
						}, cw, {
							[this.name]: 1,
						});

						ret.push(nw);
						continue;
					}

					/**
					 * 當分詞不存在於字典中時
					 * 則再度分詞一次
					 */
					let ls2 = w
						.split(/([\d+０-９]+)/)
					;

					for (let w of ls2)
					{
						if (w === '')
						{
							continue;
						}

						let lasttype = 0;

						let c = w.charCodeAt(0);
						if (c >= 65296 && c <= 65370) c -= 65248;

						if (c >= 48 && c <= 57)
						{
							lasttype = POSTAG.A_M;
						}// 字母 lasttype = POSTAG.A_NX
						else if ((c >= 65 && c <= 90) || (c >= 97 && c <= 122))
						{
							lasttype = POSTAG.A_NX;
						}
						else
						{
							lasttype = POSTAG.UNK;
						}

						if (lasttype === POSTAG.A_NX)
						{
							let cw = TABLE[w];

							if (cw)
							{
								let nw = this.createRawToken({
									w,
								}, cw, {
									[this.name]: 2,
								});

								ret.push(nw);
								continue;
							}
						}

						ret.push(self.debugToken({
							w: w,
							p: lasttype || undefined,
						}, {
							[self.name]: 3,
						}, true));
					}
				}
				else
				{
					ret.push({
						w,
					});
				}
			}
		}

		//console.timeEnd('splitForeign2');

		//console.log(ret);

		return ret.length ? ret : undefined;
	}

	/**
	 * 匹配包含的英文字符和数字，并分割
	 *
	 * @param {string} text 文本
	 * @param {int} cur 开始位置
	 * @return {array}  返回格式   {w: '单词', c: 开始位置}
	 */
	splitForeign(text: string, cur?: number): IWord[]
	{
		const POSTAG = this.segment.POSTAG;
		const TABLE = this._TABLE;

		//console.time('splitForeign');

		if (isNaN(cur)) cur = 0;
		let ret = [];

		// 取第一个字符的ASCII码
		let lastcur = 0;
		let lasttype = 0;
		let c = text.charCodeAt(0);
		// 全角数字或字母
		if (c >= 65296 && c <= 65370) c -= 65248;
		// 数字  lasttype = POSTAG.A_M
		if (c >= 48 && c <= 57)
		{
			lasttype = POSTAG.A_M;
		}// 字母 lasttype = POSTAG.A_NX
		else if ((c >= 65 && c <= 90) || (c >= 97 && c <= 122))
		{
			lasttype = POSTAG.A_NX;
		}
		else
		{
			lasttype = POSTAG.UNK;
		}

		let i: number;

		for (i = 1; i < text.length; i++)
		{
			let c = text.charCodeAt(i);
			// 全角数字或字母
			if (c >= 65296 && c <= 65370) c -= 65248;
			// 数字  lasttype = POSTAG.A_M
			if (c >= 48 && c <= 57)
			{
				if (lasttype !== POSTAG.A_M)
				{
					let nw = this.createForeignToken({
						w: text.substr(lastcur, i - lastcur),
					}, lasttype, {
						[this.name]: 1,
					});
					//let nw = { w: text.substr(lastcur, i - lastcur) } as IWord;

					//if (lasttype !== POSTAG.UNK) nw.p = lasttype;
					ret.push(nw);
					lastcur = i;
				}
				lasttype = POSTAG.A_M;
			}
			else if ((c >= 65 && c <= 90) || (c >= 97 && c <= 122))
			{
				// 字母 lasttype = POSTAG.A_NX
				if (lasttype !== POSTAG.A_NX)
				{
					//let nw = { w: text.substr(lastcur, i - lastcur) } as IWord;

					let nw = this.createRawToken({
						w: text.substr(lastcur, i - lastcur),
					}, {
						p: lasttype
					}, {
						[this.name]: 2,
					});

					//if (lasttype !== POSTAG.UNK) nw.p = lasttype;
					ret.push(nw);
					lastcur = i;
				}
				lasttype = POSTAG.A_NX;
			}
			else
			{
				// 其他
				if (lasttype !== POSTAG.UNK)
				{
					let nw = this.createForeignToken({
						w: text.substr(lastcur, i - lastcur),
						p: lasttype
					}, undefined, {
						[this.name]: 3,
					});

					ret.push(nw);
					lastcur = i;
				}
				lasttype = POSTAG.UNK;
			}
		}
		// 剩余部分
		//let nw = { w: text.substr(lastcur, i - lastcur) } as IWord;

		let nw = this.createRawToken<IWord>({
			w: text.substr(lastcur, i - lastcur),
		});

		if (lasttype !== POSTAG.UNK) nw.p = lasttype;
		ret.push(nw);

		//console.timeEnd('splitForeign');

		//debug(ret);
		return ret;
	}

	createForeignToken(word: IWord, lasttype?: number, attr?: IWordDebugInfo)
	{
		let nw = this.createToken<IWord>(word, true, attr);

		let ow = this._TABLE[nw.w];

		if (ow)
		{
			debugToken(nw, {
				_source: ow,
			});

			nw.p = nw.p | ow.p;
		}

		if (lasttype && lasttype !== this._POSTAG.UNK)
		{
			nw.p = lasttype | nw.p;
		}

		return nw;
	}
}

export const init = ForeignTokenizer.init.bind(ForeignTokenizer) as ISubTokenizerCreate<ForeignTokenizer>;

export default ForeignTokenizer;

//debug(splitForeign('ad222经济核算123非'));
