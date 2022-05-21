export declare const enum EnumSortCompareOrder {
    KEEP = 0,
    DOWN = 1,
    UP = -1
}
/**
 * @private
 */
export declare let _zhDictCompareTable: string[][];
export declare let _zhDictCompareTable_chars: string[];
export declare const RE_ZH: RegExp;
export interface IFnCompare {
    (a: string, b: string): number;
}
/**
 * 包裝排序比較函數
 */
export declare function zhDictCompareNew(failback?: IFnCompare): IFnCompare;
export declare function zhDictCompareNew(options?: {
    failback?: IFnCompare;
    fallback?: IFnCompare;
}): IFnCompare;
/**
 * 排序字典專用的比較函數
 */
export declare const zhDictCompare: IFnCompare;
declare const _default: typeof import("./sort");
export default _default;
