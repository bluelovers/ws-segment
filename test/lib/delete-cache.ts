/**
 * Created by user on 2018/4/17/017.
 */

import * as path from 'path';
import * as fs from 'fs-extra';
import ProjectConfig from '../../project.config';
import { debug } from '../../lib/util';
import FastGlob from '@bluelovers/fast-glob/bluebird';

//let cache_file = path.join(ProjectConfig.temp_root, 'cache.db');

console.time(`[delete] cache`);

//debug(path.relative(ProjectConfig.project_root, cache_file));
//fs.removeSync(cache_file);
//
//console.timeEnd(`[delete] cache.db`);

FastGlob([
	'cache.db',
	'cache*.db',
], {
	cwd: ProjectConfig.temp_root,
	absolute: true,
})
.map((cache_file) => {

	debug(path.relative(ProjectConfig.project_root, cache_file));
	fs.removeSync(cache_file);

})
	.tap(() => {

		console.timeEnd(`[delete] cache`);

	})
;