"use strict";
/**
 * Created by user on 2020/6/2.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.versions = exports.version_dict = exports.version = void 0;
exports.default = exports.version;
Object.defineProperty(exports, "version", {
    get() {
        return require('./package.json').version;
    }
});
Object.defineProperty(exports, "version_dict", {
    get() {
        return require('segment-dict/version').version;
    }
});
Object.defineProperty(exports, "versions", {
    get() {
        return {
            'novel-segment': exports.version,
            'segment-dict': exports.version_dict,
            'regexp-cjk': require('regexp-cjk/version').version,
            'cjk-conv': require('cjk-conv/version').version,
        };
    }
});
Object.defineProperty(exports, "default", {
    get() {
        return exports.version;
    }
});
//# sourceMappingURL=version.js.map