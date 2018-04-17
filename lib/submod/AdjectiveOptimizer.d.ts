import { SubSModule, SubSModuleOptimizer } from '../mod';
import { IWord } from '../Segment';
declare class AdjectiveOptimizer extends SubSModuleOptimizer {
    doOptimize(words: IWord[]): IWord[];
    isNominal(pos: number | number[]): boolean;
}
export declare const init: typeof SubSModule.init;
export default AdjectiveOptimizer;
