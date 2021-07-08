"use strict";
/**
 * Created by user on 2020/5/11.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDictPath = void 0;
const __1 = require("../");
const path_1 = require("path");
function getDictPath(id, file, ...argv) {
    return (0, path_1.join)(__1.DICT_ROOT, ...[id, file].concat(argv));
}
exports.getDictPath = getDictPath;
exports.default = getDictPath;
//# sourceMappingURL=dict.js.map