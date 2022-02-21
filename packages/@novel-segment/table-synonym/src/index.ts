/**
 * Created by user on 2018/4/19/019.
 */

import { IDICT, IOptions } from '@novel-segment/table-core-abstract';
import { TableDictSynonymPanGu } from '@novel-segment/table-synonym-pangu';
import { ArrayTwoOrMore } from '@novel-segment/types';

export interface IOptionsTableDictSynonym extends IOptions
{
	skipExists?: boolean
	forceOverwrite?: boolean
}

/**
 * 請注意 這與原版 node-segment 的格式不同
 *
 * 原版為一對一 => 錯字,正字
 * 這裡為一對多 並且順序與原版相反 => 正字,錯字,...以,分隔更多字
 */
export class TableDictSynonym extends TableDictSynonymPanGu
{
	public declare options: IOptionsTableDictSynonym;

	/**
	 * 緩存主KEY
	 */
	public declare TABLE2: IDICT<string[]>;

	constructor(type: string = TableDictSynonym.type, options?: IOptionsTableDictSynonym, ...argv)
	{
		super(type, options, ...argv)
	}

	override add(data: ArrayTwoOrMore<string>, skipExists?: boolean, forceOverwrite?: boolean)
	{
		if (!Array.isArray(data) || data.length < 2)
		{
			throw new TypeError(JSON.stringify(data));
		}

		const w = this._trim(data.shift());

		if (!w.length)
		{
			throw new TypeError(JSON.stringify(data));
		}

		const self = this;

		self.TABLE2[w] ??= [];

		forceOverwrite ??= this.options.forceOverwrite;
		skipExists ??= this.options.skipExists ?? true;

		data.forEach(function (bw, index)
		{
			bw = self._trim(bw);

			if (!bw.length)
			{
				if (index === 0)
				{
					throw new TypeError();
				}

				return;
			}

			if ((!forceOverwrite) && (skipExists && self.exists(bw) || bw in self.TABLE2))
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
