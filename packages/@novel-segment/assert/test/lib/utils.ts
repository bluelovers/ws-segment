import { lazyMatch002, IOptionsLazyMatch, lazyMatch, lazyMatchSynonym001, lazyMatchSynonym001Not, lazyMatchNot } from '../../src';
import { ITSRequireAtLeastOne } from 'ts-type';

jest.setTimeout(10000);

export type ITestSuiteData = ITSRequireAtLeastOne<{
	tests_base: Parameters<typeof lazyMatch>[]
	tests_base_not: Parameters<typeof lazyMatchNot>[],

	tests_array: Parameters<typeof lazyMatch002>[],

	tests_indexof: Parameters<typeof lazyMatchSynonym001>[],
	tests_indexof_not: Parameters<typeof lazyMatchSynonym001Not>[],
}>;

export function _testSuite(testSuiteData: ITestSuiteData, testSuiteOptions?: {
	strict?: boolean,

	mode2?: boolean,
	strict2?: boolean,
}) {
	test.skip(`dummy`, () => { });

	testSuiteOptions ??= {};

	describe(`base`, () => {

		_subTestEach(`lazyMatch`, lazyMatch, testSuiteData.tests_base, {
			strict: testSuiteOptions.strict,
		});
		_subTestEach(`lazyMatchNot`, lazyMatchNot, testSuiteData.tests_base_not, {
			strict: testSuiteOptions.strict,
		});

		_subTestEach(`lazyMatch002`, lazyMatch002, testSuiteData.tests_array, {
			strict: testSuiteOptions.strict,
		});

		_subTestEach(`lazyMatchSynonym001`, lazyMatchSynonym001, testSuiteData.tests_indexof, {
			strict: testSuiteOptions.strict,
		});
		_subTestEach(`lazyMatchSynonym001Not`, lazyMatchSynonym001Not, testSuiteData.tests_indexof_not, {
			strict: testSuiteOptions.strict,
		});

	});

	if (testSuiteOptions.mode2)
	{
		describe(`reverse`, () => {
			_subTestEach(`lazyMatch:02`, lazyMatch, testSuiteData.tests_base_not, {
				strict: testSuiteOptions.strict2,
			});
			_subTestEach(`lazyMatchNot:02`, lazyMatchNot, testSuiteData.tests_base, {
				strict: testSuiteOptions.strict2,
			});

			_subTestEach(`lazyMatchSynonym001:02`, lazyMatchSynonym001, testSuiteData.tests_indexof_not, {
				strict: testSuiteOptions.strict2,
			});
			_subTestEach(`lazyMatchSynonym001Not:02`, lazyMatchSynonym001Not, testSuiteData.tests_indexof, {
				strict: testSuiteOptions.strict2,
			});
		})
	}
}

export function _handleOptions(options: IOptionsLazyMatch) {
	return {
		...options,
		notThrowError: true
	}
}

export function _subTestEach<T extends (...args: any) => any>(testName: string, fnTest: T, testData: (Parameters<T>)[], runtimeOptions?: {
	fnHook?: (actual: ReturnType<T>, runtimeData: {
		title: string,
		fnTest: T,
	}) => void,
	strict?: boolean,
})
{
	describe(testName, () => {

		if (testData?.length)
		{
			// @ts-ignore
			testData.forEach(([a, b, options]) => {

				const title = Array.isArray(a) ? a.join('') : a;

				test(title, () => {
					options = _handleOptions(options);

					let actual = fnTest(a, b, options);

					if (Array.isArray(a))
					{
						actual.ret = a.join('/');
					}

					expect(actual).toMatchSnapshot();

					if (typeof runtimeOptions?.strict === 'boolean')
					{
						expect(actual).toHaveProperty('matched', runtimeOptions.strict);
					}

					runtimeOptions?.fnHook?.(actual, {
						title,
						fnTest,
					});
				})
			})
		}
		else
		{

		}
	})
}
