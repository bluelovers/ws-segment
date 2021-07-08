"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useDefault = void 0;
const mods_1 = require("./mods");
const dict_1 = require("./dict");
function useDefault(segment, options = {}) {
    // 识别模块
    !options.nomod && (0, mods_1.useDefaultMods)(segment, options);
    // 字典文件
    !options.nodict && (0, dict_1.useDefaultDicts)(segment, options);
    return segment;
}
exports.useDefault = useDefault;
//# sourceMappingURL=index.js.map