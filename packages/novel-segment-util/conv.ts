/**
 * Created by user on 2019/3/20.
 */

import { toHalfWidth } from '@lazy-cjk/fullhalf';
import { slugify } from '@lazy-cjk/zh-slugify';

export function getCjkName(w: string, USE_CJK_MODE?: number)
{
	let cjk_id = slugify(w, true);

	return toHalfWidth(cjk_id).toLocaleLowerCase();
}

export default getCjkName;
