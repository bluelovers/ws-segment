"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useDefaultBlacklistDict = exports.useDefaultSynonymDict = exports.useDefaultDicts = void 0;
function useDefaultDicts(segment, options = {}) {
    if (!options.nodict) {
        // 字典文件
        segment
            //.loadDict('jieba') <=== bad file
            .loadDict('char')
            // 盘古词典
            .loadDict('pangu/phrases')
            .loadDict('pangu/phrases2')
            .loadDict('phrases/*')
            .loadDict('dict')
            .loadDict('dict2')
            .loadDict('dict3')
            .loadDict('dict4')
            .loadDict('pangu/dict005')
            .loadDict('pangu/dict006')
            //.loadDict('synonym/后')
            //.loadDict('synonym/參')
            //.loadDict('synonym/发')
            .loadDict('dict_synonym/*')
            //.loadDict('pangu/wildcard', 'WILDCARD', true)   // 通配符
            .loadStopwordDict('stopword') // 停止符
            .loadDict('lazy/dict_synonym')
            /*
            .loadDict('names/area')
            .loadDict('names/job')
            .loadDict('names/food')

            .loadDict('names/other')
            .loadDict('names/jp')
            .loadDict('names/zh')
            .loadDict('names/en')
            .loadDict('names/name')
             */
            .loadDict('names/*')
            .loadDict('lazy/index')
            .loadDict('pangu/num')
            .loadDict('lazy/badword')
            .loadDict('pangu/wildcard', 'WILDCARD', true);
        useDefaultSynonymDict(segment, options);
        useDefaultBlacklistDict(segment, options);
        segment.doBlacklist();
    }
    return segment;
}
exports.useDefaultDicts = useDefaultDicts;
function useDefaultSynonymDict(segment, options = {}) {
    if (!options.nodict) {
        segment
            .loadSynonymDict('synonym') // 同义词
            .loadSynonymDict('zht.synonym', false);
        if (options.nodeNovelMode) {
            segment
                .loadSynonymDict('badword.synonym', false)
                .loadSynonymDict('zht.common.synonym', false);
        }
    }
    return segment;
}
exports.useDefaultSynonymDict = useDefaultSynonymDict;
function useDefaultBlacklistDict(segment, options = {}) {
    if (!options.nodict) {
        segment
            .loadBlacklistDict('blacklist')
            .loadBlacklistOptimizerDict('blacklist.name')
            .loadBlacklistSynonymDict('blacklist.synonym');
    }
    return segment;
}
exports.useDefaultBlacklistDict = useDefaultBlacklistDict;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGljdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpY3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBS0EsU0FBZ0IsZUFBZSxDQUFDLE9BQWdCLEVBQUUsVUFBbUMsRUFBRTtJQUV0RixJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFDbkI7UUFDQyxPQUFPO1FBQ1AsT0FBTztZQUNQLGtDQUFrQzthQUVoQyxRQUFRLENBQUMsTUFBTSxDQUFDO1lBRWpCLE9BQU87YUFDTixRQUFRLENBQUMsZUFBZSxDQUFDO2FBQ3pCLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQzthQUMxQixRQUFRLENBQUMsV0FBVyxDQUFDO2FBRXJCLFFBQVEsQ0FBQyxNQUFNLENBQUM7YUFDaEIsUUFBUSxDQUFDLE9BQU8sQ0FBQzthQUNqQixRQUFRLENBQUMsT0FBTyxDQUFDO2FBQ2pCLFFBQVEsQ0FBQyxPQUFPLENBQUM7YUFDakIsUUFBUSxDQUFDLGVBQWUsQ0FBQzthQUN6QixRQUFRLENBQUMsZUFBZSxDQUFDO1lBRTFCLHdCQUF3QjtZQUN4Qix3QkFBd0I7WUFDeEIsd0JBQXdCO2FBQ3ZCLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQztZQUUzQix3REFBd0Q7YUFFdkQsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLENBQUMsTUFBTTthQUVuQyxRQUFRLENBQUMsbUJBQW1CLENBQUM7WUFFOUI7Ozs7Ozs7Ozs7ZUFVRzthQUVGLFFBQVEsQ0FBQyxTQUFTLENBQUM7YUFFbkIsUUFBUSxDQUFDLFlBQVksQ0FBQzthQUV0QixRQUFRLENBQUMsV0FBVyxDQUFDO2FBRXJCLFFBQVEsQ0FBQyxjQUFjLENBQUM7YUFFeEIsUUFBUSxDQUFDLGdCQUFnQixFQUFFLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FDN0M7UUFFRCxxQkFBcUIsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDeEMsdUJBQXVCLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBRTFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsQ0FBQztLQUN0QjtJQUVELE9BQU8sT0FBTyxDQUFBO0FBQ2YsQ0FBQztBQS9ERCwwQ0ErREM7QUFFRCxTQUFnQixxQkFBcUIsQ0FBQyxPQUFnQixFQUFFLFVBQW1DLEVBQUU7SUFFNUYsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQ25CO1FBQ0MsT0FBTzthQUNOLGVBQWUsQ0FBQyxTQUFTLENBQUMsQ0FBRyxNQUFNO2FBQ25DLGVBQWUsQ0FBQyxhQUFhLEVBQUUsS0FBSyxDQUFDLENBQ3JDO1FBRUQsSUFBSSxPQUFPLENBQUMsYUFBYSxFQUN6QjtZQUNDLE9BQU87aUJBQ0wsZUFBZSxDQUFDLGlCQUFpQixFQUFFLEtBQUssQ0FBQztpQkFDekMsZUFBZSxDQUFDLG9CQUFvQixFQUFFLEtBQUssQ0FBQyxDQUFBO1NBQzlDO0tBRUQ7SUFFRCxPQUFPLE9BQU8sQ0FBQTtBQUNmLENBQUM7QUFuQkQsc0RBbUJDO0FBRUQsU0FBZ0IsdUJBQXVCLENBQUMsT0FBZ0IsRUFBRSxVQUFtQyxFQUFFO0lBRTlGLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUNuQjtRQUNDLE9BQU87YUFDTCxpQkFBaUIsQ0FBQyxXQUFXLENBQUM7YUFDOUIsMEJBQTBCLENBQUMsZ0JBQWdCLENBQUM7YUFDNUMsd0JBQXdCLENBQUMsbUJBQW1CLENBQUMsQ0FDOUM7S0FDRDtJQUVELE9BQU8sT0FBTyxDQUFBO0FBQ2YsQ0FBQztBQVpELDBEQVlDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgU2VnbWVudCB9IGZyb20gJy4uL1NlZ21lbnQnO1xuaW1wb3J0IHsgSVVzZURlZmF1bHRPcHRpb25zLCBJVXNlRGVmYXVsdE9wdGlvbnNEaWN0cyB9IGZyb20gJy4vaW5kZXgnO1xuaW1wb3J0IGdldERlZmF1bHRNb2RMaXN0IGZyb20gJy4uL21vZC9pbmRleCc7XG5pbXBvcnQgU2VnbWVudENvcmUgZnJvbSAnLi4vc2VnbWVudC9jb3JlJztcblxuZXhwb3J0IGZ1bmN0aW9uIHVzZURlZmF1bHREaWN0cyhzZWdtZW50OiBTZWdtZW50LCBvcHRpb25zOiBJVXNlRGVmYXVsdE9wdGlvbnNEaWN0cyA9IHt9KVxue1xuXHRpZiAoIW9wdGlvbnMubm9kaWN0KVxuXHR7XG5cdFx0Ly8g5a2X5YW45paH5Lu2XG5cdFx0c2VnbWVudFxuXHRcdC8vLmxvYWREaWN0KCdqaWViYScpIDw9PT0gYmFkIGZpbGVcblxuXHRcdFx0LmxvYWREaWN0KCdjaGFyJylcblxuXHRcdFx0Ly8g55uY5Y+k6K+N5YW4XG5cdFx0XHQubG9hZERpY3QoJ3Bhbmd1L3BocmFzZXMnKVxuXHRcdFx0LmxvYWREaWN0KCdwYW5ndS9waHJhc2VzMicpXG5cdFx0XHQubG9hZERpY3QoJ3BocmFzZXMvKicpXG5cblx0XHRcdC5sb2FkRGljdCgnZGljdCcpXG5cdFx0XHQubG9hZERpY3QoJ2RpY3QyJylcblx0XHRcdC5sb2FkRGljdCgnZGljdDMnKVxuXHRcdFx0LmxvYWREaWN0KCdkaWN0NCcpXG5cdFx0XHQubG9hZERpY3QoJ3Bhbmd1L2RpY3QwMDUnKVxuXHRcdFx0LmxvYWREaWN0KCdwYW5ndS9kaWN0MDA2JylcblxuXHRcdFx0Ly8ubG9hZERpY3QoJ3N5bm9ueW0v5ZCOJylcblx0XHRcdC8vLmxvYWREaWN0KCdzeW5vbnltL+WPgycpXG5cdFx0XHQvLy5sb2FkRGljdCgnc3lub255bS/lj5EnKVxuXHRcdFx0LmxvYWREaWN0KCdkaWN0X3N5bm9ueW0vKicpXG5cblx0XHRcdC8vLmxvYWREaWN0KCdwYW5ndS93aWxkY2FyZCcsICdXSUxEQ0FSRCcsIHRydWUpICAgLy8g6YCa6YWN56ymXG5cblx0XHRcdC5sb2FkU3RvcHdvcmREaWN0KCdzdG9wd29yZCcpIC8vIOWBnOatouesplxuXG5cdFx0XHQubG9hZERpY3QoJ2xhenkvZGljdF9zeW5vbnltJylcblxuXHRcdFx0Lypcblx0XHRcdC5sb2FkRGljdCgnbmFtZXMvYXJlYScpXG5cdFx0XHQubG9hZERpY3QoJ25hbWVzL2pvYicpXG5cdFx0XHQubG9hZERpY3QoJ25hbWVzL2Zvb2QnKVxuXG5cdFx0XHQubG9hZERpY3QoJ25hbWVzL290aGVyJylcblx0XHRcdC5sb2FkRGljdCgnbmFtZXMvanAnKVxuXHRcdFx0LmxvYWREaWN0KCduYW1lcy96aCcpXG5cdFx0XHQubG9hZERpY3QoJ25hbWVzL2VuJylcblx0XHRcdC5sb2FkRGljdCgnbmFtZXMvbmFtZScpXG5cdFx0XHQgKi9cblxuXHRcdFx0LmxvYWREaWN0KCduYW1lcy8qJylcblxuXHRcdFx0LmxvYWREaWN0KCdsYXp5L2luZGV4JylcblxuXHRcdFx0LmxvYWREaWN0KCdwYW5ndS9udW0nKVxuXG5cdFx0XHQubG9hZERpY3QoJ2xhenkvYmFkd29yZCcpXG5cblx0XHRcdC5sb2FkRGljdCgncGFuZ3Uvd2lsZGNhcmQnLCAnV0lMRENBUkQnLCB0cnVlKVxuXHRcdDtcblxuXHRcdHVzZURlZmF1bHRTeW5vbnltRGljdChzZWdtZW50LCBvcHRpb25zKTtcblx0XHR1c2VEZWZhdWx0QmxhY2tsaXN0RGljdChzZWdtZW50LCBvcHRpb25zKTtcblxuXHRcdHNlZ21lbnQuZG9CbGFja2xpc3QoKTtcblx0fVxuXG5cdHJldHVybiBzZWdtZW50XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1c2VEZWZhdWx0U3lub255bURpY3Qoc2VnbWVudDogU2VnbWVudCwgb3B0aW9uczogSVVzZURlZmF1bHRPcHRpb25zRGljdHMgPSB7fSlcbntcblx0aWYgKCFvcHRpb25zLm5vZGljdClcblx0e1xuXHRcdHNlZ21lbnRcblx0XHQubG9hZFN5bm9ueW1EaWN0KCdzeW5vbnltJykgICAvLyDlkIzkuYnor41cblx0XHQubG9hZFN5bm9ueW1EaWN0KCd6aHQuc3lub255bScsIGZhbHNlKVxuXHRcdDtcblxuXHRcdGlmIChvcHRpb25zLm5vZGVOb3ZlbE1vZGUpXG5cdFx0e1xuXHRcdFx0c2VnbWVudFxuXHRcdFx0XHQubG9hZFN5bm9ueW1EaWN0KCdiYWR3b3JkLnN5bm9ueW0nLCBmYWxzZSlcblx0XHRcdFx0LmxvYWRTeW5vbnltRGljdCgnemh0LmNvbW1vbi5zeW5vbnltJywgZmFsc2UpXG5cdFx0fVxuXG5cdH1cblxuXHRyZXR1cm4gc2VnbWVudFxufVxuXG5leHBvcnQgZnVuY3Rpb24gdXNlRGVmYXVsdEJsYWNrbGlzdERpY3Qoc2VnbWVudDogU2VnbWVudCwgb3B0aW9uczogSVVzZURlZmF1bHRPcHRpb25zRGljdHMgPSB7fSlcbntcblx0aWYgKCFvcHRpb25zLm5vZGljdClcblx0e1xuXHRcdHNlZ21lbnRcblx0XHRcdC5sb2FkQmxhY2tsaXN0RGljdCgnYmxhY2tsaXN0Jylcblx0XHRcdC5sb2FkQmxhY2tsaXN0T3B0aW1pemVyRGljdCgnYmxhY2tsaXN0Lm5hbWUnKVxuXHRcdFx0LmxvYWRCbGFja2xpc3RTeW5vbnltRGljdCgnYmxhY2tsaXN0LnN5bm9ueW0nKVxuXHRcdDtcblx0fVxuXG5cdHJldHVybiBzZWdtZW50XG59XG4iXX0=