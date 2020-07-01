"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.gitSubtreePush = void 0;
/**
 * Created by user on 2020/5/13.
 */
const cross_spawn_extra_1 = __importDefault(require("cross-spawn-extra"));
const logger_1 = __importDefault(require("debug-color2/logger"));
const __root_ws_1 = __importDefault(require("../../__root_ws"));
const fs_extra_1 = require("fs-extra");
const create_cache_name_1 = __importDefault(require("./create-cache-name"));
async function gitSubtreePush(module_name) {
    let remote;
    let prefix;
    switch (module_name) {
        case 'novel-segment':
            remote = 'node-segment';
            prefix = `packages/${module_name}`;
            break;
        case 'segment-dict':
            remote = 'node-segment-dict';
            prefix = `packages/${module_name}`;
            break;
        case 'novel-segment-cli':
            remote = module_name;
            prefix = `packages/${module_name}`;
            break;
    }
    if (remote && prefix) {
        await cross_spawn_extra_1.default.async('git', [
            'subtree',
            'push',
            remote,
            'master',
            '--prefix',
            prefix,
        ], {
            cwd: __root_ws_1.default,
            stdio: 'inherit',
        });
    }
    let file = create_cache_name_1.default('subtree', module_name);
    if (fs_extra_1.pathExistsSync(file)) {
        logger_1.default.debug(`[subtree:script]`, `del`, module_name);
        fs_extra_1.unlinkSync(file);
    }
}
exports.gitSubtreePush = gitSubtreePush;
//# sourceMappingURL=git-subtree-push.js.map