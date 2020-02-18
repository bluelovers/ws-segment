"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGljdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpY3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFLQSxTQUFnQixlQUFlLENBQUMsT0FBZ0IsRUFBRSxVQUFtQyxFQUFFO0lBRXRGLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUNuQjtRQUNDLE9BQU87UUFDUCxPQUFPO1lBQ1Asa0NBQWtDO2FBRWhDLFFBQVEsQ0FBQyxNQUFNLENBQUM7WUFFakIsT0FBTzthQUNOLFFBQVEsQ0FBQyxlQUFlLENBQUM7YUFDekIsUUFBUSxDQUFDLGdCQUFnQixDQUFDO2FBQzFCLFFBQVEsQ0FBQyxXQUFXLENBQUM7YUFFckIsUUFBUSxDQUFDLE1BQU0sQ0FBQzthQUNoQixRQUFRLENBQUMsT0FBTyxDQUFDO2FBQ2pCLFFBQVEsQ0FBQyxPQUFPLENBQUM7YUFDakIsUUFBUSxDQUFDLE9BQU8sQ0FBQzthQUNqQixRQUFRLENBQUMsZUFBZSxDQUFDO2FBQ3pCLFFBQVEsQ0FBQyxlQUFlLENBQUM7WUFFMUIsd0JBQXdCO1lBQ3hCLHdCQUF3QjtZQUN4Qix3QkFBd0I7YUFDdkIsUUFBUSxDQUFDLGdCQUFnQixDQUFDO1lBRTNCLHdEQUF3RDthQUV2RCxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsQ0FBQyxNQUFNO2FBRW5DLFFBQVEsQ0FBQyxtQkFBbUIsQ0FBQztZQUU5Qjs7Ozs7Ozs7OztlQVVHO2FBRUYsUUFBUSxDQUFDLFNBQVMsQ0FBQzthQUVuQixRQUFRLENBQUMsWUFBWSxDQUFDO2FBRXRCLFFBQVEsQ0FBQyxXQUFXLENBQUM7YUFFckIsUUFBUSxDQUFDLGNBQWMsQ0FBQzthQUV4QixRQUFRLENBQUMsZ0JBQWdCLEVBQUUsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUM3QztRQUVELHFCQUFxQixDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztRQUN4Qyx1QkFBdUIsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFFMUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxDQUFDO0tBQ3RCO0lBRUQsT0FBTyxPQUFPLENBQUE7QUFDZixDQUFDO0FBL0RELDBDQStEQztBQUVELFNBQWdCLHFCQUFxQixDQUFDLE9BQWdCLEVBQUUsVUFBbUMsRUFBRTtJQUU1RixJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFDbkI7UUFDQyxPQUFPO2FBQ04sZUFBZSxDQUFDLFNBQVMsQ0FBQyxDQUFHLE1BQU07YUFDbkMsZUFBZSxDQUFDLGFBQWEsRUFBRSxLQUFLLENBQUMsQ0FDckM7UUFFRCxJQUFJLE9BQU8sQ0FBQyxhQUFhLEVBQ3pCO1lBQ0MsT0FBTztpQkFDTCxlQUFlLENBQUMsaUJBQWlCLEVBQUUsS0FBSyxDQUFDO2lCQUN6QyxlQUFlLENBQUMsb0JBQW9CLEVBQUUsS0FBSyxDQUFDLENBQUE7U0FDOUM7S0FFRDtJQUVELE9BQU8sT0FBTyxDQUFBO0FBQ2YsQ0FBQztBQW5CRCxzREFtQkM7QUFFRCxTQUFnQix1QkFBdUIsQ0FBQyxPQUFnQixFQUFFLFVBQW1DLEVBQUU7SUFFOUYsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQ25CO1FBQ0MsT0FBTzthQUNMLGlCQUFpQixDQUFDLFdBQVcsQ0FBQzthQUM5QiwwQkFBMEIsQ0FBQyxnQkFBZ0IsQ0FBQzthQUM1Qyx3QkFBd0IsQ0FBQyxtQkFBbUIsQ0FBQyxDQUM5QztLQUNEO0lBRUQsT0FBTyxPQUFPLENBQUE7QUFDZixDQUFDO0FBWkQsMERBWUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBTZWdtZW50IH0gZnJvbSAnLi4vU2VnbWVudCc7XG5pbXBvcnQgeyBJVXNlRGVmYXVsdE9wdGlvbnMsIElVc2VEZWZhdWx0T3B0aW9uc0RpY3RzIH0gZnJvbSAnLi9pbmRleCc7XG5pbXBvcnQgZ2V0RGVmYXVsdE1vZExpc3QgZnJvbSAnLi4vbW9kL2luZGV4JztcbmltcG9ydCBTZWdtZW50Q29yZSBmcm9tICcuLi9zZWdtZW50L2NvcmUnO1xuXG5leHBvcnQgZnVuY3Rpb24gdXNlRGVmYXVsdERpY3RzKHNlZ21lbnQ6IFNlZ21lbnQsIG9wdGlvbnM6IElVc2VEZWZhdWx0T3B0aW9uc0RpY3RzID0ge30pXG57XG5cdGlmICghb3B0aW9ucy5ub2RpY3QpXG5cdHtcblx0XHQvLyDlrZflhbjmlofku7Zcblx0XHRzZWdtZW50XG5cdFx0Ly8ubG9hZERpY3QoJ2ppZWJhJykgPD09PSBiYWQgZmlsZVxuXG5cdFx0XHQubG9hZERpY3QoJ2NoYXInKVxuXG5cdFx0XHQvLyDnm5jlj6Tor43lhbhcblx0XHRcdC5sb2FkRGljdCgncGFuZ3UvcGhyYXNlcycpXG5cdFx0XHQubG9hZERpY3QoJ3Bhbmd1L3BocmFzZXMyJylcblx0XHRcdC5sb2FkRGljdCgncGhyYXNlcy8qJylcblxuXHRcdFx0LmxvYWREaWN0KCdkaWN0Jylcblx0XHRcdC5sb2FkRGljdCgnZGljdDInKVxuXHRcdFx0LmxvYWREaWN0KCdkaWN0MycpXG5cdFx0XHQubG9hZERpY3QoJ2RpY3Q0Jylcblx0XHRcdC5sb2FkRGljdCgncGFuZ3UvZGljdDAwNScpXG5cdFx0XHQubG9hZERpY3QoJ3Bhbmd1L2RpY3QwMDYnKVxuXG5cdFx0XHQvLy5sb2FkRGljdCgnc3lub255bS/lkI4nKVxuXHRcdFx0Ly8ubG9hZERpY3QoJ3N5bm9ueW0v5Y+DJylcblx0XHRcdC8vLmxvYWREaWN0KCdzeW5vbnltL+WPkScpXG5cdFx0XHQubG9hZERpY3QoJ2RpY3Rfc3lub255bS8qJylcblxuXHRcdFx0Ly8ubG9hZERpY3QoJ3Bhbmd1L3dpbGRjYXJkJywgJ1dJTERDQVJEJywgdHJ1ZSkgICAvLyDpgJrphY3nrKZcblxuXHRcdFx0LmxvYWRTdG9wd29yZERpY3QoJ3N0b3B3b3JkJykgLy8g5YGc5q2i56ymXG5cblx0XHRcdC5sb2FkRGljdCgnbGF6eS9kaWN0X3N5bm9ueW0nKVxuXG5cdFx0XHQvKlxuXHRcdFx0LmxvYWREaWN0KCduYW1lcy9hcmVhJylcblx0XHRcdC5sb2FkRGljdCgnbmFtZXMvam9iJylcblx0XHRcdC5sb2FkRGljdCgnbmFtZXMvZm9vZCcpXG5cblx0XHRcdC5sb2FkRGljdCgnbmFtZXMvb3RoZXInKVxuXHRcdFx0LmxvYWREaWN0KCduYW1lcy9qcCcpXG5cdFx0XHQubG9hZERpY3QoJ25hbWVzL3poJylcblx0XHRcdC5sb2FkRGljdCgnbmFtZXMvZW4nKVxuXHRcdFx0LmxvYWREaWN0KCduYW1lcy9uYW1lJylcblx0XHRcdCAqL1xuXG5cdFx0XHQubG9hZERpY3QoJ25hbWVzLyonKVxuXG5cdFx0XHQubG9hZERpY3QoJ2xhenkvaW5kZXgnKVxuXG5cdFx0XHQubG9hZERpY3QoJ3Bhbmd1L251bScpXG5cblx0XHRcdC5sb2FkRGljdCgnbGF6eS9iYWR3b3JkJylcblxuXHRcdFx0LmxvYWREaWN0KCdwYW5ndS93aWxkY2FyZCcsICdXSUxEQ0FSRCcsIHRydWUpXG5cdFx0O1xuXG5cdFx0dXNlRGVmYXVsdFN5bm9ueW1EaWN0KHNlZ21lbnQsIG9wdGlvbnMpO1xuXHRcdHVzZURlZmF1bHRCbGFja2xpc3REaWN0KHNlZ21lbnQsIG9wdGlvbnMpO1xuXG5cdFx0c2VnbWVudC5kb0JsYWNrbGlzdCgpO1xuXHR9XG5cblx0cmV0dXJuIHNlZ21lbnRcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVzZURlZmF1bHRTeW5vbnltRGljdChzZWdtZW50OiBTZWdtZW50LCBvcHRpb25zOiBJVXNlRGVmYXVsdE9wdGlvbnNEaWN0cyA9IHt9KVxue1xuXHRpZiAoIW9wdGlvbnMubm9kaWN0KVxuXHR7XG5cdFx0c2VnbWVudFxuXHRcdC5sb2FkU3lub255bURpY3QoJ3N5bm9ueW0nKSAgIC8vIOWQjOS5ieivjVxuXHRcdC5sb2FkU3lub255bURpY3QoJ3podC5zeW5vbnltJywgZmFsc2UpXG5cdFx0O1xuXG5cdFx0aWYgKG9wdGlvbnMubm9kZU5vdmVsTW9kZSlcblx0XHR7XG5cdFx0XHRzZWdtZW50XG5cdFx0XHRcdC5sb2FkU3lub255bURpY3QoJ2JhZHdvcmQuc3lub255bScsIGZhbHNlKVxuXHRcdFx0XHQubG9hZFN5bm9ueW1EaWN0KCd6aHQuY29tbW9uLnN5bm9ueW0nLCBmYWxzZSlcblx0XHR9XG5cblx0fVxuXG5cdHJldHVybiBzZWdtZW50XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1c2VEZWZhdWx0QmxhY2tsaXN0RGljdChzZWdtZW50OiBTZWdtZW50LCBvcHRpb25zOiBJVXNlRGVmYXVsdE9wdGlvbnNEaWN0cyA9IHt9KVxue1xuXHRpZiAoIW9wdGlvbnMubm9kaWN0KVxuXHR7XG5cdFx0c2VnbWVudFxuXHRcdFx0LmxvYWRCbGFja2xpc3REaWN0KCdibGFja2xpc3QnKVxuXHRcdFx0LmxvYWRCbGFja2xpc3RPcHRpbWl6ZXJEaWN0KCdibGFja2xpc3QubmFtZScpXG5cdFx0XHQubG9hZEJsYWNrbGlzdFN5bm9ueW1EaWN0KCdibGFja2xpc3Quc3lub255bScpXG5cdFx0O1xuXHR9XG5cblx0cmV0dXJuIHNlZ21lbnRcbn1cbiJdfQ==