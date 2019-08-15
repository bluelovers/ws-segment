"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function useDefaultDicts(segment, options = {}) {
    // 字典文件
    !options.nodict && segment
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
        .loadSynonymDict('synonym') // 同义词
        .loadSynonymDict('zht.synonym', false)
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
        .loadDict('pangu/wildcard', 'WILDCARD', true)
        .loadBlacklistDict('blacklist')
        .loadBlacklistOptimizerDict('blacklist.name')
        .loadBlacklistSynonymDict('blacklist.synonym')
        .doBlacklist();
    return segment;
}
exports.useDefaultDicts = useDefaultDicts;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGljdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpY3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFLQSxTQUFnQixlQUFlLENBQUMsT0FBZ0IsRUFBRSxVQUE4QixFQUFFO0lBRWpGLE9BQU87SUFDUCxDQUFDLE9BQU8sQ0FBQyxNQUFNLElBQUksT0FBTztRQUMxQixrQ0FBa0M7U0FFaEMsUUFBUSxDQUFDLE1BQU0sQ0FBQztRQUVqQixPQUFPO1NBQ04sUUFBUSxDQUFDLGVBQWUsQ0FBQztTQUN6QixRQUFRLENBQUMsZ0JBQWdCLENBQUM7U0FDMUIsUUFBUSxDQUFDLGFBQWEsQ0FBQztTQUV2QixRQUFRLENBQUMsTUFBTSxDQUFDO1NBQ2hCLFFBQVEsQ0FBQyxPQUFPLENBQUM7U0FDakIsUUFBUSxDQUFDLE9BQU8sQ0FBQztTQUNqQixRQUFRLENBQUMsT0FBTyxDQUFDO1NBQ2pCLFFBQVEsQ0FBQyxlQUFlLENBQUM7U0FDekIsUUFBUSxDQUFDLGVBQWUsQ0FBQztRQUUxQix3QkFBd0I7UUFDeEIsd0JBQXdCO1FBQ3hCLHdCQUF3QjtTQUN2QixRQUFRLENBQUMsZ0JBQWdCLENBQUM7UUFFM0Isd0RBQXdEO1NBQ3ZELGVBQWUsQ0FBQyxTQUFTLENBQUMsQ0FBRyxNQUFNO1NBQ25DLGVBQWUsQ0FBQyxhQUFhLEVBQUUsS0FBSyxDQUFDO1NBQ3JDLGdCQUFnQixDQUFDLFVBQVUsQ0FBQyxDQUFDLE1BQU07U0FFbkMsUUFBUSxDQUFDLG1CQUFtQixDQUFDO1FBRTlCOzs7Ozs7Ozs7O1dBVUc7U0FFRixRQUFRLENBQUMsU0FBUyxDQUFDO1NBRW5CLFFBQVEsQ0FBQyxZQUFZLENBQUM7U0FFdEIsUUFBUSxDQUFDLFdBQVcsQ0FBQztTQUVyQixRQUFRLENBQUMsY0FBYyxDQUFDO1NBRXhCLFFBQVEsQ0FBQyxnQkFBZ0IsRUFBRSxVQUFVLEVBQUUsSUFBSSxDQUFDO1NBRTVDLGlCQUFpQixDQUFDLFdBQVcsQ0FBQztTQUM5QiwwQkFBMEIsQ0FBQyxnQkFBZ0IsQ0FBQztTQUM1Qyx3QkFBd0IsQ0FBQyxtQkFBbUIsQ0FBQztTQUU3QyxXQUFXLEVBQUUsQ0FDZDtJQUVELE9BQU8sT0FBTyxDQUFBO0FBQ2YsQ0FBQztBQTlERCwwQ0E4REMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBTZWdtZW50IH0gZnJvbSAnLi4vU2VnbWVudCc7XG5pbXBvcnQgeyBJVXNlRGVmYXVsdE9wdGlvbnMgfSBmcm9tICcuL2luZGV4JztcbmltcG9ydCBnZXREZWZhdWx0TW9kTGlzdCBmcm9tICcuLi9tb2QvaW5kZXgnO1xuaW1wb3J0IFNlZ21lbnRDb3JlIGZyb20gJy4uL3NlZ21lbnQvY29yZSc7XG5cbmV4cG9ydCBmdW5jdGlvbiB1c2VEZWZhdWx0RGljdHMoc2VnbWVudDogU2VnbWVudCwgb3B0aW9uczogSVVzZURlZmF1bHRPcHRpb25zID0ge30pXG57XG5cdC8vIOWtl+WFuOaWh+S7tlxuXHQhb3B0aW9ucy5ub2RpY3QgJiYgc2VnbWVudFxuXHQvLy5sb2FkRGljdCgnamllYmEnKSA8PT09IGJhZCBmaWxlXG5cblx0XHQubG9hZERpY3QoJ2NoYXInKVxuXG5cdFx0Ly8g55uY5Y+k6K+N5YW4XG5cdFx0LmxvYWREaWN0KCdwYW5ndS9waHJhc2VzJylcblx0XHQubG9hZERpY3QoJ3Bhbmd1L3BocmFzZXMyJylcblx0XHQubG9hZERpY3QoJ3BocmFzZXMvMDAxJylcblxuXHRcdC5sb2FkRGljdCgnZGljdCcpXG5cdFx0LmxvYWREaWN0KCdkaWN0MicpXG5cdFx0LmxvYWREaWN0KCdkaWN0MycpXG5cdFx0LmxvYWREaWN0KCdkaWN0NCcpXG5cdFx0LmxvYWREaWN0KCdwYW5ndS9kaWN0MDA1Jylcblx0XHQubG9hZERpY3QoJ3Bhbmd1L2RpY3QwMDYnKVxuXG5cdFx0Ly8ubG9hZERpY3QoJ3N5bm9ueW0v5ZCOJylcblx0XHQvLy5sb2FkRGljdCgnc3lub255bS/lj4MnKVxuXHRcdC8vLmxvYWREaWN0KCdzeW5vbnltL+WPkScpXG5cdFx0LmxvYWREaWN0KCdkaWN0X3N5bm9ueW0vKicpXG5cblx0XHQvLy5sb2FkRGljdCgncGFuZ3Uvd2lsZGNhcmQnLCAnV0lMRENBUkQnLCB0cnVlKSAgIC8vIOmAmumFjeesplxuXHRcdC5sb2FkU3lub255bURpY3QoJ3N5bm9ueW0nKSAgIC8vIOWQjOS5ieivjVxuXHRcdC5sb2FkU3lub255bURpY3QoJ3podC5zeW5vbnltJywgZmFsc2UpXG5cdFx0LmxvYWRTdG9wd29yZERpY3QoJ3N0b3B3b3JkJykgLy8g5YGc5q2i56ymXG5cblx0XHQubG9hZERpY3QoJ2xhenkvZGljdF9zeW5vbnltJylcblxuXHRcdC8qXG5cdFx0LmxvYWREaWN0KCduYW1lcy9hcmVhJylcblx0XHQubG9hZERpY3QoJ25hbWVzL2pvYicpXG5cdFx0LmxvYWREaWN0KCduYW1lcy9mb29kJylcblxuXHRcdC5sb2FkRGljdCgnbmFtZXMvb3RoZXInKVxuXHRcdC5sb2FkRGljdCgnbmFtZXMvanAnKVxuXHRcdC5sb2FkRGljdCgnbmFtZXMvemgnKVxuXHRcdC5sb2FkRGljdCgnbmFtZXMvZW4nKVxuXHRcdC5sb2FkRGljdCgnbmFtZXMvbmFtZScpXG5cdFx0ICovXG5cblx0XHQubG9hZERpY3QoJ25hbWVzLyonKVxuXG5cdFx0LmxvYWREaWN0KCdsYXp5L2luZGV4JylcblxuXHRcdC5sb2FkRGljdCgncGFuZ3UvbnVtJylcblxuXHRcdC5sb2FkRGljdCgnbGF6eS9iYWR3b3JkJylcblxuXHRcdC5sb2FkRGljdCgncGFuZ3Uvd2lsZGNhcmQnLCAnV0lMRENBUkQnLCB0cnVlKVxuXG5cdFx0LmxvYWRCbGFja2xpc3REaWN0KCdibGFja2xpc3QnKVxuXHRcdC5sb2FkQmxhY2tsaXN0T3B0aW1pemVyRGljdCgnYmxhY2tsaXN0Lm5hbWUnKVxuXHRcdC5sb2FkQmxhY2tsaXN0U3lub255bURpY3QoJ2JsYWNrbGlzdC5zeW5vbnltJylcblxuXHRcdC5kb0JsYWNrbGlzdCgpXG5cdDtcblxuXHRyZXR1cm4gc2VnbWVudFxufVxuIl19