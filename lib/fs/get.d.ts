export declare type IOptions = {
    extensions?: string[];
    paths: string[];
    onlyDir?: boolean;
    onlyFile?: boolean;
};
export declare function searchFirst(file: string, paths: IOptions): string;
export declare function searchFirst(file: string, paths?: string[]): string;
export declare function existsSync(path: string, options?: {
    onlyDir?: boolean;
    onlyFile?: boolean;
}): boolean;
export default searchFirst;
