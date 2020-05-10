"use strict";
/**
 * Created by user on 2018/4/12/012.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDictPath = void 0;
const segment_dict_1 = require("segment-dict");
const path = require("path");
function getDictPath(id, file, ...argv) {
    return path.join(segment_dict_1.DICT_ROOT, ...[id, file].concat(argv));
}
exports.getDictPath = getDictPath;
exports.default = getDictPath;
//# sourceMappingURL=index.js.map