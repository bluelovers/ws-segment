import FastGlob from '@bluelovers/fast-glob';
import naturalCompare from '@bluelovers/string-natural-compare';

import { getCjkName, zhDictCompare } from '@novel-segment/util';
import BluebirdPromise from 'bluebird';
import { ILoadDictFileRow2 } from '@novel-segment/util-compare';

export { zhDictCompare, getCjkName }

export const DEFAULT_IGNORE = [
	//'char*',
	'**/skip',
	'**/jieba',
	'**/lazy',
	'**/synonym',
	'**/names',
];

export function globDict(cwd: string, pattern?: string[], ignore = DEFAULT_IGNORE)
{
	return BluebirdPromise
		.resolve<string[]>(FastGlob(pattern, {
			cwd,
			absolute: true,
			ignore,
			markDirectories: true,
		}))
		;
}

export function baseSortList<T = ILoadDictFileRow2>(ls: T[], bool?: boolean)
{
	return ls.sort(function (a, b)
	{
		// @ts-ignore
		return naturalCompare.caseInsensitive(a.cjk_id, b.cjk_id)
			// @ts-ignore
			|| naturalCompare.caseInsensitive(a.data[1], b.data[1])
			// @ts-ignore
			|| naturalCompare.caseInsensitive(a.data[0], b.data[0])
			// @ts-ignore
			|| naturalCompare.caseInsensitive(a.data[2], b.data[2])
			;
	});
}

export function all_default_load_dict()
{
	return [
		'dict_synonym/*.txt',
		'names/*.txt',
		'lazy/*.txt',
		'dict*.txt',
		'phrases/*.txt',
		'pangu/*.txt',
		'char.txt',
	] as const;
}

export function all_extra_dict()
{
	return [
		'infrequent/**/*.txt',
	] as const;
}

/*
export function getCjkName(w: string, USE_CJK_MODE: number)
{
	let cjk_id = w;

	if (1)
	{
		cjk_id = slugify(w, true);
	}
	else if (USE_CJK_MODE > 1)
	{
		let cjk_list = textList(w);
		cjk_list.sort();
		cjk_id = cjk_list[0];
	}
	else if (USE_CJK_MODE)
	{
		let cjk_list = libTable.auto(w);
		cjk_list.sort();
		cjk_id = cjk_list[0];
	}

	return StrUtil.toHalfWidth(cjk_id);
}
*/

//console.log(['第', '一', 'Ｔ', '网开一面', '三街六市'].sort(zhDictCompare));
