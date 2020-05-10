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
	describe(`干支`, function ()
	{

		`甲子|乙丑|丙寅|丁卯|戊辰|己巳|庚午|辛未|壬申|癸酉|甲戌|乙亥|丙子|丁丑|戊寅|己卯|庚辰|辛巳|壬午|癸未|甲申|乙酉|丙戌|丁亥|戊子|己丑|庚寅|辛卯|壬辰|癸巳|甲午|乙未|丙申|丁酉|戊戌|己亥|庚子|辛丑|壬寅|癸卯|甲辰|乙巳|丙午|丁未|戊申|己酉|庚戌|辛亥|壬子|癸丑|甲寅|乙卯|丙辰|丁巳|戊午|己未|庚申|辛酉|壬戌|癸亥|寅月|丙寅月|戊寅月|庚寅月|壬寅月|甲寅月|卯月|丁卯月|己卯月|辛卯月|癸卯月|乙卯月|辰月|戊辰月|庚辰月|壬辰月|甲辰月|丙辰月|巳月|己巳月|辛巳月|癸巳月|乙巳月|丁巳月|午月|庚午月|壬午月|甲午月|丙午月|戊午月|未月|辛未月|癸未月|乙未月|丁未月|己未月|申月|壬申月|甲申月|丙申月|戊申月|庚申月|酉月|癸酉月|乙酉月|丁酉月|己酉月|辛酉月|戌月|甲戌月|丙戌月|戊戌月|庚戌月|壬戌月|亥月|乙亥月|丁亥月|己亥月|辛亥月|癸亥月|子月|丙子月|戊子月|庚子月|壬子月|甲子月|丑月|丁丑月|己丑月|辛丑月|癸丑月|乙丑月`.split('|')
			.forEach(text => {

			// @ts-ignore
			it(text, function ()
			{
				let actual = toStringArray(doSegment(text));

				expect(actual).length.gt(0).lte(2);

				if (actual.length === 2)
				{
					expect(actual).to.have.deep
						.property('1', '月')
					;

					if (actual[0].length === 1)
					{
						expect(actual[0]).length.gt(1)
					}
				}
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
