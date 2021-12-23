"use strict";
/**
 * Created by user on 2018/2/24/024.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SegmentSynonymLoader = exports.SegmentDictLoader = exports.SegmentDict = void 0;
const tslib_1 = require("tslib");
const segment_dict_1 = tslib_1.__importDefault(require("segment-dict"));
exports.SegmentDict = segment_dict_1.default;
const SegmentDictLoader = tslib_1.__importStar(require("segment-dict/lib/loader/segment"));
exports.SegmentDictLoader = SegmentDictLoader;
const SegmentSynonymLoader = tslib_1.__importStar(require("@novel-segment/loaders/segment/synonym"));
exports.SegmentSynonymLoader = SegmentSynonymLoader;
exports.default = {
    SegmentDict: segment_dict_1.default,
    SegmentDictLoader,
    SegmentSynonymLoader,
};
//# sourceMappingURL=loader.js.map