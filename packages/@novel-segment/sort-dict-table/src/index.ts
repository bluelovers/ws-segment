import {
	chkLineType,
	EnumLineType,
	handleDictLines,
	ILoadDictFileRow2,
	USE_CJK_MODE,
} from '@novel-segment/util-compare';
import { load } from '@novel-segment/loader-line';
import { getCjkName, zhDictCompare } from '@novel-segment/util';
import { parseLine as parseFn } from '@novel-segment/loaders/segment/index';

export type IHandleDictTable = ILoadDictFileRow2

export interface IOptions
{
	cbIgnore?(cur: IHandleDictTable): any
}

export function sortLines(lines: string[], file?: string, options?: IOptions): IHandleDictTable[]
{
	const cbIgnore = options?.cbIgnore ?? (() => {});

	const list = handleDictLines<IHandleDictTable>(lines, function (list, cur)
	{
		cur.file = file;

		let [w, p, f] = cur.data;

		let cjk_id = getCjkName(w, USE_CJK_MODE);

		cur.cjk_id = cjk_id;
		cur.line_type = chkLineType(cur.line);

		if (cur.line_type === EnumLineType.COMMENT)
		{
			cbIgnore(cur);

			return false;
		}

		if (f > 15000)
		{
			//cur.line = [w, toHex(p), 0].join('|');
		}

		return true;
	}, {
		// @ts-ignore
		parseFn,
	});

	return SortList(list)
}

export function loadFile(file: string, options?: IOptions)
{
	return load(file).then(lines => sortLines(lines, file, options))
}

export function SortList<T extends ILoadDictFileRow2<any> = ILoadDictFileRow2>(ls: T[])
{
	return ls.sort(function (a: ILoadDictFileRow2, b: ILoadDictFileRow2)
	{
		if (
			a.line_type === EnumLineType.COMMENT_TAG
			|| b.line_type === EnumLineType.COMMENT_TAG
		)
		{
			return (a.index - b.index);
		}
		else if (
			a.line_type === EnumLineType.COMMENT
			|| b.line_type === EnumLineType.COMMENT
		)
		{
			return (a.index - b.index);
		}

		let ret = zhDictCompare(a.cjk_id, b.cjk_id)
			|| (a.index - b.index)
			|| 0
		;

		return ret;
	})
}

export default sortLines
