"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireModule = exports.requireDefault = void 0;
const tslib_1 = require("tslib");
tslib_1.__exportStar(require("@novel-segment/loaders"), exports);
const loaders_1 = require("@novel-segment/loaders");
Object.defineProperty(exports, "requireDefault", { enumerable: true, get: function () { return loaders_1.requireDefault; } });
Object.defineProperty(exports, "requireModule", { enumerable: true, get: function () { return loaders_1.requireModule; } });
exports.default = loaders_1.requireDefault;
//# sourceMappingURL=index.js.map