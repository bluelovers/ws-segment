"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cross_spawn_extra_1 = __importDefault(require("cross-spawn-extra"));
const __root_ws_1 = __importDefault(require("../../__root_ws"));
(async () => {
    await cross_spawn_extra_1.default.async('git', [
        'add',
        '-f',
        './packages/novel-segment/test/temp/cache.common.synonym.db.info.json',
    ], {
        cwd: __root_ws_1.default,
        stdio: 'inherit',
    });
    await cross_spawn_extra_1.default.async('git', [
        'add',
        '-f',
        './packages/novel-segment/test/temp/cache.db.info.json',
    ], {
        cwd: __root_ws_1.default,
        stdio: 'inherit',
    });
    await cross_spawn_extra_1.default.async('git', [
        'commit',
        '-m',
        'build(cache): build segment cache',
    ], {
        cwd: __root_ws_1.default,
        stdio: 'inherit',
    });
})();
//# sourceMappingURL=ci-build.js.map