/**
 * 中文分词器
 *
 * @author 老雷<leizongmin@gmail.com>
 */
'use strict';
const Segment_1 = require("./lib/Segment");
const POSTAG_1 = require("./lib/POSTAG");
const _Segment = Segment_1.Segment;
const Segment = _Segment;
// @ts-ignore
Segment.version = require('./package.json').version;
Segment.POSTAG = POSTAG_1.default;
Segment.Segment = Segment;
Segment.default = Segment;
module.exports = Segment;
