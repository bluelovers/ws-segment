"use strict";
/**
 * Created by user on 2018/4/19/019.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const cjk_1 = require("../util/cjk");
/**
 * 日期时间常见组合
 */
exports._DATETIME = [
    '世纪', '年', '年份', '年度', '月', '月份', '月度', '日', '号',
    '时', '点', '点钟', '分', '分钟', '秒', '毫秒'
];
exports.DATETIME = cjk_1.arr_cjk(exports._DATETIME)
    .reduce(function (data, v) {
    data[v] = v.length;
    return data;
}, {});
const self = require("./const");
exports.default = self;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJjb25zdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7O0FBR0gscUNBQXNDO0FBRXRDOztHQUVHO0FBQ1EsUUFBQSxTQUFTLEdBQUc7SUFDdEIsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxHQUFHO0lBQ2hELEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUk7Q0FDcEMsQ0FBQztBQUVXLFFBQUEsUUFBUSxHQUFrQixhQUFPLENBQUMsaUJBQVMsQ0FBQztLQUN2RCxNQUFNLENBQUMsVUFBVSxJQUFJLEVBQUUsQ0FBQztJQUV4QixJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQztJQUVuQixPQUFPLElBQUksQ0FBQztBQUNiLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FDTjtBQUVELGdDQUFnQztBQUNoQyxrQkFBZSxJQUFJLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgdXNlciBvbiAyMDE4LzQvMTkvMDE5LlxuICovXG5cbmltcG9ydCB7IElESUNUIH0gZnJvbSAnLi4vU2VnbWVudCc7XG5pbXBvcnQgeyBhcnJfY2prIH0gZnJvbSAnLi4vdXRpbC9jamsnO1xuXG4vKipcbiAqIOaXpeacn+aXtumXtOW4uOingee7hOWQiFxuICovXG5leHBvcnQgbGV0IF9EQVRFVElNRSA9IFtcblx0J+S4lue6qicsICflubQnLCAn5bm05Lu9JywgJ+W5tOW6picsICfmnIgnLCAn5pyI5Lu9JywgJ+aciOW6picsICfml6UnLCAn5Y+3Jyxcblx0J+aXticsICfngrknLCAn54K56ZKfJywgJ+WIhicsICfliIbpkp8nLCAn56eSJywgJ+avq+enkidcbl07XG5cbmV4cG9ydCBjb25zdCBEQVRFVElNRTogSURJQ1Q8bnVtYmVyPiA9IGFycl9jamsoX0RBVEVUSU1FKVxuXHQucmVkdWNlKGZ1bmN0aW9uIChkYXRhLCB2KVxuXHR7XG5cdFx0ZGF0YVt2XSA9IHYubGVuZ3RoO1xuXG5cdFx0cmV0dXJuIGRhdGE7XG5cdH0sIHt9KVxuO1xuXG5pbXBvcnQgKiBhcyBzZWxmIGZyb20gJy4vY29uc3QnO1xuZXhwb3J0IGRlZmF1bHQgc2VsZjtcbiJdfQ==