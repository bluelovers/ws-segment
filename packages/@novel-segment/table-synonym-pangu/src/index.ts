/**
 * Created by user on 2018/4/19/019.
 */

import { AbstractTableDictCore, IDICT, IDICT2, IOptions } from '@novel-segment/table-core-abstract';
import { ITSTypeAndStringLiteral } from 'ts-type/lib/helper/string';
import { EnumDictDatabase } from '@novel-segment/types';

/**
 * 原版 node-segment 的格式
 * @deprecated
 */
export class TableDictSynonymPanGu extends AbstractTableDictCore<string>
{
	static override readonly type: ITSTypeAndStringLiteral<EnumDictDatabase.SYNONYM> = EnumDictDatabase.SYNONYM;

	constructor(type: string = TableDictSynonymPanGu.type, options?: IOptions, ...argv)
	{
		super(type, options, ...argv)
	}

	add(data: [string, string] & string[], skipExists?: boolean)
	{
		if (!Array.isArray(data) || data.length !== 2)
		{
			throw new TypeError(JSON.stringify(data));
		}

		data[0] = this._trim(data[0]);

		if (!data[0]?.length)
		{
			throw new TypeError(JSON.stringify(data));
		}

		data[1] = this._trim(data[1]);

		if (skipExists && this.exists(data[0]))
		{
			return this;
		}

		this._add(data[0], data[1]);

		return this;
	}

	_add(n1: string, n2: string)
	{
		if (n1 !== n2)
		{
			this.TABLE[n1] = n2;
		}

		if (this.TABLE[n2] === n1)
		{
			delete this.TABLE[n2];
		}
	}

	protected _trim(s: string)
	{
		return s.replace(/^\s+|\s+$/g, '').trim();
	}

}

export default TableDictSynonymPanGu
