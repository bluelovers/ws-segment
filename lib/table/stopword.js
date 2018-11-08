"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const line_1 = require("./line");
/**
 * 原版 node-segment 的格式
 */
class TableDictStopword extends line_1.default {
    constructor(type = TableDictStopword.type, options = {}, ...argv) {
        super(type, options);
    }
}
TableDictStopword.type = 'STOPWORD';
exports.TableDictStopword = TableDictStopword;
exports.default = TableDictStopword;
