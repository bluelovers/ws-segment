"use strict";
/**
 * Created by user on 2018/4/16/016.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.useDefault = exports.Segment = exports.getDefaultModList = void 0;
const tslib_1 = require("tslib");
const mod_1 = tslib_1.__importDefault(require("./mod"));
exports.getDefaultModList = mod_1.default;
const Segment_1 = require("./Segment");
Object.defineProperty(exports, "Segment", { enumerable: true, get: function () { return Segment_1.Segment; } });
const defaults_1 = require("./defaults");
Object.defineProperty(exports, "useDefault", { enumerable: true, get: function () { return defaults_1.useDefault; } });
exports.default = Segment_1.Segment;
//# sourceMappingURL=index.js.map