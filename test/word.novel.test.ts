/**
 * Created by user on 2019/4/9.
 */

/// <reference types="mocha" />
/// <reference types="benchmark" />
/// <reference types="chai" />
/// <reference types="node" />

import { chai, relative, expect, path, assert, util, mochaAsync } from './_local-dev';

// @ts-ignore
import { ITest } from 'mocha';

import { tests_lazy_novel_indexof, tests_lazy_novel_array, tests_lazy_novel_base, tests_lazy_novel_base_not } from './res/lazy.novel';
import { Segment } from '../lib/Segment';
import { createSegment } from './lib';
import { IOptionsDoSegment } from '../lib/Segment';
import { lazyMatch, lazyMatch002, lazyMatchNot, lazyMatchSynonym001, mochaSetup, toStringArray } from './lib/util';
import { console } from 'debug-color2';
import { useDefaultSynonymDict } from '../lib/defaults/dict';

console.setOptions({
	label: true,
});

// @ts-ignore
describe(relative(__filename), () =>
{
	let currentTest: ITest;

	let segment: Segment = null;

	before(function ()
	{
		mochaSetup(this);

		segment = createSegment(true, {
			disableModules: [
				//ENUM_SUBMODS.ZhtSynonymOptimizer,
			]
		});

		segment.DICT.SYNONYM = {};

		useDefaultSynonymDict(segment, {
			nodeNovelMode: true,
		});
	});

	beforeEach(function ()
	{
		currentTest = this.currentTest as ITest;

		//console.log('it:before', currentTest.title);
		//console.log('it:before', currentTest.fullTitle());
	});

	// @ts-ignore
	describe(`tests_lazy_novel_base`, () =>
	{
		tests_lazy_novel_base.forEach(function (args)
		{
			it(args[0], function ()
			{
				let actual = toStringArray(doSegment(args[0]));

				let expected = args[1];

				console.debug(actual.join('/'));

				lazyMatch(actual, expected, args[2]);
			});
		});
	});

	// @ts-ignore
	describe(`tests_lazy_novel_array`, () =>
	{
		tests_lazy_novel_array.forEach(function (args)
		{
			it(args[0], function ()
			{
				let actual = toStringArray(doSegment(args[0]));

				let expected = args[1];

				console.debug(actual.join('/'));

				lazyMatch002(actual, expected, args[2]);
			});
		});
	});

	// @ts-ignore
	describe(`tests_lazy_novel_indexof`, () =>
	{
		tests_lazy_novel_indexof.forEach(function (args)
		{
			it(args[0], function ()
			{
				let actual = Segment.stringify(doSegment(args[0]));

				let expected = args[1];

				console.debug(actual);

				lazyMatchSynonym001(actual, expected, args[2]);
			});
		});



	});

	// @ts-ignore
	describe(`tests_lazy_novel_base_not`, () =>
	{
		tests_lazy_novel_base_not.forEach(function (args)
		{
			it(args[0], function ()
			{
				let actual = toStringArray(doSegment(args[0]));

				let expected = args[1];

				console.debug(actual.join('/'));

				lazyMatchNot(actual, expected, args[2]);
			});
		});
	});

	function doSegment(a: string, options?: IOptionsDoSegment)
	{
		return segment.doSegment(a, {
			...options,
		})
	}
});

