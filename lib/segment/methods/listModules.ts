import { IOptionsDoSegment } from '../types';
import { ISubTokenizer } from '../../mod/Tokenizer';
import { ISubOptimizer } from '../../mod/Optimizer';
import { Segment } from '../../Segment';

export function listModules(modules: Segment["modules"], options: IOptionsDoSegment)
{
	let ret = {
		enable: {
			tokenizer: [] as ISubTokenizer[],
			optimizer: [] as ISubOptimizer[],
		},
		disable: {
			tokenizer: [] as ISubTokenizer[],
			optimizer: [] as ISubOptimizer[],
		},
	};

	if (options && options.disableModules)
	{
		modules.tokenizer
			.forEach(function (mod)
			{
				let bool: boolean;

				if (mod.name)
				{
					if (options.disableModules.includes(mod.name))
					{
						bool = true;
					}
				}
				else
				{
					if (options.disableModules.includes(mod as any))
					{
						bool = true;
					}
				}

				ret[bool ? 'disable' : 'enable'].tokenizer.push(mod);
			})
		;

		modules.optimizer
			.forEach(function (mod)
			{
				let bool: boolean;

				if (mod.name)
				{
					if (options.disableModules.includes(mod.name))
					{
						bool = true;
					}
				}
				else
				{
					if (options.disableModules.includes(mod as any))
					{
						bool = true;
					}
				}

				ret[bool ? 'disable' : 'enable'].optimizer.push(mod);
			})
		;
	}
	else
	{
		ret.enable.tokenizer = modules.tokenizer.slice();
		ret.enable.optimizer = modules.optimizer.slice();
	}

	return ret;
}
