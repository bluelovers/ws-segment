/**
 * Created by user on 2018/4/13/013.
 */
/// <reference types="bluebird" />
import { LoaderClass } from '@novel-segment/dict-loader-core';
export type IDictRow = string;
export type IDict = IDictRow[];
export declare const load: (file: string, options?: import("@novel-segment/dict-loader-core").IOptions<IDict, string>) => import("bluebird")<IDict>;
export declare const loadSync: (file: string, options?: import("@novel-segment/dict-loader-core").IOptions<IDict, string>) => IDict;
export declare const loadStream: (file: string, options?: import("@novel-segment/dict-loader-core").IOptions<IDict, string>, callback?: import("@novel-segment/stream-loader-core/stream").ICallback<IDict>) => import("@novel-segment/stream-loader-core/line").IStreamLineWithValue<IDict>;
export declare const loadStreamSync: (file: string, options?: import("@novel-segment/dict-loader-core").IOptions<IDict, string>, callback?: import("@novel-segment/stream-loader-core/stream").ICallback<IDict>) => import("@novel-segment/stream-loader-core/line").IStreamLineWithValue<IDict>;
export declare const parseLine: (input: string) => string;
export declare const stringifyLine: (data: string) => string;
export declare const serialize: (data: string[]) => string;
export declare const Loader: LoaderClass<IDict, string>;
declare const _default: (file: string, options?: import("@novel-segment/dict-loader-core").IOptions<IDict, string>) => import("bluebird")<IDict>;
export default _default;
