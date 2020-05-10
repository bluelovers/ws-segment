/**
 * Created by user on 2018/4/11/011.
 */
/// <reference types="node" />
import Promise = require('bluebird');
import { IPipe } from 'stream-pipe';
import { ReadStream } from 'stream-pipe/fs';
export declare type IOptions = {
    mapper?(data: string): any;
    onpipe?(src: any): any;
    onclose?(...argv: any[]): any;
    onfinish?(...argv: any[]): any;
    onready?(...argv: any[]): any;
    ondata?(...argv: any[]): any;
};
export declare function byLine(fn?: any, options?: IOptions): IPipe<ReadStream, NodeJS.WritableStream>;
export declare function createStreamLine(file: string, options: IOptions): IStreamLine;
export declare function createStreamLine(file: string, fn?: (data: string) => any, options?: IOptions): IStreamLine;
export declare function readFileLine(file: string, options: IOptions): IPromiseStream<IStreamLine>;
export declare function readFileLine(file: string, fn?: (data: string) => any, options?: IOptions): IPromiseStream<IStreamLine>;
export declare function wrapStreamToPromise<T extends NodeJS.WritableStream>(stream: T): IPromiseStream<T>;
export declare type IStreamLine = IPipe<ReadStream, NodeJS.WritableStream>;
export declare type IStreamLineWithValue<T> = IStreamLine & {
    value?: T;
};
export declare type IPromiseStream<T> = Promise<T> & {
    stream: T;
};
declare const _default: typeof import("./line");
export default _default;
