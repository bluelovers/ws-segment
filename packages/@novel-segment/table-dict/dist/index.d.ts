/**
 * Created by user on 2018/4/15/015.
 */
import { IDictRow } from '@novel-segment/loaders/segment/index';
import { AbstractTableDictCore, IDICT, IDICT2, IOptions } from '@novel-segment/table-core-abstract';
import { IWord } from '@novel-segment/types';
export type ITableDictRow = {
    p: number;
    f: number;
    s?: boolean;
};
export { IDICT, IDICT2, IOptions };
export declare function notNum<T>(val: T): val is Exclude<T, number>;
/**
 * @todo 掛接其他 dict
 */
export declare class TableDict extends AbstractTableDictCore<ITableDictRow> {
    TABLE: IDICT<ITableDictRow>;
    TABLE2: IDICT2<ITableDictRow>;
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
    /**
     * 將目前的 表格 匯出
     */
    stringify(LF?: string): string;
}
export default TableDict;
