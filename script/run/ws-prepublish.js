"use strict";
/**
 * Created by user on 2020/6/27.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_pkg_list_1 = require("ws-pkg-list");
const ws_changed_1 = __importDefault(require("@yarn-tool/ws-changed"));
const find_deps_1 = require("@yarn-tool/find-deps");
const cross_spawn_extra_1 = __importDefault(require("cross-spawn-extra"));
const array_hyper_unique_1 = require("array-hyper-unique");
exports.default = (async () => {
    let record = ws_pkg_list_1.wsPkgDepsListableRecord();
    const listChanged = ws_changed_1.default();
    const cwd = listChanged.cwd;
    let list = listChanged.changed.concat(listChanged.staged).map(row => row.name);
    if (list.includes("segment-dict") || list.includes("novel-segment")) {
        list.push("segment-dict");
        array_hyper_unique_1.array_unique_overwrite(list);
    }
    let list2 = find_deps_1.findUpDepsAllDeep(list, record);
    let list3 = list2.reduce((a, b) => {
        a.push(b[0]);
        return a;
    }, []);
    console.log(list2);
    if (list3.length) {
        let cp = await cross_spawn_extra_1.default.async('lerna', [
            `run`,
            ...list3.map(v => `--scope=${v}`),
            `--concurrency`,
            1,
            `prepublishOnly`,
        ], {
            cwd,
            stdio: 'inherit',
        });
        if (cp.exitCode) {
            process.exit(cp.exitCode);
        }
    }
})();
//# sourceMappingURL=ws-prepublish.js.map