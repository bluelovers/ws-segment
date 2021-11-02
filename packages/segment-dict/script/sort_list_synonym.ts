import { array_unique } from 'array-hyper-unique';
import { console } from "debug-color2";
import { appendFile, outputFile } from "fs-extra";
import path from "upath2";
import { serialize } from '@novel-segment/loader-line';
import ProjectConfig from "../project.config";

import {
	chkLineType,
	EnumLineType,
	getCjkName,
	globDict,
	ILoadDictFileRow2,
	loadDictFile,
	zhDictCompare,
} from './util';

let CWD = path.join(ProjectConfig.dict_root, 'synonym');

let USE_CJK_MODE = 2;

let CACHE_LIST = {
	skip: [] as ILoadDictFileRow2<string[]>[],
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

		let list = await loadDictFile<ILoadDictFileRow2<string[]>>(file, function (list, cur)
		{
			cur.file = file;

			let [w] = cur.data;

			cur.line_type = chkLineType(cur.line);

			if (cur.line_type == EnumLineType.COMMENT)
			{
				w = w.replace(/^\/\//, '');

				//console.log(w);
			}
			else if (cur.line_type == EnumLineType.BASE)
			{
				let ls = cur.data.slice(1);

				ls = array_unique(ls).filter(v => v != w);
				//ls.sort();

				ls.sort(function (a, b)
				{
					let ca = getCjkName(a, USE_CJK_MODE);
					let cb = getCjkName(b, USE_CJK_MODE);

					return zhDictCompare(ca, cb)
					|| zhDictCompare(a, b)
				});

				cur.line = [w].concat(ls).join(',');

				if (!ls.length)
				{
					return false;
				}
			}

			let cjk_id = getCjkName(w, USE_CJK_MODE);

			cur.cjk_id = cjk_id;

			return true;
		}, {
			parseFn(line)
			{
				return line.split(',');
			},
		});

		list = SortList(list);

		let out_list = list.map(v => v.line);

		out_list = array_unique(out_list);

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

function SortList<T = ILoadDictFileRow2>(ls: T[])
{
	// @ts-ignore
	return ls.sort(function (a: ILoadDictFileRow2, b: ILoadDictFileRow2)
	{
		if (
			a.line_type == EnumLineType.COMMENT_TAG
			|| b.line_type == EnumLineType.COMMENT_TAG
		)
		{
			return (a.index - b.index);
		}
		else if (
			a.line_type == EnumLineType.COMMENT
			|| b.line_type == EnumLineType.COMMENT
		)
		{
			return (a.index - b.index);
		}

		let ret = zhDictCompare(a.cjk_id, b.cjk_id)
			|| zhDictCompare(b.data[0], a.data[0])
			|| (a.index - b.index)
			|| 0
		;

		return ret;
	})
}
