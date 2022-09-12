/**
 * Created by user on 2018/3/14/014.
 */
/// <reference types="bluebird" />
import { LoaderClass } from '@novel-segment/dict-loader-core';
export type IDictRow<T = string> = {
    0: string;
    1: number;
    2: number;
    [index: number]: T | string | number;
} & Array<string | number>;
export type IDict = IDictRow[];
export declare const load: (file: string, options?: import("@novel-segment/dict-loader-core").IOptions<IDict, IDictRow<string>>) => import("bluebird")<IDict>;
export declare const loadSync: (file: string, options?: import("@novel-segment/dict-loader-core").IOptions<IDict, IDictRow<string>>) => IDict;
export declare const loadStream: (file: string, options?: import("@novel-segment/dict-loader-core").IOptions<IDict, IDictRow<string>>, callback?: import("@novel-segment/stream-loader-core/stream").ICallback<IDict>) => import("@novel-segment/stream-loader-core/line").IStreamLineWithValue<IDict>;
export declare const loadStreamSync: (file: string, options?: import("@novel-segment/dict-loader-core").IOptions<IDict, IDictRow<string>>, callback?: import("@novel-segment/stream-loader-core/stream").ICallback<IDict>) => import("@novel-segment/stream-loader-core/line").IStreamLineWithValue<IDict>;
export declare const parseLine: (input: string) => IDictRow<string>;
export declare const stringifyLine: (data: IDictRow<string>) => string;
export declare const serialize: (data: IDictRow<string>[]) => string;
export declare const Loader: LoaderClass<IDict, IDictRow<string>>;
declare const _default: (file: string, options?: import("@novel-segment/dict-loader-core").IOptions<IDict, IDictRow<string>>) => import("bluebird")<IDict>;
export default _default;
