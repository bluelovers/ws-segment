/**
 * Created by user on 2019/4/10.
 */
import { lazyMatch, lazyMatch002 } from '../lib/util';

export const tests: [string, Parameters<typeof lazyMatch002>['1'], Parameters<typeof lazyMatch002>['2']?][] = [

	[
		'胡锦涛出席APEC领导人会议后回京',
		[
			[
				'会议',
				'回京',
			],
		],
	],

	[
		'在這裡有兩具自動人偶隨侍在側的烏列爾',
		[
			[
				'兩具',
				'自動',
				'人偶',
				'隨侍',
			],
			[
				'兩具',
				'自動人偶',
				'隨侍',
			],
		],
	],

	[
		'我摀住嘴',
		[
			[
				'我',
				'摀住',
				'嘴',
			],
			[
				'我',
				'摀住嘴',
			],
		],
	],

	[
		'世間萬物終歸于虛無',
		[
			[
				'世間',
				'萬物',
				'終歸',
				'於',
				'虛無',
			],
			[
				'世間',
				'萬物',
				'終歸於',
				'虛無',
			],
		],
	],

];

export default tests
