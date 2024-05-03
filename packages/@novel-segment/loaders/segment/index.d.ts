/**
 * Created by user on 2018/3/14/014.
 */
import { LoaderClass } from '@novel-segment/dict-loader-core';
export type IDictRow<T = string> = {
    0: string;
    1: number;
    2: number;
    [index: number]: T | string | number;
} & Array<string | number>;
export type IDict = IDictRow[];
declare const libLoader: LoaderClass<IDict, IDictRow<string>>;
export declare const load: typeof libLoader.load;
export declare const loadSync: typeof libLoader.loadSync;
export declare const loadStream: typeof libLoader.loadStream;
export declare const loadStreamSync: typeof libLoader.loadStreamSync;
export declare const parseLine: typeof libLoader.parseLine;
export declare const stringifyLine: typeof libLoader.stringifyLine;
export declare const serialize: typeof libLoader.serialize;
export declare const Loader: LoaderClass<IDict, IDictRow<string>>;
declare const _default: typeof libLoader.load;
export default _default;
