
import { lazyMatch002, IOptionsLazyMatch, lazyMatch, lazyMatchSynonym001, lazyMatchSynonym001Not, lazyMatchNot } from '../../src'
import { _testSuite, ITestSuiteData } from '../lib/utils';
import { stringify } from '@novel-segment/stringify';
import { Segment } from '../../../../novel-segment/lib/Segment';
import { createSegment } from '../../../../novel-segment/test/lib';
import { toStringArray } from '../../../../novel-segment/test/lib/util';

import {
	tests_fixme_array,
	tests_fixme_base,
	tests_fixme_base_not,
	tests_fixme_indexof,
	tests_fixme_indexof_not,
} from '../../../../novel-segment/test/res/fixme.data';

describe(`fixme:data`, () => {

	let testSuiteData: ITestSuiteData;
	let segment = createSegment(true, {
			disableModules: [
				//ENUM_SUBMODS.ZhtSynonymOptimizer,
			]
		});



		testSuiteData = {
			tests_base: tests_fixme_base.map(arr => {

				let text = arr[0];

				return [
					toStringArray(segment.doSegment(text)),
					...arr.slice(1),
				]
			}) as any,
			tests_base_not: tests_fixme_base_not.map(arr => {

				let text = arr[0];

				return [
					toStringArray(segment.doSegment(text)),
					...arr.slice(1),
				]
			}) as any,

			tests_array: tests_fixme_array.map(arr => {

				let text = arr[0];

				return [
					toStringArray(segment.doSegment(text)),
					...arr.slice(1),
				]
			}) as any,

			tests_indexof: tests_fixme_indexof.map(arr => {

				let text = arr[0];

				return [
					stringify(segment.doSegment(text)),
					...arr.slice(1),
				]
			}) as any,
			tests_indexof_not: tests_fixme_indexof_not.map(arr => {

				let text = arr[0];

				return [
					stringify(segment.doSegment(text)),
					...arr.slice(1),
				]
			}) as any,
		}

	_testSuite(testSuiteData, {
		// strict: true,
		// mode2: true,
		// strict2: false,
	});
});
