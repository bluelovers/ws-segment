"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useModules = void 0;
const useModules_1 = require("./useModules");
function useModules(me, mod, ...argv) {
    if (Array.isArray(mod)) {
        mod.forEach(function (m) {
            useModules(me, m, ...argv);
        });
    }
    else {
        if (typeof mod === 'string' && !useModules_1._isIgnoreModules(me, mod, ...argv)) {
            //mod = require(path.join(__dirname, '../..', 'submod', mod));
            mod = require(`../../submod/${mod}`);
        }
        useModules_1.useModules(me, mod, ...argv);
    }
    return me;
}
exports.useModules = useModules;
//# sourceMappingURL=useModules2.js.map