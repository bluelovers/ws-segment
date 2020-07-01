import FastGlob from '@bluelovers/fast-glob';
import { join, parse } from "path";
import __root from '../__root';
import { ISubOptimizer, ISubTokenizer } from '../lib/mod';
import { dirname } from 'path';
import { array_unique, array_unique_overwrite } from 'array-hyper-unique';
import SegmentCore from '../lib/segment/core';
import isUnset, { isSet } from '../lib/util/isUnset';
import * as SubmodList from '../lib/submod';

const segment = new SegmentCore;

describe(`check all files`, () =>
{

	const files = FastGlob
		.sync<string>([
			'!*.d.ts',
			'*.ts',
		], {
			cwd: join(__root, 'lib', 'submod'),
			absolute: true,
		})
	;

	FastGlob
		.sync<string>([
			'*/index.ts',
		], {
			cwd: join(__root, 'lib', 'submod'),
			absolute: true,
		})
		.forEach(m => {

			files.push(dirname(m))

		})
	;

	array_unique_overwrite(files);

	files.sort();

	files.forEach(row => {

		let name = parse(row).name;

		describe(name, () => {

			test(`import`, async (done) =>
			{
				const mod = await import(row);

				_check(mod, name);

				done();
			});

			test(`require`, async (done) =>
			{
				const mod = require(row);

				_check(mod, name);

				done();
			});

		})

	})

})

function _check(mod: ISubOptimizer | ISubTokenizer, name: string)
{
	expect(typeof mod).toStrictEqual('object');
	expect(typeof mod.init).toStrictEqual('function');


	let actual = mod.init(segment as any);
	// @ts-ignore
	let _mod: ISubOptimizer | ISubTokenizer = actual ?? mod;

	if (/Optimizer$/.test(name))
	{

		//expect(typeof (mod as ISubOptimizer).doOptimize).toStrictEqual('function');

		expect(mod).toHaveProperty('type', 'optimizer');

		_checkApi(_mod, name)

		if (isUnset(actual))
		{
			_checkApi(mod, name)
		}

	}
	else if (/Tokenizer$/.test(name))
	{
		//expect(typeof (mod as ISubTokenizer).split).toStrictEqual('function');

		expect(mod).toHaveProperty('type', 'tokenizer');

		_checkApi(_mod, name)

		if (isUnset(actual))
		{
			_checkApi(mod, name)
		}

	}
	else
	{
		expect(name).toMatch(/(?:Tokenizer|Optimizer)$/)
	}
}

describe(`submod index`, () =>
{

	Object.entries(SubmodList)
		.forEach(([name, mod]) => {

			test(name, () => {
				_check(mod as any, name);
			})

		})
	;

})

function _checkApi(mod: ISubOptimizer | ISubTokenizer, name: string)
{
	if (/Optimizer$/.test(name))
	{

		//expect(typeof (mod as ISubOptimizer).doOptimize).toStrictEqual('function');

		expect(mod).toHaveProperty('type', 'optimizer');

		expect(typeof (mod as ISubOptimizer).doOptimize).toStrictEqual('function');

	}
	else if (/Tokenizer$/.test(name))
	{
		//expect(typeof (mod as ISubTokenizer).split).toStrictEqual('function');

		expect(mod).toHaveProperty('type', 'tokenizer');

		expect(typeof (mod as ISubTokenizer).split).toStrictEqual('function');

	}
	else
	{
		expect(name).toMatch(/(?:Tokenizer|Optimizer)$/)
	}
}
