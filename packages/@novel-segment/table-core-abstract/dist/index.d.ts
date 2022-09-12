/**
 * Created by user on 2018/4/19/019.
 */
import { IDictRow } from '@novel-segment/loaders/segment/index';
import { IWord } from '@novel-segment/types';
export type IOptions = {
    autoCjk?: boolean;
};
export interface IDICT<T = any> {
    [key: string]: T;
}
export interface IDICT2<T = any> {
    [key: number]: IDICT<T>;
}
export interface ITableDictExistsTable<T> {
    TABLE?: IDICT<T>;
    TABLE2?: any | IDICT2<T>;
}
export declare abstract class AbstractTableDictCore<T> {
    static type: string;
    type: string;
    TABLE: IDICT<T>;
    TABLE2: any | IDICT2<T>;
    options: IOptions;
    constructor(type: string, options?: IOptions, existsTable?: ITableDictExistsTable<T>, ...argv: any[]);
    _init(): void;
    protected _exists<U extends IWord | IDictRow | string>(data: U, ...argv: any[]): string;
    exists<U extends IWord | IDictRow | string>(data: U, ...argv: any[]): T;
    abstract add(data: any, ...argv: any[]): this;
    protected abstract _add(data: any, ...argv: any[]): any;
    remove?(data: any, ...argv: any[]): this;
    protected _remove?(data: any, ...argv: any[]): any;
    json(...argv: any[]): IDICT<T>;
    stringify?(...argv: any[]): string;
    size(): number;
}
export default AbstractTableDictCore;
