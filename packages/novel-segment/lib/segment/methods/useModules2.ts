import { _isIgnoreModules, useModules as _useModules } from './useModules';
import { ISubOptimizer } from '../../mod/Optimizer';
import { ISubTokenizer } from '../../mod/Tokenizer';
import * as BuildInSubMod from '../../submod';

export function useModules<T>(me: T, mod: ISubOptimizer | ISubTokenizer | any | string | (ISubTokenizer | ISubOptimizer | string)[], ...argv)
{
	if (Array.isArray(mod))
	{
		mod.forEach(function (m)
		{
			useModules(me as any, m, ...argv)
		});
	}
	else
	{
		if (typeof mod === 'string' && !_isIgnoreModules(me as any, mod, ...argv))
		{
			//mod = require(path.join(__dirname, '../..', 'submod', mod));
			//mod = require(`../../submod/${mod}`);

			mod = BuildInSubMod[mod]
		}

		_useModules(me as any, mod, ...argv)
	}

	return me;
}
