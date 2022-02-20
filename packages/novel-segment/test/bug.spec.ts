//@noUnusedParameters:false

import { basename, extname } from 'path';
import { createSegment } from './lib/index';
import { stringifyList, stringify } from '@novel-segment/stringify';

describe(`bug`, () =>
{
	const segment = createSegment(true, {
		nodeNovelMode: true,
	});

	test(`check word is constructor`, () =>
	{
		let words = segment.doSegment(`inspection.dead.code.problem.synopsis28.constructor=构造函数有一个用法,但它是不可到达的从入口点.`);

		let actual = stringify(words);

		expect(actual).toContain(`inspection.dead.code.problem.synopsis28.constructor`);
		expect(actual).not.toContain(`[native code]`);

		expect(actual).toMatchSnapshot();

	});

})
