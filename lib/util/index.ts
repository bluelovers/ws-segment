/**
 * Created by user on 2018/4/17/017.
 */

export function toHex(p: number)
{
	return '0x' + p
		.toString(16)
		.padStart(4, '0')
		.toUpperCase()
		;
}

import * as self from './index';
export default self;

