"use strict";
/**
 * Created by user on 2018/2/24/024.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SegmentSynonymLoader = exports.SegmentDictLoader = exports.SegmentDict = void 0;
const segment_dict_1 = require("segment-dict");
exports.SegmentDict = segment_dict_1.default;
const SegmentDictLoader = require("segment-dict/lib/loader/segment");
exports.SegmentDictLoader = SegmentDictLoader;
const SegmentSynonymLoader = require("segment-dict/lib/loader/segment/synonym");
exports.SegmentSynonymLoader = SegmentSynonymLoader;
exports.default = {
    SegmentDict: segment_dict_1.default,
    SegmentDictLoader,
    SegmentSynonymLoader,
};
//# sourceMappingURL=loader.js.map