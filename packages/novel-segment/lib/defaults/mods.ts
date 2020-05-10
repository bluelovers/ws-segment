import { IUseDefaultOptions, IUseDefaultOptionsMods } from './index';
import getDefaultModList from '../mod/index';

export function useDefaultMods(segment, options: IUseDefaultOptionsMods = {})
{
	!options.nomod && segment.use(getDefaultModList(options.all_mod));

	return segment
}

