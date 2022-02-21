import { ISubOptimizerCreate, SubSModuleOptimizer } from '../mod';
import { IDICT, IWord } from '../Segment';
/**
 * 邮箱地址中允许出现的字符
 * 参考：http://www.cs.tut.fi/~jkorpela/rfc/822addr.html
 */
export declare const _EMAILCHAR: string[];
export declare const EMAILCHAR: IDICT<number>;
/**
 * 邮箱地址识别优化模块
 *
 * @author 老雷<leizongmin@gmail.com>
 */
export declare class EmailOptimizer extends SubSModuleOptimizer {
    /**
     * 对可能是邮箱地址的单词进行优化
     *
     * @param {array} words 单词数组
     * @return {array}
     */
    doOptimize(words: any): any;
    /**
     * 根据一组单词生成邮箱地址
     *
     * @param {array} words 单词数组
     * @return {string}
     */
    toEmailAddress(words: IWord[]): string;
}
export declare const init: ISubOptimizerCreate<EmailOptimizer, SubSModuleOptimizer>;
export declare const type = "optimizer";
export default EmailOptimizer;
