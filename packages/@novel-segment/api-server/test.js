"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSegment = void 0;
const core_1 = require("novel-segment/lib/segment/core");
const useModules2_1 = require("novel-segment/lib/segment/methods/useModules2");
const mod_1 = require("novel-segment/lib/mod");
//import { parse } from 'qs';
const url_1 = require("url");
let CACHED_SEGMENT;
function createSegment() {
    return new core_1.default({
        autoCjk: true,
        optionsDoSegment: {
            convertSynonym: true,
        },
        all_mod: true,
    });
}
function getSegment() {
    const DICT = require('./cache/cache.json');
    CACHED_SEGMENT = createSegment();
    useModules2_1.useModules(CACHED_SEGMENT, mod_1.default(CACHED_SEGMENT.options.all_mod));
    CACHED_SEGMENT.DICT = DICT;
    CACHED_SEGMENT.inited = true;
    return CACHED_SEGMENT;
}
exports.getSegment = getSegment;
//console.dir(getSegment().doSegment('韓國明文禁止遊戲代練 即日起代練遊戲獲利者將處以兩年以下有期徒刑'));
console.dir(url_1.parse("/?input=%E5%8E%BB%E9%99%A4%E5%81%9C%E6%AD%A2%E7%AC%A6&input=%E5%8E%BB%E9%99%A4%E5%81%9C%E6%AD%A2%E7%AC%A6&debug=true", true));
//# sourceMappingURL=test.js.map