"use strict";
/**
 * Created by user on 2018/7/24/024.
 */
/// <reference types="cross-spawn" />
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const path_2 = require("path");
(async () => {
    let crossSpawn;
    // @ts-ignore
    crossSpawn = await Promise.resolve().then(() => __importStar(require('cross-spawn-extra')));
    let gitroot;
    // @ts-ignore
    gitroot = await Promise.resolve().then(() => __importStar(require('git-root2')));
    // @ts-ignore
    gitroot = gitroot(__dirname);
    let project_root = path_2.join(__dirname, '..');
    if (!gitroot || path_1.default.relative(gitroot, project_root)) {
        let __root_ws = await Promise.resolve().then(() => __importStar(require('../../../../__root_ws'))).then(m => m.__root_ws)
            .catch(e => null);
        if (!__root_ws || path_1.default.relative(gitroot, __root_ws)) {
            console.warn(`no git exists`);
            console.warn(`__root_ws`, __root_ws);
            console.warn(`gitroot`, gitroot);
            console.warn(`path.relative`, path_1.default.relative(gitroot, project_root));
            return;
        }
    }
    let cwd = path_2.join(project_root);
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