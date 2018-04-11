import * as Promise from 'bluebird';
import * as path from "path";
import { ROOT } from '../../index';
import * as JIEBA from './jieba';
import * as SEGMENT from './segment';

export function requireDefault<T = any>(id, subtype: string): (file: string) => Promise<T>
export function requireDefault(id: 'jieba'): typeof JIEBA.default
export function requireDefault(id: 'segment'): typeof SEGMENT.default
export function requireDefault<T = any>(id, subtype?: string): (file: string) => Promise<T>
export function requireDefault<T = any>(id, subtype?: string): (file: string) => Promise<T>
{
	return requireModule(id, subtype).default;
}

export function requireModule<T = any>(id, subtype: string): IRequireModule<T>
export function requireModule(id: 'jieba'): typeof JIEBA
export function requireModule(id: 'segment'): typeof SEGMENT
export function requireModule<T = any>(id, subtype?: string): IRequireModule<T>
export function requireModule(id, subtype?: string)
{
	return require(path.join(__dirname, id, subtype ? subtype : ''));
}

export type IRequireModule<T = any> = {
	load(file: string): Promise<T>,
	default(file: string): Promise<T>,
}

export default requireDefault
