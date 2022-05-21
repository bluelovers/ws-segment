//@noUnusedParameters:false

import { basename, extname } from 'path';
import { chkLineType, EnumLineType } from '../src/index';

beforeAll(async () =>
{

});

describe(basename(__filename, extname(__filename)), () =>
{

	test.skip(`dummy`, () => {});

	test(`chkLineType`, () =>
	{

		expect(chkLineType(`// 格式: 正字或偏好字,錯字或同義字,...more`)).toStrictEqual(EnumLineType.COMMENT_TAG);

		expect(chkLineType(`// @todo 只放單純轉換異體字 並且不需要考慮前後文`)).toStrictEqual(EnumLineType.COMMENT_TAG);

	});

})
