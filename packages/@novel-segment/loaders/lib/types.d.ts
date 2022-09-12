/**
 * Created by user on 2020/5/11.
 */
import LoaderClass from '@novel-segment/dict-loader-core';
export type IRequireModule<T = any> = LoaderClass<T, any>;
export declare function isDefined<T>(value: T): value is NonNullable<T>;
export declare function isUndefined<T>(value: T): value is NonNullable<T>;
