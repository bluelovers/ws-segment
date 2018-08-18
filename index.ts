/**
 * 中文分词器
 *
 * @author 老雷<leizongmin@gmail.com>
 */
'use strict';

import { Segment, IWord, IDICT, IOptionsSegment, IDICT2, IDICT_STOPWORD, IDICT_SYNONYM, IOptionsDoSegment } from './lib/Segment';
import { POSTAG } from './lib/POSTAG';

const _Segment = Segment as typeof Segment & {
	version: string,
	version_dict: string,
	/**
	 * 分词接口
	 */
	Segment: typeof Segment,
	/**
	 * 词性接口
	 */
	POSTAG: typeof POSTAG,
};

const __Segment = _Segment as typeof _Segment & {
	default: typeof _Segment,
};

export = __Segment;

// @ts-ignore
__Segment.version = require('./package.json').version;
// @ts-ignore
__Segment.version_dict = require('segment-dict/package.json').version;
__Segment.POSTAG = POSTAG;
__Segment.Segment = Segment;
__Segment.default = __Segment;

/*
使用示例：

var segment = new Segment();
// 使用默认的识别模块及字典
segment.useDefault();
// 开始分词
console.log(segment.doSegment('这是一个基于Node.js的中文分词模块。'));
*/
