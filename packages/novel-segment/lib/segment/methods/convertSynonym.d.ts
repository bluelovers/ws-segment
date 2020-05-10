import { IWordDebug } from '../../util/debug';
import { IDICT, IDICT_SYNONYM, IWord } from '../types';
import POSTAG from '../../POSTAG';
import { ITSOverwrite } from 'ts-type';
interface IOptions {
    /**
     * for debug
     */
    showcount?: boolean;
    DICT_SYNONYM: IDICT_SYNONYM;
    DICT_TABLE: IDICT<IWord>;
    POSTAG: typeof POSTAG;
}
export interface IConvertSynonymWithShowcount {
    count: number;
    list: IWordDebug[];
}
/**
 * 转换同义词
 */
export declare function convertSynonym(ret: IWordDebug[], options: ITSOverwrite<IOptions, {
    showcount: true;
}>): {
    count: number;
    list: IWordDebug[];
};
/**
 * 转换同义词
 */
export declare function convertSynonym(ret: IWordDebug[], options?: IOptions): IWordDebug[];
export {};
