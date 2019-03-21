/**
 * Created by user on 2019/3/20.
 */

import StrUtil = require('str-util');
import { textList, slugify } from 'cjk-conv/lib/zh/table/list';

export function getCjkName(w: string, USE_CJK_MODE: number)
{
	let cjk_id = slugify(w, true);

	return StrUtil.toHalfWidth(cjk_id);
}

export default exports as typeof import('./conv');
