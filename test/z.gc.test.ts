/**
 * Created by User on 2019/6/12.
 */

/// <reference types="mocha" />
/// <reference types="benchmark" />
/// <reference types="chai" />
/// <reference types="node" />

import { chai, relative, expect, path, assert, util, mochaAsync } from './_local-dev';
import { mochaSetup, toStringArray } from './lib/util';
import { createSegment } from './lib';
import { Segment } from '../lib';
import { console } from 'debug-color2';
import fixedGC from './res/gc.data';
import { IOptionsDoSegment } from '../lib/Segment';

console.setOptions({
	label: true,
});

// @ts-ignore
describe(relative(__filename), () =>
{
	let currentTest: Mocha.Test;

	let segment: Segment = null;

	before(function ()
	{
		this.timeout(60000);

		segment = createSegment(true, {
			disableModules: [
				//ENUM_SUBMODS.ZhtSynonymOptimizer,
			]
		});
	});

	beforeEach(function ()
	{
		currentTest = this.currentTest;

		//console.log('it:before', currentTest.title);
		//console.log('it:before', currentTest.fullTitle());
	});

	// @ts-ignore
	describe(`suite`, () =>
	{

		fixedGC.forEach(text => {

			// @ts-ignore
			it(text, function ()
			{

				let actual = toStringArray(doSegment(text));

				console.debug(actual.join('/'));

			});

		})

	});

	function doSegment(a: string, options?: IOptionsDoSegment)
	{
		return segment.doSegment(a, {
			...options,
		})
	}
});
