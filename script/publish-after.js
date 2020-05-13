"use strict";
/**
 * Created by user on 2018/7/24/024.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const project_config_1 = require("../project.config");
const PackageJson = require("../package.json");
const path_1 = require("path");
/// <reference types="cross-spawn" />
(async () => {
    let crossSpawn;
    // @ts-ignore
    crossSpawn = await Promise.resolve().then(() => require('cross-spawn-extra'));
    let gitroot;
    // @ts-ignore
    gitroot = await Promise.resolve().then(() => require('git-root2'));
    // @ts-ignore
    gitroot = gitroot(__dirname);
    if (!gitroot || path.relative(gitroot, project_config_1.default.project_root)) {
        let __root_ws = await Promise.resolve().then(() => require('../../../__root_ws')).then(m => m.__root_ws)
            .catch(e => null);
        if (!__root_ws || path.relative(gitroot, __root_ws)) {
            console.warn(`no git exists`);
            console.warn(`__root_ws`, __root_ws);
            console.warn(`gitroot`, gitroot);
            console.warn(`path.relative`, path.relative(gitroot, project_config_1.default.project_root));
            return;
        }
    }
    let cwd = path_1.join(project_config_1.default.project_root, 'dict');
    let options = {
        cwd,
        stdio: 'inherit',
    };
    let msg = `npm publish ${PackageJson.version}`;
    await crossSpawn('git', [
        'commit',
        //'-a',
        '-m',
        msg,
        '.',
    ], options);
    /*
    await new Promise(function (done)
    {
        setTimeout(done, 500);
    });

    await crossSpawn('git', [
        'tag',
        '-a',
        PackageJson.version,
        '-m',
        msg,
        // @ts-ignore
    ], options);
     */
})().catch(e => console.error(e));
//# sourceMappingURL=publish-after.js.map