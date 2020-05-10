/**
 * Created by user on 2020/5/11.
 */

import { DICT_ROOT } from '../';
import { join } from 'path';

export type IDictID = 'jieba-js' | 'nodejieba' | 'segment' | 'stopword' | 'synonym';

export function getDictPath(id: IDictID, file: string, ...argv: string[])
{
	return join(DICT_ROOT, ...[id, file].concat(argv));
}

export default getDictPath;
