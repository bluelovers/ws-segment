/**
 * 日期时间优化模块
 *
 * @author 老雷<leizongmin@gmail.com>
 */
import Segment, { IWord } from '../Segment';
/** 模块类型 */
export declare const type = "optimizer";
export declare let segment: Segment;
/**
 * 模块初始化
 *
 * @param {Segment} segment 分词接口
 */
export declare function init(_segment: any): void;
/**
 * 日期时间优化
 *
 * @param {array} words 单词数组
 * @param {bool} is_not_first 是否为管理器调用的
 * @return {array}
 */
export declare function doOptimize(words: IWord[], is_not_first?: boolean): Segment.IWord[];
