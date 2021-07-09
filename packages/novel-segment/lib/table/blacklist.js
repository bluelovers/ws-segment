"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableDictBlacklist = void 0;
const tslib_1 = require("tslib");
const line_1 = (0, tslib_1.__importDefault)(require("./line"));
class TableDictBlacklist extends line_1.default {
    constructor(type = TableDictBlacklist.type, options = {}, ...argv) {
        super(type, options, ...argv);
    }
}
exports.TableDictBlacklist = TableDictBlacklist;
TableDictBlacklist.type = "BLACKLIST" /* BLACKLIST */;
exports.default = TableDictBlacklist;
//# sourceMappingURL=blacklist.js.map