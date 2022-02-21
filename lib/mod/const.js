"use strict";
/**
 * Created by user on 2018/4/19/019.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DATETIME = exports._DATETIME = void 0;
const list_1 = require("@lazy-cjk/zh-table-list/list");
/**
 * 日期时间常见组合
 */
exports._DATETIME = [
    '世纪', '年', '年份', '年度', '月', '月份', '月度', '日', '号',
    '时', '点', '点钟', '分', '分钟', '秒', '毫秒'
];
exports.DATETIME = (0, list_1.arrCjk)(exports._DATETIME)
    .reduce(function (data, v) {
    data[v] = v.length;
    return data;
}, {});
exports.default = exports;
//# sourceMappingURL=const.js.map