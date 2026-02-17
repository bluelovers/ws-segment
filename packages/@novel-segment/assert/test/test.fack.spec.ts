
import { lazyMatch002, IOptionsLazyMatch, lazyMatch, lazyMatchSynonym001, lazyMatchSynonym001Not, lazyMatchNot } from '../src'

jest.setTimeout(10000);

/**
 * 本測試數據並非代表正確的分詞結果，僅用來測試 assert lazyMatch 系列函數的結果
 */
const tests_base: Parameters<typeof lazyMatch>[] = [

	[
		['胡锦涛', '出席', 'APEC', '领导人', '会议', '后', '回京'],
		['会议', '回京'],
	],

	[
		['胡锦涛', '出席', 'APEC', '领导人', '会议', '后', '回京'],
		[['會議', '会议'], '回京'],
	],

	[
		['在', '這裡', '有', '兩具', '自動', '人偶', '隨侍', '在', '側', '的', '烏列爾'],
		[['會議', '会议'], '回京'],
	],

];

/**
 * 本測試數據並非代表正確的分詞結果，僅用來測試 assert lazyMatch 系列函數的結果
 */
const tests_base_not: Parameters<typeof lazyMatchNot>[] = [

	...tests_base,

	[
		['這', '份', '毫不', '守舊', '的', '率直'],
		[['份毫', '份', '毫']],
	],

	[
		['這', '份', '毫不', '守舊', '的', '率直'],
		['份', '毫'],
	],

];

/**
 * 本測試數據並非代表正確的分詞結果，僅用來測試 assert lazyMatch 系列函數的結果
 */
const tests_array: Parameters<typeof lazyMatch002>[] = [

	[
		['在', '這裡', '有', '兩具', '自動', '人偶', '隨侍', '在', '側', '的', '烏列爾'],
		[
			['兩具', '自動', '人偶', '隨侍'],
			['兩具', '自動人偶', '隨侍'],
		],
	],

	[
		['在', '這裡', '有', '兩具', '胡锦涛', '人偶', '隨侍'],
		[
			['兩具', '自動', '人偶', '隨侍'],
			['兩具', '自動人偶', '隨侍'],
		],
	],

];

/**
 * 本測試數據並非代表正確的分詞結果，僅用來測試 assert lazyMatch 系列函數的結果
 */
export const tests_indexof: Parameters<typeof lazyMatchSynonym001>[] = [

	[
		'大家干的好',
		['幹'],
	],

	[
		'大家干的好',
		[['幹', '干']],
	],

];

/**
 * 本測試數據並非代表正確的分詞結果，僅用來測試 assert lazyMatch 系列函數的結果
 */
export const tests_indexof_not: Parameters<typeof lazyMatchSynonym001Not>[] = [

	...tests_indexof,

	[
		'那是里靈魂的世界。',
		['裡'],
	],

	[
		'那是里靈魂的世界。',
		[['裡', '里']],
	],

];

describe(`fakeData`, () => {
	_testSuite({
		tests_base,
		tests_base_not,

		tests_array,

		tests_indexof,
		tests_indexof_not,
	});
});

function _testSuite(data: {
	tests_base: Parameters<typeof lazyMatch>[]
	tests_base_not: Parameters<typeof lazyMatchNot>[],

	tests_array: Parameters<typeof lazyMatch002>[],

	tests_indexof: Parameters<typeof lazyMatchSynonym001>[],
	tests_indexof_not: Parameters<typeof lazyMatchSynonym001Not>[],
}) {
	test.skip(`dummy`, () => { });

	tests_base?.length && _subTestEach(`lazyMatch`, lazyMatch, tests_base);
	tests_base_not?.length && _subTestEach(`lazyMatchNot`, lazyMatchNot, tests_base_not);

	tests_array?.length && _subTestEach(`lazyMatch002`, lazyMatch002, tests_array);

	tests_indexof?.length && _subTestEach(`lazyMatchSynonym001`, lazyMatchSynonym001, tests_indexof);
	tests_indexof_not?.length && _subTestEach(`lazyMatchSynonym001Not`, lazyMatchSynonym001Not, tests_indexof_not);
}

function _handleOptions(options: IOptionsLazyMatch) {
	return {
		...options,
		notThrowError: true
	}
}

function _subTestEach<T extends (...args: any) => any>(testName: string, fnTest: T, testData: (Parameters<T>)[]) {
	describe(testName, () => {

		// @ts-ignore
		testData.forEach(([a, b, options]) => {

			const title = Array.isArray(a) ? a.join('') : a;

			test(title, () => {
				options = _handleOptions(options);

				expect(fnTest(a, b, options)).toMatchSnapshot();
			})
		})

	})
}
