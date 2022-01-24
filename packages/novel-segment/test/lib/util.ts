/**
 * Created by user on 2019/4/9.
 */

import { IWord } from '../../lib/Segment';
import tests_lazy_index from '../res/lazy.index';
import { zhDictCompare } from '@novel-segment/util';
import { assert, chai } from '../_local-dev';
import * as  _ from '@novel-segment/assert';

function _wrapFn<T extends typeof _.lazyMatch | typeof _.lazyMatch002 | typeof _.lazyMatchNot | typeof _.lazyMatchSynonym001>(fn: T): T
{
	return ((...argv: Parameters<T>) => {
		argv[2] = {
			...(argv[2] ?? {}),
		};
		argv[2].inspectFn ??= chai.util.inspect;
		// @ts-ignore
		return fn(...argv)
	}) as T
}

export const lazyMatch = _wrapFn(_.lazyMatch);
export const lazyMatch002 = _wrapFn(_.lazyMatch002);
export const lazyMatchNot = _wrapFn(_.lazyMatchNot);
export const lazyMatchSynonym001 = _wrapFn(_.lazyMatchSynonym001);
export const lazyMatchSynonym001Not = _wrapFn(_.lazyMatchSynonym001Not);

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

export default exports as typeof import('./util');

export function sortTests<T extends typeof tests_lazy_index['tests_lazy_base'] | typeof tests_lazy_index['tests_lazy_base_not'] | typeof tests_lazy_index['tests_lazy_array'] | typeof tests_lazy_index['tests_lazy_indexof']>(list: T)
{
	list.sort(function (a, b)
	{
		return zhDictCompare(String(a[1]), String(b[1]))
			|| zhDictCompare(a[0], b[0])
	})
}
