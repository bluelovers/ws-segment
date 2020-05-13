"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gitSubtreePush = void 0;
/**
 * Created by user on 2020/5/13.
 */
const cross_spawn_extra_1 = require("cross-spawn-extra");
const __root_ws_1 = require("../../__root_ws");
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
        });
    }
}
exports.gitSubtreePush = gitSubtreePush;
//# sourceMappingURL=git-subtree-push.js.map