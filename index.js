/**
 * 中文分词器
 *
 * @author 老雷<leizongmin@gmail.com>
 */
'use strict';
const tslib_1 = require("tslib");
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
tslib_1.__exportStar(require("./version"), exports);
__Segment.POSTAG = ids_1.POSTAG;
__Segment.Segment = Segment_1.Segment;
__Segment.default = __Segment;
module.exports = __Segment;
//# sourceMappingURL=index.js.map