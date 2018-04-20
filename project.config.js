"use strict";
/**
 * Created by user on 2017/8/13/013.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
exports.project_root = path.join(__dirname);
exports.dict_root = path.join(exports.project_root, 'dicts');
//export const dist_root = path.join(project_root, 'dist');
exports.temp_root = path.join(exports.project_root, 'test/temp');
const self = require("./project.config");
exports.default = self;
