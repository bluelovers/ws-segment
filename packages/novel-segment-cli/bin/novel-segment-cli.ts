#!/usr/bin/env node

/**
 * novel-segment-cli - 命令列工具主程式
 * Novel Segment CLI - Command-line Tool Main Program
 *
 * 此檔案為命令列工具的入口點，負責解析參數並執行分詞處理。
 * This file is the entry point for the command-line tool, responsible for parsing arguments and executing segmentation.
 */
import yargs from 'yargs';
import { processFile, processText, SegmentCliError } from '../index';
import { checkUpdateSelf, checkUpdate, notNpxMaybe } from '../lib/ncu';
import { console, getCacheDirPath, freeGC } from '../lib/util';
import bluebird from 'bluebird';
import path from 'upath2';
import fs from 'fs-iconv';
import FastGlob from '@bluelovers/fast-glob';
import { array_unique } from 'array-hyper-unique';

/**
 * 命令列參數介面
 * Command-line arguments interface
 */
let cli_argv: yargs.Arguments & {
	/** 待處理的檔案列表 / List of files to process */
	file: string[],
	/** 待處理的文字 / Text to process */
	text: string,
	/** 是否順序處理 / Whether to process sequentially */
	mapSeries: boolean,
	/** 是否覆蓋輸出 / Whether to overwrite output */
	overwrite: boolean,
	/** 輸出目錄 / Output directory */
	outDir: string,
	/** 是否建立目錄 / Whether to create directory */
	createDir: boolean,
	/** 是否使用全域快取 / Whether to use global cache */
	useGlobalCache: boolean,

	/** 是否轉換換行符號 / Whether to convert line breaks */
	crlf: boolean,
	/** 是否轉換為繁體中文 / Whether to convert to Traditional Chinese */
	convertToZhTw: boolean,

	/**Glob 匹配模式 / Glob matching pattern */
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
	.option('convertToZhTw', {
		boolean: true,
		desc: `是否在轉換後轉為繁體`,
	})
	.option('crlf', {
		boolean: true,
		desc: `轉換換行符號`,
	})
	.version()
	.help()
	.argv
;

//console.log(cli_argv);

/**
 * 錯誤儲存變數
 * Error storage variable
 */
let err: Error | SegmentCliError;

/**
 * 主程式流程
 * Main program flow
 */
bluebird.resolve()
	.tap(function ()
	{
		// 檢查更新（非 npx 模式下執行）/ Check for updates (when not running via npx)
		if (!cli_argv.text && notNpxMaybe(path.join(__dirname, '..')))
		{
			let k = [
					checkUpdateSelf(),
					checkUpdate('novel-segment'),
					checkUpdate('segment-dict'),
				]
				.forEach(function (data)
				{
					try
					{
						//data.notify();
					}
					catch (e)
					{

					}
				})
			;
		}
	})
	.catchReturn(null)
	.then(async function ()
	{
		// 建立選項物件 / Build options object
		let options = {
			useGlobalCache: cli_argv.useGlobalCache,
			convertToZhTw: cli_argv.convertToZhTw,
			crlf: cli_argv.crlf,
		};

		// 若無指定檔案或文字，則使用預設 glob / If no file or text specified, use default glob
		if (!cli_argv.text && !cli_argv.file)
		{
			cli_argv.glob = cli_argv.glob || ['*.txt'];
		}

		// 處理文字輸入 / Handle text input
		if (cli_argv.text)
		{
			console.log(await processText(cli_argv.text, options));
		}
		// 處理檔案或 glob 輸入 / Handle file or glob input
		else if (cli_argv.file || cli_argv.glob)
		{
			// 驗證輸出目錄 / Validate output directory
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

			// 收集所有待處理檔案 / Collect all files to process
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

			// 處理前先進行垃圾回收 / Perform garbage collection before processing
			freeGC();

			// 依序或並行處理所有檔案 / Process all files sequentially or in parallel
			await (
				cli_argv.mapSeries ?
					bluebird.mapSeries(files, loopEach)
					: bluebird.map(files, loopEach)
			)
				.catch(setError)
				.tap(function ()
				{
					// 處理完成後進行垃圾回收 / Perform garbage collection after processing
					freeGC();
				})
			;

			/**
			 * 處理單一檔案
			 * Process single file
			 */
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

						// 輸出到指定目錄或覆蓋原檔 / Output to specified directory or overwrite original file
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
			// 顯示說明資訊 / Show help information
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
		// 若有錯誤則退出程式 / Exit program if there are errors
		if (err)
		{
//			yargs.showHelp();
			process.exit(1);
		}

		return null;
	})
;

/**
 * 設定錯誤處理
 * Set error handler
 *
 * @param e - 錯誤物件 / Error object
 */
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

/**
 * 錯誤停止類別
 * Error Stop Class
 *
 * 用於標記需要停止執行的錯誤。
 * Used to mark errors that should stop execution.
 */
class ErrorStop extends Error
{
	/** 目前的錯誤 / Current error */
	currentError: SegmentCliError;
	/** 上一次的錯誤 / Last error */
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
