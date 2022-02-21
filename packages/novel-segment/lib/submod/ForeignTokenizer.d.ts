/**
 * 外文字符、数字识别模块
 *
 * @author 老雷<leizongmin@gmail.com>
 */
import { ISubTokenizerCreate, SubSModuleTokenizer } from '../mod';
import { IWord } from '../Segment';
import { IWordDebugInfo } from '../util/index';
export declare class ForeignTokenizer extends SubSModuleTokenizer {
    name: string;
    /**
     * 分詞用(包含中文)
     */
    _REGEXP_SPLIT_1: RegExp;
    /**
     * 分詞用(不包含中文的全詞符合)
     */
    _REGEXP_SPLIT_2: RegExp;
    _cache(): void;
    /**
     * 对未识别的单词进行分词
     *
     * @param {array} words 单词数组
     * @return {array}
     */
    split(words: IWord[]): IWord[];
    /**
     * 支援更多外文判定(但可能會降低效率)
     *
     * 並且避免誤切割 例如 latīna Русский
     */
    splitForeign2(text: string, cur?: number): IWord[];
    /**
     * 匹配包含的英文字符和数字，并分割
     *
     * @param {string} text 文本
     * @param {int} cur 开始位置
     * @return {array}  返回格式   {w: '单词', c: 开始位置}
     */
    splitForeign(text: string, cur?: number): IWord[];
    createForeignToken(word: IWord, lasttype?: number, attr?: IWordDebugInfo): IWord;
}
export declare const init: ISubTokenizerCreate<ForeignTokenizer, SubSModuleTokenizer>;
export declare const type = "tokenizer";
export default ForeignTokenizer;
