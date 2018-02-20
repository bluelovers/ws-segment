import { Segment } from './Segment';
/**
 * 分词模块管理器
 */
export declare class Optimizer {
    segment: Segment;
    /**
     * @param {Segment} segment 分词接口
     */
    constructor(segment: Segment);
    /**
     * 对一段文本进行分词
     *
     * @param {array} words 单词数组
     * @param {array} modules 分词模块数组
     * @return {array}
     */
    doOptimize(words: any, modules: any): any;
}
export default Optimizer;
