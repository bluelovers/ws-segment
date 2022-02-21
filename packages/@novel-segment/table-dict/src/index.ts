/**
 * Created by user on 2018/4/15/015.
 */
import { IDictRow, stringifyLine } from '@novel-segment/loaders/segment/index';
import { textList as text_list } from '@lazy-cjk/zh-table-list/list';
import { AbstractTableDictCore, IDICT, IDICT2, IOptions } from '@novel-segment/table-core-abstract';
import { IWord } from '@novel-segment/types';

export type ITableDictRow = {
	p: number,
	f: number,
	s?: boolean,
};

export { IDICT, IDICT2, IOptions }

export function notNum<T>(val: T): val is Exclude<T, number>
{
	return typeof val !== 'number' || Number.isNaN(val)
}

/**
 * @todo 掛接其他 dict
 */
export class TableDict extends AbstractTableDictCore<ITableDictRow>
{
	//public override type: string;

	declare TABLE: IDICT<ITableDictRow>;
	declare TABLE2: IDICT2<ITableDictRow>;

	//override options: IOptions;

	override exists(data: IWord | IDictRow | string): ITableDictRow
	{
		return super.exists(data)
	}

	protected __handleInput(data: IWord | IDictRow | string)
	{
		let w: string, p: number, f: number;
		let plus: Array<string | number>;

		if (typeof data === 'string')
		{
			w = data;
		}
		else if (Array.isArray(data))
		{
			[w, p, f, ...plus] = data;
		}
		else
		{
			({ w, p, f } = data);
		}

		if (typeof w !== 'string' || w === '')
		{
			throw new TypeError(JSON.stringify(data));
		}

		p = notNum(p) ? 0 : p;
		f = notNum(f) ? 0 : f;

		return {
			data: {
				w, p, f,
			},
			plus,
		}
	}

	add(data: IWord | IDictRow | string, skipExists?: boolean)
	{
		let w: string, p: number, f: number;
		let plus: Array<string | number>;

		{
			let ret = this.__handleInput(data);

			({ w, p, f } = ret.data);
			plus = ret.plus;
		}

		if (skipExists && this.exists(w))
		{
			return this;
		}

		if (plus?.length)
		{
			// @todo do something
		}

		this._add({ w, p, f, s: true });

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
				if (w2 !== w && !self.exists(w2))
				{
					self._add({ w: w2, p, f });
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

	protected _add({ w, p, f, s }: {
		w: string,
		p: number,
		f: number,
		s?: boolean,
	})
	{
		let len = w.length;

		this.TABLE[w] = {
			p,
			f,
			s,
		} as ITableDictRow;

		if (!this.TABLE2[len]) this.TABLE2[len] = {};

		this.TABLE2[len][w] = this.TABLE[w];
	}

	override remove(target: IWord | IDictRow | string)
	{
		let { data, plus } = this.__handleInput(target);

		this._remove(data);

		return this
	}

	protected override _remove({ w, p, f, s }: IWord)
	{
		let len = w.length;

		delete this.TABLE[w];
		if (this.TABLE2[len])
		{
			delete this.TABLE2[len][w]
		}

		return this
	}

	/**
	 * 將目前的 表格 匯出
	 */
	override stringify(LF = "\n")
	{
		let self = this;

		return Object.entries(self.TABLE)
			.reduce(function (a, [w, { p, f }])
			{
				let line = stringifyLine([w, p, f]);

				a.push(line);

				return a
			}, [])
			.join(typeof LF === 'string' ? LF : "\n")
			;
	}
}

export default TableDict
