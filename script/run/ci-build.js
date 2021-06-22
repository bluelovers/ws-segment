"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const cross_spawn_extra_1 = tslib_1.__importDefault(require("cross-spawn-extra"));
const __root_ws_1 = tslib_1.__importDefault(require("../../__root_ws"));
(async () => {
    await cross_spawn_extra_1.default.async('git', [
        'add',
        '-f',
        '*.info.json',
    ], {
        cwd: __root_ws_1.default,
        stdio: 'inherit',
    });
    await cross_spawn_extra_1.default.async('git', [
        'add',
        '-f',
        '*.db',
    ], {
        cwd: __root_ws_1.default,
        stdio: 'inherit',
    });
    await cross_spawn_extra_1.default.async('git', [
        'commit',
        '-m',
        'build(cache): build segment cache',
        './packages/novel-segment/test/temp/',
    ], {
        cwd: __root_ws_1.default,
        stdio: 'inherit',
    });
})();
//# sourceMappingURL=ci-build.js.map