import { IWord } from './Segment';
import { ISubSModule, SModule } from './module';
export declare type ISubOptimizer = ISubSModule & {
    type: 'optimizer';
    doOptimize(words: IWord[]): IWord[];
};
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
    doOptimize(words: IWord[], modules: ISubOptimizer[]): IWord[];
}
export default Optimizer;
