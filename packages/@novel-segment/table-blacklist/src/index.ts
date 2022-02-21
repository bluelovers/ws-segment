
import { AbstractTableDictCore, IDICT, IDICT2, IOptions } from '@novel-segment/table-core-abstract';
import { TableDictLine } from '@novel-segment/table-line';
import { EnumDictDatabase } from '@novel-segment/types';

export class TableDictBlacklist extends TableDictLine
{
	static override readonly type = EnumDictDatabase.BLACKLIST;

	constructor(type: string = TableDictBlacklist.type, options: IOptions = {}, ...argv)
	{
		super(type, options, ...argv)
	}
}

export default TableDictBlacklist
