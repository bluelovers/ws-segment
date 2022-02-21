import { AbstractTableDictCore, IDICT, IDICT2, IOptions } from '@novel-segment/table-core-abstract';
import { TableDictLine } from '@novel-segment/table-line';
import { ITSTypeAndStringLiteral } from 'ts-type/lib/helper/string';
import { EnumDictDatabase } from '@novel-segment/types';

/**
 * 原版 node-segment 的格式
 */
export class TableDictStopword extends TableDictLine
{
	static override readonly type: ITSTypeAndStringLiteral<EnumDictDatabase.STOPWORD> = EnumDictDatabase.STOPWORD;

	constructor(type: string = TableDictStopword.type, options?: IOptions, ...argv)
	{
		super(type, options, ...argv)
	}
}

export default TableDictStopword
