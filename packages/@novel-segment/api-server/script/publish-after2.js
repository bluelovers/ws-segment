"use strict";
/**
 * Created by user on 2018/7/24/024.
 */
/// <reference types="cross-spawn" />
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const path_1 = tslib_1.__importDefault(require("path"));
const cross_spawn_extra_1 = tslib_1.__importDefault(require("cross-spawn-extra"));
const git_root2_1 = tslib_1.__importDefault(require("git-root2"));
const path_2 = require("path");
(async () => {
    let gitroot = (0, git_root2_1.default)(__dirname);
    let project_root = (0, path_2.join)(__dirname, '..');
    if (!gitroot || path_1.default.relative(gitroot, project_root)) {
        let __root_ws = await Promise.resolve().then(() => tslib_1.__importStar(require('../../../../__root_ws'))).then(m => m.__root_ws)
            .catch(e => null);
        if (!__root_ws || path_1.default.relative(gitroot, __root_ws)) {
            console.warn(`no git exists`);
            console.warn(`__root_ws`, __root_ws);
            console.warn(`gitroot`, gitroot);
            console.warn(`path.relative`, path_1.default.relative(gitroot, project_root));
            return;
        }
    }
    let cwd = (0, path_2.join)(project_root);
    let options = {
        cwd,
        stdio: 'inherit',
    };
    let msg = `chore: update api-server\n\n[skip ci]`;
    await (0, cross_spawn_extra_1.default)('git', [
        'commit',
        //'-a',
        '-m',
        msg,
        '.',
    ], options);
})().catch(e => console.error(e));
//# sourceMappingURL=publish-after2.js.map