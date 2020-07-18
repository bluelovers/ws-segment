import { IWordDebug } from '../../util/debug';
import { POSTAG } from '@novel-segment/postag/lib/postag/ids';
export declare function _doSegmentStripPOSTAG(ret: IWordDebug[], postag: POSTAG): IWordDebug[];
/**
 * 去除停止符
 */
export declare function _doSegmentStripStopword(ret: IWordDebug[], STOPWORD: any): IWordDebug[];
export declare function _doSegmentStripSpace(ret: IWordDebug[]): IWordDebug[];
/**
 * 仅返回单词内容
 */
export declare function _doSegmentSimple(ret: IWordDebug[]): string[];
