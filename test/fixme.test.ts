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

import {tests_fixme_array, tests_fixme_base, tests_fixme_indexof } from './res/fixme';
import { Segment } from '../lib';
import { createSegment } from './lib';
import { IOptionsDoSegment } from '../lib/Segment';
import { lazyMatch, lazyMatch002, lazyMatchSynonym001, mochaSetup, toStringArray } from './lib/util';
import { console } from 'debug-color2';

// @ts-ignore
describe(relative(__filename), () =>
{
	let currentTest: ITest;

	let segment: Segment = null;

	before(function ()
	{
		//this.skip();

		mochaSetup(this);

		segment = createSegment(true, {
			disableModules: [
				//ENUM_SUBMODS.ZhtSynonymOptimizer,
			]
		});
	});

	after(function ()
	{
		process.exitCode = 0
	});

	afterEach(function ()
	{
		process.exitCode = 0
	});

	beforeEach(function ()
	{
		currentTest = this.currentTest as ITest;

		//console.log('it:before', currentTest.title);
		//console.log('it:before', currentTest.fullTitle());
	});

	// @ts-ignore
	describe(`tests_fixme_base`, () =>
	{
		tests_fixme_base.forEach(function (args)
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
	describe(`tests_fixme_array`, () =>
	{
		tests_fixme_array.forEach(function (args)
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
	describe(`tests_fixme_indexof`, () =>
	{
		tests_fixme_indexof.forEach(function (args)
		{
			it(args[0], function ()
			{
				let actual = Segment.stringify(doSegment(args[0]));

				let expected = args[1];

				console.debug(actual);

				lazyMatchSynonym001(actual, expected, args[2]);

				process.exitCode = 0
			});

			process.exitCode = 0
		});
	});

	function doSegment(a: string, options?: IOptionsDoSegment)
	{
		return segment.doSegment(a, {
			...options,
		})
	}
});

