"use strict";
/**
 * Created by user on 2018/4/12/012.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDictPath = exports.requireLoaderModule = exports.requireLoader = exports.DICT_ROOT = exports.ROOT = void 0;
const tslib_1 = require("tslib");
var project_config_1 = require("./project.config");
Object.defineProperty(exports, "ROOT", { enumerable: true, get: function () { return project_config_1.project_root; } });
Object.defineProperty(exports, "DICT_ROOT", { enumerable: true, get: function () { return project_config_1.dict_root; } });
tslib_1.__exportStar(require("./version"), exports);
const index_1 = tslib_1.__importStar(require("@novel-segment/loaders/index"));
exports.requireLoader = index_1.default;
Object.defineProperty(exports, "requireLoaderModule", { enumerable: true, get: function () { return index_1.requireModule; } });
var dict_1 = require("./lib/dict");
Object.defineProperty(exports, "getDictPath", { enumerable: true, get: function () { return dict_1.getDictPath; } });
exports.default = exports;
//# sourceMappingURL=index.js.map