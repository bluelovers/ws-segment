/**
 * Created by user on 2018/4/13/013.
 */
import DeAsync from 'deasync';
export declare let hasSupport: boolean;
export declare let libDeAsync: typeof DeAsync;
export declare function initDeAsync(): DeAsync.IApi;
export declare function sleepSync(timeout: number): IWrapPromiseFakeSync<number>;
export declare function awaitSync<T>(pr: Promise<T>): IWrapPromiseFakeSync<T>;
export declare function awaitSync<T>(pr: T): IWrapPromiseFakeSync<T>;
export declare type IWrapPromiseFakeSync<T> = Promise<T> & {
    thenSync<U>(fn: (value: T) => U): U;
};
export declare function wrapPromiseFakeSync<T>(pr: Promise<any>, value: T): IWrapPromiseFakeSync<T>;
export default sleepSync;
