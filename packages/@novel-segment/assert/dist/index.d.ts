export interface IOptionsLazyMatch {
    firstOne?: boolean;
    inspectFn?(input: any, ...argv: any[]): any;
}
export declare function _handleLazyMatchOptions(options?: IOptionsLazyMatch): {
    inspectFn: (input: any, ...argv: any[]) => any;
    firstOne?: boolean;
};
export declare function lazyMatch(a: string[], b: string[] | (string | string[])[], options?: IOptionsLazyMatch): boolean;
export declare function lazyMatch002(a: string[], b_arr: Parameters<typeof lazyMatch>['1'][], options?: IOptionsLazyMatch): void;
export declare function lazyMatchSynonym001(a: string, b_arr: (string | string[])[], options?: IOptionsLazyMatch): void;
export declare function lazyMatchSynonym001Not(a: string, b_arr: (string | string[])[], options?: IOptionsLazyMatch): void;
export declare function lazyMatchNot(a: string[], b: string[] | (string | string[])[], options?: IOptionsLazyMatch): boolean;
