
export function isUnset<T>(val: T): val is Extract<T, null | undefined>
{
	return typeof val === 'undefined' || val === null
}

export function isSet<T>(val: T): val is Exclude<T, null | undefined>
{
	return typeof val !== 'undefined' && val !== null
}

export default isUnset
