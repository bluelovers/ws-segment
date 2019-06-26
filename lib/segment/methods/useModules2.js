"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const useModules_1 = require("./useModules");
const path = require("path");
function useModules(me, mod, ...argv) {
    if (Array.isArray(mod)) {
        mod.forEach(function (m) {
            useModules_1.useModules(me, mod, ...argv);
        });
    }
    else {
        if (!useModules_1._isIgnoreModules(me, mod, ...argv) && typeof mod == 'string') {
            //console.log('module', mod);
            // @ts-ignore
            let filename = path.resolve(__dirname, 'submod', mod);
            // @ts-ignore
            mod = require(filename);
        }
        useModules_1.useModules(me, mod, ...argv);
    }
    return me;
}
exports.useModules = useModules;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlTW9kdWxlczIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ1c2VNb2R1bGVzMi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDZDQUEyRTtBQUszRSw2QkFBNkI7QUFFN0IsU0FBZ0IsVUFBVSxDQUFrQyxFQUFLLEVBQUUsR0FBOEYsRUFBRSxHQUFHLElBQUk7SUFFekssSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUN0QjtRQUNDLEdBQUcsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDO1lBRXRCLHVCQUFXLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFBO1FBQzlCLENBQUMsQ0FBQyxDQUFDO0tBQ0g7U0FFRDtRQUNDLElBQUksQ0FBQyw2QkFBZ0IsQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLElBQUksT0FBTyxHQUFHLElBQUksUUFBUSxFQUNqRTtZQUNDLDZCQUE2QjtZQUM3QixhQUFhO1lBQ2IsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsUUFBUSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBRXRELGFBQWE7WUFDYixHQUFHLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQ3hCO1FBRUQsdUJBQVcsQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUE7S0FDN0I7SUFFRCxPQUFPLEVBQUUsQ0FBQztBQUNYLENBQUM7QUF6QkQsZ0NBeUJDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgX2lzSWdub3JlTW9kdWxlcywgdXNlTW9kdWxlcyBhcyBfdXNlTW9kdWxlcyB9IGZyb20gJy4vdXNlTW9kdWxlcyc7XG5pbXBvcnQgU2VnbWVudENvcmUgZnJvbSAnLi4vY29yZSc7XG5pbXBvcnQgU2VnbWVudCBmcm9tICcuLi8uLi9TZWdtZW50JztcbmltcG9ydCB7IElTdWJPcHRpbWl6ZXIgfSBmcm9tICcuLi8uLi9tb2QvT3B0aW1pemVyJztcbmltcG9ydCB7IElTdWJUb2tlbml6ZXIgfSBmcm9tICcuLi8uLi9tb2QvVG9rZW5pemVyJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSBcInBhdGhcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIHVzZU1vZHVsZXM8VCBleHRlbmRzIFNlZ21lbnRDb3JlIHwgU2VnbWVudD4obWU6IFQsIG1vZDogSVN1Yk9wdGltaXplciB8IElTdWJUb2tlbml6ZXIgfCBhbnkgfCBzdHJpbmcgfCAoSVN1YlRva2VuaXplciB8IElTdWJPcHRpbWl6ZXIgfCBzdHJpbmcpW10sIC4uLmFyZ3YpXG57XG5cdGlmIChBcnJheS5pc0FycmF5KG1vZCkpXG5cdHtcblx0XHRtb2QuZm9yRWFjaChmdW5jdGlvbiAobSlcblx0XHR7XG5cdFx0XHRfdXNlTW9kdWxlcyhtZSwgbW9kLCAuLi5hcmd2KVxuXHRcdH0pO1xuXHR9XG5cdGVsc2Vcblx0e1xuXHRcdGlmICghX2lzSWdub3JlTW9kdWxlcyhtZSwgbW9kLCAuLi5hcmd2KSAmJiB0eXBlb2YgbW9kID09ICdzdHJpbmcnKVxuXHRcdHtcblx0XHRcdC8vY29uc29sZS5sb2coJ21vZHVsZScsIG1vZCk7XG5cdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRsZXQgZmlsZW5hbWUgPSBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnc3VibW9kJywgbW9kKTtcblxuXHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0bW9kID0gcmVxdWlyZShmaWxlbmFtZSk7XG5cdFx0fVxuXG5cdFx0X3VzZU1vZHVsZXMobWUsIG1vZCwgLi4uYXJndilcblx0fVxuXG5cdHJldHVybiBtZTtcbn1cbiJdfQ==