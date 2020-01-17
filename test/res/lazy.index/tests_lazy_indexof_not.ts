/**
 * Created by user on 2020/1/17.
 */

import { lazyMatchSynonym001Not } from '../../lib/util';

/**
 * 分析轉換後不應該具有以下字詞
 */
export const tests_lazy_indexof_not: [string, Parameters<typeof lazyMatchSynonym001Not>['1'], Parameters<typeof lazyMatchSynonym001Not>['2']?][] = [

	[
		'那是里靈魂的世界。',
		[
			'裡',
		],
	],

	[
		'原因還是在於教會對于究極療癒所抱持的想法吧',
		[
			'于',
		],
	],

];

export default tests_lazy_indexof_not
