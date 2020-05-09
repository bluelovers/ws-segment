"use strict";
/**
 * Created by user on 2017/8/13/013.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectConfig = exports.temp_root = exports.dict_root = exports.project_root = void 0;
const path = require("path");
exports.project_root = path.join(__dirname);
exports.dict_root = path.join(exports.project_root, 'dict');
//export const dist_root = path.join(project_root, 'dist');
exports.temp_root = path.join(exports.project_root, 'test/temp');
const ProjectConfig = require("./project.config");
exports.ProjectConfig = ProjectConfig;
exports.default = ProjectConfig;
//# sourceMappingURL=project.config.js.map