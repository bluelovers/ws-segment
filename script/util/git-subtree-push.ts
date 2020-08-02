/**
 * Created by user on 2020/5/13.
 */
import crossSpawn from 'cross-spawn-extra'
import console from 'debug-color2/logger'
import __root_ws from '../../__root_ws';
import { unlinkSync, pathExistsSync } from 'fs-extra';
import { name } from './add-to-postpublish-task';
import createCacheName from './create-cache-name';
import { subtreePush } from '@git-lazy/subtree/index';

export async function gitSubtreePush(module_name: '@novel-segment/api-server' | 'segment-dict' | 'novel-segment' | 'novel-segment-cli' | string)
{
	let remote: string;
	let prefix: string;

	switch (module_name)
	{
		case 'novel-segment':
			remote = 'node-segment';
			prefix = `packages/${module_name}`
			break;
		case 'segment-dict':
			remote = 'node-segment-dict';
			prefix = `packages/${module_name}`
			break;
		case 'novel-segment-cli':
			remote = module_name;
			prefix = `packages/${module_name}`
			break;
	}

	let error;

	if (remote && prefix)
	{
		await subtreePush({
			remote,
			prefix,
			cwd: __root_ws
		})
			.then(cp => {
				if (cp.exitCode)
				{
					error = true
				}
			})
			.catch(e => error = e)
		;

		/*
		await crossSpawn.async('git', [
			'subtree',
			'push',
			remote,
			'master',
			'--prefix',
			prefix,
		], {
			cwd: __root_ws,
			stdio: 'inherit',
		});
		 */
	}

	if (error)
	{
		if (error !== true)
		{
			console.error(error)
		}
	}
	else
	{
		let file = createCacheName('subtree', module_name);
		if (pathExistsSync(file))
		{
			console.debug(`[subtree:script]`, `del`, module_name);
			unlinkSync(file);
		}
	}
}
