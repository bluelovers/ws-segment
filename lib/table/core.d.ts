/**
 * Created by user on 2018/4/19/019.
 */
import { IWord } from '../Segment';
import { IDictRow } from 'segment-dict/lib/loader/segment';
export declare type IOptions = {
    autoCjk?: boolean;
};
export interface IDICT<T = any> {
    [key: string]: T;
}
export interface IDICT2<T = any> {
    [key: number]: IDICT<T>;
}
export declare abstract class AbstractTableDictCore<T> {
    type: string;
    TABLE: IDICT<T>;
    TABLE2: any | IDICT2<T>;
    options: IOptions;
    constructor(type: string, options?: IOptions, ...argv: any[]);
    exists<U extends IWord | IDictRow | string>(data: U, ...argv: any[]): T;
    abstract add(data: any, ...argv: any[]): this;
    protected abstract _add(data: any, ...argv: any[]): any;
    size(): number;
}
export default AbstractTableDictCore;
