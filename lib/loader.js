"use strict";
/**
 * Created by user on 2018/2/24/024.
 */
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-ignore
const fs = require("fs");
const crlf_normalize_1 = require("crlf-normalize");
const segment_dict_1 = require("segment-dict");
exports.SegmentDict = segment_dict_1.default;
const SegmentDictLoader = require("segment-dict/lib/loader/segment");
exports.SegmentDictLoader = SegmentDictLoader;
const SegmentSynonymLoader = require("segment-dict/lib/loader/segment/synonym");
exports.SegmentSynonymLoader = SegmentSynonymLoader;
function loadTxtSync(filename, options = {}) {
    let data = fs
        .readFileSync(filename, {
        encoding: options.encoding ? options.encoding : null,
    })
        .toString();
    if (options.toLowerCase) {
        data = data.toLowerCase();
    }
    return crlf_normalize_1.crlf(data);
}
exports.loadTxtSync = loadTxtSync;
const self = require("./loader");
exports.default = self;
