"use strict";
/**
 * Created by user on 2020/5/11.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const bluebird_1 = require("@bluelovers/fast-glob/bluebird");
const path_1 = require("path");
const __root_ws_1 = require("../../__root_ws");
const fs_extra_1 = require("fs-extra");
const git_subtree_push_1 = require("../util/git-subtree-push");
bluebird_1.default
    .async([
    '**/*',
], {
    cwd: path_1.join(__root_ws_1.default, 'temp', 'subtree'),
    absolute: true,
})
    .map(file => fs_extra_1.readFile(file, 'utf8'))
    .mapSeries(async (module_name) => {
    return git_subtree_push_1.gitSubtreePush(module_name);
});
//# sourceMappingURL=postpublish-subtree.js.map