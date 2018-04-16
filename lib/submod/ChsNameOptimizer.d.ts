import Segment, { IWord } from '../Segment';
declare module ChsNameOptimizer {
    /** 模块类型 */
    const type = "optimizer";
    let segment: Segment;
    /**
     * 模块初始化
     *
     * @param {Segment} segment 分词接口
     */
    function init(_segment: any): typeof ChsNameOptimizer;
    /**
     * 对可能是人名的单词进行优化
     *
     * @param {array} words 单词数组
     * @return {array}
     */
    function doOptimize(words: IWord[]): IWord[];
}
export = ChsNameOptimizer;
