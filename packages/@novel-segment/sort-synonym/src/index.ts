
import {
	chkLineType,
	EnumLineType,
	handleDictLines,
	ILoadDictFileRow2,
	USE_CJK_MODE,
} from '@novel-segment/util-compare';
import { array_unique } from 'array-hyper-unique';
import { ArrayTwoOrMore } from '@novel-segment/types';
import { load } from '@novel-segment/loader-line';
import { getCjkName, zhDictCompare } from '@novel-segment/util';

export type IHandleDictSynonym = ILoadDictFileRow2<ArrayTwoOrMore<string>>

export function sortLines(lines: string[], file?: string)
{
	const list = handleDictLines<IHandleDictSynonym>(lines, function (list, cur)
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

		const cjk_id = getCjkName(w, USE_CJK_MODE);

		cur.cjk_id = cjk_id;

		return true;
	}, {
		parseFn(line)
		{
			return line.split(',') as ArrayTwoOrMore<string>;
		},
	});

	return SortList(list)
}

export function loadFile(file: string)
{
	return load(file).then(lines => sortLines(lines, file))
}

export function SortList<T extends ILoadDictFileRow2<any> = ILoadDictFileRow2>(ls: T[])
{
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

export default sortLines
