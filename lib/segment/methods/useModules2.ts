import { _isIgnoreModules, useModules as _useModules } from './useModules';
import { ISubOptimizer } from '../../mod/Optimizer';
import { ISubTokenizer } from '../../mod/Tokenizer';
import * as path from "path";

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
		if (!_isIgnoreModules(me as any, mod, ...argv) && typeof mod == 'string')
		{
			//mod = require(path.join(__dirname, '../..', 'submod', mod));
			mod = require(`../../submod/${mod}`);
		}

		_useModules(me as any, mod, ...argv)
	}

	return me;
}
