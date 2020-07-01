"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZhuyinTokenizer = exports.ZhtSynonymOptimizer = exports.ZhRadicalTokenizer = exports.WildcardTokenizer = exports.URLTokenizer = exports.SingleTokenizer = exports.PunctuationTokenizer = exports.JpSimpleTokenizer = exports.ForeignTokenizer = exports.ForeignOptimizer = exports.EmailOptimizer = exports.DictTokenizer = exports.DictOptimizer = exports.DatetimeOptimizer = exports.ChsNameTokenizer = exports.ChsNameOptimizer = exports.AdjectiveOptimizer = void 0;
const AdjectiveOptimizer = __importStar(require("./submod/AdjectiveOptimizer"));
exports.AdjectiveOptimizer = AdjectiveOptimizer;
const ChsNameOptimizer = __importStar(require("./submod/ChsNameOptimizer"));
exports.ChsNameOptimizer = ChsNameOptimizer;
const ChsNameTokenizer = __importStar(require("./submod/ChsNameTokenizer"));
exports.ChsNameTokenizer = ChsNameTokenizer;
const DatetimeOptimizer = __importStar(require("./submod/DatetimeOptimizer"));
exports.DatetimeOptimizer = DatetimeOptimizer;
const DictOptimizer = __importStar(require("./submod/DictOptimizer"));
exports.DictOptimizer = DictOptimizer;
const DictTokenizer = __importStar(require("./submod/DictTokenizer"));
exports.DictTokenizer = DictTokenizer;
const EmailOptimizer = __importStar(require("./submod/EmailOptimizer"));
exports.EmailOptimizer = EmailOptimizer;
const ForeignOptimizer = __importStar(require("./submod/ForeignOptimizer"));
exports.ForeignOptimizer = ForeignOptimizer;
const ForeignTokenizer = __importStar(require("./submod/ForeignTokenizer"));
exports.ForeignTokenizer = ForeignTokenizer;
const JpSimpleTokenizer = __importStar(require("./submod/JpSimpleTokenizer"));
exports.JpSimpleTokenizer = JpSimpleTokenizer;
const PunctuationTokenizer = __importStar(require("./submod/PunctuationTokenizer"));
exports.PunctuationTokenizer = PunctuationTokenizer;
const SingleTokenizer = __importStar(require("./submod/SingleTokenizer"));
exports.SingleTokenizer = SingleTokenizer;
const URLTokenizer = __importStar(require("./submod/URLTokenizer"));
exports.URLTokenizer = URLTokenizer;
const WildcardTokenizer = __importStar(require("./submod/WildcardTokenizer"));
exports.WildcardTokenizer = WildcardTokenizer;
const ZhRadicalTokenizer = __importStar(require("./submod/ZhRadicalTokenizer"));
exports.ZhRadicalTokenizer = ZhRadicalTokenizer;
const ZhtSynonymOptimizer = __importStar(require("./submod/ZhtSynonymOptimizer"));
exports.ZhtSynonymOptimizer = ZhtSynonymOptimizer;
const ZhuyinTokenizer = __importStar(require("./submod/ZhuyinTokenizer"));
exports.ZhuyinTokenizer = ZhuyinTokenizer;
//# sourceMappingURL=submod.js.map