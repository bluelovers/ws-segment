import { array_unique } from 'array-hyper-unique';
import { console } from "debug-color2";
import { outputFile } from "fs-extra";
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

let CWD = path.join(ProjectConfig.dict_root, 'blacklist');

let USE_CJK_MODE = 2;

let CACHE_LIST = {
	skip: [] as ILoadDictFileRow2<string[]>[],
};

globDict(CWD, [
	'*.txt',
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

		let list = await loadDictFile<ILoadDictFileRow2<string>>(file, function (list, cur)
		{
			cur.file = file;

			let w = cur.data;

			cur.line_type = chkLineType(cur.line);

			if (cur.line_type == EnumLineType.COMMENT)
			{
				w = w.replace(/^\/\//, '');

				//console.log(w);
			}

			if (!cur.line.length)
			{
				return false;
			}

			let cjk_id = getCjkName(w, USE_CJK_MODE);

			cur.cjk_id = cjk_id;

			return true;
		}, {
			parseFn(line)
			{
				return line.trim();
			},
		});

		list = SortList(list);

		let out_list = list
			.filter(v => v.line != '')
			.map(v => v.line)
		;

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
			|| zhDictCompare(b.line, a.line)
			|| (a.index - b.index)
			|| 0
		;

		return ret;
	})
}
