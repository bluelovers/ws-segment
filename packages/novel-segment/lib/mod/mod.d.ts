/**
 * Created by user on 2018/2/21/021.
 */
import { IDICT_BLACKLIST, IWord, Segment } from '../Segment';
import { IWordDebug, IWordDebugInfo } from '../util/index';
import { ENUM_SUBMODS_NAME } from './index';
import { POSTAG } from '@novel-segment/postag/lib/postag/ids';
export type ISModuleType = 'optimizer' | 'tokenizer' | string;
export declare class SModule implements ISModule {
    type?: ISModuleType;
    segment: Segment;
    /**
     * @param {Segment} segment 分词接口
     */
    constructor(segment: Segment);
    protected _doMethod<S extends IWord, T extends ISubSModule>(fn: string, target: S[], mods: T[], ...argv: any[]): S[];
}
export declare class SubSModule implements ISubSModule {
    static type: ISModuleType;
    type: ISModuleType;
    segment: Segment;
    priority?: number;
    inited?: boolean;
    static NAME: string;
    name: string;
    protected _TABLE?: any;
    protected _POSTAG?: typeof POSTAG;
    protected _BLACKLIST?: IDICT_BLACKLIST;
    constructor(type?: ISModuleType, segment?: Segment, ...argv: any[]);
    static init<T extends SubSModule = SubSModule>(segment: Segment, ...argv: any[]): T;
    protected static _init<T extends SubSModule>(libThis: IModuleStatic<T>, segment: Segment, ...argv: any[]): T;
    init(segment: Segment, ...argv: any[]): this;
    protected _cache(...argv: any[]): void;
    /**
     * 回傳最簡版的 IWord { w, p, f, s }
     */
    protected createRawToken<T extends IWord, U extends IWordDebugInfo = IWordDebugInfo>(data: T, ow?: Partial<T & IWord>, attr?: U & IWordDebugInfo): T;
    protected createToken<T extends IWord, U extends IWordDebugInfo = IWordDebugInfo>(data: T, skipCheck?: boolean, attr?: U & IWordDebugInfo): T;
    protected sliceToken<T extends IWord, U extends IWordDebugInfo>(words: T[], pos: number, len: number, data: T, skipCheck?: boolean, attr?: U & IWordDebugInfo): T[];
    protected debugToken<T extends IWordDebug, U extends IWordDebugInfo>(data: T, attr?: U & IWordDebugInfo, returnToken?: true, ...argv: any[]): T;
}
export interface ISubSModuleMethod<T extends IWord, U extends IWord = T> {
    (words: T[], ...argv: any[]): U[];
}
export interface ISubSModuleCreate<T extends SubSModule, R extends SubSModule = SubSModule> {
    (segment: Segment, ...argv: any[]): T & R;
}
export interface ISModule {
    type?: ISModuleType;
    segment: Segment;
}
export interface IModuleStatic<T extends ISModule | SubSModule> {
    type: ISModuleType;
    new (type?: ISModuleType, segment?: Segment, ...argv: any[]): T;
    init(segment: Segment, ...argv: any[]): T;
}
export interface ISubSModule {
    type: ISModuleType;
    segment: Segment;
    name?: ENUM_SUBMODS_NAME | string;
    priority?: number;
    init(segment: Segment, ...argv: any[]): ISubSModule;
}
declare const _default: typeof import("./mod");
export default _default;
