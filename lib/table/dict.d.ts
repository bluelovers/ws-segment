/**
 * Created by user on 2018/4/15/015.
 */
import { IWord } from '../Segment';
import { IDictRow } from 'segment-dict/lib/loader/segment';
import AbstractTableDictCore, { IDICT, IDICT2, IOptions } from './core';
export declare type ITableDictRow = {
    p: number;
    f: number;
    s?: boolean;
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
    protected __handleInput(data: IWord | IDictRow | string): {
        data: {
            w: string;
            p: number;
            f: number;
        };
        plus: (string | number)[];
    };
    add(data: IWord | IDictRow | string, skipExists?: boolean): this;
    protected _add({ w, p, f, s }: {
        w: string;
        p: number;
        f: number;
        s?: boolean;
    }): void;
    remove(target: IWord | IDictRow | string): this;
    protected _remove({ w, p, f, s }: IWord): this;
    json(): IDICT<ITableDictRow>;
    /**
     * 將目前的 表格 匯出
     */
    stringify(LF?: string): string;
}
export default TableDict;
