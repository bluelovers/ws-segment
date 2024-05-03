import { ILoadDictFileRow2 } from '@novel-segment/util-compare';
export type IHandleDictTable = ILoadDictFileRow2;
export interface IOptions {
    cbIgnore?(cur: IHandleDictTable): any;
}
export declare function sortLines(lines: string[], file?: string, options?: IOptions): IHandleDictTable[];
export declare function loadFile(file: string, options?: IOptions): import("bluebird")<IHandleDictTable[]>;
export declare function SortList<T extends ILoadDictFileRow2<any> = ILoadDictFileRow2>(ls: T[]): T[];
export default sortLines;
