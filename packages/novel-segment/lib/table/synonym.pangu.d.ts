/**
 * Created by user on 2018/4/19/019.
 */
import AbstractTableDictCore, { IOptions } from './core';
/**
 * 原版 node-segment 的格式
 */
export declare class TableDictSynonymPanGu extends AbstractTableDictCore<string> {
    static readonly type = "SYNONYM";
    constructor(type?: string, options?: IOptions, ...argv: any[]);
    add(data: [string, string] & string[], skipExists?: boolean): this;
    _add(n1: string, n2: string): void;
    protected _trim(s: string): string;
}
export default TableDictSynonymPanGu;
