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

];

export default tests
