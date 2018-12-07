"use strict";
/**
 * Created by user on 2018/4/16/016.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const mod_1 = require("./mod");
exports.getDefaultModList = mod_1.default;
const Segment_1 = require("./Segment");
exports.Segment = Segment_1.Segment;
function useDefault(segment, options = {}) {
    // 识别模块
    !options.nomod && segment.use(mod_1.default(options.all_mod));
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
        .loadSynonymDict('zht.synonym')
        .loadStopwordDict('stopword') // 停止符
        .loadDict('lazy/dict_synonym')
        .loadDict('names/area')
        .loadDict('names/job')
        .loadDict('names/food')
        .loadDict('names/other')
        .loadDict('names/jp')
        .loadDict('names/zh')
        .loadDict('names/en')
        .loadDict('lazy/index')
        .loadDict('pangu/num')
        .loadDict('lazy/badword')
        .loadDict('pangu/wildcard', 'WILDCARD', true)
        .loadBlacklistDict('blacklist')
        .doBlacklist();
    return segment;
}
exports.useDefault = useDefault;
exports.default = Segment_1.Segment;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7O0FBR0gsK0JBQThGO0FBRXJGLDRCQUZGLGFBQWlCLENBRUU7QUFFMUIsdUNBQW9DO0FBQzNCLGtCQURBLGlCQUFPLENBQ0E7QUFFaEIsU0FBZ0IsVUFBVSxDQUFDLE9BQWdCLEVBQUUsVUFJekMsRUFBRTtJQUdMLE9BQU87SUFDUCxDQUFDLE9BQU8sQ0FBQyxLQUFLLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFpQixDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0lBRWxFLE9BQU87SUFDUCxDQUFDLE9BQU8sQ0FBQyxNQUFNLElBQUksT0FBTztRQUN6QixrQ0FBa0M7U0FFakMsUUFBUSxDQUFDLE1BQU0sQ0FBQztRQUVqQixPQUFPO1NBQ04sUUFBUSxDQUFDLGVBQWUsQ0FBQztTQUN6QixRQUFRLENBQUMsZ0JBQWdCLENBQUM7U0FDMUIsUUFBUSxDQUFDLGFBQWEsQ0FBQztTQUV2QixRQUFRLENBQUMsTUFBTSxDQUFDO1NBQ2hCLFFBQVEsQ0FBQyxPQUFPLENBQUM7U0FDakIsUUFBUSxDQUFDLE9BQU8sQ0FBQztTQUNqQixRQUFRLENBQUMsT0FBTyxDQUFDO1NBQ2pCLFFBQVEsQ0FBQyxlQUFlLENBQUM7U0FDekIsUUFBUSxDQUFDLGVBQWUsQ0FBQztRQUUxQix3QkFBd0I7UUFDeEIsd0JBQXdCO1FBQ3hCLHdCQUF3QjtTQUN2QixRQUFRLENBQUMsZ0JBQWdCLENBQUM7UUFFM0Isd0RBQXdEO1NBQ3ZELGVBQWUsQ0FBQyxTQUFTLENBQUMsQ0FBRyxNQUFNO1NBQ25DLGVBQWUsQ0FBQyxhQUFhLENBQUM7U0FDOUIsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLENBQUMsTUFBTTtTQUVuQyxRQUFRLENBQUMsbUJBQW1CLENBQUM7U0FFN0IsUUFBUSxDQUFDLFlBQVksQ0FBQztTQUN0QixRQUFRLENBQUMsV0FBVyxDQUFDO1NBQ3JCLFFBQVEsQ0FBQyxZQUFZLENBQUM7U0FFdEIsUUFBUSxDQUFDLGFBQWEsQ0FBQztTQUN2QixRQUFRLENBQUMsVUFBVSxDQUFDO1NBQ3BCLFFBQVEsQ0FBQyxVQUFVLENBQUM7U0FDcEIsUUFBUSxDQUFDLFVBQVUsQ0FBQztTQUVwQixRQUFRLENBQUMsWUFBWSxDQUFDO1NBRXRCLFFBQVEsQ0FBQyxXQUFXLENBQUM7U0FFckIsUUFBUSxDQUFDLGNBQWMsQ0FBQztTQUV4QixRQUFRLENBQUMsZ0JBQWdCLEVBQUUsVUFBVSxFQUFFLElBQUksQ0FBQztTQUU1QyxpQkFBaUIsQ0FBQyxXQUFXLENBQUM7U0FFOUIsV0FBVyxFQUFFLENBQ2Q7SUFFRCxPQUFPLE9BQU8sQ0FBQztBQUNoQixDQUFDO0FBL0RELGdDQStEQztBQUVELGtCQUFlLGlCQUFPLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgdXNlciBvbiAyMDE4LzQvMTYvMDE2LlxuICovXG5cbmltcG9ydCAqIGFzIEZhc3RHbG9iIGZyb20gJ2Zhc3QtZ2xvYic7XG5pbXBvcnQgZ2V0RGVmYXVsdE1vZExpc3QsIHsgT3B0aW1pemVyLCBJU3ViT3B0aW1pemVyLCBUb2tlbml6ZXIsIElTdWJUb2tlbml6ZXIgfSBmcm9tICcuL21vZCc7XG5cbmV4cG9ydCB7IGdldERlZmF1bHRNb2RMaXN0IH1cblxuaW1wb3J0IHsgU2VnbWVudCB9IGZyb20gJy4vU2VnbWVudCc7XG5leHBvcnQgeyBTZWdtZW50IH1cblxuZXhwb3J0IGZ1bmN0aW9uIHVzZURlZmF1bHQoc2VnbWVudDogU2VnbWVudCwgb3B0aW9uczoge1xuXHRhbGxfbW9kPzogYm9vbGVhbixcblx0bm9tb2Q/OiBib29sZWFuLFxuXHRub2RpY3Q/OiBib29sZWFuLFxufSA9IHt9KVxue1xuXG5cdC8vIOivhuWIq+aooeWdl1xuXHQhb3B0aW9ucy5ub21vZCAmJiBzZWdtZW50LnVzZShnZXREZWZhdWx0TW9kTGlzdChvcHRpb25zLmFsbF9tb2QpKTtcblxuXHQvLyDlrZflhbjmlofku7Zcblx0IW9wdGlvbnMubm9kaWN0ICYmIHNlZ21lbnRcblx0XHQvLy5sb2FkRGljdCgnamllYmEnKSA8PT09IGJhZCBmaWxlXG5cblx0XHQubG9hZERpY3QoJ2NoYXInKVxuXG5cdFx0Ly8g55uY5Y+k6K+N5YW4XG5cdFx0LmxvYWREaWN0KCdwYW5ndS9waHJhc2VzJylcblx0XHQubG9hZERpY3QoJ3Bhbmd1L3BocmFzZXMyJylcblx0XHQubG9hZERpY3QoJ3BocmFzZXMvMDAxJylcblxuXHRcdC5sb2FkRGljdCgnZGljdCcpXG5cdFx0LmxvYWREaWN0KCdkaWN0MicpXG5cdFx0LmxvYWREaWN0KCdkaWN0MycpXG5cdFx0LmxvYWREaWN0KCdkaWN0NCcpXG5cdFx0LmxvYWREaWN0KCdwYW5ndS9kaWN0MDA1Jylcblx0XHQubG9hZERpY3QoJ3Bhbmd1L2RpY3QwMDYnKVxuXG5cdFx0Ly8ubG9hZERpY3QoJ3N5bm9ueW0v5ZCOJylcblx0XHQvLy5sb2FkRGljdCgnc3lub255bS/lj4MnKVxuXHRcdC8vLmxvYWREaWN0KCdzeW5vbnltL+WPkScpXG5cdFx0LmxvYWREaWN0KCdkaWN0X3N5bm9ueW0vKicpXG5cblx0XHQvLy5sb2FkRGljdCgncGFuZ3Uvd2lsZGNhcmQnLCAnV0lMRENBUkQnLCB0cnVlKSAgIC8vIOmAmumFjeesplxuXHRcdC5sb2FkU3lub255bURpY3QoJ3N5bm9ueW0nKSAgIC8vIOWQjOS5ieivjVxuXHRcdC5sb2FkU3lub255bURpY3QoJ3podC5zeW5vbnltJylcblx0XHQubG9hZFN0b3B3b3JkRGljdCgnc3RvcHdvcmQnKSAvLyDlgZzmraLnrKZcblxuXHRcdC5sb2FkRGljdCgnbGF6eS9kaWN0X3N5bm9ueW0nKVxuXG5cdFx0LmxvYWREaWN0KCduYW1lcy9hcmVhJylcblx0XHQubG9hZERpY3QoJ25hbWVzL2pvYicpXG5cdFx0LmxvYWREaWN0KCduYW1lcy9mb29kJylcblxuXHRcdC5sb2FkRGljdCgnbmFtZXMvb3RoZXInKVxuXHRcdC5sb2FkRGljdCgnbmFtZXMvanAnKVxuXHRcdC5sb2FkRGljdCgnbmFtZXMvemgnKVxuXHRcdC5sb2FkRGljdCgnbmFtZXMvZW4nKVxuXG5cdFx0LmxvYWREaWN0KCdsYXp5L2luZGV4JylcblxuXHRcdC5sb2FkRGljdCgncGFuZ3UvbnVtJylcblxuXHRcdC5sb2FkRGljdCgnbGF6eS9iYWR3b3JkJylcblxuXHRcdC5sb2FkRGljdCgncGFuZ3Uvd2lsZGNhcmQnLCAnV0lMRENBUkQnLCB0cnVlKVxuXG5cdFx0LmxvYWRCbGFja2xpc3REaWN0KCdibGFja2xpc3QnKVxuXG5cdFx0LmRvQmxhY2tsaXN0KClcblx0O1xuXG5cdHJldHVybiBzZWdtZW50O1xufVxuXG5leHBvcnQgZGVmYXVsdCBTZWdtZW50O1xuIl19