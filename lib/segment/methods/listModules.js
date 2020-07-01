"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listModules = void 0;
function listModules(modules, options) {
    let ret = {
        enable: {
            tokenizer: [],
            optimizer: [],
        },
        disable: {
            tokenizer: [],
            optimizer: [],
        },
    };
    if (options === null || options === void 0 ? void 0 : options.disableModules) {
        modules.tokenizer
            .forEach(function (mod) {
            let bool;
            if (mod.name) {
                if (options.disableModules.includes(mod.name)) {
                    bool = true;
                }
            }
            else {
                if (options.disableModules.includes(mod)) {
                    bool = true;
                }
            }
            ret[bool ? 'disable' : 'enable'].tokenizer.push(mod);
        });
        modules.optimizer
            .forEach(function (mod) {
            let bool;
            if (mod.name) {
                if (options.disableModules.includes(mod.name)) {
                    bool = true;
                }
            }
            else {
                if (options.disableModules.includes(mod)) {
                    bool = true;
                }
            }
            ret[bool ? 'disable' : 'enable'].optimizer.push(mod);
        });
    }
    else {
        ret.enable.tokenizer = modules.tokenizer.slice();
        ret.enable.optimizer = modules.optimizer.slice();
    }
    return ret;
}
exports.listModules = listModules;
//# sourceMappingURL=listModules.js.map