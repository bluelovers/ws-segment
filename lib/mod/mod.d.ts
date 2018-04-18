/**
 * Created by user on 2018/2/21/021.
 */
import { POSTAG } from '../POSTAG';
import { IWord, Segment } from '../Segment';
import { IWordDebug, IWordDebugInfo } from '../util/index';
export declare type ISModuleType = 'optimizer' | 'tokenizer' | string;
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
    name: string;
    protected _TABLE?: any;
    protected _POSTAG?: typeof POSTAG;
    constructor(type?: ISModuleType, segment?: Segment, ...argv: any[]);
    static init<T extends SubSModule = SubSModule>(segment: Segment, ...argv: any[]): T;
    protected static _init<T extends SubSModule>(libThis: IModuleStatic<T>, segment: Segment, ...argv: any[]): T;
    init(segment: Segment, ...argv: any[]): this;
    protected _cache(...argv: any[]): void;
    protected createToken<T extends IWord>(data: T, skipCheck?: boolean): T;
    protected sliceToken<T extends IWord>(words: T[], pos: number, len: number, data: T, skipCheck?: boolean): T[];
    protected debugToken<T extends IWordDebug, U extends IWordDebugInfo>(data: T, attr?: U & IWordDebugInfo): U & IWordDebugInfo;
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
    priority?: number;
    init(segment: Segment, ...argv: any[]): ISubSModule;
}
import * as self from './mod';
export default self;
