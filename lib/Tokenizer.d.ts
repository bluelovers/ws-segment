import { Segment } from './Segment';
/**
 * 分词模块管理器
 */
export declare class Tokenizer {
    segment: Segment;
    /**
     * @param {Segment} segment 分词接口
     */
    constructor(segment: Segment);
    /**
     * 对一段文本进行分词
     *
     * @param {string} text 文本
     * @param {array} modules 分词模块数组
     * @return {array}
     */
    split(text: string, modules: any): {
        w: string;
    }[];
}
export default Tokenizer;
