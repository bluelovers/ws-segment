/**
 * 标点符号识别模块
 *
 * @author 老雷<leizongmin@gmail.com>
 */
import { SubSModuleTokenizer } from '../mod';
import { IWord } from '../Segment';
export declare class PunctuationTokenizer extends SubSModuleTokenizer {
    name: string;
    _STOPWORD: string[];
    STOPWORD: {
        [key: string]: number;
    };
    STOPWORD2: {
        [key: number]: {
            [key: string]: number;
        };
    };
    /**
     * 对未识别的单词进行分词
     *
     * @param {array} words 单词数组
     * @return {array}
     */
    split(words: IWord[]): IWord[];
    /**
     * 匹配包含的标点符号，返回相关信息
     *
     * @param {string} text 文本
     * @param {int} cur 开始位置
     * @return {array}  返回格式   {w: '网址', c: 开始位置}
     */
    matchStopword(text: string, cur?: number): IWord[];
}
export declare const init: typeof SubSModuleTokenizer.init;
export declare const type = "tokenizer";
export default PunctuationTokenizer;
