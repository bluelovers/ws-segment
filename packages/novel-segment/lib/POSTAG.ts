'use strict';

import { enumList, enumIsNaN } from './util/core';

/**
 * 单词类型
 */
export enum POSTAG
{
	
	/**
	 * 錯字
	 */
	BAD = 0x80000000,
	/**
	 * 形容词 形语素
	 */
	D_A = 0x40000000,
	/**
	 * 区别词 区别语素
	 */
	D_B = 0x20000000,
	/**
	 * 连词 连语素
	 */
	D_C = 0x10000000,

	// ---

	/**
	 * 副词 副语素
	 */
	D_D = 0x08000000,
	/**
	 * 叹词 叹语素
	 */
	D_E = 0x04000000,
	/**
	 * 方位词 方位语素
	 */
	D_F = 0x02000000,
	/**
	 * 成语
	 */
	D_I = 0x01000000,

	// ---

	/**
	 * 习语
	 * 類似成語或者曖昧無法分明的用語
	 */
	D_L = 0x00800000,
	/**
	 * 数词 数语素
	 * 可以與其他數詞或者量詞合併的詞
	 */
	A_M = 0x00400000,
	/**
	 * 数量词
	 */
	D_MQ = 0x00200000,
	/**
	 * 名词 名语素
	 */
	D_N = 0x00100000,

	// ---

	/**
	 * 拟声词
	 */
	D_O = 0x00080000,
	/**
	 * 介词
	 */
	D_P = 0x00040000,
	/**
	 * 量词 量语素
	 * 可以與數詞合併的詞
	 */
	A_Q = 0x00020000,
	/**
	 * 代词 代语素
	 */
	D_R = 0x00010000,

	// ---

	/**
	 * 处所词
	 */
	D_S = 0x00008000,
	/**
	 * 时间词
	 */
	D_T = 0x00004000,
	/**
	 * 助词 助语素
	 */
	D_U = 0x00002000,
	/**
	 * 动词 动语素
	 */
	D_V = 0x00001000,

	// ---

	/**
	 * 标点符号
	 */
	D_W = 0x00000800,
	/**
	 * 非语素字
	 */
	D_X = 0x00000400,
	/**
	 * 语气词 语气语素
	 */
	D_Y = 0x00000200,
	/**
	 * 状态词
	 */
	D_Z = 0x00000100,

	// ---

	/**
	 * 人名
	 */
	A_NR = 0x00000080,
	/**
	 * 地名
	 */
	A_NS = 0x00000040,
	/**
	 * 机构团体
	 */
	A_NT = 0x00000020,
	/**
	 * 外文字符
	 */
	A_NX = 0x00000010,

	// ---

	/**
	 * 其他专名
	 */
	A_NZ = 0x00000008,
	/**
	 * 前接成分
	 */
	D_ZH = 0x00000004,
	/**
	 * 后接成分
	 */
	D_K = 0x00000002,
	/**
	 * 网址、邮箱地址
	 */
	URL = 0x00000001,

	/**
	 * 未知词性
	 */
	UNK = 0x00000000,
}

export namespace POSTAG
{
	export const POSTAG_KEYS = enumList(POSTAG);

	/**
	 * 中文说明
	 */
	export enum CHSNAME
	{
		BAD = '錯字',
		D_A = '形容词 形语素',
		D_B = '区别词 区别语素',
		D_C = '连词 连语素',
		D_D = '副词 副语素',
		D_E = '叹词 叹语素',
		D_F = '方位词 方位语素',
		D_I = '成语',
		D_L = '习语',
		A_M = '数词 数语素',
		D_MQ = '数量词',
		D_N = '名词 名语素',
		D_O = '拟声词',
		D_P = '介词',
		A_Q = '量词 量语素',
		D_R = '代词 代语素',
		D_S = '处所词',
		D_T = '时间词',
		D_U = '助词 助语素',
		D_V = '动词 动语素',
		D_W = '标点符号',
		D_X = '非语素字',
		D_Y = '语气词 语气语素',
		D_Z = '状态词',
		A_NR = '人名',
		A_NS = '地名',
		A_NT = '机构团体',
		A_NX = '外文字符',
		A_NZ = '其他专名',
		D_ZH = '前接成分',
		D_K = '后接成分',
		URL = '网址 邮箱地址',
		UNK = '未知',
	}

