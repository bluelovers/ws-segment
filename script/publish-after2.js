"use strict";
/**
 * Created by user on 2018/7/24/024.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const path = require("path");
/// <reference types="cross-spawn" />
const index = require("../index");
const project_config_1 = tslib_1.__importDefault(require("../project.config"));
const path_1 = require("path");
(async () => {
    let crossSpawn;
    // @ts-ignore
    crossSpawn = await import('cross-spawn-extra');
    let gitroot;
    // @ts-ignore
    gitroot = await import('git-root2').then(m => m.sync);
    // @ts-ignore
    gitroot = gitroot(__dirname);
    if (!gitroot || path.relative(gitroot, project_config_1.default.project_root)) {
        let __root_ws = await import('../../../__root_ws')
            .then(m => m.__root_ws)
            .catch(e => null);
        if (!__root_ws || path.relative(gitroot, __root_ws)) {
            console.warn(`no git exists`);
            console.warn(`__root_ws`, __root_ws);
            console.warn(`gitroot`, gitroot);
            console.warn(`path.relative`, path.relative(gitroot, project_config_1.default.project_root));
            return;
        }
    }
    let cwd = (0, path_1.join)(project_config_1.default.project_root, 'test');
    let options = {
        cwd,
        stdio: 'inherit',
    };
    let msg = `novel-segment@${index.versions['novel-segment']}, segment-dict@${index.versions['segment-dict']}, cjk-conv@${index.versions['cjk-conv']}, regexp-cjk@${index.versions['regexp-cjk']}`;
    await crossSpawn('git', [
        'commit',
        //'-a',
        '-m',
        msg,
        '.',
    ], options);
})().catch(e => console.error(e));
//# sourceMappingURL=publish-after2.js.map