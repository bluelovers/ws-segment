import { IOptionsDoSegment } from '../types';
import { defaultOptionsDoSegment } from '../defaults';

export function getOptionsDoSegment<T extends IOptionsDoSegment>(options: T, optionsDoSegment: any): T
{
	return Object.assign({},
		defaultOptionsDoSegment,
		optionsDoSegment,
		options,
	);
}
