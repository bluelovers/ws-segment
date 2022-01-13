"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableDictStopword = void 0;
const tslib_1 = require("tslib");
const line_1 = tslib_1.__importDefault(require("./line"));
/**
 * 原版 node-segment 的格式
 */
class TableDictStopword extends line_1.default {
    constructor(type = TableDictStopword.type, options = {}, ...argv) {
        super(type, options, ...argv);
    }
}
exports.TableDictStopword = TableDictStopword;
TableDictStopword.type = "STOPWORD" /* STOPWORD */;
exports.default = TableDictStopword;
//# sourceMappingURL=stopword.js.map