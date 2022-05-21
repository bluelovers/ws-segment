//@noUnusedParameters:false

import { basename, extname, resolve } from 'path';
import { sortLines, loadFile } from "../src/index";
import { load, loadSync, serialize } from '@novel-segment/loader-line';
import { stringifyHandleDictLinesList } from '@novel-segment/util-compare';
import _random from 'random-extra'
import { IHandleDictSynonym } from '../src/index';
import { newRngSeedRandom } from '@lazy-random/util-test';

const random = _random.newUse(newRngSeedRandom());

beforeEach(async () =>
{
	random.seed('ZDJjM2IyNmFlNmVjNWQwMGZkMmY1Y2Nk');
});

describe(basename(__filename, extname(__filename)), () =>
{
	test.skip(`dummy`, () => {});

	[
		'./fixture/synonym.txt',
		'./fixture/synonym2.txt',
		'./fixture/synonym3.txt',
		'./fixture/synonym4.txt',
	].forEach(name =>
	{

		describe(name, () =>
		{
			const file = resolve(__dirname, name);

			const lines = loadSync(file);

			let expected = serialize(lines.flat());

			test(`default`, () =>
			{
				const input = lines.flat();

				let actual_results = sortLines(input, name);

				let actual = stringifyHandleDictLinesList(actual_results);

				//expect(actual_results).toMatchSnapshot();

				expect(serialize(actual)).toStrictEqual(expected);

				expect(actual).toMatchSnapshot();
			});

			test.skip(`shuffle`, () =>
			{
				const fn = random.dfArrayShuffle(lines.flat(), false);

				let actual_results: IHandleDictSynonym[];
				let actual: string[];

				for (let i = 1; i < 10; i++)
				{
					const input = fn();

					actual_results = sortLines(input, name);
					actual = stringifyHandleDictLinesList(actual_results);

					const out = serialize(actual);

					expect(out).toMatchSnapshot();
					expect(out).toStrictEqual(expected);
				}

				actual_results.forEach(line =>
				{
					delete line.index;
				});

				expect(actual_results).toMatchSnapshot();
				expect(actual).toMatchSnapshot();
			});

		});

	});

})
