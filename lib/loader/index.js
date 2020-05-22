"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireModule = exports.requireDefault = void 0;
__exportStar(require("@novel-segment/loaders"), exports);
const loaders_1 = require("@novel-segment/loaders");
Object.defineProperty(exports, "requireDefault", { enumerable: true, get: function () { return loaders_1.requireDefault; } });
Object.defineProperty(exports, "requireModule", { enumerable: true, get: function () { return loaders_1.requireModule; } });
exports.default = loaders_1.requireDefault;
//# sourceMappingURL=index.js.map