import { IDICT_SYNONYM, IWord } from '../Segment';
import { IDictRow, stringifyLine } from 'segment-dict/lib/loader/line';
import CjkConv from 'cjk-conv';
import { cloneDeep } from '../util';
import { text_list } from '../util/cjk';
import AbstractTableDictCore, { IDICT, IDICT2, IOptions } from './core';
import TableDictLine from './line';
import { EnumDictDatabase } from '../const';

export class TableDictBlacklist extends TableDictLine
{
	static readonly type = EnumDictDatabase.BLACKLIST;

	constructor(type: string = TableDictBlacklist.type, options: IOptions = {}, ...argv)
	{
		super(type, options, ...argv)
	}
}

export default TableDictBlacklist
