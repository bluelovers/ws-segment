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
const _segment_dict = require("segment-dict");
const _cjk_conv = require("cjk-conv");
const _regexp_cjk = require("regexp-cjk");
const _package_json = require("./package.json");
__Segment.version = _package_json.version;
__Segment.version_dict = _segment_dict.version;
exports.versions = __Segment.versions = Object.assign(__Segment.versions || {}, {
    'novel-segment': _package_json.version,
    'segment-dict': _segment_dict.version,
    'regexp-cjk': _regexp_cjk.version,
    'cjk-conv': _cjk_conv.version,
});
__Segment.POSTAG = POSTAG_1.POSTAG;
__Segment.Segment = Segment_1.Segment;
__Segment.default = __Segment;
module.exports = __Segment;
