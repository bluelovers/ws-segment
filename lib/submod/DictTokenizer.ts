'use strict';

import { SubSModule, SubSModuleTokenizer, ISubTokenizerCreate } from '../mod';
// @ts-ignore
import { UString } from 'uni-string';
import { ITableDictRow } from '../table/dict';
import { hexAndAny, toHex } from '../util/index';
import CHS_NAMES, { FAMILY_NAME_1, FAMILY_NAME_2, SINGLE_NAME, DOUBLE_NAME_1, DOUBLE_NAME_2 } from '../mod/CHS_NAMES';
import Segment, { IDICT, IWord, IDICT2 } from '../Segment';
import { debug } from '../util';
import { DATETIME } from '../mod/const';
import IPOSTAG from '../POSTAG';

export const DEFAULT_MAX_CHUNK_COUNT = 40;
export const DEFAULT_MAX_CHUNK_COUNT_MIN = 25;

/**
 * 字典识别模块
 *
 * @author 老雷<leizongmin@gmail.com>
 */
export class DictTokenizer extends SubSModuleTokenizer
{

	/**
	 * 防止因無分段導致分析過久甚至超過處理負荷
	 * 越高越精準但是處理時間會加倍成長甚至超過記憶體能處理的程度
	 *
	 * 數字越小越快
	 *
	 * FATAL ERROR: CALL_AND_RETRY_LAST Allocation failed - JavaScript heap out of memory
	 *
	 * @type {number}
	 */
	MAX_CHUNK_COUNT = DEFAULT_MAX_CHUNK_COUNT;
	/**
	 *
	 * 追加新模式使 MAX_CHUNK_COUNT 遞減來防止無分段長段落的總處理次數過高 由 DEFAULT_MAX_CHUNK_COUNT_MIN 來限制最小值
	 */
	DEFAULT_MAX_CHUNK_COUNT_MIN = DEFAULT_MAX_CHUNK_COUNT_MIN;

	protected _TABLE: IDICT<IWord>;
	protected _TABLE2: IDICT2<IWord>;

