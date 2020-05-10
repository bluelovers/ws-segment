/**
 * Created by user on 2020/5/11.
 */

import LoaderClass from '@novel-segment/dict-loader-core';

export type IRequireModule<T = any> = LoaderClass<T, any>

export function isDefined<T>(value: T): value is NonNullable<T>
{
	return value !== undefined && value !== null
}

export function isUndefined<T>(value: T): value is NonNullable<T>
{
	return value === null || value === void 0
}
