/**
 * 词典优化模块
 *
 * @author 老雷<leizongmin@gmail.com>
 */
import IPOSTAG from '../POSTAG';
import Segment, { IDICT, IWord } from '../Segment';
/** 模块类型 */
export declare const type = "optimizer";
export declare let segment: Segment;
/**
 * 模块初始化
 *
 * @param {Segment} segment 分词接口
 */
export declare const init: (_segment: any) => void;
export declare function isMergeable(w1: IWord, w2: IWord, {POSTAG, TABLE, nw, i}: {
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
export declare function doOptimize(words: IWord[], is_not_first: boolean): IWord[];
