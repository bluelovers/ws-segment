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

	[
		'遥遥领先于帝位争夺的皇太子战死于战场都是太过奇怪的事了',
		[
			'于',
		],
	],

	[
		'那里民风保守',
		[
			'里',
		],
	],

	[
		'似乎在一栋别墅里长住不走了',
		[
			'里',
		],
	],

	[
		'生活里长期充满了无奈',
		[
			'里',
		],
	],

	[
		'异次元里拉出来',
		[
			'里',
		],
	],

	[
		'他被寄养在别的家庭里长达十年',
		[
			'里',
		],
	],

];

export default tests_lazy_indexof_not
