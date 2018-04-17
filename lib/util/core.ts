/**
 * Created by user on 2018/4/17/017.
 */

export function enumIsNaN(v)
{
	return isNaN(Number(v));
}

export function enumList(varEnum, byValue?: boolean)
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

import * as self from './core';
export default self;
