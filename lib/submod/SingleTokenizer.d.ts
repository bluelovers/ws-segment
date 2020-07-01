import { SubSModuleTokenizer } from '../mod';
import { IWord } from '../Segment';
/**
 * 单字切分模块
 * 此模組不包含模組列表內 需要手動指定
 *
 * @author 老雷<leizongmin@gmail.com>
 */
export declare class SingleTokenizer extends SubSModuleTokenizer {
    /**
     * 对未识别的单词进行分词
     *
     * @param {array} words 单词数组
     * @return {array}
     */
    split(words: IWord[]): IWord[];
    /**
     * 单字切分
     *
     * @param {string} text 要切分的文本
     * @param {int} cur 开始位置
     * @return {array}
     */
    splitSingle(text: any, cur?: number): IWord[];
}
export declare const init: typeof SubSModuleTokenizer.init;
export declare const type = "tokenizer";
export default SingleTokenizer;
