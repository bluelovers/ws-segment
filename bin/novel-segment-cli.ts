#!/usr/bin/env node

import yargs = require('yargs');
import { processFile, processText, SegmentCliError } from '../index';
import { checkUpdateSelf, checkUpdate } from '../lib/ncu';
import { console, getCacheDirPath, freeGC } from '../lib/util';
import bluebird = require('bluebird');
import path = require('upath2');
import * as fs from 'fs-extra';
import FastGlob = require('fast-glob');
import { array_unique } from 'array-hyper-unique';

let cli_argv: yargs.Arguments & {
	file: string[],
	text: string,
	mapSeries: boolean,
	overwrite: boolean,
	outDir: string,
	createDir: boolean,
	useGlobalCache: boolean,

	glob: string[],
};

// @ts-ignore
cli_argv = yargs
	.option('file', {
		alias: ['f'],
		requiresArg: true,
		normalize: true,
		array: true,
		group: 'file',
		desc: `處理的檔案，可同時處理多個檔案`,
	})
	.option('glob', {
		alias: ['g'],
		requiresArg: true,
		array: true,
		group: 'file',
	})
	.option('text', {
		alias: ['t'],
		requiresArg: true,
		group: 'text',
		desc: `處理的文字，可搭配其他 cli 程式一起使用`,
	})
	.option('mapSeries', {
		boolean: true,
		group: 'file',
		desc: `按照順序並且每次只處理一個檔案`,
	})
	.option('createDir', {
		boolean: true,
		group: 'file',
		desc: `允許當目標資料夾不存在時自動建立`,
	})
	.option('overwrite', {
		boolean: true,
	})
	.option('useGlobalCache', {
		boolean: true,
	})
	.option('outDir', {
		alias: ['o'],
		desc: `將處理後的結果儲存到目標資料夾`,
		requiresArg: true,
		normalize: true,
		group: 'file',
	})
	.version()
	.help()
	.argv
;

//console.log(cli_argv);

let err: Error | SegmentCliError;

bluebird.resolve()
	.tap(function ()
	{
		if (!cli_argv.text)
		{
			let k = [
					checkUpdateSelf(),
					checkUpdate('novel-segment'),
					checkUpdate('segment-dict'),
				]
				.forEach(function (data)
				{
					data.notify();
				})
			;
		}
	})
	.catchReturn(null)
	.then(async function ()
	{
		let options = {
			useGlobalCache: cli_argv.useGlobalCache
		};

		if (cli_argv.text)
		{
			console.log(await processText(cli_argv.text, options));
		}
		else if (cli_argv.file || cli_argv.glob)
		{
			if (cli_argv.outDir)
			{
				let k = path.resolve(cli_argv.outDir);

				let exists = fs.existsSync(cli_argv.outDir);

				if (!cli_argv.outDir
					|| (
						!cli_argv.createDir
						&& !exists
					)
					|| k === path.resolve(__dirname)
					|| k === path.resolve(path.join(__dirname, '..'))
				)
				{
					let msg = `不合法的 outDir 路徑 ${k}`;

					if (!exists)
					{
						msg += `，該目錄不存在`;
					}

					throw new SegmentCliError(msg)
				}
			}

			let files: string[] = cli_argv.file || [];

			if (cli_argv.glob && cli_argv.glob.length)
			{
				await FastGlob.async<string>(cli_argv.glob, {
					cwd: process.cwd(),
				})
					.then(ls => {
						if (ls.length)
						{
							files = files.concat(ls);
							files = array_unique(files);
						}
					})
			}

			freeGC();

			await (
				cli_argv.mapSeries ?
					bluebird.mapSeries(files, loopEach)
					: bluebird.map(files, loopEach)
			)
				.catch(setError)
				.tap(function ()
				{
					freeGC();
				})
			;

			async function loopEach(file: string, index: number, len: number)
			{
				return processFile(file, options)
					.tap(async function (text)
					{
						if (!text.length)
						{
							console.gray.info(`[${index+1}/${len}]`, file);
							return;
						}

						console.info(`[${index+1}/${len}]`, file);

						let p: Promise<any>;

						if (cli_argv.outDir)
						{
							p = fs.outputFile(path.join(cli_argv.outDir, path.basename(file)), text)
						}
						else
						{
							p = fs.writeFile(file, text);
						}

						return p
							.catch(setError)
							;
					})
					;
			}
		}
		else if (!err)
		{
			yargs.showHelp();
		}
	})
	.catch(setError)
	.catch(function (e)
	{
		if (e instanceof ErrorStop)
		{

		}
		else if (e instanceof SegmentCliError)
		{

		}
		else
		{
			return bluebird.reject(e)
		}
	})
	.then(function ()
	{
		if (err)
		{
//			yargs.showHelp();
			process.exit(1);
		}

		return null;
	})
;

function setError(e: Error | SegmentCliError)
{
	let lastError = err;
	err = e;

	if (e instanceof SegmentCliError)
	{
		console.error(e.message);
		return bluebird.reject(new ErrorStop(e, lastError));
	}
	else
	{
		return bluebird.reject(e)
	}
}

class ErrorStop extends Error
{
	currentError: SegmentCliError;
	lastError: Error | SegmentCliError;

	constructor(e: string | Error, lastError: Error | SegmentCliError)
	{
		if (typeof e == 'string')
		{
			super(e)
		}
		else
		{
			super();

			this.currentError = e;
			this.lastError = lastError;
		}
	}
}
