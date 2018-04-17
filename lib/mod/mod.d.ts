/**
 * Created by user on 2018/2/21/021.
 */
import { Segment } from '../Segment';
export declare type ISModuleType = 'optimizer' | 'tokenizer' | string;
export declare class SModule implements ISModule {
    type?: ISModuleType;
    segment: Segment;
    /**
     * @param {Segment} segment 分词接口
     */
    constructor(segment: Segment);
}
export declare class SubSModule implements ISubSModule {
    static type: ISModuleType;
    type: ISModuleType;
    segment: Segment;
    priority?: number;
    inited?: boolean;
    constructor(type?: ISModuleType, segment?: Segment, ...argv: any[]);
    static init(segment: Segment, ...argv: any[]): self.SubSModule;
    init(segment: Segment, ...argv: any[]): this;
}
export interface ISModule {
    type?: ISModuleType;
    segment: Segment;
}
export interface IModuleStatic<T = ISModule> {
    new (segment: Segment): T;
}
export interface ISubSModule {
    type: ISModuleType;
    segment: Segment;
    priority?: number;
    init(segment: Segment, ...argv: any[]): ISubSModule;
}
import * as self from './mod';
export default self;
