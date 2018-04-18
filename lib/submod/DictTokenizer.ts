'use strict';

import { SubSModule, SubSModuleTokenizer, ISubTokenizerCreate } from '../mod';
import { UString } from 'uni-string';
import { toHex } from '../util/index';
import CHS_NAMES, { FAMILY_NAME_1, FAMILY_NAME_2, SINGLE_NAME, DOUBLE_NAME_1, DOUBLE_NAME_2 } from '../mod/CHS_NAMES';
import Segment, { IDICT, IWord } from '../Segment';
import { debug } from '../util';
import { DATETIME } from '../mod/const';

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
	 * FATAL ERROR: CALL_AND_RETRY_LAST Allocation failed - JavaScript heap out of memory
	 *
	 * @type {number}
	 */
	MAX_CHUNK_COUNT = 50;

	/**
	 * 对未识别的单词进行分词
	 *
	 * @param {array} words 单词数组
	 * @return {array}
	 */
	split(words: IWord[]): IWord[]
	{
		// debug(words);
		const POSTAG = this.segment.POSTAG;
		const TABLE = this.segment.getDict('TABLE');

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
					ret.push({ w: word.w.substr(lastc, bw.c - lastc) });
				}
				ret.push({ w: bw.w, p: TABLE[bw.w].p, f: bw.f });
				lastc = bw.c + bw.w.length;
			});

			let lastword = wordinfo[wordinfo.length - 1];
			if (lastword.c + lastword.w.length < word.w.length)
			{
				ret.push({ w: word.w.substr(lastword.c + lastword.w.length) });
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
		let TABLE = this.segment.getDict('TABLE2');
		// 匹配可能出现的单词
		while (cur < text.length)
		{
			for (let i in TABLE)
			{
				let w = text.substr(cur, i as any as number);
				if (w in TABLE[i])
				{
					ret.push({ w: w, c: cur, f: TABLE[i][w].f });
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
		let POSTAG = this.segment.POSTAG;
		let TABLE = this.segment.getDict('TABLE');
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

		// 对各个分支就行评估
		for (let i = 0, chunk; chunk = chunks[i]; i++)
		{
			assess[i] = { x: chunk.length, a: 0, b: 0, c: 0, d: 0 };
			// 词平均长度
			let sp = text.length / chunk.length;
			// 句子经常包含的语法结构
			let has_D_V = false;  // 是否包含动词

			// 遍历各个词
			let prew: IWord;

			if (preword)
			{
				prew = { w: preword.w, p: preword.p, f: preword.f }
			}
			else
			{
				prew = null;
			}
			for (let j = 0, w; w = chunk[j]; j++)
			{
				if (w.w in TABLE)
				{
					w.p = TABLE[w.w].p;
					assess[i].a += w.f;   // 总词频

					if (j == 0 && !preword && (w.p & POSTAG.D_V) > 0)
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
						if ((prew.p & POSTAG.A_M) > 0 &&
							(((TABLE[w.w].p & POSTAG.A_Q) > 0) || w.w in DATETIME))
						{
							assess[i].d++;
						}

						// 如果当前词是动词
						if ((w.p & POSTAG.D_V) > 0)
						{
							has_D_V = true;
							// 如果是连续的两个动词，则减分
							//if ((prew.p & POSTAG.D_V) > 0)
							//assess[i].d--;
							// 如果是 形容词 + 动词，则加分
							if ((prew.p & POSTAG.D_A) > 0)
							{
								assess[i].d++;
							}
						}
						// 如果是地区名、机构名或形容词，后面跟地区、机构、代词、名词等，则加分
						if (((prew.p & POSTAG.A_NS) > 0 || (prew.p & POSTAG.A_NT) || (prew.p & POSTAG.D_A) > 0) &&
							((w.p & POSTAG.D_N) > 0 || (w.p & POSTAG.A_NR) > 0 ||
								(w.p & POSTAG.A_NS) > 0 || (w.p & POSTAG.A_NZ) > 0 ||
								(w.p & POSTAG.A_NT) > 0
							))
						{
							assess[i].d++;
						}
						// 如果是 方位词 + 数量词，则加分
						if ((prew.p & POSTAG.D_F) > 0 &&
							// @ts-ignore
							((w.p & POSTAG.A_M > 0) || w.p & POSTAG.D_MQ > 0))
						{
							//debug(prew, w);
							assess[i].d++;
						}
						// 如果是 姓 + 名词，则加分
						if ((prew.w in FAMILY_NAME_1 || prew.w in FAMILY_NAME_2) &&
							((w.p & POSTAG.D_N) > 0 || (w.p & POSTAG.A_NZ) > 0))
						{
							//debug(prew, w);
							assess[i].d++;
						}

						// 探测下一个词
						let nextw = chunk[j + 1];
						if (nextw)
						{
							if (nextw.w in TABLE)
							{
								nextw.p = TABLE[nextw.w].p;
							}
							// 如果是连词，前后两个词词性相同则加分
							if ((w.p & POSTAG.D_C) > 0 && prew.p == nextw.p)
							{
								assess[i].d++;
							}
							// 如果当前是“的”+ 名词，则加分
							if ((w.w == '的' || w.w == '之') && (
								(nextw.p & POSTAG.D_N) > 0 || (nextw.p & POSTAG.A_NR) > 0 ||
								(nextw.p & POSTAG.A_NS) > 0 || (nextw.p & POSTAG.A_NZ) > 0 ||
								(nextw.p & POSTAG.A_NT) > 0
							))
							{
								assess[i].d += 1.5;
							}
						}
					}
					// ===========================================
				}
				else
				{
					assess[i].c++;      // 未识别的词数量
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

		//console.log(chunks);
		//console.log(top);
		//console.log(currchunk);

		// 剔除不能识别的词
		for (let i = 0, word; word = currchunk[i]; i++)
		{
			if (!(word.w in TABLE))
			{
				currchunk.splice(i--, 1);
			}
		}
		ret = currchunk;

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
		let top: IAssessRow = { x: assess[0].x, a: assess[0].a, b: assess[0].b, c: assess[0].c, d: assess[0].d };

		for (let i = 1, ass; ass = assess[i]; i++)
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
		for (let i = 0, ass; ass = assess[i]; i++)
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
			//debug(tops[i]);debug('---');
		}
		//debug(tops.join('  '));

		//console.log(tops);
		//console.log(assess);

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
				// 如果分数相同，则根据词长度、未识别词个数和平均频率来选择
				let a = 0;
				let b = 0;
				if (assess[i].c < assess[curri].c)
				{
					a++;
				}
				else
				{
					b++;
				}
				if (assess[i].a > assess[curri].a)
				{
					a++;
				}
				else
				{
					b++;
				}
				if (assess[i].x < assess[curri].x)
				{
					a++;
				}
				else
				{
					b++;
				}
				if (a > b)
				{
					curri = i as any as number;
					maxs = s;
				}
			}
			// debug('i=' + i + ', s=' + s + ', maxs=' + maxs);
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
	}, pos: number, text?: string, total_count = 0)
	{
		total_count++;

		let words = wordpos[pos] || [];
		// debug('getChunks: ');
		// debug(words);
		// throw new Error();
		let ret: IWord[][] = [];
		for (let i = 0; i < words.length; i++)
		{
			let word = words[i];
			//debug(word);
			let nextcur = word.c + word.w.length;
			/**
			 * @FIXME
			 */
			if (!wordpos[nextcur] || total_count > this.MAX_CHUNK_COUNT)
			{
				ret.push([word]);
			}
			else
			{
				let chunks = this.getChunks(wordpos, nextcur, null, total_count);
				for (let j = 0; j < chunks.length; j++)
				{
					ret.push([word].concat(chunks[j]));
				}
			}
		}
		return ret;
	}
}

export namespace DictTokenizer
{
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
		 */
		b: number,
		/**
		 * 未识别词，越小越好
		 */
		c: number,
		/**
		 * 符合语法结构程度，越大越好
		 */
		d: number,
	};
}

export import IAssessRow = DictTokenizer.IAssessRow;

export const init = DictTokenizer.init.bind(DictTokenizer) as ISubTokenizerCreate<DictTokenizer>;

export default DictTokenizer;

//debug(DATETIME);

//debug(matchWord('长春市长春药店'));
