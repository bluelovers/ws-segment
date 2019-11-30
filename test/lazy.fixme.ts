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

import {
	tests_fixme_array,
	tests_fixme_base,
	tests_fixme_base_not,
	tests_fixme_indexof,
	tests_fixme_indexof_not,
} from './res/fixme.data';
import { Segment } from '../lib/Segment';
import { createSegment } from './lib';
import { IOptionsDoSegment } from '../lib/Segment';
import { lazyMatch, lazyMatch002, lazyMatchNot, lazyMatchSynonym001, mochaSetup, toStringArray } from './lib/util';
import { console } from 'debug-color2';

import yargs = require('yargs');

let cli = yargs
	.argv
;

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

	});

	afterEach(function ()
	{

	});

	beforeEach(function ()
	{
		currentTest = this.currentTest as ITest;

		//console.log('it:before', currentTest.title);
		//console.log('it:before', currentTest.fullTitle());
	});

	it(`don't care this fail`, function ()
	{
		// @ts-ignore
		if (cli.reporter && cli.reporter.indexOf('mochaIntellijReporter'))
		{
			this.skip();
		}

		throw new Error(`don't care this fail`)
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

//				console.debug(actual);

				lazyMatchSynonym001(actual, expected, args[2]);
			});
		});

	});

	// @ts-ignore
	describe(`tests_fixme_indexof_not`, () =>
	{
		tests_fixme_indexof_not.forEach(function (args)
		{
			it(args[0], function ()
			{
				let actual = Segment.stringify(doSegment(args[0]));

				let expected = args[1];

//				console.debug(actual);

				lazyMatchSynonym001(actual, expected, args[2]);
			});
		});

	});

	// @ts-ignore
	describe(`tests_fixme_base_not`, () =>
	{
		tests_fixme_base_not.forEach(function (args)
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

