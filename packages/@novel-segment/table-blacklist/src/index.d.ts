import { IOptions } from '@novel-segment/table-core-abstract';
import { TableDictLine } from '@novel-segment/table-line';
import { EnumDictDatabase } from '@novel-segment/types';
export declare class TableDictBlacklist extends TableDictLine {
    static readonly type = EnumDictDatabase.BLACKLIST;
    constructor(type?: string, options?: IOptions, ...argv: any[]);
}
export default TableDictBlacklist;
