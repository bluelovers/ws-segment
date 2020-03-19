"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnumDictDatabase = void 0;
var EnumDictDatabase;
(function (EnumDictDatabase) {
    EnumDictDatabase["SYNONYM"] = "SYNONYM";
    EnumDictDatabase["TABLE"] = "TABLE";
    EnumDictDatabase["STOPWORD"] = "STOPWORD";
    /**
     * 字典黑名單 在主字典內刪除此字典內有的條目
     */
    EnumDictDatabase["BLACKLIST"] = "BLACKLIST";
    /**
     * 優化器黑名單 會防止部分優化器去組合此字典內的詞
     * 例如 人名 自動組合之類
     */
    EnumDictDatabase["BLACKLIST_FOR_OPTIMIZER"] = "BLACKLIST_FOR_OPTIMIZER";
    /**
     * 轉換黑名單 動態轉換字詞時會忽略此字典內的詞
     */
    EnumDictDatabase["BLACKLIST_FOR_SYNONYM"] = "BLACKLIST_FOR_SYNONYM";
})(EnumDictDatabase = exports.EnumDictDatabase || (exports.EnumDictDatabase = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJjb25zdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSxJQUFrQixnQkF1QmpCO0FBdkJELFdBQWtCLGdCQUFnQjtJQUdqQyx1Q0FBbUIsQ0FBQTtJQUNuQixtQ0FBZSxDQUFBO0lBQ2YseUNBQXFCLENBQUE7SUFFckI7O09BRUc7SUFDSCwyQ0FBdUIsQ0FBQTtJQUV2Qjs7O09BR0c7SUFDSCx1RUFBbUQsQ0FBQTtJQUVuRDs7T0FFRztJQUNILG1FQUErQyxDQUFBO0FBRWhELENBQUMsRUF2QmlCLGdCQUFnQixHQUFoQix3QkFBZ0IsS0FBaEIsd0JBQWdCLFFBdUJqQyIsInNvdXJjZXNDb250ZW50IjpbIlxuZXhwb3J0IGNvbnN0IGVudW0gRW51bURpY3REYXRhYmFzZVxue1xuXG5cdFNZTk9OWU0gPSAnU1lOT05ZTScsXG5cdFRBQkxFID0gJ1RBQkxFJyxcblx0U1RPUFdPUkQgPSAnU1RPUFdPUkQnLFxuXG5cdC8qKlxuXHQgKiDlrZflhbjpu5HlkI3llq4g5Zyo5Li75a2X5YW45YWn5Yiq6Zmk5q2k5a2X5YW45YWn5pyJ55qE5qKd55uuXG5cdCAqL1xuXHRCTEFDS0xJU1QgPSAnQkxBQ0tMSVNUJyxcblxuXHQvKipcblx0ICog5YSq5YyW5Zmo6buR5ZCN5ZauIOacg+mYsuatoumDqOWIhuWEquWMluWZqOWOu+e1hOWQiOatpOWtl+WFuOWFp+eahOipnlxuXHQgKiDkvovlpoIg5Lq65ZCNIOiHquWLlee1hOWQiOS5i+mhnlxuXHQgKi9cblx0QkxBQ0tMSVNUX0ZPUl9PUFRJTUlaRVIgPSAnQkxBQ0tMSVNUX0ZPUl9PUFRJTUlaRVInLFxuXG5cdC8qKlxuXHQgKiDovYnmj5vpu5HlkI3llq4g5YuV5oWL6L2J5o+b5a2X6Kme5pmC5pyD5b+955Wl5q2k5a2X5YW45YWn55qE6KmeXG5cdCAqL1xuXHRCTEFDS0xJU1RfRk9SX1NZTk9OWU0gPSAnQkxBQ0tMSVNUX0ZPUl9TWU5PTllNJyxcblxufVxuIl19