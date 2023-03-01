"use strict";
/**
 * Created by user on 2018/7/24/024.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const path_1 = tslib_1.__importDefault(require("path"));
const project_config_1 = tslib_1.__importDefault(require("../project.config"));
const PackageJson = tslib_1.__importStar(require("../package.json"));
const path_2 = require("path");
/// <reference types="cross-spawn" />
(async () => {
    let crossSpawn;
    // @ts-ignore
    crossSpawn = await import('cross-spawn-extra');
    let gitroot;
    // @ts-ignore
    gitroot = await import('git-root2').then(m => m.sync);
    // @ts-ignore
    gitroot = gitroot(__dirname);
    if (!gitroot || path_1.default.relative(gitroot, project_config_1.default.project_root)) {
        let __root_ws = await import('../../../__root_ws')
            .then(m => m.__root_ws)
            .catch(e => null);
        if (!__root_ws || path_1.default.relative(gitroot, __root_ws)) {
            console.warn(`no git exists`);
            console.warn(`__root_ws`, __root_ws);
            console.warn(`gitroot`, gitroot);
            console.warn(`path.relative`, path_1.default.relative(gitroot, project_config_1.default.project_root));
            return;
        }
    }
    let cwd = (0, path_2.join)(project_config_1.default.project_root, 'dict');
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
        // @ts-ignore
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