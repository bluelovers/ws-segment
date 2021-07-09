"use strict";
/**
 * Created by user on 2018/7/24/024.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const path = (0, tslib_1.__importStar)(require("path"));
const project_config_1 = (0, tslib_1.__importDefault)(require("../project.config"));
// @ts-ignore
const PackageJson = (0, tslib_1.__importStar)(require("../package.json"));
/// <reference types="cross-spawn" />
const index = require("../index");
(async () => {
    let crossSpawn;
    // @ts-ignore
    crossSpawn = await Promise.resolve().then(() => (0, tslib_1.__importStar)(require('cross-spawn-extra')));
    let gitroot;
    // @ts-ignore
    gitroot = await Promise.resolve().then(() => (0, tslib_1.__importStar)(require('git-root2')));
    // @ts-ignore
    gitroot = gitroot(__dirname);
    if (!gitroot || path.relative(gitroot, project_config_1.default.project_root)) {
        console.warn(`no git exists`);
        return;
    }
    let options = {
        cwd: project_config_1.default.project_root,
        stdio: 'inherit',
    };
    let msg = `npm publish ${PackageJson.version}`;
    msg += `\n\nnovel-segment@${index.versions['novel-segment']}, segment-dict@${index.versions['segment-dict']}, cjk-conv@${index.versions['cjk-conv']}, regexp-cjk@${index.versions['regexp-cjk']}`;
    await crossSpawn('git', [
        'commit',
        '-a',
        '-m',
        msg,
    ], options);
    await new Promise(function (done) {
        setTimeout(done, 500);
    });
    await crossSpawn('git', [
        'tag',
        '-a',
        PackageJson.version,
        '-m',
        msg,
    ], options);
})().catch(e => console.error(e));
//# sourceMappingURL=publish-after.js.map