"use strict";
/**
 * Created by user on 2018/2/24/024.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const segment_dict_1 = require("segment-dict");
exports.SegmentDict = segment_dict_1.default;
const SegmentDictLoader = require("segment-dict/lib/loader/segment");
exports.SegmentDictLoader = SegmentDictLoader;
const SegmentSynonymLoader = require("segment-dict/lib/loader/segment/synonym");
exports.SegmentSynonymLoader = SegmentSynonymLoader;
const self = require("./loader");
exports.default = self;
