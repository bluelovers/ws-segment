/**
 * Created by user on 2019/6/26.
 */
import { Segment } from '../Segment';
/**
 * @private
 */
export interface IUseDefaultOptionsDicts {
    /**
     * 不載入 字典
     */
    nodict?: boolean;
    /**
     * 載入 node-novel 相關字典
     */
    nodeNovelMode?: boolean;
}
/**
 * @private
 */
export interface IUseDefaultOptionsMods {
    all_mod?: boolean;
    nomod?: boolean;
}
export interface IUseDefaultOptions extends IUseDefaultOptionsDicts, IUseDefaultOptionsMods {
}
export declare function useDefault(segment: Segment, options?: IUseDefaultOptions): Segment;
