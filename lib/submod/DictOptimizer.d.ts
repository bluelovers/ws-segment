import { SubSModuleOptimizer, ISubOptimizerCreate } from '../mod';
import { IWord, IDICT } from '../Segment';
import IPOSTAG from '../POSTAG';
/**
 * 词典优化模块
 *
 * @author 老雷<leizongmin@gmail.com>
 */
export declare class DictOptimizer extends SubSModuleOptimizer {
    protected _TABLE: IDICT<IWord>;
    _cache(): void;
    isMergeable(w1: IWord, w2: IWord, {POSTAG, TABLE, nw, i}: {
        POSTAG: typeof IPOSTAG;
        TABLE: IDICT;
        nw: string;
        i: number;
    }): boolean;
    /**
     * 词典优化
     *
     * @param {array} words 单词数组
     * @param {bool} is_not_first 是否为管理器调用的
     * @return {array}
     */
    doOptimize(words: IWord[], is_not_first: boolean): IWord[];
}
export declare const init: ISubOptimizerCreate<DictOptimizer, SubSModuleOptimizer>;
export default DictOptimizer;
