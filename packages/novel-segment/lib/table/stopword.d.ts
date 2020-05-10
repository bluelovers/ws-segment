import { IOptions } from './core';
import TableDictLine from './line';
/**
 * 原版 node-segment 的格式
 */
export declare class TableDictStopword extends TableDictLine {
    static readonly type = "STOPWORD";
    constructor(type?: string, options?: IOptions, ...argv: any[]);
}
export default TableDictStopword;
