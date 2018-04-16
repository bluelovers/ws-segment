/**
 * Created by user on 2018/2/21/021.
 */
import { Segment } from './Segment';
export declare class SModule implements ISModule {
    type?: string;
    segment: Segment;
    /**
     * @param {Segment} segment 分词接口
     */
    constructor(segment: Segment);
}
export declare class SubSModule implements ISubSModule {
    type: string;
    segment: Segment;
    priority?: number;
    constructor(type?: string, segment?: Segment, ...argv: any[]);
    init(segment: Segment): void;
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
    init(segment: Segment): any;
}
import * as self from './module';
export default self;
