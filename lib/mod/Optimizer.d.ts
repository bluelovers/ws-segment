import { IWord, Segment } from '../Segment';
import { ISubSModule, SModule, SubSModule } from './mod';
export type ISubOptimizer = ISubSModule & {
    type: 'optimizer';
    doOptimize(words: IWord[], ...argv: any[]): IWord[];
};
export type ISubOptimizerCreate<T extends SubSModuleOptimizer, R extends SubSModuleOptimizer = SubSModuleOptimizer> = {
    (segment: Segment, ...argv: any[]): T & R;
};
export declare class SubSModuleOptimizer extends SubSModule implements ISubOptimizer {
    static readonly type = "optimizer";
    readonly type = "optimizer";
    doOptimize(words: IWord[], ...argv: any[]): IWord[];
    init(segment: Segment, ...argv: any[]): this;
    static init<T extends SubSModuleOptimizer = SubSModuleOptimizer>(segment: Segment, ...argv: any[]): T;
}
/**
 * 分词模块管理器
 */
export declare class Optimizer extends SModule {
    type: string;
    /**
     * 对一段文本进行分词
     *
     * @param {array} words 单词数组
     * @param {array} modules 分词模块数组
     * @return {array}
     */
    doOptimize(words: IWord[], mods: ISubOptimizer[], ...argv: any[]): IWord[];
}
export default Optimizer;
