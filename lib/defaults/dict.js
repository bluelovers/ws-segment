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
            .loadDict('phrases/001')
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGljdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpY3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFLQSxTQUFnQixlQUFlLENBQUMsT0FBZ0IsRUFBRSxVQUFtQyxFQUFFO0lBRXRGLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUNuQjtRQUNDLE9BQU87UUFDUCxPQUFPO1lBQ1Asa0NBQWtDO2FBRWhDLFFBQVEsQ0FBQyxNQUFNLENBQUM7WUFFakIsT0FBTzthQUNOLFFBQVEsQ0FBQyxlQUFlLENBQUM7YUFDekIsUUFBUSxDQUFDLGdCQUFnQixDQUFDO2FBQzFCLFFBQVEsQ0FBQyxhQUFhLENBQUM7YUFFdkIsUUFBUSxDQUFDLE1BQU0sQ0FBQzthQUNoQixRQUFRLENBQUMsT0FBTyxDQUFDO2FBQ2pCLFFBQVEsQ0FBQyxPQUFPLENBQUM7YUFDakIsUUFBUSxDQUFDLE9BQU8sQ0FBQzthQUNqQixRQUFRLENBQUMsZUFBZSxDQUFDO2FBQ3pCLFFBQVEsQ0FBQyxlQUFlLENBQUM7WUFFMUIsd0JBQXdCO1lBQ3hCLHdCQUF3QjtZQUN4Qix3QkFBd0I7YUFDdkIsUUFBUSxDQUFDLGdCQUFnQixDQUFDO1lBRTNCLHdEQUF3RDthQUV2RCxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsQ0FBQyxNQUFNO2FBRW5DLFFBQVEsQ0FBQyxtQkFBbUIsQ0FBQztZQUU5Qjs7Ozs7Ozs7OztlQVVHO2FBRUYsUUFBUSxDQUFDLFNBQVMsQ0FBQzthQUVuQixRQUFRLENBQUMsWUFBWSxDQUFDO2FBRXRCLFFBQVEsQ0FBQyxXQUFXLENBQUM7YUFFckIsUUFBUSxDQUFDLGNBQWMsQ0FBQzthQUV4QixRQUFRLENBQUMsZ0JBQWdCLEVBQUUsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUM3QztRQUVELHFCQUFxQixDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztRQUN4Qyx1QkFBdUIsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFFMUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxDQUFDO0tBQ3RCO0lBRUQsT0FBTyxPQUFPLENBQUE7QUFDZixDQUFDO0FBL0RELDBDQStEQztBQUVELFNBQWdCLHFCQUFxQixDQUFDLE9BQWdCLEVBQUUsVUFBbUMsRUFBRTtJQUU1RixJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFDbkI7UUFDQyxPQUFPO2FBQ04sZUFBZSxDQUFDLFNBQVMsQ0FBQyxDQUFHLE1BQU07YUFDbkMsZUFBZSxDQUFDLGFBQWEsRUFBRSxLQUFLLENBQUMsQ0FDckM7UUFFRCxJQUFJLE9BQU8sQ0FBQyxhQUFhLEVBQ3pCO1lBQ0MsT0FBTztpQkFDTCxlQUFlLENBQUMsaUJBQWlCLEVBQUUsS0FBSyxDQUFDO2lCQUN6QyxlQUFlLENBQUMsb0JBQW9CLEVBQUUsS0FBSyxDQUFDLENBQUE7U0FDOUM7S0FFRDtJQUVELE9BQU8sT0FBTyxDQUFBO0FBQ2YsQ0FBQztBQW5CRCxzREFtQkM7QUFFRCxTQUFnQix1QkFBdUIsQ0FBQyxPQUFnQixFQUFFLFVBQW1DLEVBQUU7SUFFOUYsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQ25CO1FBQ0MsT0FBTzthQUNMLGlCQUFpQixDQUFDLFdBQVcsQ0FBQzthQUM5QiwwQkFBMEIsQ0FBQyxnQkFBZ0IsQ0FBQzthQUM1Qyx3QkFBd0IsQ0FBQyxtQkFBbUIsQ0FBQyxDQUM5QztLQUNEO0lBRUQsT0FBTyxPQUFPLENBQUE7QUFDZixDQUFDO0FBWkQsMERBWUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBTZWdtZW50IH0gZnJvbSAnLi4vU2VnbWVudCc7XG5pbXBvcnQgeyBJVXNlRGVmYXVsdE9wdGlvbnMsIElVc2VEZWZhdWx0T3B0aW9uc0RpY3RzIH0gZnJvbSAnLi9pbmRleCc7XG5pbXBvcnQgZ2V0RGVmYXVsdE1vZExpc3QgZnJvbSAnLi4vbW9kL2luZGV4JztcbmltcG9ydCBTZWdtZW50Q29yZSBmcm9tICcuLi9zZWdtZW50L2NvcmUnO1xuXG5leHBvcnQgZnVuY3Rpb24gdXNlRGVmYXVsdERpY3RzKHNlZ21lbnQ6IFNlZ21lbnQsIG9wdGlvbnM6IElVc2VEZWZhdWx0T3B0aW9uc0RpY3RzID0ge30pXG57XG5cdGlmICghb3B0aW9ucy5ub2RpY3QpXG5cdHtcblx0XHQvLyDlrZflhbjmlofku7Zcblx0XHRzZWdtZW50XG5cdFx0Ly8ubG9hZERpY3QoJ2ppZWJhJykgPD09PSBiYWQgZmlsZVxuXG5cdFx0XHQubG9hZERpY3QoJ2NoYXInKVxuXG5cdFx0XHQvLyDnm5jlj6Tor43lhbhcblx0XHRcdC5sb2FkRGljdCgncGFuZ3UvcGhyYXNlcycpXG5cdFx0XHQubG9hZERpY3QoJ3Bhbmd1L3BocmFzZXMyJylcblx0XHRcdC5sb2FkRGljdCgncGhyYXNlcy8wMDEnKVxuXG5cdFx0XHQubG9hZERpY3QoJ2RpY3QnKVxuXHRcdFx0LmxvYWREaWN0KCdkaWN0MicpXG5cdFx0XHQubG9hZERpY3QoJ2RpY3QzJylcblx0XHRcdC5sb2FkRGljdCgnZGljdDQnKVxuXHRcdFx0LmxvYWREaWN0KCdwYW5ndS9kaWN0MDA1Jylcblx0XHRcdC5sb2FkRGljdCgncGFuZ3UvZGljdDAwNicpXG5cblx0XHRcdC8vLmxvYWREaWN0KCdzeW5vbnltL+WQjicpXG5cdFx0XHQvLy5sb2FkRGljdCgnc3lub255bS/lj4MnKVxuXHRcdFx0Ly8ubG9hZERpY3QoJ3N5bm9ueW0v5Y+RJylcblx0XHRcdC5sb2FkRGljdCgnZGljdF9zeW5vbnltLyonKVxuXG5cdFx0XHQvLy5sb2FkRGljdCgncGFuZ3Uvd2lsZGNhcmQnLCAnV0lMRENBUkQnLCB0cnVlKSAgIC8vIOmAmumFjeesplxuXG5cdFx0XHQubG9hZFN0b3B3b3JkRGljdCgnc3RvcHdvcmQnKSAvLyDlgZzmraLnrKZcblxuXHRcdFx0LmxvYWREaWN0KCdsYXp5L2RpY3Rfc3lub255bScpXG5cblx0XHRcdC8qXG5cdFx0XHQubG9hZERpY3QoJ25hbWVzL2FyZWEnKVxuXHRcdFx0LmxvYWREaWN0KCduYW1lcy9qb2InKVxuXHRcdFx0LmxvYWREaWN0KCduYW1lcy9mb29kJylcblxuXHRcdFx0LmxvYWREaWN0KCduYW1lcy9vdGhlcicpXG5cdFx0XHQubG9hZERpY3QoJ25hbWVzL2pwJylcblx0XHRcdC5sb2FkRGljdCgnbmFtZXMvemgnKVxuXHRcdFx0LmxvYWREaWN0KCduYW1lcy9lbicpXG5cdFx0XHQubG9hZERpY3QoJ25hbWVzL25hbWUnKVxuXHRcdFx0ICovXG5cblx0XHRcdC5sb2FkRGljdCgnbmFtZXMvKicpXG5cblx0XHRcdC5sb2FkRGljdCgnbGF6eS9pbmRleCcpXG5cblx0XHRcdC5sb2FkRGljdCgncGFuZ3UvbnVtJylcblxuXHRcdFx0LmxvYWREaWN0KCdsYXp5L2JhZHdvcmQnKVxuXG5cdFx0XHQubG9hZERpY3QoJ3Bhbmd1L3dpbGRjYXJkJywgJ1dJTERDQVJEJywgdHJ1ZSlcblx0XHQ7XG5cblx0XHR1c2VEZWZhdWx0U3lub255bURpY3Qoc2VnbWVudCwgb3B0aW9ucyk7XG5cdFx0dXNlRGVmYXVsdEJsYWNrbGlzdERpY3Qoc2VnbWVudCwgb3B0aW9ucyk7XG5cblx0XHRzZWdtZW50LmRvQmxhY2tsaXN0KCk7XG5cdH1cblxuXHRyZXR1cm4gc2VnbWVudFxufVxuXG5leHBvcnQgZnVuY3Rpb24gdXNlRGVmYXVsdFN5bm9ueW1EaWN0KHNlZ21lbnQ6IFNlZ21lbnQsIG9wdGlvbnM6IElVc2VEZWZhdWx0T3B0aW9uc0RpY3RzID0ge30pXG57XG5cdGlmICghb3B0aW9ucy5ub2RpY3QpXG5cdHtcblx0XHRzZWdtZW50XG5cdFx0LmxvYWRTeW5vbnltRGljdCgnc3lub255bScpICAgLy8g5ZCM5LmJ6K+NXG5cdFx0LmxvYWRTeW5vbnltRGljdCgnemh0LnN5bm9ueW0nLCBmYWxzZSlcblx0XHQ7XG5cblx0XHRpZiAob3B0aW9ucy5ub2RlTm92ZWxNb2RlKVxuXHRcdHtcblx0XHRcdHNlZ21lbnRcblx0XHRcdFx0LmxvYWRTeW5vbnltRGljdCgnYmFkd29yZC5zeW5vbnltJywgZmFsc2UpXG5cdFx0XHRcdC5sb2FkU3lub255bURpY3QoJ3podC5jb21tb24uc3lub255bScsIGZhbHNlKVxuXHRcdH1cblxuXHR9XG5cblx0cmV0dXJuIHNlZ21lbnRcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVzZURlZmF1bHRCbGFja2xpc3REaWN0KHNlZ21lbnQ6IFNlZ21lbnQsIG9wdGlvbnM6IElVc2VEZWZhdWx0T3B0aW9uc0RpY3RzID0ge30pXG57XG5cdGlmICghb3B0aW9ucy5ub2RpY3QpXG5cdHtcblx0XHRzZWdtZW50XG5cdFx0XHQubG9hZEJsYWNrbGlzdERpY3QoJ2JsYWNrbGlzdCcpXG5cdFx0XHQubG9hZEJsYWNrbGlzdE9wdGltaXplckRpY3QoJ2JsYWNrbGlzdC5uYW1lJylcblx0XHRcdC5sb2FkQmxhY2tsaXN0U3lub255bURpY3QoJ2JsYWNrbGlzdC5zeW5vbnltJylcblx0XHQ7XG5cdH1cblxuXHRyZXR1cm4gc2VnbWVudFxufSJdfQ==