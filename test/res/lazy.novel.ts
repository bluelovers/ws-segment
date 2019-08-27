/**
 * 測試段落 每次發布版本時 會保證以下分析轉換是符合預期
 *
 * 此檔案內的測試只有在開啟 nodeNovelMode 後才會符合預期
 */

import { lazyMatch, lazyMatch002, lazyMatchNot, lazyMatchSynonym001, sortTests } from '../lib/util';

/**
 * 分析後應該要符合以下結果
 */
export const tests_lazy_novel_base: [string, Parameters<typeof lazyMatch>['1'], Parameters<typeof lazyMatch>['2']?][] = [

];

/**
 * 分析後不應該存在符合以下結果
 */
export const tests_lazy_novel_base_not: [string, Parameters<typeof lazyMatchNot>['1'], Parameters<typeof lazyMatchNot>['2']?][] = [



];

/**
 * 分析後應該要符合以下其中一個結果
 */
export const tests_lazy_novel_array: [string, Parameters<typeof lazyMatch002>['1'], Parameters<typeof lazyMatch002>['2']?][] = [

];

/**
 * 分析轉換後應該要具有以下字詞
 */
export const tests_lazy_novel_indexof: [string, Parameters<typeof lazyMatchSynonym001>['1'], Parameters<typeof lazyMatchSynonym001>['2']?][] = [

	[
		'但是在發出邀請後卻被回以“吾才不要去那種魚龍混雜的地方呢”，義正言辭的回絕了',
		[
			'義正辭嚴',
		],
	],

	[
		'也許是不知道有普通人被卷入了結界',
		[
			'捲',
		],
	],

	[
		'不過好象只是杞人憂天。',
		[
			'像',
		],
	],

	[
		'鶫讓自己的身體深深的陷入政府準備的轎車后座',
		[
			'後',
		],
	],

	[
		'貝爾不遜的回復道。',
		[
			'覆',
		],
	],

	[
		'「沒有借口啊」',
		[
			'藉',
		],
	],

	[
		'「⋯⋯你啊。说了吧。会把我卷进你的漩涡里，让我无处可逃。」',
		[
			'捲',
		],
	],

];

sortTests(tests_lazy_novel_base);
sortTests(tests_lazy_novel_base_not);
sortTests(tests_lazy_novel_array);
sortTests(tests_lazy_novel_indexof);

export default exports as typeof import('./lazy.novel');
