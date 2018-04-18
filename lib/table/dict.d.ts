/**
 * Created by user on 2018/4/15/015.
 */
import { IWord } from '../Segment';
import { IDictRow } from 'segment-dict/lib/loader/segment';
export declare type IOptions = {
    autoCjk?: boolean;
};
export declare type ITableDictRow = {
    p: number;
    f: number;
};
export interface IDICT<T = any> {
    [key: string]: T;
}
export interface IDICT2<T = any> {
    [key: number]: IDICT<T>;
}
/**
 * @todo 掛接其他 dict
 */
export declare class TableDict {
    type: string;
    TABLE: IDICT<ITableDictRow>;
    TABLE2: IDICT2<ITableDictRow>;
    options: IOptions;
    constructor(type: string, options?: IOptions);
    exists(data: IWord | IDictRow | string): ITableDictRow;
    add(data: IWord | IDictRow | string, skipExists?: boolean): this;
    size(): number;
    protected _add({w, p, f}: {
        w: any;
        p: any;
        f: any;
    }): void;
}
export default TableDict;
