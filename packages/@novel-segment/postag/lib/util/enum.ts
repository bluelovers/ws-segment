import { IEnumLike } from '../types';

export function enumIsNaN(v)
{
	return isNaN(Number(v));
}

export function enumList<T extends IEnumLike<any>>(varEnum: T, byValue?: boolean)
{
	let keys = Object.keys(varEnum);

	if (byValue)
	{
		return keys.filter(key => isNaN(Number(varEnum[key])));
	}
	else
	{
		return keys.filter(key => !isNaN(Number(varEnum[key])));
	}
}
