import BluebirdPromise from 'bluebird';
import { IDict } from '@novel-segment/loader-line';
export declare const USE_CJK_MODE: 2;
export declare const enum EnumLineType {
    BASE = 0,
    COMMENT = 1,
    COMMENT_TAG = 2
}
export type ILoadDictFileRow2<D extends any = [string, number, number, ...any[]]> = ILoadDictFileRow<D> & {
    file: string;
    cjk_id: string;
    line_type: EnumLineType;
};
export interface ILoadDictFileRow<D = [string, number, number, ...any[]]> {
    data: D;
    line: string;
    index: number;
}
export type IUnpackRowData<T extends ILoadDictFileRow<any>> = T extends {
    data: infer D;
} ? D : never;
export type IParseFn<D = any> = (line: string) => D;
export interface IOptionsHandleDictLines<D = any> {
    parseFn: IParseFn<D>;
}
export interface IOptionsHandleDictLinesPartial<D = any> extends Partial<IOptionsHandleDictLines<D>> {
}
export type IFnHandleDictLines<T = ILoadDictFileRow> = (list: T[], cur: T) => boolean;
export declare function stringifyHandleDictLinesList<T extends ILoadDictFileRow<any> = ILoadDictFileRow>(list: T[], options?: {
    disableUnique?: boolean;
}): string[];
export declare function handleDictLines<T extends ILoadDictFileRow<any> = ILoadDictFileRow>(lines: IDict, fn: IFnHandleDictLines<T>, options: IOptionsHandleDictLines<IUnpackRowData<T>>): T[];
export declare function loadDictFile<T extends ILoadDictFileRow<any> = ILoadDictFileRow>(file: string, fn?: IFnHandleDictLines<T>, options?: IOptionsHandleDictLinesPartial<IUnpackRowData<T>>): BluebirdPromise<T[]>;
export declare function chkLineType(line: string): EnumLineType;
