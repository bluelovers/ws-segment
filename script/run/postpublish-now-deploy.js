"use strict";
/**
 * Created by user on 2020/5/11.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const bluebird_1 = tslib_1.__importDefault(require("@bluelovers/fast-glob/bluebird"));
const path_1 = require("path");
const __root_ws_1 = tslib_1.__importDefault(require("../../__root_ws"));
const fs_extra_1 = require("fs-extra");
const cross_spawn_extra_1 = tslib_1.__importDefault(require("cross-spawn-extra"));
const add_to_postpublish_task_1 = require("../util/add-to-postpublish-task");
const Bluebird = require("bluebird");
const logger_1 = tslib_1.__importDefault(require("debug-color2/logger"));
const git_subtree_push_1 = require("../util/git-subtree-push");
bluebird_1.default
    .async([
    '**/*',
], {
    cwd: path_1.join(__root_ws_1.default, 'temp', 'postpublish'),
    absolute: true,
})
    .map(file => fs_extra_1.readFile(file, 'utf8'))
    .then(async (ls) => {
    logger_1.default.dir(ls);
    return Bluebird
        .mapSeries([
        '@novel-segment/api-server',
    ], async (module_name) => {
        let bool = ls.includes(module_name);
        logger_1.default.debug(`check`, module_name, bool);
        if (bool) {
            await cross_spawn_extra_1.default.async('lerna', [
                'run',
                '--stream',
                '--scope',
                module_name,
                'postpublish:done',
            ], {
                cwd: __root_ws_1.default,
                stdio: 'inherit',
            });
            await add_to_postpublish_task_1.del(module_name);
            await git_subtree_push_1.gitSubtreePush(module_name);
        }
        return bool;
    });
});
//# sourceMappingURL=postpublish-now-deploy.js.map