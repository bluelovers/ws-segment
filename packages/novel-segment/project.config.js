"use strict";
/**
 * Created by user on 2017/8/13/013.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.temp_root = exports.dict_root = exports.project_root = void 0;
const tslib_1 = require("tslib");
const path = tslib_1.__importStar(require("path"));
exports.project_root = path.join(__dirname);
exports.dict_root = path.join(exports.project_root, 'dicts');
//export const dist_root = path.join(project_root, 'dist');
exports.temp_root = path.join(exports.project_root, 'test/temp');
exports.default = exports;
//# sourceMappingURL=project.config.js.map