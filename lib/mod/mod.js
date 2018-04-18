"use strict";
/**
 * Created by user on 2018/2/21/021.
 */
Object.defineProperty(exports, "__esModule", { value: true });
class SModule {
    /**
     * @param {Segment} segment 分词接口
     */
    constructor(segment) {
        this.segment = segment;
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
        return this;
    }
}
exports.SubSModule = SubSModule;
const self = require("./mod");
exports.default = self;