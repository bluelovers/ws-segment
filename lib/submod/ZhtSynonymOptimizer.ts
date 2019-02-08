/**
 * Created by user on 2018/4/16/016.
 */

import { SubSModule, SubSModuleOptimizer } from '../mod';
import POSTAG from '../POSTAG';
import Segment, { IDICT, IDICT_SYNONYM, IWord } from '../Segment';
import { IWordDebug } from '../util';
import { hexAndAny } from '../util/index';
import { COLOR_ALL, COLOR_HAIR } from '../mod/COLORS';

import UString = require('uni-string');

/**
 * 以詞意來自動轉換 而不需要手動加入字典於 synonym.txt
 * 適用於比較容易需要人工處理的轉換
 *
 * 自動處理 `里|后`
 *
 * 建議在字典內追加人名地名等等名字 來增加準確性
 * 防止轉換錯誤
 *
 * @todo 發于余干松冲准呆只范舍涂
 */
export class ZhtSynonymOptimizer extends SubSModuleOptimizer
{
	name = 'ZhtSynonymOptimizer';

	protected _SYNONYM?: IDICT_SYNONYM;
	protected _TABLE: IDICT<IWord>;

	_cache()
	{
		super._cache();

		this._TABLE = this.segment.getDict('TABLE');
		this._POSTAG = this.segment.POSTAG;

		this._SYNONYM = this.segment.getDict('SYNONYM') || {};
	}

	protected _getSynonym(w: string, nw: string): string
	{
		const SYNONYM = this._SYNONYM;

		if (w in SYNONYM)
		{
			nw = SYNONYM[w];
		}

		if (nw in SYNONYM)
		{
			//let w = nw;
			nw = SYNONYM[nw];
		}

		return nw;
	}

