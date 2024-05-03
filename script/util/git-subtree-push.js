"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gitSubtreePush = gitSubtreePush;
const tslib_1 = require("tslib");
const logger_1 = tslib_1.__importDefault(require("debug-color2/logger"));
const __root_ws_1 = tslib_1.__importDefault(require("../../__root_ws"));
const fs_extra_1 = require("fs-extra");
const create_cache_name_1 = tslib_1.__importDefault(require("./create-cache-name"));
const index_1 = require("@git-lazy/subtree/index");
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
    let error;
    if (remote && prefix) {
        await (0, index_1.subtreePush)({
            remote,
            prefix,
            cwd: __root_ws_1.default
        })
            .then(cp => {
            if (cp.exitCode) {
                error = true;
            }
        })
            .catch(e => error = e);
        /*
        await crossSpawn.async('git', [
            'subtree',
            'push',
            remote,
            'master',
            '--prefix',
            prefix,
        ], {
            cwd: __root_ws,
            stdio: 'inherit',
        });
         */
    }
    if (error) {
        if (error !== true) {
            logger_1.default.error(error);
        }
    }
    else {
        let file = (0, create_cache_name_1.default)('subtree', module_name);
        if ((0, fs_extra_1.pathExistsSync)(file)) {
            logger_1.default.debug(`[subtree:script]`, `del`, module_name);
            (0, fs_extra_1.unlinkSync)(file);
        }
    }
}
//# sourceMappingURL=git-subtree-push.js.map