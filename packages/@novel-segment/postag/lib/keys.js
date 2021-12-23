"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POSTAG_KEYS = void 0;
const tslib_1 = require("tslib");
const ids_1 = tslib_1.__importDefault(require("./postag/ids"));
const ts_enum_util_1 = require("ts-enum-util");
exports.POSTAG_KEYS = (0, ts_enum_util_1.$enum)(ids_1.default).getKeys();
exports.default = exports.POSTAG_KEYS;
//# sourceMappingURL=keys.js.map