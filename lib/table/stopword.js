"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableDictStopword = void 0;
const line_1 = require("./line");
/**
 * 原版 node-segment 的格式
 */
class TableDictStopword extends line_1.default {
    constructor(type = TableDictStopword.type, options = {}, ...argv) {
        super(type, options, ...argv);
    }
}
exports.TableDictStopword = TableDictStopword;
TableDictStopword.type = 'STOPWORD';
exports.default = TableDictStopword;
//# sourceMappingURL=stopword.js.map