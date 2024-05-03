"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useDefaultMods = useDefaultMods;
const tslib_1 = require("tslib");
const index_1 = tslib_1.__importDefault(require("../mod/index"));
function useDefaultMods(segment, options = {}) {
    !options.nomod && segment.use((0, index_1.default)(options.all_mod));
    return segment;
}
//# sourceMappingURL=mods.js.map