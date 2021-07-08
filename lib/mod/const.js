"use strict";
/**
 * Created by user on 2018/4/19/019.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DATETIME = exports._DATETIME = void 0;
const cjk_1 = require("../util/cjk");
/**
 * 日期时间常见组合
 */
exports._DATETIME = [
    '世纪', '年', '年份', '年度', '月', '月份', '月度', '日', '号',
    '时', '点', '点钟', '分', '分钟', '秒', '毫秒'
];
exports.DATETIME = (0, cjk_1.arr_cjk)(exports._DATETIME)
    .reduce(function (data, v) {
    data[v] = v.length;
    return data;
}, {});
exports.default = exports;
//# sourceMappingURL=const.js.map