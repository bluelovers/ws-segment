"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useModules = exports._warnIgnoreModules = exports._isIgnoreModules = void 0;
function _isIgnoreModules(me, mod, ...argv) {
    return (me.options && me.options.disableModules && me.options.disableModules.includes(mod));
}
exports._isIgnoreModules = _isIgnoreModules;
function _warnIgnoreModules(mod) {
    console.warn(`can't use this mod, because it got disable: ${mod}`);
}
exports._warnIgnoreModules = _warnIgnoreModules;
function useModules(me, mod, ...argv) {
    if (_isIgnoreModules(me, mod, ...argv)) {
        _warnIgnoreModules(mod);
    }
    else {
        // 初始化并注册模块
        let c = mod.init(me, ...argv);
        if (typeof c !== 'undefined') {
            mod = c;
        }
        // @ts-ignore
        me.modules[mod.type].push(mod);
    }
    return me;
}
exports.useModules = useModules;
//# sourceMappingURL=useModules.js.map