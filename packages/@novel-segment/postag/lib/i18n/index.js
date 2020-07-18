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
    let lc = key.toLowerCase();
    // @ts-ignore
    ids_1.default[lc] = ids_1.default[key];
    // @ts-ignore
    chs_1.default[lc] = chs_1.default[key];
    // @ts-ignore
    cht_1.default[lc] = cht_1.default[key];
    // @ts-ignore
    en_1.default[lc] = en_1.default[key];
});
exports.enName = getPOSTagTranslator_1.default(ids_1.default, en_1.default);
exports.chsName = getPOSTagTranslator_1.default(ids_1.default, chs_1.default);
exports.zhName = getPOSTagTranslator_1.default(ids_1.default, cht_1.default);
//# sourceMappingURL=index.js.map