/**
 * Created by user on 2020/5/13.
 */
import crossSpawn from 'cross-spawn-extra'
import console from 'debug-color2/logger'
import __root_ws from '../../__root_ws';
import { unlinkSync, pathExistsSync } from 'fs-extra';
import { name } from './add-to-postpublish-task';
import createCacheName from './create-cache-name';

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

	if (remote && prefix)
	{
		await crossSpawn.async('git', [
			'subtree',
			'push',
			remote,
			'master',
			'--prefix',
			prefix,
		], {
			cwd: __root_ws,
		});
	}

	let file = createCacheName('subtree', module_name);
	if (pathExistsSync(file))
	{
		console.debug(`[subtree:script]`, `del`, module_name);
		unlinkSync(file);
	}
}
