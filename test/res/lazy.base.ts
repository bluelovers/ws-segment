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

];

export default tests
