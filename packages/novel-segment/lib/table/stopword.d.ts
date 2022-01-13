import { IOptions } from './core';
import TableDictLine from './line';
import { ITSTypeAndStringLiteral } from 'ts-type/lib/helper/string';
import { EnumDictDatabase } from '@novel-segment/types';
/**
 * 原版 node-segment 的格式
 */
export declare class TableDictStopword extends TableDictLine {
    static readonly type: ITSTypeAndStringLiteral<EnumDictDatabase.STOPWORD>;
    constructor(type?: string, options?: IOptions, ...argv: any[]);
}
export default TableDictStopword;
