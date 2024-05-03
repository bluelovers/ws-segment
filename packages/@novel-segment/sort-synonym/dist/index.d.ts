import { ILoadDictFileRow2 } from '@novel-segment/util-compare';
import { ArrayTwoOrMore } from '@novel-segment/types';
export type IHandleDictSynonym = ILoadDictFileRow2<ArrayTwoOrMore<string>>;
export declare function sortLines(lines: string[], file?: string): IHandleDictSynonym[];
export declare function loadFile(file: string): import("bluebird")<IHandleDictSynonym[]>;
export declare function SortList<T extends ILoadDictFileRow2<any> = ILoadDictFileRow2>(ls: T[]): T[];
export default sortLines;
