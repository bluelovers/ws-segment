"use strict";
/**
 * Created by user on 2018/7/24/024.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const project_config_1 = require("../project.config");
const PackageJson = require("../package.json");
const crossSpawn = require("cross-spawn");
(async () => {
    let gitroot;
    // @ts-ignore
    gitroot = await Promise.resolve().then(() => require('git-root2'));
    // @ts-ignore
    gitroot = gitroot();
    if (!gitroot || path.relative(gitroot, project_config_1.default.project_root)) {
        console.warn(`no git exists`);
        return;
    }
    let options = {
        cwd: project_config_1.default.project_root,
        stdio: 'inherit',
    };
    let msg = `npm publish ${PackageJson.version}`;
    await crossSpawn('git', [
        'commit',
        '-a',
        '-m',
        msg,
    ], options);
    await crossSpawn('git', [
        'tag',
        '-a',
        PackageJson.version,
        '-m',
        msg,
    ], options);
    console.log(gitroot, PackageJson);
})().catch(e => console.error(e));
