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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDictPath = exports.requireLoaderModule = exports.requireLoader = exports.DICT_ROOT = exports.ROOT = void 0;
var project_config_1 = require("./project.config");
Object.defineProperty(exports, "ROOT", { enumerable: true, get: function () { return project_config_1.project_root; } });
Object.defineProperty(exports, "DICT_ROOT", { enumerable: true, get: function () { return project_config_1.dict_root; } });
__exportStar(require("./version"), exports);
const index_1 = __importStar(require("@novel-segment/loaders/index"));
exports.requireLoader = index_1.default;
Object.defineProperty(exports, "requireLoaderModule", { enumerable: true, get: function () { return index_1.requireModule; } });
var dict_1 = require("./lib/dict");
Object.defineProperty(exports, "getDictPath", { enumerable: true, get: function () { return dict_1.getDictPath; } });
exports.default = exports;
//# sourceMappingURL=index.js.map