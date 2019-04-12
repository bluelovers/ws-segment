/**
 * Created by user on 2019/4/12.
 */

import tests_lazy_index from './lazy.index';

export const tests_fixme_base: typeof tests_lazy_index['tests_lazy_base'] = [

	[
		'被大人版的月大人以公主抱抱著',
		[
			'公主抱',
			'抱著',
		]
	],

	[
		'然後是境界山脈內部全體表示范達魯擁有影響力的地區全區的國名',
		[
			['全體表示', '表示',],
		]
	],

	[
		'在山國里長大的男生三人大概沒見過吧',
		[
			'長大',
		]
	],

	[
		'仍有几處在几小時後繼續施工的工程',
		[
			'幾處',
			'幾小時',
		]
	],

	[
		'但也有普通的日子里表现出气冲冲样子的时候',
		[
			'气沖沖',
		]
	],

	[
		'想要将一切饮干的贪慾的恶意',
		[
			'饮乾',
		]
	],

];

export const tests_fixme_base_not: typeof tests_lazy_index['tests_lazy_base_not'] = [

	[
		'由於領民間產生不小的騷動',
		[
			'民間',
		]
	],

	[
		'到湖中間后手終於能休息了',
		[
			['后手', '後手'],
		],
	],

	[
		'被卷入山崩的人中沒有發現生存者',
		[
			'人中',
		],
	],

	[
		'你的待遇是以后再做決定的事情',
		[
			'是以',
		]
	],

];

export const tests_fixme_array: typeof tests_lazy_index['tests_lazy_array'] = [

];

export const tests_fixme_indexof: typeof tests_lazy_index['tests_lazy_indexof'] = [

	[
		'在看到他的身影后',
		[
			'後',
		],
	],

	[
		'溫室里長大',
		[
			'裡',
		],
	],

	[
		'月光灑落在一把長長的黑发上',
		[
			'髮',
		],
	],

	[
		'他對于月',
		[
			'於',
		],
	],

	[
		'是看起來很困的愛莉絲',
		[
			'睏',
		],
	],

	[
		'亞歷山大把髒了的下巴用脏的餐巾擦了起來',
		[
			'用髒的',
		],
	],

	[
		'只會落到后手',
		[
			'後',
		],
	],

	[
		'就這麼干吧',
		[
			'幹',
		],
	],

	[
		'好像剛到學園的時候我就開始干著鐵匠活了',
		[
			'幹',
		],
	],




];

export default exports as typeof import('./fixme.data');
