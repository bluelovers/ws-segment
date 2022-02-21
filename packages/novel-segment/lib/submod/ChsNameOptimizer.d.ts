/**
 * 人名优化模块
 *
 * @author 老雷<leizongmin@gmail.com>
 * @version 0.1
 */
import { SubSModuleOptimizer } from '../mod';
import { IDICT, IWord } from '../Segment';
/**
 * @todo 支援 XX氏
 */
export declare class ChsNameOptimizer extends SubSModuleOptimizer {
    protected _TABLE: IDICT<IWord>;
    name: string;
    _cache(): void;
    isBlackList(nw: string): boolean;
    isMergeable2(...words: string[]): boolean;
    isMergeable(word: IWord, nextword: IWord): boolean;
    /**
     * 只有新詞屬於人名或未知詞時才會合併
     */
    validUnknownNewWord<W extends string | string[]>(ws: W, cb?: (nw: string, ew: IWord, ws: W) => IWord | boolean | void): true | IWord;
    /**
     * 姓
     */
    isFamilyName(w: string): boolean;
    /**
     * 双字姓名
     */
    isDoubleName(w1: string, w2: string): boolean;
    isSingleNameRepeat(w1: string, w2: string): boolean;
    /**
     * 单字姓名
     */
    isSingleName(w1: string): boolean;
    /**
     * 单字姓名 不重覆
     */
    isSingleNameNoRepeat(w1: string): boolean;
    isFirstName(w1: string, w2: string): boolean;
    /**
     * 对可能是人名的单词进行优化
     *
     * @param {array} words 单词数组
     * @return {array}
     */
    doOptimize(words: IWord[]): IWord[];
}
export declare const init: typeof SubSModuleOptimizer.init;
export declare const type = "optimizer";
export default ChsNameOptimizer;
