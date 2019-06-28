"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const useModules_1 = require("./useModules");
function useModules(me, mod, ...argv) {
    if (Array.isArray(mod)) {
        mod.forEach(function (m) {
            useModules(me, m, ...argv);
        });
    }
    else {
        if (!useModules_1._isIgnoreModules(me, mod, ...argv) && typeof mod == 'string') {
            //mod = require(path.join(__dirname, '../..', 'submod', mod));
            mod = require(`../../submod/${mod}`);
        }
        useModules_1.useModules(me, mod, ...argv);
    }
    return me;
}
exports.useModules = useModules;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlTW9kdWxlczIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ1c2VNb2R1bGVzMi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDZDQUEyRTtBQUszRSxTQUFnQixVQUFVLENBQUksRUFBSyxFQUFFLEdBQThGLEVBQUUsR0FBRyxJQUFJO0lBRTNJLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFDdEI7UUFDQyxHQUFHLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQztZQUV0QixVQUFVLENBQUMsRUFBUyxFQUFFLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFBO1FBQ2xDLENBQUMsQ0FBQyxDQUFDO0tBQ0g7U0FFRDtRQUNDLElBQUksQ0FBQyw2QkFBZ0IsQ0FBQyxFQUFTLEVBQUUsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLElBQUksT0FBTyxHQUFHLElBQUksUUFBUSxFQUN4RTtZQUNDLDhEQUE4RDtZQUM5RCxHQUFHLEdBQUcsT0FBTyxDQUFDLGdCQUFnQixHQUFHLEVBQUUsQ0FBQyxDQUFDO1NBQ3JDO1FBRUQsdUJBQVcsQ0FBQyxFQUFTLEVBQUUsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUE7S0FDcEM7SUFFRCxPQUFPLEVBQUUsQ0FBQztBQUNYLENBQUM7QUFyQkQsZ0NBcUJDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgX2lzSWdub3JlTW9kdWxlcywgdXNlTW9kdWxlcyBhcyBfdXNlTW9kdWxlcyB9IGZyb20gJy4vdXNlTW9kdWxlcyc7XG5pbXBvcnQgeyBJU3ViT3B0aW1pemVyIH0gZnJvbSAnLi4vLi4vbW9kL09wdGltaXplcic7XG5pbXBvcnQgeyBJU3ViVG9rZW5pemVyIH0gZnJvbSAnLi4vLi4vbW9kL1Rva2VuaXplcic7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gXCJwYXRoXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiB1c2VNb2R1bGVzPFQ+KG1lOiBULCBtb2Q6IElTdWJPcHRpbWl6ZXIgfCBJU3ViVG9rZW5pemVyIHwgYW55IHwgc3RyaW5nIHwgKElTdWJUb2tlbml6ZXIgfCBJU3ViT3B0aW1pemVyIHwgc3RyaW5nKVtdLCAuLi5hcmd2KVxue1xuXHRpZiAoQXJyYXkuaXNBcnJheShtb2QpKVxuXHR7XG5cdFx0bW9kLmZvckVhY2goZnVuY3Rpb24gKG0pXG5cdFx0e1xuXHRcdFx0dXNlTW9kdWxlcyhtZSBhcyBhbnksIG0sIC4uLmFyZ3YpXG5cdFx0fSk7XG5cdH1cblx0ZWxzZVxuXHR7XG5cdFx0aWYgKCFfaXNJZ25vcmVNb2R1bGVzKG1lIGFzIGFueSwgbW9kLCAuLi5hcmd2KSAmJiB0eXBlb2YgbW9kID09ICdzdHJpbmcnKVxuXHRcdHtcblx0XHRcdC8vbW9kID0gcmVxdWlyZShwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4vLi4nLCAnc3VibW9kJywgbW9kKSk7XG5cdFx0XHRtb2QgPSByZXF1aXJlKGAuLi8uLi9zdWJtb2QvJHttb2R9YCk7XG5cdFx0fVxuXG5cdFx0X3VzZU1vZHVsZXMobWUgYXMgYW55LCBtb2QsIC4uLmFyZ3YpXG5cdH1cblxuXHRyZXR1cm4gbWU7XG59XG4iXX0=