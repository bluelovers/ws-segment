"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPOSTagTranslator = void 0;
const ids_1 = __importDefault(require("../postag/ids"));
const keys_1 = __importDefault(require("../keys"));
const enum_1 = require("./enum");
function getPOSTagTranslator(POSTagDict, I18NDict) {
    return (p) => {
        if (enum_1.enumIsNaN(p)) {
            return I18NDict[p] || I18NDict.UNK;
        }
        if (typeof p === 'string') {
            p = Number(p);
        }
        let ret = keys_1.default.reduce(function (ret, i) {
            if ((p & ids_1.default[i])) 
            //if ((<number>p & <number>POSTAG[i]) > 0)
            {
                ret.push(I18NDict[i] || i);
            }
            return ret;
        }, []);
        if (ret.length < 1) {
            return I18NDict.UNK;
        }
        else {
            return ret.toString();
        }
    };
}
exports.getPOSTagTranslator = getPOSTagTranslator;
exports.default = getPOSTagTranslator;
//# sourceMappingURL=getPOSTagTranslator.js.map