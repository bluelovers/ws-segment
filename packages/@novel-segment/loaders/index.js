"use strict";
/**
 * @novel-segment/loaders
 *
 * 載入器模組聚合器
 * Loader Module Aggregator
 *
 * 統一匯出各種字典載入器，為 novel-segment 提供模組化的字典載入功能。
 * Provides unified exports for various dictionary loaders, offering modular dictionary loading for novel-segment.
 *
 * 支援的載入器類型 / Supported Loader Types:
 * - line: 行式字典載入器 / Line-based dictionary loader
 * - stopword: 停用詞字典載入器 / Stopword dictionary loader
 * - jieba: 結巴格式字典載入器 / Jieba format dictionary loader
 * - opencc: OpenCC 轉換字典載入器 / OpenCC conversion dictionary loader
 * - segment: 斷詞字典載入器 / Segment dictionary loader
 *
 * @module @novel-segment/loaders
 *
 * @example
 * ```ts
 * import load from '@novel-segment/loaders';
 * import { requireDefault, requireModule } from '@novel-segment/loaders';
 *
 * // 載入斷詞字典 / Load segment dictionary
 * const dict = await load('segment')('path/to/dict.txt');
 *
 * // 使用模組載入行式字典 / Load line dictionary with module
 * const lineModule = requireModule('line');
 * const lineDict = await lineModule.load('path/to/lines.txt');
 * ```
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireModule = exports.requireDefault = void 0;
const lib_1 = require("./lib");
Object.defineProperty(exports, "requireDefault", { enumerable: true, get: function () { return lib_1.requireDefault; } });
Object.defineProperty(exports, "requireModule", { enumerable: true, get: function () { return lib_1.requireModule; } });
exports.default = lib_1.requireDefault;
//# sourceMappingURL=index.js.map