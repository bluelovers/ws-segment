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
        if (segment) {
            this.init(segment);
        }
    }
    static init(segment, ...argv) {
        let mod = new this();
        mod.init(segment, ...argv);
        return mod;
    }
    init(segment, ...argv) {
        this.segment = segment;
        return this;
    }
}
exports.SubSModule = SubSModule;
const self = require("./module");
exports.default = self;
