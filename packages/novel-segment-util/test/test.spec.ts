import { zhDictCompare } from '../sort';

test(`zhDictCompare`, () =>
{

	let actual = ['10', '1'].sort(zhDictCompare);;
	let expected;

	expect(actual).toStrictEqual(['1', '10']);
	//expect(actual).toBeInstanceOf(Date);
	expect(actual).toMatchSnapshot();

});

