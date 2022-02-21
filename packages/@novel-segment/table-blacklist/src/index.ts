
import { AbstractTableDictCore, IDICT, IDICT2, IOptions } from '@novel-segment/table-core-abstract';
import { TableDictLine } from '@novel-segment/table-line';
import { EnumDictDatabase } from '@novel-segment/types';
import { ITSTypeAndStringLiteral } from 'ts-type/lib/helper/string';

export class TableDictBlacklist extends TableDictLine
{
	static override readonly type: ITSTypeAndStringLiteral<EnumDictDatabase.BLACKLIST> = EnumDictDatabase.BLACKLIST;

	constructor(type: string = TableDictBlacklist.type, options?: IOptions, ...argv)
	{
		super(type, options, ...argv)
	}
}

export default TableDictBlacklist
