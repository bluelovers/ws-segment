/**
 * 通配符识别模块
 *
 * @author 老雷<leizongmin@gmail.com>
 */
import { ISubTokenizerCreate, SubSModuleTokenizer } from '../mod';
import { IDICT, IDICT2, IWord } from '../Segment';
import { IWordDebugInfo } from '../util/index';
export declare class WildcardTokenizer extends SubSModuleTokenizer {
    name: string;
    protected _TABLE: IDICT<IWord>;
    protected _TABLE2: IDICT2<IWord>;
    _cache(): void;
    /**
     * 对未识别的单词进行分词
     *
     * @param {array} words 单词数组
     * @return {array}
     */
    split(words: IWord[]): IWord[];
    createWildcardToken(word: IWord, lasttype?: number, attr?: IWordDebugInfo): IWord;
    splitWildcard(text: string, cur?: number): IWord[];
    /**
     * 匹配单词，返回相关信息
     *
     * @param {string} text 文本
     * @param {int} cur 开始位置
     * @return {array}  返回格式   {w: '单词', c: 开始位置}
     */
    matchWord(text: string, cur?: number): IWord[];
}
export declare const init: ISubTokenizerCreate<WildcardTokenizer, SubSModuleTokenizer>;
export declare const type = "tokenizer";
export default WildcardTokenizer;
