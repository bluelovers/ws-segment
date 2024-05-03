"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._doSegmentStripPOSTAG = _doSegmentStripPOSTAG;
exports._doSegmentStripStopword = _doSegmentStripStopword;
exports._doSegmentStripSpace = _doSegmentStripSpace;
exports._doSegmentSimple = _doSegmentSimple;
function _doSegmentStripPOSTAG(ret, postag) {
    return ret.filter(function (item) {
        return item.p !== postag;
    });
}
/**
 * 去除停止符
 */
function _doSegmentStripStopword(ret, STOPWORD) {
    return ret.filter(function (item) {
        return !(item.w in STOPWORD);
    });
}
function _doSegmentStripSpace(ret) {
    return ret.filter(function (item) {
        return !/^\s+$/g.test(item.w);
    });
}
/**
 * 仅返回单词内容
 */
function _doSegmentSimple(ret) {
    return ret.map(function (item) {
        return item.w;
    });
}
//# sourceMappingURL=doSegment.js.map