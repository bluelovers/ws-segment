/**
 * Created by user on 2019/6/26.
 */
import { Segment } from '../Segment';
import getDefaultModList from '../mod/index';
import { useDefaultMods } from './mods';
import { useDefaultDicts } from './dict';

export interface IUseDefaultOptions
{
	all_mod?: boolean,
	nomod?: boolean,
	nodict?: boolean,
}

export function useDefault(segment: Segment, options: IUseDefaultOptions = {})
{

	// 识别模块
	!options.nomod && useDefaultMods(segment, options);

	// 字典文件
	!options.nodict && useDefaultDicts(segment, options);

	return segment;
}
