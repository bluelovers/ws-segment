/**
 * Created by user on 2018/4/15/015.
 */

import { IWord } from '../Segment';
import { IDictRow } from 'segment-dict/lib/loader/segment';
import CjkConv from 'cjk-conv';
import { text_list } from '../util/cjk';

export type IOptions = {
	autoCjk?: boolean,
}

export class TableDict
{
	public type: string;

	TABLE: {
		[key: string]: ITableDictRow,
	} = {};

	TABLE2: {
		[key: number]: {
			[key: string]: ITableDictRow
		}
	} = {};

	options: IOptions;

	constructor(type: string, options: IOptions = {})
	{
		this.type = type;

		this.options = Object.assign({}, this.options, options);

		//console.log(this.options);
	}

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

		if (typeof w !== 'string' || w === '')
		{
			throw new TypeError(JSON.stringify(data));
		}

		if (skipExists && this.exists(w))
		{
			return this;
		}

		p = (Number.isNaN(p) || typeof p != 'number') ? 0 : p;
		f = (Number.isNaN(f) || typeof f != 'number') ? 0 : f;

		this._add({w, p, f});

		let self = this;

		/**
		 * @todo 需要更聰明的作法 目前的做法實在太蠢
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

export type ITableDictRow = {
	p: number,
	f: number,
};

export default TableDict
