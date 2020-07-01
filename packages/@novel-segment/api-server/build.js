"use strict";
/**
 * Created by user on 2019/6/28.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Created by user on 2019/6/26.
 */
const lib_1 = __importDefault(require("novel-segment/lib"));
const fs_extra_1 = require("fs-extra");
//import { resolve } from 'bluebird';
const path_1 = require("path");
const __root = __dirname;
function buildCache() {
    const CACHED_SEGMENT = createSegment();
    CACHED_SEGMENT.doSegment('');
    return fs_extra_1.outputJSON(path_1.join(__root, 'cache', 'cache.json'), CACHED_SEGMENT.DICT)
        .then(() => {
        console.log('[buildCache] done');
    });
}
function createSegment() {
    return new lib_1.default({
        autoCjk: true,
        optionsDoSegment: {
            convertSynonym: true,
        },
        all_mod: true,
    });
}
buildCache();
//# sourceMappingURL=build.js.map