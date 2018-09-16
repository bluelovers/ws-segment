import { console } from "debug-color2";
import * as fs from "fs-extra";
import * as path from "upath2";
import { serialize } from '../../lib/loader/line';
import ProjectConfig from "../../project.config";

import { chkLineType, EnumLineType, getCjkName, globDict, ILoadDictFileRow2, loadDictFile } from './util';
import naturalCompare = require('string-natural-compare');

let CWD = path.join(ProjectConfig.dict_root, 'segment');

let USE_CJK_MODE = 2;

let CACHE_LIST = {
	skip: [] as ILoadDictFileRow2[],
};

globDict(CWD, [
	'dict_synonym/*.txt',
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

		console.debug(`[START]`, _basepath);

		console.time(_basepath);

		let list = await loadDictFile<ILoadDictFileRow2>(file, function (list, cur)
		{
			cur.file = file;

			let [w, p, f] = cur.data;

			let cjk_id = getCjkName(w, USE_CJK_MODE);

			cur.cjk_id = cjk_id;
			cur.line_type = chkLineType(cur.line);

			if (cur.line_type == EnumLineType.COMMENT)
			{
				CACHE_LIST.skip.push(cur);

				return false;
			}

			return true;
		});

		list = SortList( list);

		let out_list = list.map(v => v.line);

		//console.log(list);

		let out_file = file;

		if (0)
		{
			out_file = path.join(ProjectConfig.temp_root, path.basename(_basepath));
		}

		let out_data = serialize(out_list) + "\n\n";

		await fs.outputFile(out_file, out_data);

		console.timeEnd(_basepath);
	})
	.tap(async function ()
	{
		if (CACHE_LIST.skip.length)
		{
			let list = SortList( CACHE_LIST.skip);
			let out_list = list.map(v => v.line);

			let out_file = path.join(ProjectConfig.temp_root, 'skip2.txt');

			await fs.appendFile(out_file, "\n\n" + serialize(out_list) + "\n\n");
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

		let ret = naturalCompare.caseInsensitive(a.cjk_id, b.cjk_id)
			|| (a.index - b.index)
			|| 0
		;

		return ret;
	})
}
