"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJjb25zdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLElBQWtCLGdCQXVCakI7QUF2QkQsV0FBa0IsZ0JBQWdCO0lBR2pDLHVDQUFtQixDQUFBO0lBQ25CLG1DQUFlLENBQUE7SUFDZix5Q0FBcUIsQ0FBQTtJQUVyQjs7T0FFRztJQUNILDJDQUF1QixDQUFBO0lBRXZCOzs7T0FHRztJQUNILHVFQUFtRCxDQUFBO0lBRW5EOztPQUVHO0lBQ0gsbUVBQStDLENBQUE7QUFFaEQsQ0FBQyxFQXZCaUIsZ0JBQWdCLEdBQWhCLHdCQUFnQixLQUFoQix3QkFBZ0IsUUF1QmpDIiwic291cmNlc0NvbnRlbnQiOlsiXG5leHBvcnQgY29uc3QgZW51bSBFbnVtRGljdERhdGFiYXNlXG57XG5cblx0U1lOT05ZTSA9ICdTWU5PTllNJyxcblx0VEFCTEUgPSAnVEFCTEUnLFxuXHRTVE9QV09SRCA9ICdTVE9QV09SRCcsXG5cblx0LyoqXG5cdCAqIOWtl+WFuOm7keWQjeWWriDlnKjkuLvlrZflhbjlhafliKrpmaTmraTlrZflhbjlhafmnInnmoTmop3nm65cblx0ICovXG5cdEJMQUNLTElTVCA9ICdCTEFDS0xJU1QnLFxuXG5cdC8qKlxuXHQgKiDlhKrljJblmajpu5HlkI3llq4g5pyD6Ziy5q2i6YOo5YiG5YSq5YyW5Zmo5Y6757WE5ZCI5q2k5a2X5YW45YWn55qE6KmeXG5cdCAqIOS+i+WmgiDkurrlkI0g6Ieq5YuV57WE5ZCI5LmL6aGeXG5cdCAqL1xuXHRCTEFDS0xJU1RfRk9SX09QVElNSVpFUiA9ICdCTEFDS0xJU1RfRk9SX09QVElNSVpFUicsXG5cblx0LyoqXG5cdCAqIOi9ieaPm+m7keWQjeWWriDli5XmhYvovYnmj5vlrZfoqZ7mmYLmnIPlv73nlaXmraTlrZflhbjlhafnmoToqZ5cblx0ICovXG5cdEJMQUNLTElTVF9GT1JfU1lOT05ZTSA9ICdCTEFDS0xJU1RfRk9SX1NZTk9OWU0nLFxuXG59XG4iXX0=