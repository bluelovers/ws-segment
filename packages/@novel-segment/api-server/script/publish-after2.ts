/**
 * Created by user on 2018/7/24/024.
 */
/// <reference types="cross-spawn" />

import path from 'path';
// @ts-ignore
import PackageJson from '../package.json';
import CrossSpawn from 'cross-spawn-extra';
import gitRoot from 'git-root2';
import { join } from "path";

(async () =>
{
	let gitroot = gitRoot(__dirname);

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

	await CrossSpawn('git', [
		'commit',
		//'-a',
		'-m',
		msg,
		'.',
	], options);

})().catch(e => console.error(e));
