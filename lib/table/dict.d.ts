/**
 * Created by user on 2018/4/15/015.
 */
import { IWord } from '../Segment';
import { IDictRow } from 'segment-dict/lib/loader/segment';
export declare type IOptions = {
    autoCjk?: boolean;
};
export declare class TableDict {
    type: string;
    TABLE: {
        [key: string]: ITableDictRow;
    };
    TABLE2: {
        [key: number]: {
            [key: string]: ITableDictRow;
        };
    };
    options: IOptions;
    constructor(type: string, options?: IOptions);
    exists(data: IWord | IDictRow | string): ITableDictRow;
    add(data: IWord | IDictRow | string, skipExists?: boolean): this;
    protected _add({w, p, f}: {
        w: any;
        p: any;
        f: any;
    }): void;
}
export declare type ITableDictRow = {
    p: number;
    f: number;
};
export default TableDict;
