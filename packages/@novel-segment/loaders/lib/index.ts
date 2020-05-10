
import { IRequireModule, isUndefined } from './types';

export function requireDefault(id: 'line'): typeof import('../line').default
export function requireDefault(id: 'stopword'): typeof import('../stopword').default
export function requireDefault(id: 'jieba'): typeof import('../jieba').default
export function requireDefault(id: 'opencc'): typeof import('../opencc').default
export function requireDefault(id: 'opencc', subtype: 'scheme'): typeof import('../opencc/scheme').default
export function requireDefault(id: 'segment'): typeof import('../segment').default
export function requireDefault(id: 'segment', subtype: 'synonym'): typeof import('../segment/synonym').default
export function requireDefault<T = any>(id, subtype?: string): (file: string) => Promise<T>
export function requireDefault(id, subtype?)
{
	return requireModule(id, subtype).default as any;
}

export function requireModule(id: 'line'): typeof import('../line')
export function requireModule(id: 'stopword'): typeof import('../stopword')
export function requireModule(id: 'jieba'): typeof import('../jieba')
export function requireModule(id: 'opencc'): typeof import('../opencc')
export function requireModule(id: 'opencc', subtype: 'scheme'): typeof import('../opencc/scheme')
export function requireModule(id: 'segment'): typeof import('../segment')
export function requireModule(id: 'segment', subtype: 'synonym'): typeof import('../segment/synonym')
export function requireModule<T = any>(id: string, subtype?: string): IRequireModule<T>
export function requireModule(id, subtype?)
{
	if (id === 'line' && isUndefined(subtype)) return require('../line');
	if (id === 'stopword' && isUndefined(subtype)) return require('../stopword');
	if (id === 'jieba' && isUndefined(subtype)) return require('../jieba');
	if (id === 'opencc' && isUndefined(subtype)) return require('../opencc');
	if (id === 'opencc' && subtype === 'scheme') return require('../opencc/scheme');
	if (id === 'segment' && isUndefined(subtype)) return require('../segment');
	if (id === 'segment' && subtype === 'synonym') return require('../segment/synonym');

	throw new Error(`module not defined. id: ${id}, subtype: ${subtype}`)
}
