"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useModules = void 0;
const tslib_1 = require("tslib");
const useModules_1 = require("./useModules");
const BuildInSubMod = tslib_1.__importStar(require("../../submod"));
function useModules(me, mod, ...argv) {
    if (Array.isArray(mod)) {
        mod.forEach(function (m) {
            useModules(me, m, ...argv);
        });
    }
    else {
        if (typeof mod === 'string' && !(0, useModules_1._isIgnoreModules)(me, mod, ...argv)) {
            //mod = require(path.join(__dirname, '../..', 'submod', mod));
            //mod = require(`../../submod/${mod}`);
            mod = BuildInSubMod[mod];
        }
        (0, useModules_1.useModules)(me, mod, ...argv);
    }
    return me;
}
exports.useModules = useModules;
//# sourceMappingURL=useModules2.js.map