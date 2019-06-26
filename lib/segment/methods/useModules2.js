"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const useModules_1 = require("./useModules");
const path = require("path");
function useModules(me, mod, ...argv) {
    if (Array.isArray(mod)) {
        mod.forEach(function (m) {
            useModules(me, m, ...argv);
        });
    }
    else {
        if (!useModules_1._isIgnoreModules(me, mod, ...argv) && typeof mod == 'string') {
            //console.log('module', mod);
            // @ts-ignore
            let filename = path.resolve(__dirname, '../..', 'submod', mod);
            // @ts-ignore
            mod = require(filename);
        }
        useModules_1.useModules(me, mod, ...argv);
    }
    return me;
}
exports.useModules = useModules;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlTW9kdWxlczIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ1c2VNb2R1bGVzMi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDZDQUEyRTtBQUczRSw2QkFBNkI7QUFFN0IsU0FBZ0IsVUFBVSxDQUFJLEVBQUssRUFBRSxHQUE4RixFQUFFLEdBQUcsSUFBSTtJQUUzSSxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQ3RCO1FBQ0MsR0FBRyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUM7WUFFdEIsVUFBVSxDQUFDLEVBQVMsRUFBRSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQTtRQUNsQyxDQUFDLENBQUMsQ0FBQztLQUNIO1NBRUQ7UUFDQyxJQUFJLENBQUMsNkJBQWdCLENBQUMsRUFBUyxFQUFFLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxJQUFJLE9BQU8sR0FBRyxJQUFJLFFBQVEsRUFDeEU7WUFDQyw2QkFBNkI7WUFDN0IsYUFBYTtZQUNiLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFFL0QsYUFBYTtZQUNiLEdBQUcsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDeEI7UUFFRCx1QkFBVyxDQUFDLEVBQVMsRUFBRSxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQTtLQUNwQztJQUVELE9BQU8sRUFBRSxDQUFDO0FBQ1gsQ0FBQztBQXpCRCxnQ0F5QkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBfaXNJZ25vcmVNb2R1bGVzLCB1c2VNb2R1bGVzIGFzIF91c2VNb2R1bGVzIH0gZnJvbSAnLi91c2VNb2R1bGVzJztcbmltcG9ydCB7IElTdWJPcHRpbWl6ZXIgfSBmcm9tICcuLi8uLi9tb2QvT3B0aW1pemVyJztcbmltcG9ydCB7IElTdWJUb2tlbml6ZXIgfSBmcm9tICcuLi8uLi9tb2QvVG9rZW5pemVyJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSBcInBhdGhcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIHVzZU1vZHVsZXM8VD4obWU6IFQsIG1vZDogSVN1Yk9wdGltaXplciB8IElTdWJUb2tlbml6ZXIgfCBhbnkgfCBzdHJpbmcgfCAoSVN1YlRva2VuaXplciB8IElTdWJPcHRpbWl6ZXIgfCBzdHJpbmcpW10sIC4uLmFyZ3YpXG57XG5cdGlmIChBcnJheS5pc0FycmF5KG1vZCkpXG5cdHtcblx0XHRtb2QuZm9yRWFjaChmdW5jdGlvbiAobSlcblx0XHR7XG5cdFx0XHR1c2VNb2R1bGVzKG1lIGFzIGFueSwgbSwgLi4uYXJndilcblx0XHR9KTtcblx0fVxuXHRlbHNlXG5cdHtcblx0XHRpZiAoIV9pc0lnbm9yZU1vZHVsZXMobWUgYXMgYW55LCBtb2QsIC4uLmFyZ3YpICYmIHR5cGVvZiBtb2QgPT0gJ3N0cmluZycpXG5cdFx0e1xuXHRcdFx0Ly9jb25zb2xlLmxvZygnbW9kdWxlJywgbW9kKTtcblx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdGxldCBmaWxlbmFtZSA9IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8uLicsICdzdWJtb2QnLCBtb2QpO1xuXG5cdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRtb2QgPSByZXF1aXJlKGZpbGVuYW1lKTtcblx0XHR9XG5cblx0XHRfdXNlTW9kdWxlcyhtZSBhcyBhbnksIG1vZCwgLi4uYXJndilcblx0fVxuXG5cdHJldHVybiBtZTtcbn1cbiJdfQ==