/**
 * Created by user on 2019/6/26.
 */

import { IOptions as IOptionsTableDict } from '../table/core';
import { TableDict } from '../table/dict';
import { ENUM_SUBMODS_NAME } from '../mod/index';

export type ISPLIT = RegExp | string | {
	[Symbol.split](input: string, limit?: number): string[],
};

export type ISPLIT_FILTER = RegExp | {
	test(input: string): boolean,
};

export interface IDICT<T = any>
{
	[key: string]: T,
}

export interface IDICT2<T = any>
{
	[key: number]: IDICT<T>,
}

export type IOptionsSegment = IOptionsTableDict & {
	db?: TableDict[],
	optionsDoSegment?: IOptionsDoSegment,

	all_mod?: boolean,

	maxChunkCount?: number,
	minChunkCount?: number,

	disableModules?: (ENUM_SUBMODS_NAME | unknown)[],
};

export type IDICT_SYNONYM = IDICT<string>;
export type IDICT_STOPWORD = IDICT<boolean>;
export type IDICT_BLACKLIST = IDICT<boolean>;

export interface IWord
{
	w: string,
	/**
	 * 詞性
	 */
	p?: number,
	/**
	 * 詞性名稱
	 */
	ps?: string,
	pp?: string,
	/**
	 * 權重
	 */
	f?: number,
	/**
	 * 开始位置
	 */
	c?: number,
	/**
	 * 合併項目
	 */
	m?: Array<IWord | string>,

	//convertSynonym?: boolean,
	//autoCreate?: boolean,

	/**
	 * 代表原生存在於字典內的項目
	 */
	s?: boolean,
	os?: boolean,
}

export interface IOptionsDoSegment
{
	/**
	 * 不返回词性
	 */
	simple?: boolean,

	/**
	 * 去除标点符号
	 */
	stripPunctuation?: boolean,

	/**
	 * 转换同义词
	 */
	convertSynonym?: boolean,

	/**
	 * 去除停止符
	 */
	stripStopword?: boolean,

	stripSpace?: boolean,

	disableModules?: (ENUM_SUBMODS_NAME | unknown)[],
}
