/**
 * Created by user on 2018/4/13/013.
 */
import * as Promise from 'bluebird';
import { IStreamLineWithValue } from '../../fs/line';
import { ICallback } from '../../fs/stream';
import { LoaderClass } from '../_class';
export declare type IDictRow = [string, string[], string] | [string, string[]];
export declare type IDict = IDictRow[];
export declare const load: (file: string, options?: import("../_class").IOptions<IDictRow[], IDictRow>) => Promise<IDictRow[]>;
export declare const loadSync: (file: string, options?: import("../_class").IOptions<IDictRow[], IDictRow>) => IDictRow[];
export declare const loadStream: (file: string, options?: import("../_class").IOptions<IDictRow[], IDictRow>, callback?: ICallback<IDictRow[]>) => IStreamLineWithValue<IDictRow[]>;
export declare const loadStreamSync: (file: string, options?: import("../_class").IOptions<IDictRow[], IDictRow>, callback?: ICallback<IDictRow[]>) => IStreamLineWithValue<IDictRow[]>;
export declare const parseLine: (input: string) => IDictRow;
export declare const stringifyLine: (data: IDictRow) => string;
export declare const serialize: (data: IDictRow[]) => string;
export declare const Loader: LoaderClass<IDictRow[], IDictRow>;
declare const _default: (file: string, options?: import("../_class").IOptions<IDictRow[], IDictRow>) => Promise<IDictRow[]>;
export default _default;
