import { getCjkName, zhDictCompare } from '@novel-segment/util';
import BluebirdPromise from 'bluebird';
import { ILoadDictFileRow2 } from '@novel-segment/util-compare';
export { zhDictCompare, getCjkName };
export declare const DEFAULT_IGNORE: string[];
export declare function globDict(cwd: string, pattern?: string[], ignore?: string[]): BluebirdPromise<string[]>;
export declare function baseSortList<T = ILoadDictFileRow2>(ls: T[], bool?: boolean): T[];
export declare function all_default_load_dict(): readonly ["dict_synonym/*.txt", "names/*.txt", "lazy/*.txt", "dict*.txt", "phrases/*.txt", "pangu/*.txt", "char.txt"];
export declare function all_extra_dict(): readonly ["infrequent/**/*.txt"];
