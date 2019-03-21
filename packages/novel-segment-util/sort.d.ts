/**
 * @private
 */
export declare let _zhDictCompareTable: string[][];
export declare let _zhDictCompareTable_chars: string[];
export declare const RE_ZH: RegExp;
export interface IFnCompare {
    (a: string, b: string): number;
}
export declare function zhDictCompareNew(failback?: IFnCompare): IFnCompare;
export declare function zhDictCompareNew(options?: {
    failback?: IFnCompare;
}): IFnCompare;
export declare const zhDictCompare: IFnCompare;
declare const _default: typeof import("./sort");
export default _default;