	_cache()
	{
		super._cache();
		this._TABLE = this.segment.getDict('TABLE');
		this._TABLE2 = this.segment.getDict('TABLE2');
		this._POSTAG = this.segment.POSTAG;

		if (typeof this.segment.options.maxChunkCount == 'number' && this.segment.options.maxChunkCount > DEFAULT_MAX_CHUNK_COUNT_MIN)
		{
			this.MAX_CHUNK_COUNT = this.segment.options.maxChunkCount;
		}

		if (typeof this.segment.options.minChunkCount == 'number' && this.segment.options.minChunkCount > DEFAULT_MAX_CHUNK_COUNT_MIN)
		{
			this.DEFAULT_MAX_CHUNK_COUNT_MIN = this.segment.options.minChunkCount;
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
		//debug(words);
		const TABLE = this._TABLE;
		const POSTAG = this._POSTAG;

		const self = this;

		let ret: IWord[] = [];
		for (let i = 0, word; word = words[i]; i++)
		{
			if (word.p > 0)
			{
				ret.push(word);
				continue;
			}

			// 仅对未识别的词进行匹配
			let wordinfo = this.matchWord(word.w, 0, words[i - 1]);
			if (wordinfo.length < 1)
			{
				ret.push(word);
				continue;
			}

			// 分离出已识别的单词
			let lastc = 0;

			wordinfo.forEach(function (bw, ui)
			{
				if (bw.c > lastc)
				{
					ret.push({
						w: word.w.substr(lastc, bw.c - lastc),
					});
				}

				let cw = self.createRawToken({
					w: bw.w,
					f: bw.f,
				}, TABLE[bw.w]);

				ret.push(cw);

				/*
				ret.push({
					w: bw.w,
					p: ww.p,
					f: bw.f,
					s: ww.s,
				});
				*/
				lastc = bw.c + bw.w.length;
			});

			let lastword = wordinfo[wordinfo.length - 1];
			if (lastword.c + lastword.w.length < word.w.length)
			{
				let cw = self.createRawToken({
					w: word.w.substr(lastword.c + lastword.w.length),
				});

				ret.push(cw);
			}
		}

		return ret;
	}

	// =================================================================

	/**
	 * 匹配单词，返回相关信息
	 *
	 * @param {string} text 文本
	 * @param {int} cur 开始位置
	 * @param {object} preword 上一个单词
	 * @return {array}  返回格式   {w: '单词', c: 开始位置}
	 */
	protected matchWord(text: string, cur: number, preword: IWord)
	{
		if (isNaN(cur)) cur = 0;
		let ret: IWord[] = [];
		let s = false;

		const TABLE2 = this._TABLE2;

		// 匹配可能出现的单词
		while (cur < text.length)
		{
			for (let i in TABLE2)
			{
				let w = text.substr(cur, i as any as number);
				if (w in TABLE2[i])
				{
					ret.push({
						w: w,
						c: cur,
						f: TABLE2[i][w].f,
					});
				}
			}
			cur++;
		}

		return this.filterWord(ret, preword, text);
	}

	/**
	 * 选择最有可能匹配的单词
	 *
	 * @param {array} words 单词信息数组
	 * @param {object} preword 上一个单词
	 * @param {string} text 本节要分词的文本
	 * @return {array}
	 */
	protected filterWord(words: IWord[], preword: IWord, text: string)
	{
		const TABLE = this._TABLE;
		const POSTAG = this._POSTAG;
		let ret: IWord[] = [];

		// 将单词按位置分组
		let wordpos = this.getPosInfo(words, text);
		//debug(wordpos);

		/**
		 * 使用类似于MMSG的分词算法
		 * 找出所有分词可能，主要根据一下几项来评价：
		 * x、词数量最少；
		 * a、词平均频率最大；
		 * b、每个词长度标准差最小；
		 * c、未识别词最少；
		 * d、符合语法结构项：如两个连续的动词减分，数词后面跟量词加分；
		 * 取以上几项综合排名最最好的
		 */
		let chunks = this.getChunks(wordpos, 0, text);
		//debug(chunks);
		let assess: Array<IAssessRow> = [];  // 评价表

		//console.log(chunks);

		// 对各个分支就行评估
		for (let i = 0, chunk: IWord[]; chunk = chunks[i]; i++)
		{
			assess[i] = {
				x: chunk.length,
				a: 0,
				b: 0,
				c: 0,
				d: 0,

				index: i,
			};
			// 词平均长度
			let sp = text.length / chunk.length;
			// 句子经常包含的语法结构
			let has_D_V = false;  // 是否包含动词

			// 遍历各个词
			let prew: IWord;

			if (preword)
			{
				/*
				prew = {
					w: preword.w,
					p: preword.p,
					f: preword.f,
					s: preword.s,
				}
				*/

				prew = this.createRawToken(preword);

			}
			else
			{
				prew = null;
			}
			for (let j = 0, w: IWord; w = chunk[j]; j++)
			{
				if (w.w in TABLE)
				{
					w.p = TABLE[w.w].p;
					assess[i].a += w.f;   // 总词频

					if (j == 0 && !preword && (w.p & POSTAG.D_V))
					{
						/**
						 * 將第一個字也計算進去是否包含動詞
						 */
						has_D_V = true;
					}

					// ================ 检查语法结构 ===================
					if (prew)
					{
						// 如果上一个词是数词且当前词是量词（单位），则加分
						if (
							(prew.p & POSTAG.A_M)
							&&
							(
								((w.p & POSTAG.A_Q))
								|| w.w in DATETIME
							)
						)
						{
							assess[i].d++;
						}

						// 如果当前词是动词
						if ((w.p & POSTAG.D_V))
						{
							has_D_V = true;
							// 如果是连续的两个动词，则减分
							//if ((prew.p & POSTAG.D_V) > 0)
							//assess[i].d--;

							/*
							// 如果是 形容词 + 动词，则加分
							if ((prew.p & POSTAG.D_A))
							{
								assess[i].d++;
							}
							*/

							// 如果是 副词 + 动词，则加分
							if (prew.p & POSTAG.D_D)
							{
								assess[i].d++;
							}
						}
						// 如果是地区名、机构名或形容词，后面跟地区、机构、代词、名词等，则加分
						if ((
								(prew.p & POSTAG.A_NS)
								|| (prew.p & POSTAG.A_NT)
								|| (prew.p & POSTAG.D_A)
							) &&
							(
								(w.p & POSTAG.D_N)
								|| (w.p & POSTAG.A_NR)
								|| (w.p & POSTAG.A_NS)
								|| (w.p & POSTAG.A_NZ)
								|| (w.p & POSTAG.A_NT)
							))
						{
							assess[i].d++;
						}
						// 如果是 方位词 + 数量词，则加分
						if (
							(prew.p & POSTAG.D_F)
							&&
							(
								(w.p & POSTAG.A_M)
								|| (w.p & POSTAG.D_MQ)
							))
						{
							//debug(prew, w);
							assess[i].d++;
						}
						// 如果是 姓 + 名词，则加分
						if (
							(
								prew.w in FAMILY_NAME_1
								|| prew.w in FAMILY_NAME_2
							) &&
							(
								(w.p & POSTAG.D_N)
								|| (w.p & POSTAG.A_NZ)
							))
						{
							//debug(prew, w);
							assess[i].d++;
						}

						/**
						 * 地名/处所 + 方位
						 */
						if (hexAndAny(prew.p
							, POSTAG.D_S
							, POSTAG.A_NS,
						) && hexAndAny(w.p
							, POSTAG.D_F,
						))
						{
							assess[i].d += 0.5;
						}

						// 探测下一个词
						let nextw = chunk[j + 1];
						if (nextw)
						{
							if (nextw.w in TABLE)
							{
								nextw.p = TABLE[nextw.w].p;
							}

							let _temp_ok: boolean = true;

							/**
							 * 如果当前是“的”+ 名词，则加分
							 */
							if (
								(w.w == '的' || w.w == '之')
								&& nextw.p && (
									(nextw.p & POSTAG.D_N)
									|| (nextw.p & POSTAG.D_V)
									|| (nextw.p & POSTAG.A_NR)
									|| (nextw.p & POSTAG.A_NS)
									|| (nextw.p & POSTAG.A_NZ)
									|| (nextw.p & POSTAG.A_NT)
								))
							{
								assess[i].d += 1.5;
								_temp_ok = false;
							}
							/**
							 * 如果是连词，前后两个词词性相同则加分
							 */
							else if (prew.p && (w.p & POSTAG.D_C))
							{
								let p = prew.p & nextw.p;

								if (prew.p === nextw.p)
								{
									assess[i].d++;
									_temp_ok = false;
								}
								else if (p)
								{
									assess[i].d += 0.25;
									_temp_ok = false;

									if (p & POSTAG.D_N)
									{
										assess[i].d += 0.75;
									}
								}
							}

							if (_temp_ok && nextw.p && (w.p & POSTAG.D_P))
							{
								if (nextw.p & POSTAG.A_NR && (
									nextw.w.length > 1
								))
								{
									assess[i].d++;

									if (prew.w == '的')
									{
										/**
										 * 的 + 介詞 + 人名
										 */
										assess[i].d += 1;
										_temp_ok = false;
									}
								}
							}

							if (_temp_ok && (w.p & POSTAG.D_P) && hexAndAny(prew.p,
								POSTAG.D_N,
							) && hexAndAny(nextw.p,
								POSTAG.D_N,
								POSTAG.D_V,
							))
							{
								assess[i].d++;
								_temp_ok = false;
							}
							else if (_temp_ok && (w.p & POSTAG.D_P) && hexAndAny(prew.p,
								POSTAG.D_R,
							) && hexAndAny(nextw.p,
								POSTAG.D_R,
							))
							{
								assess[i].d += 0.5;
								_temp_ok = false;
							}

							// @FIXME 暴力解決 三天后 的問題
							if (nextw.w == '后' && w.p & POSTAG.D_T && hexAndAny(prew.p,
								POSTAG.D_MQ,
								POSTAG.A_M,
							))
							{
								assess[i].d++;
							}
							// @FIXME 到湖中間后手終於能休息了
							else if (
								(
									nextw.w == '后'
									|| nextw.w == '後'
								)
								&& hexAndAny(w.p,
								POSTAG.D_F,
								)
							)
							{
								assess[i].d++;
							}

							if (
								(
									w.w == '后'
									|| w.w == '後'
								)
								&& hexAndAny(prew.p,
								POSTAG.D_F,
								)
								&& hexAndAny(nextw.p,
								POSTAG.D_N,
								)
							)
							{
								assess[i].d++;
							}
						}
						else
						{
							let _temp_ok: boolean = true;

							/**
							 * 她把荷包蛋摆在像是印度烤饼的面包上
							 */
							if (_temp_ok && (w.p & POSTAG.D_F) && hexAndAny(prew.p,
								POSTAG.D_N,
							))
							{
								assess[i].d += 1;
								_temp_ok = false;
							}
						}
					}
					// ===========================================
				}
				else
				{
					// 未识别的词数量
					assess[i].c++;
				}
				// 标准差
				assess[i].b += Math.pow(sp - w.w.length, 2);
				prew = chunk[j];
			}

			// 如果句子中包含了至少一个动词
			if (has_D_V === false) assess[i].d -= 0.5;

			assess[i].a = assess[i].a / chunk.length;
			assess[i].b = assess[i].b / chunk.length;
		}

		//console.dir(assess);

		// 计算排名
		let top = this.getTops(assess);
		let currchunk = chunks[top];

		if (false)
		{
			//console.log(assess);
			//console.log(Object.entries(chunks));
			console.dir(Object.entries(chunks)
				.map(([i, chunk]) => { return { i, asses: assess[i as unknown as number], chunk } }), { depth: 5 });
			console.dir({ i: top, asses: assess[top], currchunk });
			//console.log(top);
			//console.log(currchunk);
		}

		// 剔除不能识别的词
		for (let i = 0, word: IWord; word = currchunk[i]; i++)
		{
			if (!(word.w in TABLE))
			{
				currchunk.splice(i--, 1);
			}
		}
		ret = currchunk;

		// 試圖主動清除記憶體
		assess = undefined;
		chunks = undefined;

		//debug(ret);
		return ret;
	}

	/**
	 * 评价排名
	 *
	 * @param {object} assess
	 * @return {object}
	 */
	getTops(assess: Array<IAssessRow>)
	{
		//debug(assess);
		// 取各项最大值
		let top: IAssessRow = {
			x: assess[0].x,
			a: assess[0].a,
			b: assess[0].b,
			c: assess[0].c,
			d: assess[0].d,
		};

		for (let i = 1, ass: IAssessRow; ass = assess[i]; i++)
		{
			if (ass.a > top.a) top.a = ass.a;  // 取最大平均词频
			if (ass.b < top.b) top.b = ass.b;  // 取最小标准差
			if (ass.c > top.c) top.c = ass.c;  // 取最大未识别词
			if (ass.d < top.d) top.d = ass.d;  // 取最小语法分数
			if (ass.x > top.x) top.x = ass.x;  // 取最大单词数量
		}
		//debug(top);

		// 评估排名
		let tops: number[] = [];
		for (let i = 0, ass: IAssessRow; ass = assess[i]; i++)
		{
			tops[i] = 0;
			// 词数量，越小越好
			tops[i] += (top.x - ass.x) * 1.5;
			// 词总频率，越大越好
			if (ass.a >= top.a) tops[i] += 1;
			// 词标准差，越小越好
			if (ass.b <= top.b) tops[i] += 1;
			// 未识别词，越小越好
			tops[i] += (top.c - ass.c);//debug(tops[i]);
			// 符合语法结构程度，越大越好
			tops[i] += (ass.d < 0 ? top.d + ass.d : ass.d - top.d) * 1;

			ass.score = tops[i];

			//debug(tops[i]);debug('---');
		}
		//debug(tops.join('  '));

		//console.log(tops);
		//console.log(assess);

		//const old_method = true;
		const old_method = false;

		// 取分数最高的
		let curri = 0;
		let maxs = tops[0];
		for (let i in tops)
		{
			let s = tops[i];
			if (s > maxs)
			{
				curri = i as any as number;
				maxs = s;
			}
			else if (s == maxs)
			{
				/**
				 * 如果分数相同，则根据词长度、未识别词个数和平均频率来选择
				 *
				 * 如果依然同分，則保持不變
				 */
				let a = 0;
				let b = 0;
				if (assess[i].c < assess[curri].c)
				{
					a++;
				}
				else if (assess[i].c !== assess[curri].c)
				{
					b++;
				}
				if (assess[i].a > assess[curri].a)
				{
					a++;
				}
				else if (assess[i].a !== assess[curri].a)
				{
					b++;
				}
				if (assess[i].x < assess[curri].x)
				{
					a++;
				}
				else if (assess[i].x !== assess[curri].x)
				{
					b++;
				}
				if (a > b)
				{
					curri = i as any as number;
					maxs = s;
				}
			}
			//debug({ i, s, maxs, curri });
		}
		//debug('max: i=' + curri + ', s=' + tops[curri]);
		return curri;
	}

	/**
	 * 将单词按照位置排列
	 *
	 * @param {array} words
	 * @param {string} text
	 * @return {object}
	 */
	getPosInfo(words: IWord[], text: string): {
		[index: number]: IWord[];
	}
	{
		let wordpos = {};
		// 将单词按位置分组
		for (let i = 0, word; word = words[i]; i++)
		{
			if (!wordpos[word.c])
			{
				wordpos[word.c] = [];
			}
			wordpos[word.c].push(word);
		}
		// 按单字分割文本，填补空缺的位置
		for (let i = 0; i < text.length; i++)
		{
			if (!wordpos[i])
			{
				wordpos[i] = [{ w: text.charAt(i), c: i, f: 0 }];
			}
		}

		return wordpos;
	}

	/**
	 * 取所有分支
	 *
	 * @param {{[p: number]: Segment.IWord[]}} wordpos
	 * @param {number} pos 当前位置
	 * @param {string} text 本节要分词的文本
	 * @param {number} total_count
	 * @returns {Segment.IWord[][]}
	 */
	getChunks(wordpos: {
		[index: number]: IWord[];
	}, pos: number, text?: string, total_count = 0, MAX_CHUNK_COUNT?: number): IWord[][]
	{

		/**
		 *
		 * 追加新模式使 MAX_CHUNK_COUNT 遞減來防止無分段長段落的總處理次數過高 由 DEFAULT_MAX_CHUNK_COUNT_MIN 來限制最小值
		 */
		if (total_count == 0)
		{
			MAX_CHUNK_COUNT = this.MAX_CHUNK_COUNT;
		}
		else
		{
			MAX_CHUNK_COUNT = Math.max(MAX_CHUNK_COUNT, this.DEFAULT_MAX_CHUNK_COUNT_MIN, DEFAULT_MAX_CHUNK_COUNT_MIN)
		}

		/**
		 * 忽略連字
		 *
		 * 例如: 啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊
		 */
		let m;
		if (m = text.match(/^((.+)\2{5,})/))
		{
			let s1 = text.slice(0, m[1].length);
			let s2 = text.slice(m[1].length);

			let word = {
				w: s1,
				c: pos,
				f: 0,
			} as IWord;

			let ret: IWord[][] = [];

			if (s2 !== '')
			{
				let chunks = this.getChunks(wordpos, pos + s1.length, s2, total_count, MAX_CHUNK_COUNT - 1);

				for (let j = 0; j < chunks.length; j++)
				{
					ret.push([word].concat(chunks[j]));
				}
			}
			else
			{
				ret.push([word]);
			}

//			console.dir(wordpos);
//
//			console.dir(ret);
//
//			console.dir([pos, text, total_count]);

			return ret;
		}

		total_count++;

		let words = wordpos[pos] || [];

		//debug(total_count, MAX_CHUNK_COUNT);

//		debug({
//			total_count,
//			MAX_CHUNK_COUNT: this.MAX_CHUNK_COUNT,
//			text,
//			words,
//		});

		// debug('getChunks: ');
		// debug(words);
		//throw new Error();

		let ret: IWord[][] = [];
		for (let i = 0; i < words.length; i++)
		{
			let word = words[i];
			//debug(word);
			let nextcur = word.c + word.w.length;
			/**
			 * @FIXME
			 */
			if (!wordpos[nextcur])
			{
				ret.push([word]);
			}
			else if (total_count > MAX_CHUNK_COUNT - 1)
			{
				// do something

//				console.log(444, words.slice(i));
//				console.log(333, word);

				let w1: IWord[] = [word];

				let j = nextcur;
				while (j in wordpos)
				{
					let w2 = wordpos[j][0];

					if (w2)
					{
						w1.push(w2);

						j += w2.w.length;
					}
					else
					{
						break;
					}
				}

				ret.push(w1);
			}
			else
			{
				let t = text.slice(word.w.length);

				let chunks = this.getChunks(wordpos, nextcur, t, total_count, MAX_CHUNK_COUNT - 1);
				for (let j = 0; j < chunks.length; j++)
				{
					ret.push([word].concat(chunks[j]));
				}

				chunks = null;
			}
		}

		words = undefined;

		return ret;
	}
}

export namespace DictTokenizer
{
	/**
	 * 使用类似于MMSG的分词算法
	 * 找出所有分词可能，主要根据一下几项来评价：
	 *
	 * x、词数量最少；
	 * a、词平均频率最大；
	 * b、每个词长度标准差最小；
	 * c、未识别词最少；
	 * d、符合语法结构项：如两个连续的动词减分，数词后面跟量词加分；
	 *
	 * 取以上几项综合排名最最好的
	 */
	export type IAssessRow = {
		/**
		 * 词数量，越小越好
		 */
		x: number,
		/**
		 * 词总频率，越大越好
		 */
		a: number,
		/**
		 * 词标准差，越小越好
		 * 每个词长度标准差最小
		 */
		b: number,
		/**
		 * 未识别词，越小越好
		 */
		c: number,
		/**
		 * 符合语法结构程度，越大越好
		 * 符合语法结构项：如两个连续的动词减分，数词后面跟量词加分
		 */
		d: number,

		/**
		 * 結算評分(自動計算)
		 */
		score?: number,
		readonly index?: number,
	};
}

export import IAssessRow = DictTokenizer.IAssessRow;

export const init = DictTokenizer.init.bind(DictTokenizer) as ISubTokenizerCreate<DictTokenizer>;

export default DictTokenizer;
