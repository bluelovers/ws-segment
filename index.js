"use strict";
/**
 * Created by user on 2018/4/12/012.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DICT_ROOT = exports.ROOT = exports.getDictPath = exports.requireLoaderModule = exports.requireLoader = void 0;
const project_config_1 = require("./project.config");
__exportStar(require("./version"), exports);
const index_1 = require("@novel-segment/loaders/index");
exports.requireLoader = index_1.default;
Object.defineProperty(exports, "requireLoaderModule", { enumerable: true, get: function () { return index_1.requireModule; } });
const dict_1 = require("./lib/dict");
exports.getDictPath = dict_1.default;
exports.ROOT = project_config_1.default.project_root;
exports.DICT_ROOT = project_config_1.default.dict_root;
exports.default = exports;
//# sourceMappingURL=index.js.map