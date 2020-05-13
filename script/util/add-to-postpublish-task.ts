/**
 * Created by user on 2020/5/11.
 */
import __root_ws from '../../__root_ws';
import { join } from 'path';
import { outputFileSync, ensureFileSync, unlinkSync } from 'fs-extra';
import console from 'debug-color2';

export function name(name: string)
{
	name = name
		.replace(/[^\-_\w\d]/g, '__')
	;

	return join(__root_ws, 'temp', 'postpublish', `${name}`)
}

export function add(module_name: string)
{
	let file = name(module_name);
	console.debug(`[postpublish:script]`, `add`, module_name);
	outputFileSync(file, module_name);
}

export function del(module_name: string)
{
	let file = name(module_name);
	console.debug(`[postpublish:script]`, `del`, module_name);
	unlinkSync(file);
}

export default add
