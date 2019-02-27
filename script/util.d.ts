import BluebirdPromise = require('bluebird');
export declare type ILoadDictFileRow2<D extends any = [string, number, number, ...any[]]> = ILoadDictFileRow<D> & {
    file: string;
    cjk_id: string;
    line_type: EnumLineType;
};
export declare const DEFAULT_IGNORE: string[];
export declare function globDict(cwd: string, pattern?: string[], ignore?: string[]): BluebirdPromise<string[]>;
export interface ILoadDictFileRow<D = [string, number, number, ...any[]]> {
    data: D;
    line: string;
    index: number;
}
export declare function loadDictFile<T = ILoadDictFileRow>(file: string, fn?: (list: T[], cur: T) => boolean, options?: {
    parseFn?: (line: string) => any;
}): BluebirdPromise<T[]>;
export declare enum EnumLineType {
    BASE = 0,
    COMMENT = 1,
    COMMENT_TAG = 2
}
export declare function chkLineType(line: string): EnumLineType;
export declare function baseSortList<T = ILoadDictFileRow2>(ls: T[], bool?: boolean): T[];
export declare function getCjkName(w: string, USE_CJK_MODE: number): string;
export declare function zhDictCompare(a: string, b: string): number;
