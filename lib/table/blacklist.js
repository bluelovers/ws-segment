"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableDictBlacklist = void 0;
const line_1 = require("./line");
class TableDictBlacklist extends line_1.default {
    constructor(type = TableDictBlacklist.type, options = {}, ...argv) {
        super(type, options, ...argv);
    }
}
exports.TableDictBlacklist = TableDictBlacklist;
TableDictBlacklist.type = "BLACKLIST" /* BLACKLIST */;
exports.default = TableDictBlacklist;
//# sourceMappingURL=blacklist.js.map