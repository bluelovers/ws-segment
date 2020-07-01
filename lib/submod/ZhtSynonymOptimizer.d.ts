/**
 * Created by user on 2018/4/16/016.
 */
import { SubSModuleOptimizer } from '../mod';
import { IDICT, IDICT_SYNONYM, IWord } from '../Segment';
import { IWordDebug } from '../util';
/**
 * 以詞意來自動轉換 而不需要手動加入字典於 synonym.txt
 * 適用於比較容易需要人工處理的轉換
 *
 * 自動處理 `里|后`
 *
 * 建議在字典內追加人名地名等等名字 來增加準確性
 * 防止轉換錯誤
 *
 * @todo 發于余干松冲准呆只范舍涂
 */
export declare class ZhtSynonymOptimizer extends SubSModuleOptimizer {
    name: string;
    protected _SYNONYM?: IDICT_SYNONYM;
    protected _TABLE: IDICT<IWord>;
    _cache(): void;
    isSynonymBlacklist(w: string): boolean;
    protected _getSynonym(w: string, nw: string): string;
    doOptimize<T extends IWordDebug>(words: T[]): T[];
}
export declare const init: typeof SubSModuleOptimizer.init;
export declare const type = "optimizer";
export default ZhtSynonymOptimizer;
