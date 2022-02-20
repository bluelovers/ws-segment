/**
 * Created by user on 2020/5/11.
 */

import FastGlob from '@bluelovers/fast-glob/bluebird';
import { join } from "path";
import __root_ws from '../../__root_ws';
import { readFile } from 'fs-extra';
import crossSpawn from 'cross-spawn-extra'
import { del } from '../util/add-to-postpublish-task';
import Bluebird = require('bluebird')
import console from 'debug-color2/logger'
import { gitSubtreePush } from '../util/git-subtree-push';
import { enableDebug } from '@git-lazy/debug';

enableDebug();

console.enabledColor = true;

FastGlob
	.async([
		'**/*',
	], {
		cwd: join(__root_ws, 'temp', 'subtree'),
		absolute: true,
	})
	.map(file => readFile(file, 'utf8'))
	.mapSeries(async (module_name) =>
	{
		return gitSubtreePush(module_name)
	})
;
