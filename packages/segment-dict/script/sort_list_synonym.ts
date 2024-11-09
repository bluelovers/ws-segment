import { array_unique } from 'array-hyper-unique';
import { console } from "debug-color2";
import { appendFile, outputFile } from "fs-extra";
import path from "upath2";
import { serialize } from '@novel-segment/loader-line';
import { dict_root } from "../project.config";

import { getCjkName, globDict, zhDictCompare } from './util';
import {
	chkLineType,
	EnumLineType,
	ILoadDictFileRow2,
	loadDictFile,
	stringifyHandleDictLinesList,
} from '@novel-segment/util-compare';
import { IHandleDictSynonym, loadFile, SortList } from '@novel-segment/sort-synonym';

let CWD = path.join(dict_root, 'synonym');

let USE_CJK_MODE = 2;

let CACHE_LIST = {
	skip: [] as IHandleDictSynonym[],
};

globDict(CWD, [
	'synonym.txt',
	'zht.synonym.txt',
	'*.synonym.txt',
])
	.tap(function (ls: string[])
	{
		let a = ls.reduce(function (a, v)
		{
			let p = path.relative(CWD, v);

			a.push(p);

			return a;
		}, []);

		console.debug(a);

		//process.exit();
	})
	.mapSeries(async function (file: string)
	{
		let _basepath = path.relative(CWD, file);

		console.debug(`[START]`, _basepath);

		console.time(_basepath);

		let list = await loadFile(file);

		let out_list = stringifyHandleDictLinesList(list);

		//console.log(list);

		let out_file = file;

		if (0)
		{
			out_file = path.join(ProjectConfig.temp_root, path.basename(_basepath));
		}

		let out_data = serialize(out_list) + "\n\n\n";

		await outputFile(out_file, out_data);

		console.timeEnd(_basepath);
	})
	.tap(async function ()
	{
		if (CACHE_LIST.skip.length)
		{
			let list = SortList(CACHE_LIST.skip);
			let out_list = list.map(v => v.line);

			let out_file = path.join(ProjectConfig.temp_root, 'skip2.txt');

			await appendFile(out_file, "\n\n" + serialize(out_list) + "\n\n");
		}
	})
;

