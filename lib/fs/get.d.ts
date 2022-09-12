/**
 * Created by user on 2018/4/13/013.
 */
export type IOptions = {
    extensions?: string[];
    paths: string[];
    onlyDir?: boolean;
    onlyFile?: boolean;
};
export declare function searchGlobSync(file: string, options: IOptions): string[];
export declare function searchGlobSync(file: string, paths?: string[]): string[];
export declare function _searchGlobSync(file: any, options: IOptions, cwd?: string): string[];
export declare function searchFirstSync(file: string, options: IOptions): string;
export declare function searchFirstSync(file: string, paths?: string[]): string;
export declare function existsSync(path: string, options?: {
    onlyDir?: boolean;
    onlyFile?: boolean;
}): boolean;
export declare function getOptions<T extends IOptions>(options: T & IOptions): T & IOptions;
export declare function getOptions(paths: string[]): IOptions;
export declare function getOptions(options: IOptions | string[]): options is IOptions;
export default searchFirstSync;
