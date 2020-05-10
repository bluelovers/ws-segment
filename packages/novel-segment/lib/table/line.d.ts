import AbstractTableDictCore, { IDICT } from './core';
/**
 * 原版 node-segment 的格式
 */
export declare abstract class TableDictLine extends AbstractTableDictCore<boolean> {
    exists(data: any, ...argv: any[]): boolean;
    add(word: string | string[]): this;
    _add(word: string): void;
    remove(word: string): this;
    _remove(word: string): void;
    json(): IDICT<boolean>;
    stringify(LF?: string): string;
}
export default TableDictLine;
