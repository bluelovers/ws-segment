/**
 * Created by user on 2019/6/26.
 */
import { IOptions as IOptionsTableDict } from '@novel-segment/table-core-abstract';
import { TableDict } from '@novel-segment/table-dict';
import { ENUM_SUBMODS_NAME } from '../mod/index';
import { IUseDefaultOptions } from '../defaults/index';
export { IWord } from '@novel-segment/types';
export type ISPLIT = RegExp | string | {
    [Symbol.split](input: string, limit?: number): string[];
};
export type ISPLIT_FILTER = RegExp | {
    test(input: string): boolean;
};
export interface IDICT<T = any> {
    [key: string]: T;
}
export interface IDICT2<T = any> {
    [key: number]: IDICT<T>;
}
export interface IOptionsSegment extends IOptionsTableDict, IUseDefaultOptions {
    db?: TableDict[];
    optionsDoSegment?: IOptionsDoSegment;
    maxChunkCount?: number;
    minChunkCount?: number;
    disableModules?: (ENUM_SUBMODS_NAME | unknown)[];
}
export type IDICT_SYNONYM = IDICT<string>;
export type IDICT_STOPWORD = IDICT<boolean>;
export type IDICT_BLACKLIST = IDICT<boolean>;
export interface IOptionsDoSegment {
    /**
     * 不返回词性
     */
    simple?: boolean;
    /**
     * 去除标点符号
     */
    stripPunctuation?: boolean;
    /**
     * 转换同义词
     */
    convertSynonym?: boolean;
    /**
     * 去除停止符
     */
    stripStopword?: boolean;
    stripSpace?: boolean;
    disableModules?: (ENUM_SUBMODS_NAME | unknown)[];
}
