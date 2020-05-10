"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableDictBlacklist = void 0;
const line_1 = require("./line");
let TableDictBlacklist = /** @class */ (() => {
    class TableDictBlacklist extends line_1.default {
        constructor(type = TableDictBlacklist.type, options = {}, ...argv) {
            super(type, options, ...argv);
        }
    }
    TableDictBlacklist.type = "BLACKLIST" /* BLACKLIST */;
    return TableDictBlacklist;
})();
exports.TableDictBlacklist = TableDictBlacklist;
exports.default = TableDictBlacklist;
//# sourceMappingURL=blacklist.js.map