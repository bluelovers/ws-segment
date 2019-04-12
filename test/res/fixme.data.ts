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

];

export default exports as typeof import('./fixme.data');
