"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.POSTAG_KEYS = void 0;
const ids_1 = __importDefault(require("./postag/ids"));
const ts_enum_util_1 = require("ts-enum-util");
exports.POSTAG_KEYS = ts_enum_util_1.$enum(ids_1.default).getKeys();
exports.default = exports.POSTAG_KEYS;
//# sourceMappingURL=keys.js.map