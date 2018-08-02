/**
 * 外文字符、数字识别模块
 *
 * @author 老雷<leizongmin@gmail.com>
 */
import { SubSModuleTokenizer, ISubTokenizerCreate } from '../mod';
import { Segment, IWord } from '../Segment';
export declare class ForeignTokenizer extends SubSModuleTokenizer {
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
     * 匹配包含的英文字符和数字，并分割
     *
     * @param {string} text 文本
     * @param {int} cur 开始位置
     * @return {array}  返回格式   {w: '单词', c: 开始位置}
     */
    splitForeign(text: string, cur?: number): IWord[];
    createForeignToken(word: IWord, lasttype?: number): Segment.IWord;
}
export declare const init: ISubTokenizerCreate<ForeignTokenizer, SubSModuleTokenizer>;
export default ForeignTokenizer;
