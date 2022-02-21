import { SubSModuleTokenizer } from '../mod';
import { IDICT, IWord } from '../Segment';
export declare class ChsNameTokenizer extends SubSModuleTokenizer {
    protected _TABLE: IDICT<IWord>;
    name: string;
    _cache(): void;
    /**
     * 对未识别的单词进行分词
     *
     * @param {array} words 单词数组
     * @return {array}
     */
    split(words: IWord[]): IWord[];
    /**
     * 匹配包含的人名，并返回相关信息
     *
     * @param {string} text 文本
     * @param {int} cur 开始位置
     * @return {array}  返回格式   {w: '人名', c: 开始位置}
     */
    matchName(text: string, cur?: number): IWord[];
}
export declare const init: typeof SubSModuleTokenizer.init;
export declare const type = "tokenizer";
export default ChsNameTokenizer;
