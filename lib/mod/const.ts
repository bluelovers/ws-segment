/**
 * Created by user on 2018/4/19/019.
 */

import { IDICT } from '../Segment';
import { arr_cjk } from '../util/cjk';

/**
 * 日期时间常见组合
 */
export let _DATETIME = [
	'世纪', '年', '年份', '年度', '月', '月份', '月度', '日', '号',
	'时', '点', '点钟', '分', '分钟', '秒', '毫秒'
];

export const DATETIME: IDICT<number> = arr_cjk(_DATETIME)
	.reduce(function (data, v)
	{
		data[v] = v.length;

		return data;
	}, {})
;

export default exports as typeof import('./const');
