"use strict";
/**
 * Created by user on 2018/2/24/024.
 */
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-ignore
const fs = require("fs");
const crlf_normalize_1 = require("crlf-normalize");
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
