/**
 * Created by user on 2018/4/19/019.
 */

import { IDICT_SYNONYM, IWord } from '../Segment';
import { IDictRow } from 'segment-dict/lib/loader/segment';
import CjkConv from 'cjk-conv';
import { text_list } from '../util/cjk';
import AbstractTableDictCore, { IDICT, IDICT2, IOptions } from './core';

/**
 * 原版 node-segment 的格式
 */
export class TableDictSynonymPanGu extends AbstractTableDictCore<string>
{
	static readonly type = 'SYNONYM';

	constructor(type: string = TableDictSynonymPanGu.type, options: IOptions = {}, ...argv)
	{
		super(type, options, ...argv)
	}

	add(data: [string, string] & string[], skipExists?: boolean)
	{
		if (!Array.isArray(data) || data.length != 2)
		{
			throw new TypeError(JSON.stringify(data));
		}

		data[0] = this._trim(data[0]);
		data[1] = this._trim(data[1]);

		if (!data[0])
		{
			throw new TypeError(JSON.stringify(data));
		}

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
