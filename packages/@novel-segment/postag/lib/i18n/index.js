"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.zhName = exports.chsName = exports.enName = void 0;
const keys_1 = __importDefault(require("../keys"));
const ids_1 = __importDefault(require("../postag/ids"));
const chs_1 = __importDefault(require("../postag/chs"));
const cht_1 = __importDefault(require("../postag/cht"));
const en_1 = __importDefault(require("../postag/en"));
const getPOSTagTranslator_1 = __importDefault(require("../util/getPOSTagTranslator"));
keys_1.default.forEach(function (key) {
    var _a, _b, _c, _d;
    let lc = key.toLowerCase();
    // @ts-ignore
    (_a = ids_1.default[lc]) !== null && _a !== void 0 ? _a : (ids_1.default[lc] = ids_1.default[key]);
    // @ts-ignore
    (_b = chs_1.default[lc]) !== null && _b !== void 0 ? _b : (chs_1.default[lc] = chs_1.default[key]);
    // @ts-ignore
    (_c = cht_1.default[lc]) !== null && _c !== void 0 ? _c : (cht_1.default[lc] = cht_1.default[key]);
    // @ts-ignore
    (_d = en_1.default[lc]) !== null && _d !== void 0 ? _d : (en_1.default[lc] = en_1.default[key]);
});
exports.enName = getPOSTagTranslator_1.default(ids_1.default, en_1.default);
exports.chsName = getPOSTagTranslator_1.default(ids_1.default, chs_1.default);
exports.zhName = getPOSTagTranslator_1.default(ids_1.default, cht_1.default);
//# sourceMappingURL=index.js.map