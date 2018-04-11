"use strict";
/**
 * Created by user on 2018/4/12/012.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const project_config_1 = require("./project.config");
const loader_1 = require("./lib/loader");
exports.requireLoader = loader_1.default;
exports.requireLoaderModule = loader_1.requireModule;
const dict_1 = require("./lib/dict");
exports.getDictPath = dict_1.default;
exports.ROOT = project_config_1.default.project_root;
exports.DICT_ROOT = project_config_1.default.dict_root;
const self = require("./index");
exports.default = self;
