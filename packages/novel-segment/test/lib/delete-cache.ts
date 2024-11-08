/**
 * Created by user on 2018/4/17/017.
 */

import { relative } from 'path';
import { removeSync } from 'fs-extra';
import { temp_root, project_root } from '../../project.config';
import { debug } from '../../lib/util';
import { async as FastGlob } from '@bluelovers/fast-glob/bluebird';

console.time(`[delete] cache`);

export default FastGlob([
	'**/cache.db',
	'**/cache*.db',
], {
	cwd: temp_root,
	absolute: true,
})
.map((cache_file) => {

	debug(relative(project_root, cache_file));
	removeSync(cache_file);

})
	.tap(() => {

		console.timeEnd(`[delete] cache`);

	})
;
