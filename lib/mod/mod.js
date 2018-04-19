"use strict";
/**
 * Created by user on 2018/2/21/021.
 */
Object.defineProperty(exports, "__esModule", { value: true });
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
            if (typeof mod._cache == 'function') {
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
    }
    createToken(data, skipCheck) {
        let TABLE = this._TABLE;
        if (!skipCheck && !(data.w in TABLE)) {
            this.debugToken(data, {
                autoCreate: true,
            });
        }
        return data;
    }
    sliceToken(words, pos, len, data, skipCheck) {
        words.splice(pos, len, this.createToken(data, skipCheck));
        return words;
    }
    debugToken(data, attr, returnToken, ...argv) {
        return debug_1.debugToken(data, attr, returnToken, ...argv);
    }
}
exports.SubSModule = SubSModule;
const self = require("./mod");
exports.default = self;