	/**
	 * 繁體中文说明
	 */
	export enum ZHNAME
	{
		BAD = '錯字',
		D_A = '形容詞 形語素',
		D_B = '區別詞 區別語素',
		D_C = '連詞 連語素',
		D_D = '副詞 副語素',
		D_E = '嘆詞 嘆語素',
		D_F = '方位詞 方位語素',
		D_I = '成語',
		D_L = '習語',
		A_M = '數詞 數語素',
		D_MQ = '數量詞',
		D_N = '名詞 名語素',
		D_O = '擬聲詞',
		D_P = '介詞',
		A_Q = '量詞 量語素',
		D_R = '代詞 代語素',
		D_S = '處所詞',
		D_T = '時間詞',
		D_U = '助詞 助語素',
		D_V = '動詞 動語素',
		D_W = '標點符號',
		D_X = '非語素字',
		D_Y = '語氣詞 語氣語素',
		D_Z = '狀態詞',
		A_NR = '人名',
		A_NS = '地名',
		A_NT = '機構團體',
		A_NX = '外文字符',
		A_NZ = '其他專名',
		D_ZH = '前接成分',
		D_K = '後接成分',
		URL = '網址 郵箱地址',
		UNK = '未知',
	}

	/**
	 * 英文
	 */
	export enum ENNAME
	{
		D_A = 'a',
		D_B = 'b',
		D_C = 'c',
		D_D = 'd',
		D_E = 'e',
		D_F = 'f',
		D_I = 'i',
		D_L = 'l',
		A_M = 'm',
		D_MQ = 'mq',
		D_N = 'n',
		D_O = 'o',
		D_P = 'p',
		A_Q = 'q',
		D_R = 'r',
		D_S = 's',
		D_T = 't',
		D_U = 'u',
		D_V = 'v',
		D_W = 'w',
		D_X = 'x',
		D_Y = 'y',
		D_Z = 'z',
		A_NR = 'nr',
		A_NS = 'ns',
		A_NT = 'nt',
		A_NX = 'nx',
		A_NZ = 'nz',
		D_ZH = 'h',
		D_K = 'k',
		URL = 'uri',
		UNK = 'un',
	}

	POSTAG_KEYS.forEach(function (key)
	{
		let lc = key.toLowerCase();

		POSTAG[lc] = POSTAG[key];
		CHSNAME[lc] = CHSNAME[key];
		ZHNAME[lc] = ZHNAME[key];
		ENNAME[lc] = ENNAME[key];
	});

	export const enName = getPOSTagTranslator(POSTAG, ENNAME);
	export const chsName = getPOSTagTranslator(POSTAG, CHSNAME);
	export const zhName = getPOSTagTranslator(POSTAG, ZHNAME);

	export function getPOSTagTranslator(POSTagDict: typeof POSTAG, I18NDict)
	{
		return (p: number | string): string =>
		{
			if (enumIsNaN(p))
			{
				return I18NDict[p] || I18NDict.UNK;
			}

			if (typeof p == 'string')
			{
				p = Number(p);
			}

			let ret = POSTAG_KEYS.reduce(function (ret, i)
			{
				if ((<number>p & <number>POSTAG[i]))
				//if ((<number>p & <number>POSTAG[i]) > 0)
				{
					ret.push(I18NDict[i] || i);
				}

				return ret;
			}, []);

			if (ret.length < 1)
			{
				return I18NDict.UNK;
			}
			else
			{
				return ret.toString();
			}
		};
	}
}

//console.log(POSTAG);
//console.log(POSTAG.chsName(0x00000008 | 0x00000010));

export default POSTAG;
