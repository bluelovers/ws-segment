/**
 * Created by user on 2019/4/9.
 */

import {
	Segment,
	IWord,
	IDICT,
	IOptionsSegment,
	IDICT2,
	IDICT_STOPWORD,
	IDICT_SYNONYM,
	IOptionsDoSegment,
} from '../../lib/Segment';
import { assert, expect, chai } from '../_local-dev';

export function mochaSetup(mocha: Mocha.Context)
{
	mocha.timeout(30000);

	return mocha;
}

export function toStringArray<T extends IWord[]>(arr: T)
{
	return arr.map(function (w)
	{
		return w.w;
	});
}

export function lazyMatch(a: string[], b: string[] | (string | string[])[], options: {
	firstOne?: boolean,
} = {})
{
	let i: number = null;

	let bool = b.every(function (value, index, array)
	{
		let j: number = -1;
		let ii = i;

		if (i == null)
		{
			i = -1;
		}

		if (Array.isArray(value))
		{
			if (options.firstOne)
			{
				value.some(function (bb)
				{
					let jj = a.indexOf(bb, ii);

					if ((jj > -1) && (jj > i))
					{
						j = jj;

						return true
					}
				});
			}
			else
			{
				j = value.reduce(function (aa, bb)
				{
					let jj = a.indexOf(bb, ii);

					if ((jj > -1) && (jj > i))
					{
						if (aa == -1)
						{
							return jj;
						}

						return Math.min(jj, aa)
					}

					return aa;
				}, -1)
			}
		}
		else
		{
			j = a.indexOf(value, ii);
		}

		if ((j > -1) && (j > i))
		{
			i = j;

			return true;
		}
	});

	if (i === -1)
	{
		bool = false;
	}

	!bool && assert.fail(`expected ${chai.util.inspect(a)} to have include ordered members ${chai.util.inspect(b)}`);

	return bool;
}

export function lazyMatch002(a: string[], b_arr: Parameters<typeof lazyMatch>['1'][], options: {
	firstOne?: boolean,
} = {})
{
	let bool: boolean;

	for (let b of b_arr)
	{
		try
		{
			bool = lazyMatch(a, b, options);

			if (bool)
			{
				break;
			}
		}
		catch (e)
		{

		}
	}

	!bool && assert.fail(`expected ${chai.util.inspect(a)} to have include one of ordered members in ${chai.util.inspect(b_arr)}`);
}

export function lazyMatchSynonym001(a: string, b_arr: string[], options: {
	firstOne?: boolean,
} = {})
{
	let bool: boolean;
	let i: number = undefined;

	bool = b_arr.every(function (bb)
	{
		let ii = i;

		if (i == null)
		{
			i = -1;
		}

		let j = a.indexOf(bb, ii);

		if ((j > -1) && (j > i))
		{
			i = j;

			return true;
		}
		else if (i > -1)
		{
			assert.fail(`expected ${chai.util.inspect(a)} to have have ${chai.util.inspect(bb)} on index > ${i}, but got ${j}`);
		}
	});

	if (i === -1)
	{
		bool = false;
	}

	!bool && assert.fail(`expected ${chai.util.inspect(a)} to have index of ordered members in ${chai.util.inspect(b_arr)}`);
}

export default exports as typeof import('./util');
