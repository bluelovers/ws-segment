import * as Promise from 'bluebird';
// @ts-ignore
import * as path from "path";
import { ROOT } from '../../index';
import { IStreamLineWithValue } from '../fs/line';
import * as JIEBA from './jieba';
import * as SEGMENT from './segment';
import * as OPENCC from './opencc';
import LoaderClass from './_class';

export function requireDefault<T = any>(id, subtype: string): (file: string) => Promise<T>
export function requireDefault(id: 'jieba'): typeof JIEBA.default
export function requireDefault(id: 'segment'): typeof SEGMENT.Loader.load
export function requireDefault(id: 'opencc'): typeof OPENCC.Loader.load
export function requireDefault<T = any>(id, subtype?: string): (file: string) => Promise<T>
export function requireDefault<T = any>(id, subtype?: string): (file: string) => Promise<T>
{
	return requireModule(id, subtype).default;
}

export function requireModule<T = any>(id, subtype: string): IRequireModule<T>
export function requireModule(id: 'jieba'): typeof JIEBA
export function requireModule(id: 'segment'): typeof SEGMENT
export function requireModule(id: 'opencc'): typeof OPENCC
export function requireModule<T = any>(id, subtype?: string): IRequireModule<T>
export function requireModule(id, subtype?: string)
{
	// @ts-ignore
	return require(path.join(__dirname, id, subtype ? subtype : ''));
}

/*
export type IRequireModule<T = any> = {
	load(file: string): Promise<T>,
	loadSync(file: string): T,

	loadStream(): IStreamLineWithValue<T>,
	loadStreamSync(): IStreamLineWithValue<T>,

	default(file: string): Promise<T>,
}
*/

export type IRequireModule<T = any> = LoaderClass<T, any>

export default requireDefault