	doOptimize<T extends IWordDebug>(words: T[]): T[]
	{
		const self = this;
		const POSTAG = this._POSTAG;
		const TABLE = this._TABLE;
		const SYNONYM = this._SYNONYM;

		let i = 0;

		let CLOSE_P = ['】', '」', '》', '』', '］', '’', '”', '〉'];
		let SEP_P = ['、', ',', '…'];

		while (i < words.length)
		{
			let w0: IWord = words[i - 1] || null;
			let w1 = words[i];
			let w2: IWord = words[i + 1] || null;

			let bool: boolean;

			let w1_len = UString.size(w1.w);

			let new_p: number;

			if (w1_len == 1)
			{
				//console.log(w1);

				if (w1.w == '里')
				{
					if (w0 && (
						w0.w.slice(-1) == '的'
						|| w0.w === '和'
					))
					{

					}
					else if (w0 && CLOSE_P.includes(w0.w))
					{
						w1.ow = w1.w;
						w1.w = '裡';

						bool = true;
					}
					else if (w0 && hexAndAny(w0.p,
						// 名詞
						POSTAG.D_N,

						// 處所
						POSTAG.D_S,

						// 方位
						POSTAG.D_F,

						// 时间词
						POSTAG.D_T,

						// 动词 训练
						POSTAG.D_V,
					))
					{
						w1.ow = w1.w;
						w1.w = '裡';

						bool = true;
					}
				}
				else if (w1.w == '后')
				{

					if (w0 && (
						w0.w === '和'
					))
					{

					}
					else if (w0 && CLOSE_P.includes(w0.w))
					{
						w1.ow = w1.w;
						w1.w = '後';

						bool = true;
					}
					else if (w0 && ['腰'].includes(w0.w))
					{
						w1.ow = w1.w;
						w1.w = '後';

						bool = true;
					}
					// 如果前一個項目為
					else if (w0 && (w0.p && hexAndAny(w0.p,

						// 动词 離開
						POSTAG.D_V,
						// 处所词
						POSTAG.D_S,
						// 时间词
						POSTAG.D_T,
						// 名词 名语素
						POSTAG.D_N,
						// 数量词 - 几次后
						POSTAG.D_MQ,
						POSTAG.A_M,

						// 方位词 方位语素
						POSTAG.D_F,

						// 副词
						POSTAG.D_D,

						POSTAG.D_R,
					)))
					{
						w1.ow = w1.w;
						w1.w = '後';

						bool = true;
					}
					else if (w2 && (w2.p && hexAndAny(w2.p,
						POSTAG.D_V,
					)))
					{
						w1.ow = w1.w;
						w1.w = '後';

						bool = true;
					}
					else if (w2 && ((w0 && !w0.p) && (w2.p && hexAndAny(w2.p,
						// 副词
						POSTAG.D_D,
					))))
					{
						w1.ow = w1.w;
						w1.w = '後';

						bool = true;
					}
					else if (w2 && ((!w0 || !w0.p) && SEP_P.includes(w2.w)))
					{
						w1.ow = w1.w;
						w1.w = '後';

						bool = true;
					}
				}
				else if (w1.w == '发' || w1.w == '發')
				{
					let c: string;

					if (w0)
					{
						c = w0.w;
					}

					if (c && COLOR_HAIR[c])
					{
						let nw = '髮';

						nw = this._getSynonym(w1.w, nw);

						if (nw != w1.w)
						{
							w1.ow = w1.w;
							w1.w = nw;

							new_p = POSTAG.D_N;

							bool = true;
						}
					}
				}
				else if (w1.w == '于')
				{
					if (w0 == null)
					{
						/**
						 * 當 於 在句子開頭並且後面是名詞或動詞時
						 */
						if (w2 && (
							w2.p & POSTAG.D_N
							|| w2.p & POSTAG.D_V
						))
						{
							w1.ow = w1.w;
							w1.w = '於';

							new_p = POSTAG.D_P;
							w1.p = new_p;

							bool = true;
						}
					}
					else if (w0 && w2)
					{
						let w3: IWord;

						if (
							(hexAndAny(w0.p,
								POSTAG.D_V,
								POSTAG.D_R,
								POSTAG.D_A,
								POSTAG.D_T,
							) && hexAndAny(w2.p,
								POSTAG.D_N,
								POSTAG.D_V,
								POSTAG.D_R,
								POSTAG.D_S,
								POSTAG.A_NX,
							))
							||
							(hexAndAny(w0.p,
								POSTAG.D_N,
							) && hexAndAny(w2.p,
								POSTAG.D_N,
							))
							||
							(hexAndAny(w0.p,
								POSTAG.D_V,
								POSTAG.D_N,
							) && hexAndAny(w2.p,
								POSTAG.D_F,
								POSTAG.D_T,
								POSTAG.A_NR,
								POSTAG.D_R,
								POSTAG.D_S,
							))
							||
							(hexAndAny(w0.p,
								POSTAG.A_NS,
								POSTAG.D_T,
								POSTAG.D_C,
							) && hexAndAny(w2.p,
								POSTAG.A_NS,
								POSTAG.D_T,
							))
							||
							(hexAndAny(w0.p,
								POSTAG.D_D,
							) && hexAndAny(w2.p,
								POSTAG.D_N,
							))
							/*
							||
							(hexAndAny(w0.p,
								POSTAG.D_V,
							) && hexAndAny(w2.p,
								POSTAG.D_D,
							))
							*/
							||
							(hexAndAny(w0.p,
								POSTAG.A_NR,
							) && hexAndAny(w2.p,
								POSTAG.A_NS,
								POSTAG.A_NT,
								POSTAG.D_S,
								POSTAG.D_N,
								POSTAG.D_V,
							))
							||
							(hexAndAny(w0.p,
								POSTAG.D_V,
							) && hexAndAny(w2.p,
								POSTAG.D_W,
							))
						)
						{
							w1.ow = w1.w;
							w1.w = '於';

							new_p = POSTAG.D_P;
							w1.p = new_p;

							bool = true;
						}
						else if (w3 = words[i + 2])
						{
							if (
								w0.p & POSTAG.D_V
								&& w2.p & POSTAG.D_D
								&& w3.p & POSTAG.D_V
							)
							{
								w1.ow = w1.w;
								w1.w = '於';

								new_p = POSTAG.D_P;
								w1.p = new_p;

								bool = true;
							}
						}
					}
				}
				else if (w1.w == '么')
				{
					if (!w2 || w2.p & POSTAG.D_W)
					{
						w1.ow = w1.w;
						w1.w = '麼';

						bool = true;
					}
				}
			}
			else if (w1_len > 1)
			{
				if (w1.w.match(/^(.+)[发發]$/))
				{
					let c = RegExp.$1;

					if (COLOR_HAIR[c])
					{
						let nw = c + '髮';

						nw = this._getSynonym(w1.w, nw);

						if (nw != w1.w)
						{
							w1.ow = w1.w;
							w1.w = nw;

							bool = true;
						}
					}
					else if (
						w1.w === (c + '发')
						&& (w1.p & POSTAG.D_MQ)
					)
					{
						// 　一发、兩发、三发、四发、五发、六发——

						let nw = c + '發';

						w1.ow = w1.w;
						w1.w = nw;

						bool = true;
					}
					else if (
						// 不修正繁體的 發
						w1.w === (c + '发')
						&& (
							!w0
							|| (
								w0 && (
									w0.p === POSTAG.D_W
									//|| COLOR_HAIR[w0.w]
								)
							)
						)
					)
					{
						let nw = c + '髮';

						let ow: IWord = TABLE[nw];

						if (ow && ow.s)
						{
							w1.ow = w1.w;
							w1.w = nw;

							new_p = ow.p;

							bool = true;
						}
					}
				}
				else if (hexAndAny(w1.p,
					POSTAG.D_MQ,
				) && /^(.+)余$/.test(w1.w))
				{
					let nw = RegExp.$1 + '餘';

					w1.ow = w1.w;
					w1.w = nw;

					bool = true;
				}
				// 如果項目為 量词
				else if (hexAndAny(w1.p,
					POSTAG.A_Q,
					POSTAG.D_MQ,
				))
				{

				}
				else if (w1.p & POSTAG.D_V && /^干(.)$/.test(w1.w))
				{
					/**
					 * @todo 需要更嚴謹的判斷方式
					 */

					let c = RegExp.$1;
					let nw = '幹' + c;
					let ow: IWord = TABLE[nw];

					if (ow && hexAndAny(ow.p,
						POSTAG.D_V,
					))
					{
						if (w2 && hexAndAny(w2.p,
							POSTAG.D_R,
						))
						{
							w1.ow = w1.w;
							w1.w = nw;

							bool = true;
						}
					}
				}
				// 如果項目為 錯字
				else if (w1.p & POSTAG.BAD)
				{
					let nw: string;

					nw = w1.w
						.replace(/(.)里|里(.)/, '$1裡$2')
						.replace(/(.)后|后(.)/, '$1後$2')
						.replace(/蔘(.)/, '參$1')
					;

					nw = this._getSynonym(w1.w, nw);

					//console.log(w1, nw);

					if (nw != w1.w)
					{
						w1.ow = w1.w;
						w1.w = nw;

						bool = true;
					}
				}
				// 如果項目為 方位
				else if (w1.p & POSTAG.D_F)
				{
					let nw = w1.w
						.replace(/(.)里|里(.)/, '$1裡$2')
						.replace(/(.)后|后(.)/, '$1後$2')
					;

					nw = this._getSynonym(w1.w, nw);

					if (nw != w1.w)
					{
						w1.ow = w1.w;
						w1.w = nw;

						bool = true;
					}
				}
				// 如果項目為 處所
				else if (w1.p & POSTAG.D_S)
				{
					let nw = w1.w
						.replace(/(.)里$/, '$1裡')
					;

					nw = this._getSynonym(w1.w, nw);

					if (nw != w1.w)
					{
						w1.ow = w1.w;
						w1.w = nw;

						bool = true;
					}
				}
				// 如果項目為 时间
				else if (w1.p & POSTAG.D_T || w1.p & POSTAG.D_V)
				{
					let nw = w1.w
						.replace(/(.)后|后(.)/, '$1後$2')
					;

					nw = this._getSynonym(w1.w, nw);

					if (nw != w1.w)
					{
						w1.op = w1.op || w1.p;
						w1.ow = w1.w;

						w1.w = nw;

						bool = true;
					}
				}
			}

			if (bool && w1.ow && w1.ow != w1.w)
			{
				if (w1.w in TABLE)
				{
					let ow = TABLE[w1.w];

					if (typeof new_p !== 'undefined')
					{
						w1.op = w1.op || ow.p;
						w1.p = new_p;
					}
					else if (ow.p != w1.p)
					{
						w1.op = w1.op || w1.p;
						w1.p = ow.p;

						//console.log(TABLE[w1.w]);
					}

					if (ow.s !== w1.s)
					{
						w1.os = ('os' in w1) ? w1.os : (w1.s || false);
						w1.s = ow.s;
					}
				}

				this.debugToken(w1, {
					[this.name]: true,
				});
			}

			i++;
		}

		return words;
	}
}

export const init = ZhtSynonymOptimizer.init.bind(ZhtSynonymOptimizer) as typeof ZhtSynonymOptimizer.init;

export default ZhtSynonymOptimizer;
