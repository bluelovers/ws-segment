import { IWord } from '../Segment';
import { ISubSModule, SModule, SubSModule } from './mod';
export declare type ISubOptimizer = ISubSModule & {
    type: 'optimizer';
    doOptimize(words: IWord[], ...argv): IWord[];
};
export declare class SubSModuleOptimizer extends SubSModule implements ISubOptimizer {
    static readonly type: string;
    readonly type: string;
    doOptimize(words: IWord[], ...argv: any[]): IWord[];
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
