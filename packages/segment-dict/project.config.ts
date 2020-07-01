/**
 * Created by user on 2017/8/13/013.
 */

import { join } from 'path';

export const project_root = join(__dirname);

export const dict_root = join(project_root, 'dict');

export const temp_root = join(project_root, 'test/temp');

export const ProjectConfig = exports as typeof import('./project.config')

export default ProjectConfig;
