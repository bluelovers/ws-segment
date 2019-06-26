import { _isIgnoreModules, useModules as _useModules } from './useModules';
import SegmentCore from '../core';
import Segment from '../../Segment';
import { ISubOptimizer } from '../../mod/Optimizer';
import { ISubTokenizer } from '../../mod/Tokenizer';
import * as path from "path";

export function useModules<T extends SegmentCore | Segment>(me: T, mod: ISubOptimizer | ISubTokenizer | any | string | (ISubTokenizer | ISubOptimizer | string)[], ...argv)
{
	if (Array.isArray(mod))
	{
		mod.forEach(function (m)
		{
			_useModules(me, mod, ...argv)
		});
	}
	else
	{
		if (!_isIgnoreModules(me, mod, ...argv) && typeof mod == 'string')
		{
			//console.log('module', mod);
			// @ts-ignore
			let filename = path.resolve(__dirname, 'submod', mod);

			// @ts-ignore
			mod = require(filename);
		}

		_useModules(me, mod, ...argv)
	}

	return me;
}
