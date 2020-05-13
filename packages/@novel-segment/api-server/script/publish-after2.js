"use strict";
/**
 * Created by user on 2018/7/24/024.
 */
/// <reference types="cross-spawn" />
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const path_1 = require("path");
(async () => {
    let crossSpawn;
    // @ts-ignore
    crossSpawn = await Promise.resolve().then(() => require('cross-spawn-extra'));
    let gitroot;
    // @ts-ignore
    gitroot = await Promise.resolve().then(() => require('git-root2'));
    // @ts-ignore
    gitroot = gitroot(__dirname);
    let project_root = path_1.join(__dirname, '..');
    if (!gitroot || path.relative(gitroot, project_root)) {
        let __root_ws = await Promise.resolve().then(() => require('../../../../__root_ws')).then(m => m.__root_ws)
            .catch(e => null);
        if (!__root_ws || path.relative(gitroot, __root_ws)) {
            console.warn(`no git exists`);
            console.warn(`__root_ws`, __root_ws);
            console.warn(`gitroot`, gitroot);
            console.warn(`path.relative`, path.relative(gitroot, project_root));
            return;
        }
    }
    let cwd = path_1.join(project_root);
    let options = {
        cwd,
        stdio: 'inherit',
    };
    let msg = `chore: update api-server\n\n[skip ci]`;
    await crossSpawn('git', [
        'commit',
        //'-a',
        '-m',
        msg,
        '.',
    ], options);
})().catch(e => console.error(e));
//# sourceMappingURL=publish-after2.js.map