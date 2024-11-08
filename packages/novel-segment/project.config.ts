/**
 * Created by user on 2017/8/13/013.
 */

import { join } from 'path';

export const project_root = join(__dirname);

export const dict_root = join(project_root, 'dicts');

//export const dist_root = path.join(project_root, 'dist');
export const temp_root = join(project_root, 'test/temp');

export default {
	project_root,
	dict_root,
	temp_root,
};
