import { IOptions } from '@novel-segment/table-core-abstract';
import { TableDictLine } from '@novel-segment/table-line';
import { EnumDictDatabase } from '@novel-segment/types';
import { ITSTypeAndStringLiteral } from 'ts-type/lib/helper/string';
export declare class TableDictBlacklist extends TableDictLine {
    static readonly type: ITSTypeAndStringLiteral<EnumDictDatabase.BLACKLIST>;
    constructor(type?: string, options?: IOptions, ...argv: any[]);
}
export default TableDictBlacklist;
