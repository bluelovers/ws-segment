/**
 * Created by user on 2018/7/24/024.
 */

import path = require('path');
// @ts-ignore
import PackageJson = require('../package.json');
import CrossSpawn = require('cross-spawn-extra');
/// <reference types="cross-spawn" />
import index = require('../index');
import ProjectConfig from '../project.config';
import { join } from "path";

(async () =>
{
	let crossSpawn: typeof CrossSpawn;
	// @ts-ignore
	crossSpawn = await import('cross-spawn-extra');

	let gitroot: string;

	// @ts-ignore
	gitroot = await import('git-root2');
	// @ts-ignore
	gitroot = gitroot(__dirname);

	if (!gitroot || path.relative(gitroot, ProjectConfig.project_root))
	{
		let __root_ws = await import('../../../__root_ws')
			.then(m => m.__root_ws)
			.catch(e => null)
		;

		if (!__root_ws || path.relative(gitroot, __root_ws))
		{
			console.warn(`no git exists`);
			console.warn(`__root_ws`, __root_ws);
			console.warn(`gitroot`, gitroot);
			console.warn(`path.relative`, path.relative(gitroot, ProjectConfig.project_root));
			return;
		}
	}

	let cwd = join(ProjectConfig.project_root, 'test');

	let options = {
		cwd,
		stdio: 'inherit',
	};

	let msg = `novel-segment@${index.versions['novel-segment']}, segment-dict@${index.versions['segment-dict']}, cjk-conv@${index.versions['cjk-conv']}, regexp-cjk@${index.versions['regexp-cjk']}`;

	await crossSpawn('git', [
		'commit',
		//'-a',
		'-m',
		msg,
		'.',
	], options);

})().catch(e => console.error(e));
