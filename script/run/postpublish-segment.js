"use strict";
/**
 * Created by user on 2020/5/11.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const bluebird_1 = require("@bluelovers/fast-glob/bluebird");
const path_1 = require("path");
const __root_ws_1 = require("../../__root_ws");
const fs_extra_1 = require("fs-extra");
const cross_spawn_extra_1 = require("cross-spawn-extra");
const add_to_postpublish_task_1 = require("../util/add-to-postpublish-task");
const Bluebird = require("bluebird");
const logger_1 = require("debug-color2/logger");
const create_cache_name_1 = require("../util/create-cache-name");
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
        'segment-dict',
        'novel-segment',
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
            logger_1.default.debug(`[postpublish:script]`, `add`, module_name);
            fs_extra_1.outputFileSync(create_cache_name_1.default('subtree', module_name), module_name);
        }
        return bool;
    });
});
//# sourceMappingURL=postpublish-segment.js.map