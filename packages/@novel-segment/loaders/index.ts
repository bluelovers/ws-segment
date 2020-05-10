/**
 * Created by user on 2018/4/12/012.
 */

import { DICT_ROOT } from 'segment-dict';
import path = require('path');

export type IDictID = 'jieba-js' | 'nodejieba' | 'segment' | 'stopword' | 'synonym';

export function getDictPath(id: IDictID, file: string, ...argv: string[])
{
	return path.join(DICT_ROOT, ...[id, file].concat(argv));
}

export default getDictPath;
