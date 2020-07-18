/**
 * 中文分词器
 *
 * @author 老雷<leizongmin@gmail.com>
 */
'use strict';
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
const Segment_1 = require("./lib/Segment");
const ids_1 = require("@novel-segment/postag/lib/postag/ids");
const _Segment = Segment_1.Segment;
const __Segment = _Segment;
Object.defineProperty(__Segment, "version", {
    get() {
        return require('./version').version;
    }
});
Object.defineProperty(__Segment, "version_dict", {
    get() {
        return require('./version').version_dict;
    }
});
Object.defineProperty(__Segment, "versions", {
    get() {
        return require('./version').versions;
    }
});
// @ts-ignore
__exportStar(require("./version"), exports);
__Segment.POSTAG = ids_1.POSTAG;
__Segment.Segment = Segment_1.Segment;
__Segment.default = __Segment;
module.exports = __Segment;
//# sourceMappingURL=index.js.map