"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._doSegmentSimple = exports._doSegmentStripSpace = exports._doSegmentStripStopword = exports._doSegmentStripPOSTAG = void 0;
function _doSegmentStripPOSTAG(ret, postag) {
    return ret.filter(function (item) {
        return item.p !== postag;
    });
}
exports._doSegmentStripPOSTAG = _doSegmentStripPOSTAG;
/**
 * 去除停止符
 */
function _doSegmentStripStopword(ret, STOPWORD) {
    return ret.filter(function (item) {
        return !(item.w in STOPWORD);
    });
}
exports._doSegmentStripStopword = _doSegmentStripStopword;
function _doSegmentStripSpace(ret) {
    return ret.filter(function (item) {
        return !/^\s+$/g.test(item.w);
    });
}
exports._doSegmentStripSpace = _doSegmentStripSpace;
/**
 * 仅返回单词内容
 */
function _doSegmentSimple(ret) {
    return ret.map(function (item) {
        return item.w;
    });
}
exports._doSegmentSimple = _doSegmentSimple;
//# sourceMappingURL=doSegment.js.map