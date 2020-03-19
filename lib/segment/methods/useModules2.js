"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useModules = void 0;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlTW9kdWxlczIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ1c2VNb2R1bGVzMi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSw2Q0FBMkU7QUFLM0UsU0FBZ0IsVUFBVSxDQUFJLEVBQUssRUFBRSxHQUE4RixFQUFFLEdBQUcsSUFBSTtJQUUzSSxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQ3RCO1FBQ0MsR0FBRyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUM7WUFFdEIsVUFBVSxDQUFDLEVBQVMsRUFBRSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQTtRQUNsQyxDQUFDLENBQUMsQ0FBQztLQUNIO1NBRUQ7UUFDQyxJQUFJLENBQUMsNkJBQWdCLENBQUMsRUFBUyxFQUFFLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxJQUFJLE9BQU8sR0FBRyxJQUFJLFFBQVEsRUFDeEU7WUFDQyw4REFBOEQ7WUFDOUQsR0FBRyxHQUFHLE9BQU8sQ0FBQyxnQkFBZ0IsR0FBRyxFQUFFLENBQUMsQ0FBQztTQUNyQztRQUVELHVCQUFXLENBQUMsRUFBUyxFQUFFLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFBO0tBQ3BDO0lBRUQsT0FBTyxFQUFFLENBQUM7QUFDWCxDQUFDO0FBckJELGdDQXFCQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IF9pc0lnbm9yZU1vZHVsZXMsIHVzZU1vZHVsZXMgYXMgX3VzZU1vZHVsZXMgfSBmcm9tICcuL3VzZU1vZHVsZXMnO1xuaW1wb3J0IHsgSVN1Yk9wdGltaXplciB9IGZyb20gJy4uLy4uL21vZC9PcHRpbWl6ZXInO1xuaW1wb3J0IHsgSVN1YlRva2VuaXplciB9IGZyb20gJy4uLy4uL21vZC9Ub2tlbml6ZXInO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tIFwicGF0aFwiO1xuXG5leHBvcnQgZnVuY3Rpb24gdXNlTW9kdWxlczxUPihtZTogVCwgbW9kOiBJU3ViT3B0aW1pemVyIHwgSVN1YlRva2VuaXplciB8IGFueSB8IHN0cmluZyB8IChJU3ViVG9rZW5pemVyIHwgSVN1Yk9wdGltaXplciB8IHN0cmluZylbXSwgLi4uYXJndilcbntcblx0aWYgKEFycmF5LmlzQXJyYXkobW9kKSlcblx0e1xuXHRcdG1vZC5mb3JFYWNoKGZ1bmN0aW9uIChtKVxuXHRcdHtcblx0XHRcdHVzZU1vZHVsZXMobWUgYXMgYW55LCBtLCAuLi5hcmd2KVxuXHRcdH0pO1xuXHR9XG5cdGVsc2Vcblx0e1xuXHRcdGlmICghX2lzSWdub3JlTW9kdWxlcyhtZSBhcyBhbnksIG1vZCwgLi4uYXJndikgJiYgdHlwZW9mIG1vZCA9PSAnc3RyaW5nJylcblx0XHR7XG5cdFx0XHQvL21vZCA9IHJlcXVpcmUocGF0aC5qb2luKF9fZGlybmFtZSwgJy4uLy4uJywgJ3N1Ym1vZCcsIG1vZCkpO1xuXHRcdFx0bW9kID0gcmVxdWlyZShgLi4vLi4vc3VibW9kLyR7bW9kfWApO1xuXHRcdH1cblxuXHRcdF91c2VNb2R1bGVzKG1lIGFzIGFueSwgbW9kLCAuLi5hcmd2KVxuXHR9XG5cblx0cmV0dXJuIG1lO1xufVxuIl19