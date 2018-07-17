/**
 * 人名优化模块
 *
 * @author 老雷<leizongmin@gmail.com>
 * @version 0.1
 */
import { SubSModuleOptimizer } from '../mod';
import { IWord } from '../Segment';
export declare class ChsNameOptimizer extends SubSModuleOptimizer {
    name: string;
    /**
     * 对可能是人名的单词进行优化
     *
     * @param {array} words 单词数组
     * @return {array}
     */
    doOptimize(words: IWord[]): IWord[];
}
export declare const init: typeof SubSModuleOptimizer.init;
export default ChsNameOptimizer;
