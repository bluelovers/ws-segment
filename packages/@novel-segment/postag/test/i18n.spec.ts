import { chsName } from '../lib/i18n';

describe(`chsName`, () =>
{

	test(`0x00000008 | 0x00000010`, () =>
	{

		let actual = chsName(0x00000008 | 0x00000010);

		expect(actual).toMatchSnapshot();

	});

})
