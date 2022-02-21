import { ISubTokenizerCreate, SubSModuleTokenizer } from '../mod';
import { IDICT, IDICT2, IWord } from '../Segment';
export declare const DEFAULT_MAX_CHUNK_COUNT = 40;
export declare const DEFAULT_MAX_CHUNK_COUNT_MIN = 30;
/**
 * 字典识别模块
 *
 * @author 老雷<leizongmin@gmail.com>
 */
export declare class DictTokenizer extends SubSModuleTokenizer {
    /**
     * 防止因無分段導致分析過久甚至超過處理負荷
     * 越高越精準但是處理時間會加倍成長甚至超過記憶體能處理的程度
     *
     * 數字越小越快
     *
     * FATAL ERROR: CALL_AND_RETRY_LAST Allocation failed - JavaScript heap out of memory
     *
     * @type {number}
     */
    MAX_CHUNK_COUNT: number;
    /**
     *
     * 追加新模式使 MAX_CHUNK_COUNT 遞減來防止無分段長段落的總處理次數過高 由 DEFAULT_MAX_CHUNK_COUNT_MIN 來限制最小值
     */
    DEFAULT_MAX_CHUNK_COUNT_MIN: number;
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
    /**
     * 匹配单词，返回相关信息
     *
     * @param {string} text 文本
     * @param {int} cur 开始位置
     * @param {object} preword 上一个单词
     * @return {array}  返回格式   {w: '单词', c: 开始位置}
     */
    protected matchWord(text: string, cur: number, preword: IWord): IWord[];
    /**
     * 选择最有可能匹配的单词
     *
     * @param {array} words 单词信息数组
     * @param {object} preword 上一个单词
     * @param {string} text 本节要分词的文本
     * @return {array}
     */
    protected filterWord(words: IWord[], preword: IWord, text: string): IWord[];
    /**
     * 评价排名
     *
     * @param {object} assess
     * @return {object}
     */
    getTops(assess: Array<IAssessRow>): number;
    /**
     * 将单词按照位置排列
     *
     * @param {array} words
     * @param {string} text
     * @return {object}
     */
    getPosInfo(words: IWord[], text: string): {
        [index: number]: IWord[];
    };
    /**
     * 取所有分支
     *
     * @param {{[p: number]: Segment.IWord[]}} wordpos
     * @param {number} pos 当前位置
     * @param {string} text 本节要分词的文本
     * @param {number} total_count
     * @returns {Segment.IWord[][]}
     */
    getChunks(wordpos: {
        [index: number]: IWord[];
    }, pos: number, text?: string, total_count?: number, MAX_CHUNK_COUNT?: number): IWord[][];
}
export declare namespace DictTokenizer {
    /**
     * 使用类似于MMSG的分词算法
     * 找出所有分词可能，主要根据一下几项来评价：
     *
     * x、词数量最少；
     * a、词平均频率最大；
     * b、每个词长度标准差最小；
     * c、未识别词最少；
     * d、符合语法结构项：如两个连续的动词减分，数词后面跟量词加分；
     *
     * 取以上几项综合排名最最好的
     */
    type IAssessRow = {
        /**
         * 词数量，越小越好
         */
        x: number;
        /**
         * 词总频率，越大越好
         */
        a: number;
        /**
         * 词标准差，越小越好
         * 每个词长度标准差最小
         */
        b: number;
        /**
         * 未识别词，越小越好
         */
        c: number;
        /**
         * 符合语法结构程度，越大越好
         * 符合语法结构项：如两个连续的动词减分，数词后面跟量词加分
         */
        d: number;
        /**
         * 結算評分(自動計算)
         */
        score?: number;
        readonly index?: number;
    };
}
export import IAssessRow = DictTokenizer.IAssessRow;
export declare const init: ISubTokenizerCreate<DictTokenizer, SubSModuleTokenizer>;
export declare const type = "tokenizer";
export default DictTokenizer;
