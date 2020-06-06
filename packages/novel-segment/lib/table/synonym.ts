/**
 * Created by user on 2018/4/19/019.
 */

import AbstractTableDictCore, { IDICT, IDICT2, IOptions } from './core';
import { TableDictSynonymPanGu } from './synonym.pangu';

export type ArrayTwoOrMore<T> = {
	0: T,
	1: T,
	[n: number]: T,
	length: number,
}

/**
 * 請注意 這與原版 node-segment 的格式不同
 *
 * 原版為一對一 => 錯字,正字
 * 這裡為一對多 並且順序與原版相反 => 正字,錯字,...以,分隔更多字
 */
export class TableDictSynonym extends TableDictSynonymPanGu
{

	constructor(type: string = TableDictSynonym.type, options: IOptions = {}, ...argv)
	{
		super(type, options, ...argv)
	}

	/**
	 * 緩存主KEY
	 */
	public TABLE2: IDICT<string[]> = {};

	add(data: ArrayTwoOrMore<string>, skipExists?: boolean)
	{
		if (!Array.isArray(data) || data.length < 2)
		{
			throw new TypeError(JSON.stringify(data));
		}

		let w = this._trim(data.shift());

		if (!w)
		{
			throw new TypeError(JSON.stringify(data));
		}

		let self = this;

		self.TABLE2[w] = self.TABLE2[w] || [];

		if (skipExists == null)
		{
			skipExists = true;
		}

		data.forEach(function (bw, index)
		{
			bw = self._trim(bw);

			if (!bw)
			{
				if (index == 0)
				{
					throw new TypeError();
				}

				return;
			}

			if (skipExists && self.exists(bw) || bw in self.TABLE2)
			{
				return;
			}

			self.TABLE2[w].push(bw);
			self._add(bw, w);

			//skipExists = true;
		});

		return this;
	}

}

export default TableDictSynonym
