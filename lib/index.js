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
        .loadDict('names/name')
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7O0FBR0gsK0JBQThGO0FBRXJGLDRCQUZGLGFBQWlCLENBRUU7QUFFMUIsdUNBQW9DO0FBQzNCLGtCQURBLGlCQUFPLENBQ0E7QUFFaEIsU0FBZ0IsVUFBVSxDQUFDLE9BQWdCLEVBQUUsVUFJekMsRUFBRTtJQUdMLE9BQU87SUFDUCxDQUFDLE9BQU8sQ0FBQyxLQUFLLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFpQixDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0lBRWxFLE9BQU87SUFDUCxDQUFDLE9BQU8sQ0FBQyxNQUFNLElBQUksT0FBTztRQUN6QixrQ0FBa0M7U0FFakMsUUFBUSxDQUFDLE1BQU0sQ0FBQztRQUVqQixPQUFPO1NBQ04sUUFBUSxDQUFDLGVBQWUsQ0FBQztTQUN6QixRQUFRLENBQUMsZ0JBQWdCLENBQUM7U0FDMUIsUUFBUSxDQUFDLGFBQWEsQ0FBQztTQUV2QixRQUFRLENBQUMsTUFBTSxDQUFDO1NBQ2hCLFFBQVEsQ0FBQyxPQUFPLENBQUM7U0FDakIsUUFBUSxDQUFDLE9BQU8sQ0FBQztTQUNqQixRQUFRLENBQUMsT0FBTyxDQUFDO1NBQ2pCLFFBQVEsQ0FBQyxlQUFlLENBQUM7U0FDekIsUUFBUSxDQUFDLGVBQWUsQ0FBQztRQUUxQix3QkFBd0I7UUFDeEIsd0JBQXdCO1FBQ3hCLHdCQUF3QjtTQUN2QixRQUFRLENBQUMsZ0JBQWdCLENBQUM7UUFFM0Isd0RBQXdEO1NBQ3ZELGVBQWUsQ0FBQyxTQUFTLENBQUMsQ0FBRyxNQUFNO1NBQ25DLGVBQWUsQ0FBQyxhQUFhLENBQUM7U0FDOUIsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLENBQUMsTUFBTTtTQUVuQyxRQUFRLENBQUMsbUJBQW1CLENBQUM7U0FFN0IsUUFBUSxDQUFDLFlBQVksQ0FBQztTQUN0QixRQUFRLENBQUMsV0FBVyxDQUFDO1NBQ3JCLFFBQVEsQ0FBQyxZQUFZLENBQUM7U0FFdEIsUUFBUSxDQUFDLGFBQWEsQ0FBQztTQUN2QixRQUFRLENBQUMsVUFBVSxDQUFDO1NBQ3BCLFFBQVEsQ0FBQyxVQUFVLENBQUM7U0FDcEIsUUFBUSxDQUFDLFVBQVUsQ0FBQztTQUNwQixRQUFRLENBQUMsWUFBWSxDQUFDO1NBRXRCLFFBQVEsQ0FBQyxZQUFZLENBQUM7U0FFdEIsUUFBUSxDQUFDLFdBQVcsQ0FBQztTQUVyQixRQUFRLENBQUMsY0FBYyxDQUFDO1NBRXhCLFFBQVEsQ0FBQyxnQkFBZ0IsRUFBRSxVQUFVLEVBQUUsSUFBSSxDQUFDO1NBRTVDLGlCQUFpQixDQUFDLFdBQVcsQ0FBQztTQUU5QixXQUFXLEVBQUUsQ0FDZDtJQUVELE9BQU8sT0FBTyxDQUFDO0FBQ2hCLENBQUM7QUFoRUQsZ0NBZ0VDO0FBRUQsa0JBQWUsaUJBQU8sQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTgvNC8xNi8wMTYuXG4gKi9cblxuaW1wb3J0ICogYXMgRmFzdEdsb2IgZnJvbSAnZmFzdC1nbG9iJztcbmltcG9ydCBnZXREZWZhdWx0TW9kTGlzdCwgeyBPcHRpbWl6ZXIsIElTdWJPcHRpbWl6ZXIsIFRva2VuaXplciwgSVN1YlRva2VuaXplciB9IGZyb20gJy4vbW9kJztcblxuZXhwb3J0IHsgZ2V0RGVmYXVsdE1vZExpc3QgfVxuXG5pbXBvcnQgeyBTZWdtZW50IH0gZnJvbSAnLi9TZWdtZW50JztcbmV4cG9ydCB7IFNlZ21lbnQgfVxuXG5leHBvcnQgZnVuY3Rpb24gdXNlRGVmYXVsdChzZWdtZW50OiBTZWdtZW50LCBvcHRpb25zOiB7XG5cdGFsbF9tb2Q/OiBib29sZWFuLFxuXHRub21vZD86IGJvb2xlYW4sXG5cdG5vZGljdD86IGJvb2xlYW4sXG59ID0ge30pXG57XG5cblx0Ly8g6K+G5Yir5qih5Z2XXG5cdCFvcHRpb25zLm5vbW9kICYmIHNlZ21lbnQudXNlKGdldERlZmF1bHRNb2RMaXN0KG9wdGlvbnMuYWxsX21vZCkpO1xuXG5cdC8vIOWtl+WFuOaWh+S7tlxuXHQhb3B0aW9ucy5ub2RpY3QgJiYgc2VnbWVudFxuXHRcdC8vLmxvYWREaWN0KCdqaWViYScpIDw9PT0gYmFkIGZpbGVcblxuXHRcdC5sb2FkRGljdCgnY2hhcicpXG5cblx0XHQvLyDnm5jlj6Tor43lhbhcblx0XHQubG9hZERpY3QoJ3Bhbmd1L3BocmFzZXMnKVxuXHRcdC5sb2FkRGljdCgncGFuZ3UvcGhyYXNlczInKVxuXHRcdC5sb2FkRGljdCgncGhyYXNlcy8wMDEnKVxuXG5cdFx0LmxvYWREaWN0KCdkaWN0Jylcblx0XHQubG9hZERpY3QoJ2RpY3QyJylcblx0XHQubG9hZERpY3QoJ2RpY3QzJylcblx0XHQubG9hZERpY3QoJ2RpY3Q0Jylcblx0XHQubG9hZERpY3QoJ3Bhbmd1L2RpY3QwMDUnKVxuXHRcdC5sb2FkRGljdCgncGFuZ3UvZGljdDAwNicpXG5cblx0XHQvLy5sb2FkRGljdCgnc3lub255bS/lkI4nKVxuXHRcdC8vLmxvYWREaWN0KCdzeW5vbnltL+WPgycpXG5cdFx0Ly8ubG9hZERpY3QoJ3N5bm9ueW0v5Y+RJylcblx0XHQubG9hZERpY3QoJ2RpY3Rfc3lub255bS8qJylcblxuXHRcdC8vLmxvYWREaWN0KCdwYW5ndS93aWxkY2FyZCcsICdXSUxEQ0FSRCcsIHRydWUpICAgLy8g6YCa6YWN56ymXG5cdFx0LmxvYWRTeW5vbnltRGljdCgnc3lub255bScpICAgLy8g5ZCM5LmJ6K+NXG5cdFx0LmxvYWRTeW5vbnltRGljdCgnemh0LnN5bm9ueW0nKVxuXHRcdC5sb2FkU3RvcHdvcmREaWN0KCdzdG9wd29yZCcpIC8vIOWBnOatouesplxuXG5cdFx0LmxvYWREaWN0KCdsYXp5L2RpY3Rfc3lub255bScpXG5cblx0XHQubG9hZERpY3QoJ25hbWVzL2FyZWEnKVxuXHRcdC5sb2FkRGljdCgnbmFtZXMvam9iJylcblx0XHQubG9hZERpY3QoJ25hbWVzL2Zvb2QnKVxuXG5cdFx0LmxvYWREaWN0KCduYW1lcy9vdGhlcicpXG5cdFx0LmxvYWREaWN0KCduYW1lcy9qcCcpXG5cdFx0LmxvYWREaWN0KCduYW1lcy96aCcpXG5cdFx0LmxvYWREaWN0KCduYW1lcy9lbicpXG5cdFx0LmxvYWREaWN0KCduYW1lcy9uYW1lJylcblxuXHRcdC5sb2FkRGljdCgnbGF6eS9pbmRleCcpXG5cblx0XHQubG9hZERpY3QoJ3Bhbmd1L251bScpXG5cblx0XHQubG9hZERpY3QoJ2xhenkvYmFkd29yZCcpXG5cblx0XHQubG9hZERpY3QoJ3Bhbmd1L3dpbGRjYXJkJywgJ1dJTERDQVJEJywgdHJ1ZSlcblxuXHRcdC5sb2FkQmxhY2tsaXN0RGljdCgnYmxhY2tsaXN0JylcblxuXHRcdC5kb0JsYWNrbGlzdCgpXG5cdDtcblxuXHRyZXR1cm4gc2VnbWVudDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgU2VnbWVudDtcbiJdfQ==