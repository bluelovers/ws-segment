"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cache_path_1 = require("cache-path");
const debug_color2_1 = require("debug-color2");
exports.console = new debug_color2_1.Console();
const PACKAGE_JSON = require("../package.json");
exports.console.inspectOptions = {
    colors: exports.console.enabledColor
};
exports.debugConsole = new debug_color2_1.Console(null, {
    label: true,
    time: true,
});
exports.debugConsole.inspectOptions = {
    colors: exports.debugConsole.enabledColor
};
exports.debugConsole.enabled = false;
function enableDebug(bool) {
    if (bool || typeof bool === 'undefined') {
        exports.debugConsole.enabled = true;
    }
    else if (bool === false) {
        exports.debugConsole.enabled = false;
    }
    return exports.debugConsole.enabled;
}
exports.enableDebug = enableDebug;
function getCacheDirPath(useGlobal) {
    return cache_path_1.getCachePath({
        name: PACKAGE_JSON.name,
        create: true,
        fnOrder: useGlobal ? [
            cache_path_1.findNpmCachePath,
            cache_path_1.getOSTempPath,
            cache_path_1.findPkgModulePath,
        ] : null,
    });
}
exports.getCacheDirPath = getCacheDirPath;
function freeGC() {
    if (global && typeof global.gc === 'function') {
        try {
            global.gc();
            return true;
        }
        catch (e) {
            exports.console.error(e);
        }
    }
    return false;
}
exports.freeGC = freeGC;
const self = require("./util");
exports.default = self;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInV0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFLQSwyQ0FBOEY7QUFFOUYsK0NBQXVDO0FBQzFCLFFBQUEsT0FBTyxHQUFHLElBQUksc0JBQU8sRUFBRSxDQUFDO0FBRXJDLGdEQUFpRDtBQUVqRCxlQUFPLENBQUMsY0FBYyxHQUFHO0lBQ3hCLE1BQU0sRUFBRSxlQUFPLENBQUMsWUFBWTtDQUM1QixDQUFDO0FBRVcsUUFBQSxZQUFZLEdBQUcsSUFBSSxzQkFBTyxDQUFDLElBQUksRUFBRTtJQUM3QyxLQUFLLEVBQUUsSUFBSTtJQUNYLElBQUksRUFBRSxJQUFJO0NBQ1YsQ0FBQyxDQUFDO0FBRUgsb0JBQVksQ0FBQyxjQUFjLEdBQUc7SUFDN0IsTUFBTSxFQUFFLG9CQUFZLENBQUMsWUFBWTtDQUNqQyxDQUFDO0FBRUYsb0JBQVksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO0FBRTdCLFNBQWdCLFdBQVcsQ0FBQyxJQUFjO0lBRXpDLElBQUksSUFBSSxJQUFJLE9BQU8sSUFBSSxLQUFLLFdBQVcsRUFDdkM7UUFDQyxvQkFBWSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7S0FDNUI7U0FDSSxJQUFJLElBQUksS0FBSyxLQUFLLEVBQ3ZCO1FBQ0Msb0JBQVksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO0tBQzdCO0lBRUQsT0FBTyxvQkFBWSxDQUFDLE9BQU8sQ0FBQztBQUM3QixDQUFDO0FBWkQsa0NBWUM7QUFFRCxTQUFnQixlQUFlLENBQUMsU0FBbUI7SUFFbEQsT0FBTyx5QkFBWSxDQUFDO1FBQ25CLElBQUksRUFBRSxZQUFZLENBQUMsSUFBSTtRQUN2QixNQUFNLEVBQUUsSUFBSTtRQUNaLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQ3BCLDZCQUFnQjtZQUNoQiwwQkFBYTtZQUNiLDhCQUFpQjtTQUNqQixDQUFBLENBQUMsQ0FBQyxJQUFJO0tBQ1AsQ0FBQyxDQUFDO0FBQ0osQ0FBQztBQVhELDBDQVdDO0FBRUQsU0FBZ0IsTUFBTTtJQUVyQixJQUFJLE1BQU0sSUFBSSxPQUFPLE1BQU0sQ0FBQyxFQUFFLEtBQUssVUFBVSxFQUM3QztRQUNDLElBQ0E7WUFDQyxNQUFNLENBQUMsRUFBRSxFQUFFLENBQUM7WUFFWixPQUFPLElBQUksQ0FBQztTQUNaO1FBQ0QsT0FBTyxDQUFDLEVBQ1I7WUFDQyxlQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ2pCO0tBQ0Q7SUFFRCxPQUFPLEtBQUssQ0FBQztBQUNkLENBQUM7QUFqQkQsd0JBaUJDO0FBRUQsK0JBQStCO0FBQy9CLGtCQUFlLElBQUksQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBmaW5kQ2FjaGVEaXIgPSByZXF1aXJlKCdmaW5kLWNhY2hlLWRpcicpO1xuaW1wb3J0IHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcy1leHRyYSc7XG5pbXBvcnQgKiBhcyBvcyBmcm9tICdvcyc7XG5pbXBvcnQgeyBleGVjLCBleGVjU3luYyB9IGZyb20gJ2NoaWxkX3Byb2Nlc3MnO1xuaW1wb3J0IHsgZ2V0Q2FjaGVQYXRoLCBmaW5kTnBtQ2FjaGVQYXRoLCBnZXRPU1RlbXBQYXRoLCBmaW5kUGtnTW9kdWxlUGF0aCB9IGZyb20gJ2NhY2hlLXBhdGgnO1xuXG5pbXBvcnQgeyBDb25zb2xlIH0gZnJvbSAnZGVidWctY29sb3IyJztcbmV4cG9ydCBjb25zdCBjb25zb2xlID0gbmV3IENvbnNvbGUoKTtcblxuaW1wb3J0IFBBQ0tBR0VfSlNPTiA9IHJlcXVpcmUoJy4uL3BhY2thZ2UuanNvbicpO1xuXG5jb25zb2xlLmluc3BlY3RPcHRpb25zID0ge1xuXHRjb2xvcnM6IGNvbnNvbGUuZW5hYmxlZENvbG9yXG59O1xuXG5leHBvcnQgY29uc3QgZGVidWdDb25zb2xlID0gbmV3IENvbnNvbGUobnVsbCwge1xuXHRsYWJlbDogdHJ1ZSxcblx0dGltZTogdHJ1ZSxcbn0pO1xuXG5kZWJ1Z0NvbnNvbGUuaW5zcGVjdE9wdGlvbnMgPSB7XG5cdGNvbG9yczogZGVidWdDb25zb2xlLmVuYWJsZWRDb2xvclxufTtcblxuZGVidWdDb25zb2xlLmVuYWJsZWQgPSBmYWxzZTtcblxuZXhwb3J0IGZ1bmN0aW9uIGVuYWJsZURlYnVnKGJvb2w/OiBib29sZWFuKVxue1xuXHRpZiAoYm9vbCB8fCB0eXBlb2YgYm9vbCA9PT0gJ3VuZGVmaW5lZCcpXG5cdHtcblx0XHRkZWJ1Z0NvbnNvbGUuZW5hYmxlZCA9IHRydWU7XG5cdH1cblx0ZWxzZSBpZiAoYm9vbCA9PT0gZmFsc2UpXG5cdHtcblx0XHRkZWJ1Z0NvbnNvbGUuZW5hYmxlZCA9IGZhbHNlO1xuXHR9XG5cblx0cmV0dXJuIGRlYnVnQ29uc29sZS5lbmFibGVkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q2FjaGVEaXJQYXRoKHVzZUdsb2JhbD86IGJvb2xlYW4pOiBzdHJpbmdcbntcblx0cmV0dXJuIGdldENhY2hlUGF0aCh7XG5cdFx0bmFtZTogUEFDS0FHRV9KU09OLm5hbWUsXG5cdFx0Y3JlYXRlOiB0cnVlLFxuXHRcdGZuT3JkZXI6IHVzZUdsb2JhbCA/IFtcblx0XHRcdGZpbmROcG1DYWNoZVBhdGgsXG5cdFx0XHRnZXRPU1RlbXBQYXRoLFxuXHRcdFx0ZmluZFBrZ01vZHVsZVBhdGgsXG5cdFx0XTogbnVsbCxcblx0fSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmcmVlR0MoKTogYm9vbGVhblxue1xuXHRpZiAoZ2xvYmFsICYmIHR5cGVvZiBnbG9iYWwuZ2MgPT09ICdmdW5jdGlvbicpXG5cdHtcblx0XHR0cnlcblx0XHR7XG5cdFx0XHRnbG9iYWwuZ2MoKTtcblxuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXHRcdGNhdGNoIChlKVxuXHRcdHtcblx0XHRcdGNvbnNvbGUuZXJyb3IoZSk7XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIGZhbHNlO1xufVxuXG5pbXBvcnQgKiBhcyBzZWxmIGZyb20gJy4vdXRpbCc7XG5leHBvcnQgZGVmYXVsdCBzZWxmO1xuIl19