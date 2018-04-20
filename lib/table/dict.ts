/**
 * Created by user on 2018/4/15/015.
 */

import { IWord } from '../Segment';
import { IDictRow } from 'segment-dict/lib/loader/segment';
import CjkConv from 'cjk-conv';
import { text_list } from '../util/cjk';
import AbstractTableDictCore, { IDICT, IDICT2, IOptions } from './core';

export type ITableDictRow = {
	p: number,
	f: number,
};

export { IDICT, IDICT2, IOptions }

/**
 * @todo 掛接其他 dict
 */
export class TableDict extends AbstractTableDictCore<ITableDictRow>
{
	public type: string;

	TABLE: IDICT<ITableDictRow> = {};
	TABLE2: IDICT2<ITableDictRow> = {};

	options: IOptions;

	exists(data: IWord | IDictRow | string): ITableDictRow
	{
		let w, p, f;

		if (typeof data == 'string')
		{
			w = data;
		}
		else if (Array.isArray(data))
		{
			[w, p, f] = data;
		}
		else
		{
			({w, p, f} = data);
		}

		return this.TABLE[w] || null;
	}

	add(data: IWord | IDictRow | string, skipExists?: boolean)
	{
		let w: string, p: number, f: number;
		let plus: Array<string | number>;

		if (typeof data == 'string')
		{
			w = data;
		}
		else if (Array.isArray(data))
		{
			[w, p, f, ...plus] = data;
		}
		else
		{
			({w, p, f} = data);
		}

		if (typeof w !== 'string' || w === '')
		{
			throw new TypeError(JSON.stringify(data));
		}

		if (skipExists && this.exists(w))
		{
			return this;
		}

		p = (typeof p != 'number' || Number.isNaN(p)) ? 0 : p;
		f = (typeof f != 'number' || Number.isNaN(f)) ? 0 : f;

		if (plus && plus.length)
		{
			// @todo do something
		}

		this._add({w, p, f});

		let self = this;

		/**
		 * @todo 需要更聰明的作法 目前的做法實在太蠢
		 * @BUG 在不明原因下 似乎不會正確的添加每個項目 如果遇到這種情形請手動添加簡繁項目
		 */
		if (1 && this.options.autoCjk)
		{
			let wa = text_list(w);

			wa.forEach(function (w2)
			{
				if (w2 != w && !self.exists(w2))
				{
					self._add({w: w2, p, f});
				}
			});

			/*
			let w2: string;
			w2 = CjkConv.zh2jp(w);

			if (w2 != w && !this.exists(w2))
			{
				this._add({w: w2, p, f});
				//console.log(w2);
			}

			w2 = CjkConv.cjk2zht(w);

			if (w2 !== w && !this.exists(w2))
			{
				this._add({w: w2, p, f});
				//console.log(w2);
			}

			w2 = CjkConv.cjk2zhs(w);

			if (w2 !== w && !this.exists(w2))
			{
				this._add({w: w2, p, f});
				//console.log(w2);
			}
			*/
		}

		return this;
	}

	protected _add({w, p, f})
	{
		let len = w.length;

		this.TABLE[w] = {
			p,
			f,
		} as ITableDictRow;

		if (!this.TABLE2[len]) this.TABLE2[len] = {};

		this.TABLE2[len][w] = this.TABLE[w];
	}
}

export default TableDict
