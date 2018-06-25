/**
 * Created by user on 2018/4/15/015.
 */
import { IWord } from '../Segment';
import { IDictRow } from 'segment-dict/lib/loader/segment';
import AbstractTableDictCore, { IDICT, IDICT2, IOptions } from './core';
export declare type ITableDictRow = {
    p: number;
    f: number;
};
export { IDICT, IDICT2, IOptions };
/**
 * @todo 掛接其他 dict
 */
export declare class TableDict extends AbstractTableDictCore<ITableDictRow> {
    type: string;
    TABLE: IDICT<ITableDictRow>;
    TABLE2: IDICT2<ITableDictRow>;
    options: IOptions;
    exists(data: IWord | IDictRow | string): ITableDictRow;
    add(data: IWord | IDictRow | string, skipExists?: boolean): this;
    protected _add({ w, p, f }: {
        w: any;
        p: any;
        f: any;
    }): void;
}
export default TableDict;
