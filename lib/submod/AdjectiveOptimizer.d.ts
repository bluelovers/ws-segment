import { SubSModuleOptimizer } from '../mod';
import { IWordDebug } from '../util';
/**
 * 把一些错认为名词的词标注为形容词，或者对名词作定语的情况
 */
export declare class AdjectiveOptimizer extends SubSModuleOptimizer {
    name: string;
    doOptimize(words: IWordDebug[]): IWordDebug[];
    isNominal(pos: number | number[]): boolean;
}
export declare const init: typeof SubSModuleOptimizer.init;
export declare const type = "optimizer";
export default AdjectiveOptimizer;
