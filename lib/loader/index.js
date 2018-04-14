"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-ignore
const path = require("path");
function requireDefault(id, subtype) {
    return requireModule(id, subtype).default;
}
exports.requireDefault = requireDefault;
function requireModule(id, subtype) {
    // @ts-ignore
    return require(path.join(__dirname, id, subtype ? subtype : ''));
}
exports.requireModule = requireModule;
exports.default = requireDefault;
