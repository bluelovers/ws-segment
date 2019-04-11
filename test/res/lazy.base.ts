/**
 * Created by user on 2019/4/10.
 */
import { lazyMatch } from '../lib/util';

export const tests: [string, Parameters<typeof lazyMatch>['1'], Parameters<typeof lazyMatch>['2']?][] = [

	[
		'胡锦涛出席APEC领导人会议后回京',
		[
			'会议',
			'回京',
		],
	],

	[
		'两个中国',
		[
			'两个',
			'中国',
		],
	],

	[
		'全部都有',
		[
			'全部',
			'都有',
		],
	],

	[
		'從位在下方的湖面',
		[
			'位在',
			'下方',
		],
	],

	[
		'將那叫燕麥茶的玩意兒一口氣倒入口中。',
		[
			'一口氣',
			'倒入',
			'口中',
		],
	],

	[
		'我就順便在你臉上涂鴉吧',
		[
			'塗鴉',
		],
	],

	[
		'手指著岩地',
		[
			'手',
			'指著',
		],
	],

	[
		'疲憊不堪的強尼癱坐在岩石上',
		[
			'癱坐',
		],
	],

	[
		'「这是什么啊？是特別好的樹木的樹干吗？」',
		[
			'樹幹',
		],
	],

	[
		'由於領民間產生不小的騷動',
		[
			['領民', '領民間'],
			'產生',
		],
	],

	[
		'爲了收集有能力對術文獻上祈禱的人',
		[
			'收集',
			'獻上',
			'祈禱',
		],
	],

	[
		'賽拉正站在馬車的貨台上',
		[
			'馬車',
			'貨台',
		],
	],

	[
		'平均比重為一點七',
		[
			'一點七',
		],
	],

	[
		'正因為不知道明天會是如何',
		[
			'不知道',
			'明天',
		],
	],

	[
		'坐在倒塌樹幹上的安格斯站起了身子',
		[
			'倒塌',
			['樹幹', '樹幹上'],
		],
	],

	[
		'在操縱席的彼得開啟動力之後',
		[
			'操縱席',
			'彼得',
			'開啟',
			'動力',
		],
	],

	[
		'風壓擠機體',
		[
			'風',
			'壓擠',
			'機體',
		],
	],

	[
		'因此需要分成數趟往返搬運',
		[
			'因此',
			'需要',
			'分成',
			'數趟',
			'往返',
			'搬運',
		],
	],

	[
		'我打發了不少時間',
		[
			['打發', '打發了',]
		],
	],

	[
		'在農地外面則有大片可牧養牛羊的牧草地',
		[
			'牧養',
		],
	],

	[
		'就連個人影都找不著',
		[
			'人影',
		],
	],

	[
		'我发自內心表示感謝',
		[
			['發自', '發自內心',],
			'表示',
			'感謝',
		],
	],

];

export default tests
