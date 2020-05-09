"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireModule = exports.requireDefault = void 0;
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
//# sourceMappingURL=index.js.map