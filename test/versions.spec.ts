import _m1, { versions } from '../version';
import { version } from '../package.json';

test(`export version check`, () =>
{

	expect(_m1).toStrictEqual(versions['novel-segment']);
	expect(_m1).toStrictEqual(version);

});

test(`export versions check`, () =>
{

	expect(versions).toMatchObject({
		'novel-segment': expect.any(String),
		'segment-dict': expect.any(String),
		'regexp-cjk': expect.any(String),
		'cjk-conv': expect.any(String),
	});

});
