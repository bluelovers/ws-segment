"use strict";
/**
 * Created by user on 2018/4/12/012.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
const path = require("path");
function getDictPath(id, file, ...argv) {
    return path.join(index_1.DICT_ROOT, ...[id, file].concat(argv));
}
exports.getDictPath = getDictPath;
exports.default = getDictPath;
