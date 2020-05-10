/**
 * Created by user on 2017/8/13/013.
 */

import * as path from 'path';

export const project_root = path.join(__dirname);

export const dict_root = path.join(project_root, 'dicts');

//export const dist_root = path.join(project_root, 'dist');
export const temp_root = path.join(project_root, 'test/temp');

export default exports as typeof import('./project.config');
