/**
 * 中文分词器
 *
 * @author 老雷<leizongmin@gmail.com>
 */
'use strict';

import { Segment as libSegment } from './lib/Segment';
import POSTAG from './lib/POSTAG';

const _Segment = libSegment as typeof libSegment & {
	version: string,
	/**
	 * 分词接口
	 */
	Segment: typeof libSegment,
	/**
	 * 词性接口
	 */
	POSTAG: typeof POSTAG,
};

const Segment = _Segment as typeof _Segment & {
	default: typeof _Segment,
};

export = Segment;

// @ts-ignore
Segment.version = require('./package.json').version;
Segment.POSTAG = POSTAG;
Segment.Segment = Segment;
Segment.default = Segment;

/*
使用示例：

var segment = new Segment();
// 使用默认的识别模块及字典
segment.useDefault();
// 开始分词
console.log(segment.doSegment('这是一个基于Node.js的中文分词模块。'));
*/
