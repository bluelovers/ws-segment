/**
 * Created by user on 2018/7/24/024.
 */
/// <reference types="cross-spawn" />

import path = require('path');
// @ts-ignore
import PackageJson = require('../package.json');
import CrossSpawn = require('cross-spawn-extra');
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

	let project_root = join(__dirname, '..');

	if (!gitroot || path.relative(gitroot, project_root))
	{
		let __root_ws = await import('../../../../__root_ws')
			.then(m => m.__root_ws)
			.catch(e => null)
		;

		if (!__root_ws || path.relative(gitroot, __root_ws))
		{
			console.warn(`no git exists`);
			console.warn(`__root_ws`, __root_ws);
			console.warn(`gitroot`, gitroot);
			console.warn(`path.relative`, path.relative(gitroot, project_root));
			return;
		}
	}

	let cwd = join(project_root);

	let options = {
		cwd,
		stdio: 'inherit',
	};

	let msg = `chore: update api-server\n\n[skip ci]`;

	await crossSpawn('git', [
		'commit',
		//'-a',
		'-m',
		msg,
		'.',
	], options);

})().catch(e => console.error(e));
