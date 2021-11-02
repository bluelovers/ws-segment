import { console } from "debug-color2";
import { appendFile, outputFile } from "fs-extra";
import path from "upath2";
import { serialize } from '@novel-segment/loader-line';
import ProjectConfig from "../project.config";

import {
	all_default_load_dict,
	chkLineType,
	EnumLineType,
	getCjkName,
	globDict,
	ILoadDictFileRow2,
	loadDictFile,
	zhDictCompare,
} from './util';
import { array_unique } from 'array-hyper-unique';
import UString from 'uni-string/src/core';

let CWD = path.join(ProjectConfig.dict_root, 'segment');

let USE_CJK_MODE = 2;

let CACHE_LIST = {
	skip: [] as ILoadDictFileRow2[],
};

globDict(CWD, [
	...all_default_load_dict()
], [
	'char*',
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
	.mapSeries(async function (file)
	{
		let _basepath = path.relative(CWD, file);

		let bool: boolean = true;

		let list = await loadDictFile<ILoadDictFileRow2>(file, function (list, cur)
		{
			cur.file = file;

			let [w, p, f] = cur.data;

			if (w && UString.size(w) === 1)
			{
				CACHE_LIST.skip.push(cur);
				bool = false;

				return false;
			}

			return true;
		});

		if (bool)
		{
			return
		}

		console.debug(`[START]`, _basepath);

		let out_list = list.map(v => v.line);

		out_list = array_unique(out_list);

		let out_file = file;
		let out_data = serialize(out_list) + "\n\n";

		await outputFile(out_file, out_data);
	})
	.tap(async function ()
	{
		if (CACHE_LIST.skip.length)
		{
			let list = CACHE_LIST.skip;
			let out_list = list.map(v => v.line);

			let out_file = path.join(CWD, 'char.txt');

			await appendFile(out_file, "\n\n" + serialize(out_list) + "\n\n");
		}
	})
;
