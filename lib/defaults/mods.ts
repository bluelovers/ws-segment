import { IUseDefaultOptions } from './index';
import getDefaultModList from '../mod/index';

export function useDefaultMods(segment, options: IUseDefaultOptions = {})
{
	!options.nomod && segment.use(getDefaultModList(options.all_mod));

	return segment
}

