/**
 * Created by user on 2020/7/1.
 */

export function notNum<T>(val: T): val is Exclude<T, number>
{
	return typeof val !== 'number' || Number.isNaN(val)
}

