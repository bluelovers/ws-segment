/**
 * 中文分词器
 *
 * @author 老雷<leizongmin@gmail.com>
 */
'use strict';
const Segment_1 = require("./lib/Segment");
const POSTAG_1 = require("./lib/POSTAG");
const _Segment = Segment_1.Segment;
const __Segment = _Segment;
// @ts-ignore
__Segment.version = require('./package.json').version;
// @ts-ignore
__Segment.version_dict = require('segment-dict/package.json').version;
__Segment.POSTAG = POSTAG_1.POSTAG;
__Segment.Segment = Segment_1.Segment;
__Segment.default = __Segment;
module.exports = __Segment;
