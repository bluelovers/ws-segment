"use strict";
/**
 * Created by user on 2018/2/21/021.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubSModule = exports.SModule = void 0;
const debug_1 = require("../util/debug");
class SModule {
    /**
     * @param {Segment} segment 分词接口
     */
    constructor(segment) {
        this.segment = segment;
    }
    _doMethod(fn, target, mods, ...argv) {
        mods.forEach(function (mod) {
            // @ts-ignore
            if (typeof mod._cache === 'function') {
                // @ts-ignore
                mod._cache();
            }
            target = mod[fn](target, ...argv);
        });
        return target;
    }
}
exports.SModule = SModule;
class SubSModule {
    constructor(type, segment, ...argv) {
        if (type) {
            this.type = type;
        }
        if (!this.type) {
            throw new Error();
        }
        if (segment) {
            this.init(segment, ...argv);
            this.inited = true;
        }
    }
    static init(segment, ...argv) {
        // @ts-ignore
        return this._init(this, segment, ...argv);
    }
    static _init(libThis, segment, ...argv) {
        if (!libThis.type) {
            throw new Error();
        }
        let mod = new libThis(libThis.type, segment, ...argv);
        if (!mod.inited) {
            mod.init(segment, ...argv);
            mod.inited = true;
        }
        // @ts-ignore
        return mod;
    }
    init(segment, ...argv) {
        this.segment = segment;
        this.inited = true;
        //this._cache();
        return this;
    }
    _cache(...argv) {
        this._POSTAG = this.segment.POSTAG;
    }
    /**
     * 回傳最簡版的 IWord { w, p, f, s }
     */
    createRawToken(data, ow, attr) {
        var _a, _b, _c, _d;
        // @ts-ignore
        ow = ow || {};
        let nw = {
            w: (_a = data.w) !== null && _a !== void 0 ? _a : ow.w,
            p: (_b = data.p) !== null && _b !== void 0 ? _b : ow.p,
            f: (_c = data.f) !== null && _c !== void 0 ? _c : ow.f,
            s: (_d = data.s) !== null && _d !== void 0 ? _d : ow.s,
        };
        if (attr) {
            this.debugToken(nw, attr);
        }
        return nw;
    }
    createToken(data, skipCheck, attr) {
        let TABLE = this._TABLE;
        if (!skipCheck && TABLE && !(data.w in TABLE)) {
            this.debugToken(data, {
                autoCreate: true,
            });
        }
        // 自動將模組名稱血入 debug 資訊
        if (this.name) {
            attr = Object.assign(attr || {});
            if (!(this.name in attr)) {
                // @ts-ignore
                attr[this.name] = true;
            }
        }
        if (attr) {
            this.debugToken(data, attr);
        }
        return data;
    }
    sliceToken(words, pos, len, data, skipCheck, attr) {
        words.splice(pos, len, this.createToken(data, skipCheck, attr));
        return words;
    }
    debugToken(data, attr, returnToken, ...argv) {
        return (0, debug_1.debugToken)(data, attr, returnToken, ...argv);
    }
}
exports.SubSModule = SubSModule;
exports.default = exports;
//# sourceMappingURL=mod.js.map