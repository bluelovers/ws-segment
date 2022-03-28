/**
 * Created by user on 2018/4/13/013.
 */
/// <reference types="node" />
/// <reference types="node" />
import { Readable } from 'stream';
import { IOptions, IStreamLine, IStreamLineWithValue } from './line';
import { ICallback } from './stream';
export declare function createLoadStreamSync<T>(file: string, options?: {
    mapper?(line: string): any;
    ondata?(data: any): any;
    callback?: ICallback<T>;
    onready?(...argv: any[]): any;
}): IStreamLineWithValue<T>;
export declare function createStreamLineSync(file: string, options: IOptions): IStreamLine;
export declare function createStreamLineSync(file: string, fn?: (data: string) => any, options?: IOptions): IStreamLine;
export declare function createReadStreamSync(file: string): ReadableSync;
export declare class ReadableSync extends Readable {
    protected fd: number;
    protected flags: string | number;
    bytesRead: number;
    path: string;
    protected fdEnd: boolean;
    protected options: {
        readChunk: number;
    };
    constructor(file: string);
    _read(size: number): Buffer;
    __read(size: number): Buffer;
    run(): this;
}
export default createLoadStreamSync;
