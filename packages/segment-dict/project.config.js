"use strict";
/**
 * Created by user on 2017/8/13/013.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectConfig = exports.temp_root = exports.dict_root = exports.project_root = void 0;
const path_1 = require("path");
exports.project_root = (0, path_1.join)(__dirname);
exports.dict_root = (0, path_1.join)(exports.project_root, 'dict');
exports.temp_root = (0, path_1.join)(exports.project_root, 'test/temp');
exports.ProjectConfig = exports;
exports.default = exports.ProjectConfig;
//# sourceMappingURL=project.config.js.map