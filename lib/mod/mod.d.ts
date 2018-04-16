/**
 * Created by user on 2018/2/21/021.
 */
import { Segment } from '../Segment';
export declare class SModule implements ISModule {
    type?: string;
    segment: Segment;
    /**
     * @param {Segment} segment 分词接口
     */
    constructor(segment: Segment);
}
export declare class SubSModule implements ISubSModule {
    static type: string;
    type: string;
    segment: Segment;
    priority?: number;
    inited?: boolean;
    constructor(type?: string, segment?: Segment, ...argv: any[]);
    static init(segment: Segment, ...argv: any[]): self.SubSModule;
    init(segment: Segment, ...argv: any[]): this;
}
export interface ISModule {
    type?: string;
    segment: Segment;
}
export interface IModuleStatic<T = ISModule> {
    new (segment: Segment): T;
}
export interface ISubSModule {
    type: string;
    segment: Segment;
    priority?: number;
    init(segment: Segment, ...argv: any[]): ISubSModule;
}
import * as self from './mod';
export default self;
