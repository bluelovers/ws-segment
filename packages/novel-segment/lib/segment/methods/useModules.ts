import { IOptionsSegment } from '../types';
import SegmentCore from '../core';
import { ISubOptimizer } from '../../mod/Optimizer';
import { ISubTokenizer } from '../../mod/Tokenizer';

export function _isIgnoreModules<T extends SegmentCore>(me: T, mod: ISubOptimizer | ISubTokenizer | any, ...argv)
{
	return (me.options && me.options.disableModules && me.options.disableModules.includes(mod))
}

export function _warnIgnoreModules(mod)
{
	console.warn(`can't use this mod, because it got disable: ${mod}`)
}

export function useModules<T>(me: T, mod: ISubOptimizer | ISubTokenizer | any, ...argv)
{
	if (_isIgnoreModules(me as any, mod, ...argv))
	{
		_warnIgnoreModules(mod)
	}
	else
	{
		// 初始化并注册模块
		let c = mod.init(me, ...argv);

		if (typeof c !== 'undefined')
		{
			mod = c;
		}

		// @ts-ignore
		me.modules[mod.type].push(mod);
	}

	return me;
}
