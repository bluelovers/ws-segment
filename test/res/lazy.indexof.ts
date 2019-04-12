/**
 * Created by user on 2019/4/10.
 */
import { lazyMatchSynonym001 } from '../lib/util';

export const tests: [string, Parameters<typeof lazyMatchSynonym001>['1'], Parameters<typeof lazyMatchSynonym001>['2']?][] = [

	[
		'大家干的好',
		[
			'幹',
		],
	],

	[
		'至今為止他對自己所干的事',
		[
			'幹',
		],
	],

	[
		'反正會被拼命干的吧',
		[
			'幹',
		],
	],

	[
		'雖然要干的事也增加了',
		[
			'幹',
		],
	],

	[
		'你好好干的話',
		[
			'幹',
		],
	],

];

export default tests
