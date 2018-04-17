/**
 * Created by user on 2018/4/17/017.
 */

import * as path from 'path';
import * as fs from 'fs-extra';
import ProjectConfig from '../../project.config';
import { debug } from '../../lib/util';

let cache_file = path.join(ProjectConfig.temp_root, 'cache.db');

console.time(`[delete] cache.db`);

debug(path.relative(ProjectConfig.project_root, cache_file));
fs.removeSync(cache_file);

console.timeEnd(`[delete] cache.db`);
