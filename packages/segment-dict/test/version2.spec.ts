import _m1 from '../version';
import { version } from '../';

test(`export version check`, () =>
{

	expect(_m1).toStrictEqual(version);

});
