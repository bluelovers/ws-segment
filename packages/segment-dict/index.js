"use strict";
/**
 * Created by user on 2018/4/12/012.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.version = exports.DICT_ROOT = exports.ROOT = exports.getDictPath = exports.requireLoaderModule = exports.requireLoader = void 0;
const project_config_1 = require("./project.config");
const package_json_1 = require("./package.json");
const index_1 = require("@novel-segment/loaders/index");
exports.requireLoader = index_1.default;
Object.defineProperty(exports, "requireLoaderModule", { enumerable: true, get: function () { return index_1.requireModule; } });
const dict_1 = require("./lib/dict");
exports.getDictPath = dict_1.default;
exports.ROOT = project_config_1.default.project_root;
exports.DICT_ROOT = project_config_1.default.dict_root;
exports.version = package_json_1.version;
exports.default = exports;
//# sourceMappingURL=index.js.map