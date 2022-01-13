import { IOptions } from './core';
import TableDictLine from './line';
import { EnumDictDatabase } from '@novel-segment/types';
export declare class TableDictBlacklist extends TableDictLine {
    static readonly type = EnumDictDatabase.BLACKLIST;
    constructor(type?: string, options?: IOptions, ...argv: any[]);
}
export default TableDictBlacklist;
