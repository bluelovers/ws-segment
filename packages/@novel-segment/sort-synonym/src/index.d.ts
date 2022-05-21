/// <reference types="bluebird" />
import { ILoadDictFileRow2 } from '@novel-segment/util-compare';
import { ArrayTwoOrMore } from '@novel-segment/types';
export declare type IHandleDictSynonym = ILoadDictFileRow2<ArrayTwoOrMore<string>>;
export declare function sortLines(lines: string[], file?: string): ILoadDictFileRow2[];
export declare function loadFile(file: string): import("bluebird")<ILoadDictFileRow2[]>;
export declare function SortList<T extends ILoadDictFileRow2<any> = ILoadDictFileRow2>(ls: T[]): T[];
export default sortLines;
