"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useDefaultMods = void 0;
const index_1 = require("../mod/index");
function useDefaultMods(segment, options = {}) {
    !options.nomod && segment.use(index_1.default(options.all_mod));
    return segment;
}
exports.useDefaultMods = useDefaultMods;
//# sourceMappingURL=mods.js.map