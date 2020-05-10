/**
 * Created by user on 2018/4/14/014.
 */
import Promise = require('bluebird');
import { IStreamLineWithValue } from '../fs/line';
import { ICallback } from '../fs/stream';
import { LoaderClass } from './_class';
export declare type IDictRow = string;
export declare type IDict = IDictRow[];
export declare const load: (file: string, options?: import("./_class").IOptions<IDict, string>) => Promise<IDict>;
export declare const loadSync: (file: string, options?: import("./_class").IOptions<IDict, string>) => IDict;
export declare const loadStream: (file: string, options?: import("./_class").IOptions<IDict, string>, callback?: ICallback<IDict>) => IStreamLineWithValue<IDict>;
export declare const loadStreamSync: (file: string, options?: import("./_class").IOptions<IDict, string>, callback?: ICallback<IDict>) => IStreamLineWithValue<IDict>;
export declare const parseLine: (input: string) => string;
export declare const stringifyLine: (data: string) => string;
export declare const Loader: LoaderClass<IDict, string>;
declare const _default: (file: string, options?: import("./_class").IOptions<IDict, string>) => Promise<IDict>;
export default _default;
