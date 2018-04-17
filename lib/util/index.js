"use strict";
/**
 * Created by user on 2018/4/17/017.
 */
Object.defineProperty(exports, "__esModule", { value: true });
function toHex(p) {
    return '0x' + p
        .toString(16)
        .padStart(4, '0')
        .toUpperCase();
}
exports.toHex = toHex;
const self = require("./index");
exports.default = self;
