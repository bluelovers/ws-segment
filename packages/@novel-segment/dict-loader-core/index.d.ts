/**
 * Created by user on 2018/4/13/013.
 */
import Bluebird from 'bluebird';
import { IStreamLineWithValue } from '@novel-segment/stream-loader-core/line';
import createLoadStream, { ICallback } from '@novel-segment/stream-loader-core/stream';
export type IOptions<T, R> = {
    parseLine?(input: string, oldFn?: (input: string) => R): R;
    mapper?(line: any): any;
    filter?(line: any): any;
    stringifyLine?(data: R): string;
};
export declare class LoaderClass<T, R> {
    default: (file: string, options?: IOptions<T, R>) => Bluebird<T>;
    protected defaultOptions: IOptions<T, R>;
    constructor(options?: IOptions<T, R>, ...argv: any[]);
    static create(options?: IOptions<any, any>, ...argv: any[]): LoaderClass<any, any>;
    parseLine(input: string): R;
    stringifyLine(data: R): string;
    serialize(data: R[]): string;
    filter(input: string): string;
    load(file: string, options?: IOptions<T, R>): Bluebird<T>;
    loadSync(file: string, options?: IOptions<T, R>): T;
    loadStream(file: string, options?: IOptions<T, R>, callback?: ICallback<T>): IStreamLineWithValue<T>;
    loadStreamSync(file: string, options?: IOptions<T, R>, callback?: ICallback<T>): IStreamLineWithValue<T>;
    protected _createStream<T>(fnStream: typeof createLoadStream, file: string, options?: IOptions<T, R>, callback?: ICallback<T>): IStreamLineWithValue<T>;
}
export default LoaderClass;
