"use strict";
/**
 * Created by user on 2018/4/13/013.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const FastGlob = require("fast-glob");
const path = require("path");
const fs = require("fs");
// @ts-ignore
function searchGlobSync(file, options) {
    options = getOptions(options);
    let ls = [];
    options.extensions = options.extensions || [''];
    options.paths.some(function (cwd) {
        let bool = options.extensions
            .some(function (ext) {
            let ret = _searchGlobSync(file + ext, options, cwd);
            if (ret.length) {
                ls = ret;
                return true;
            }
        });
        if (bool || ls.length) {
            return true;
        }
    });
    return ls;
}
exports.searchGlobSync = searchGlobSync;
function _searchGlobSync(file, options, cwd) {
    let glob_options = {
        markDirectories: true,
        unique: true,
        onlyDirectories: options.onlyDir,
        onlyFiles: !options.onlyDir,
        ignore: [
            '.*',
            '*.bak',
            '*.old',
        ],
        deep: 0,
        absolute: true,
    };
    if (cwd) {
        glob_options.cwd = cwd;
    }
    return FastGlob.sync(file, glob_options);
}
exports._searchGlobSync = _searchGlobSync;
// @ts-ignore
function searchFirstSync(file, options = {}) {
    if (typeof file !== 'string' || file === '') {
        throw new TypeError();
    }
    let fp;
    options = getOptions(options);
    let bool = options.paths.some(function (dir) {
        fp = path.join(dir, file);
        let bool;
        // typescript don't know what type about options
        if (options.extensions) {
            for (let ext of options.extensions) {
                let file = fp + ext;
                bool = existsSync(file, options);
                if (bool) {
                    fp = file;
                    break;
                }
            }
        }
        else {
            bool = existsSync(fp, options);
        }
        return bool;
    });
    if (bool) {
        return path.resolve(fp);
    }
    return null;
}
exports.searchFirstSync = searchFirstSync;
function existsSync(path, options = {}) {
    let bool = fs.existsSync(path);
    if (bool && (options.onlyDir || options.onlyFile)) {
        let stat = fs.statSync(path);
        if (options.onlyDir && !stat.isDirectory()) {
            bool = false;
        }
        else if (options.onlyFile && !stat.isFile()) {
            bool = false;
        }
    }
    // @ts-ignore
    delete options.cwd;
    return bool;
}
exports.existsSync = existsSync;
// @ts-ignore
function getOptions(options = {}) {
    if (Array.isArray(options)) {
        let paths;
        [paths, options] = [options, {}];
        options.paths = paths;
    }
    options = Object.assign({}, options);
    // typescript know options is IOptions
    if (options.onlyDir || options.extensions && !options.extensions.length) {
        delete options.extensions;
    }
    return options;
}
exports.getOptions = getOptions;
/*
let k = searchFirstSync('index', {
    paths: [
        '.',
        '..',
        '../..',
    ],
    extensions: [
        '.ts',
    ],
});

console.log(k);
*/
/*
console.log(searchGlobSync('fs/*', {
    paths: [
        '..',
    ],

    extensions: [
        '.js',
    ]
}));
*/
exports.default = searchFirstSync;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZ2V0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7R0FFRzs7QUFFSCxzQ0FBc0M7QUFDdEMsNkJBQTZCO0FBQzdCLHlCQUF5QjtBQWF6QixhQUFhO0FBQ2IsU0FBZ0IsY0FBYyxDQUFDLElBQVksRUFBRSxPQUFpQjtJQUU3RCxPQUFPLEdBQUcsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBRTlCLElBQUksRUFBRSxHQUFhLEVBQUUsQ0FBQztJQUV0QixPQUFPLENBQUMsVUFBVSxHQUFHLE9BQU8sQ0FBQyxVQUFVLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUVoRCxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxVQUFVLEdBQUc7UUFFL0IsSUFBSSxJQUFJLEdBQUcsT0FBTyxDQUFDLFVBQVU7YUFDM0IsSUFBSSxDQUFDLFVBQVUsR0FBRztZQUVsQixJQUFJLEdBQUcsR0FBRyxlQUFlLENBQUMsSUFBSSxHQUFHLEdBQUcsRUFBRSxPQUFPLEVBQUUsR0FBRyxDQUFhLENBQUM7WUFFaEUsSUFBSSxHQUFHLENBQUMsTUFBTSxFQUNkO2dCQUNDLEVBQUUsR0FBRyxHQUFHLENBQUM7Z0JBRVQsT0FBTyxJQUFJLENBQUM7YUFDWjtRQUNGLENBQUMsQ0FBQyxDQUNGO1FBRUQsSUFBSSxJQUFJLElBQUksRUFBRSxDQUFDLE1BQU0sRUFDckI7WUFDQyxPQUFPLElBQUksQ0FBQztTQUNaO0lBQ0YsQ0FBQyxDQUFDLENBQUM7SUFFSCxPQUFPLEVBQUUsQ0FBQztBQUNYLENBQUM7QUEvQkQsd0NBK0JDO0FBRUQsU0FBZ0IsZUFBZSxDQUFDLElBQUksRUFBRSxPQUFpQixFQUFFLEdBQVk7SUFFcEUsSUFBSSxZQUFZLEdBQXFCO1FBQ3BDLGVBQWUsRUFBRSxJQUFJO1FBQ3JCLE1BQU0sRUFBRSxJQUFJO1FBRVosZUFBZSxFQUFFLE9BQU8sQ0FBQyxPQUFPO1FBQ2hDLFNBQVMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxPQUFPO1FBRTNCLE1BQU0sRUFBRTtZQUNQLElBQUk7WUFDSixPQUFPO1lBQ1AsT0FBTztTQUNQO1FBRUQsSUFBSSxFQUFFLENBQUM7UUFFUCxRQUFRLEVBQUUsSUFBSTtLQUNkLENBQUM7SUFFRixJQUFJLEdBQUcsRUFDUDtRQUNDLFlBQVksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO0tBQ3ZCO0lBRUQsT0FBTyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxZQUFZLENBQWEsQ0FBQztBQUN0RCxDQUFDO0FBMUJELDBDQTBCQztBQUtELGFBQWE7QUFDYixTQUFnQixlQUFlLENBQUMsSUFBWSxFQUFFLFVBQW9CLEVBQUU7SUFFbkUsSUFBSSxPQUFPLElBQUksS0FBSyxRQUFRLElBQUksSUFBSSxLQUFLLEVBQUUsRUFDM0M7UUFDQyxNQUFNLElBQUksU0FBUyxFQUFFLENBQUM7S0FDdEI7SUFFRCxJQUFJLEVBQVUsQ0FBQztJQUVmLE9BQU8sR0FBRyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7SUFFOUIsSUFBSSxJQUFJLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsVUFBVSxHQUFHO1FBRTFDLEVBQUUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUUxQixJQUFJLElBQWEsQ0FBQztRQUVsQixnREFBZ0Q7UUFDaEQsSUFBSyxPQUFvQixDQUFDLFVBQVUsRUFDcEM7WUFDQyxLQUFLLElBQUksR0FBRyxJQUFLLE9BQW9CLENBQUMsVUFBVSxFQUNoRDtnQkFDQyxJQUFJLElBQUksR0FBRyxFQUFFLEdBQUcsR0FBRyxDQUFDO2dCQUNwQixJQUFJLEdBQUcsVUFBVSxDQUFDLElBQUksRUFBRSxPQUFtQixDQUFDLENBQUM7Z0JBQzdDLElBQUksSUFBSSxFQUNSO29CQUNDLEVBQUUsR0FBRyxJQUFJLENBQUM7b0JBQ1YsTUFBTTtpQkFDTjthQUNEO1NBQ0Q7YUFFRDtZQUNDLElBQUksR0FBRyxVQUFVLENBQUMsRUFBRSxFQUFFLE9BQW1CLENBQUMsQ0FBQztTQUMzQztRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQyxDQUFDLENBQUM7SUFFSCxJQUFJLElBQUksRUFDUjtRQUNDLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztLQUN4QjtJQUVELE9BQU8sSUFBSSxDQUFDO0FBQ2IsQ0FBQztBQTdDRCwwQ0E2Q0M7QUFFRCxTQUFnQixVQUFVLENBQUMsSUFBWSxFQUFFLFVBR3JDLEVBQUU7SUFFTCxJQUFJLElBQUksR0FBRyxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBRS9CLElBQUksSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sSUFBSSxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQ2pEO1FBQ0MsSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUU3QixJQUFJLE9BQU8sQ0FBQyxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLEVBQzFDO1lBQ0MsSUFBSSxHQUFHLEtBQUssQ0FBQztTQUNiO2FBQ0ksSUFBSSxPQUFPLENBQUMsUUFBUSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUMzQztZQUNDLElBQUksR0FBRyxLQUFLLENBQUM7U0FDYjtLQUNEO0lBRUQsYUFBYTtJQUNiLE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQztJQUVuQixPQUFPLElBQUksQ0FBQztBQUNiLENBQUM7QUF6QkQsZ0NBeUJDO0FBTUQsYUFBYTtBQUNiLFNBQWdCLFVBQVUsQ0FBQyxVQUErQixFQUFFO0lBRTNELElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFDMUI7UUFDQyxJQUFJLEtBQWUsQ0FBQztRQUNwQixDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxFQUFjLENBQUMsQ0FBQztRQUU3QyxPQUFPLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztLQUN0QjtJQUVELE9BQU8sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxPQUFPLENBQWEsQ0FBQztJQUVqRCxzQ0FBc0M7SUFDdEMsSUFBSSxPQUFPLENBQUMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxVQUFVLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFDdkU7UUFDQyxPQUFPLE9BQU8sQ0FBQyxVQUFVLENBQUM7S0FDMUI7SUFFRCxPQUFPLE9BQU8sQ0FBQztBQUNoQixDQUFDO0FBbkJELGdDQW1CQztBQUVEOzs7Ozs7Ozs7Ozs7O0VBYUU7QUFFRjs7Ozs7Ozs7OztFQVVFO0FBRUYsa0JBQWUsZUFBZSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDcmVhdGVkIGJ5IHVzZXIgb24gMjAxOC80LzEzLzAxMy5cbiAqL1xuXG5pbXBvcnQgKiBhcyBGYXN0R2xvYiBmcm9tICdmYXN0LWdsb2InO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzJztcblxuZXhwb3J0IHR5cGUgSU9wdGlvbnMgPSB7XG5cdGV4dGVuc2lvbnM/OiBzdHJpbmdbXSxcblx0cGF0aHM6IHN0cmluZ1tdLFxuXG5cdG9ubHlEaXI/OiBib29sZWFuLFxuXHRvbmx5RmlsZT86IGJvb2xlYW4sXG59O1xuXG5leHBvcnQgZnVuY3Rpb24gc2VhcmNoR2xvYlN5bmMoZmlsZTogc3RyaW5nLCBvcHRpb25zOiBJT3B0aW9ucyk6IHN0cmluZ1tdXG4vLyBAdHMtaWdub3JlXG5leHBvcnQgZnVuY3Rpb24gc2VhcmNoR2xvYlN5bmMoZmlsZTogc3RyaW5nLCBwYXRocz86IHN0cmluZ1tdKTogc3RyaW5nW11cbi8vIEB0cy1pZ25vcmVcbmV4cG9ydCBmdW5jdGlvbiBzZWFyY2hHbG9iU3luYyhmaWxlOiBzdHJpbmcsIG9wdGlvbnM6IElPcHRpb25zKTogc3RyaW5nW11cbntcblx0b3B0aW9ucyA9IGdldE9wdGlvbnMob3B0aW9ucyk7XG5cblx0bGV0IGxzOiBzdHJpbmdbXSA9IFtdO1xuXG5cdG9wdGlvbnMuZXh0ZW5zaW9ucyA9IG9wdGlvbnMuZXh0ZW5zaW9ucyB8fCBbJyddO1xuXG5cdG9wdGlvbnMucGF0aHMuc29tZShmdW5jdGlvbiAoY3dkKVxuXHR7XG5cdFx0bGV0IGJvb2wgPSBvcHRpb25zLmV4dGVuc2lvbnNcblx0XHRcdC5zb21lKGZ1bmN0aW9uIChleHQpXG5cdFx0XHR7XG5cdFx0XHRcdGxldCByZXQgPSBfc2VhcmNoR2xvYlN5bmMoZmlsZSArIGV4dCwgb3B0aW9ucywgY3dkKSBhcyBzdHJpbmdbXTtcblxuXHRcdFx0XHRpZiAocmV0Lmxlbmd0aClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGxzID0gcmV0O1xuXG5cdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdH1cblx0XHRcdH0pXG5cdFx0O1xuXG5cdFx0aWYgKGJvb2wgfHwgbHMubGVuZ3RoKVxuXHRcdHtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblx0fSk7XG5cblx0cmV0dXJuIGxzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gX3NlYXJjaEdsb2JTeW5jKGZpbGUsIG9wdGlvbnM6IElPcHRpb25zLCBjd2Q/OiBzdHJpbmcpOiBzdHJpbmdbXVxue1xuXHRsZXQgZ2xvYl9vcHRpb25zOiBGYXN0R2xvYi5PcHRpb25zID0ge1xuXHRcdG1hcmtEaXJlY3RvcmllczogdHJ1ZSxcblx0XHR1bmlxdWU6IHRydWUsXG5cblx0XHRvbmx5RGlyZWN0b3JpZXM6IG9wdGlvbnMub25seURpcixcblx0XHRvbmx5RmlsZXM6ICFvcHRpb25zLm9ubHlEaXIsXG5cblx0XHRpZ25vcmU6IFtcblx0XHRcdCcuKicsXG5cdFx0XHQnKi5iYWsnLFxuXHRcdFx0Jyoub2xkJyxcblx0XHRdLFxuXG5cdFx0ZGVlcDogMCxcblxuXHRcdGFic29sdXRlOiB0cnVlLFxuXHR9O1xuXG5cdGlmIChjd2QpXG5cdHtcblx0XHRnbG9iX29wdGlvbnMuY3dkID0gY3dkO1xuXHR9XG5cblx0cmV0dXJuIEZhc3RHbG9iLnN5bmMoZmlsZSwgZ2xvYl9vcHRpb25zKSBhcyBzdHJpbmdbXTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNlYXJjaEZpcnN0U3luYyhmaWxlOiBzdHJpbmcsIG9wdGlvbnM6IElPcHRpb25zKTogc3RyaW5nXG4vLyBAdHMtaWdub3JlXG5leHBvcnQgZnVuY3Rpb24gc2VhcmNoRmlyc3RTeW5jKGZpbGU6IHN0cmluZywgcGF0aHM/OiBzdHJpbmdbXSk6IHN0cmluZ1xuLy8gQHRzLWlnbm9yZVxuZXhwb3J0IGZ1bmN0aW9uIHNlYXJjaEZpcnN0U3luYyhmaWxlOiBzdHJpbmcsIG9wdGlvbnM6IElPcHRpb25zID0ge30pOiBzdHJpbmdcbntcblx0aWYgKHR5cGVvZiBmaWxlICE9PSAnc3RyaW5nJyB8fCBmaWxlID09PSAnJylcblx0e1xuXHRcdHRocm93IG5ldyBUeXBlRXJyb3IoKTtcblx0fVxuXG5cdGxldCBmcDogc3RyaW5nO1xuXG5cdG9wdGlvbnMgPSBnZXRPcHRpb25zKG9wdGlvbnMpO1xuXG5cdGxldCBib29sID0gb3B0aW9ucy5wYXRocy5zb21lKGZ1bmN0aW9uIChkaXIpXG5cdHtcblx0XHRmcCA9IHBhdGguam9pbihkaXIsIGZpbGUpO1xuXG5cdFx0bGV0IGJvb2w6IGJvb2xlYW47XG5cblx0XHQvLyB0eXBlc2NyaXB0IGRvbid0IGtub3cgd2hhdCB0eXBlIGFib3V0IG9wdGlvbnNcblx0XHRpZiAoKG9wdGlvbnMgYXMgSU9wdGlvbnMpLmV4dGVuc2lvbnMpXG5cdFx0e1xuXHRcdFx0Zm9yIChsZXQgZXh0IG9mIChvcHRpb25zIGFzIElPcHRpb25zKS5leHRlbnNpb25zKVxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgZmlsZSA9IGZwICsgZXh0O1xuXHRcdFx0XHRib29sID0gZXhpc3RzU3luYyhmaWxlLCBvcHRpb25zIGFzIElPcHRpb25zKTtcblx0XHRcdFx0aWYgKGJvb2wpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRmcCA9IGZpbGU7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0ZWxzZVxuXHRcdHtcblx0XHRcdGJvb2wgPSBleGlzdHNTeW5jKGZwLCBvcHRpb25zIGFzIElPcHRpb25zKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gYm9vbDtcblx0fSk7XG5cblx0aWYgKGJvb2wpXG5cdHtcblx0XHRyZXR1cm4gcGF0aC5yZXNvbHZlKGZwKTtcblx0fVxuXG5cdHJldHVybiBudWxsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZXhpc3RzU3luYyhwYXRoOiBzdHJpbmcsIG9wdGlvbnM6IHtcblx0b25seURpcj86IGJvb2xlYW4sXG5cdG9ubHlGaWxlPzogYm9vbGVhbixcbn0gPSB7fSk6IGJvb2xlYW5cbntcblx0bGV0IGJvb2wgPSBmcy5leGlzdHNTeW5jKHBhdGgpO1xuXG5cdGlmIChib29sICYmIChvcHRpb25zLm9ubHlEaXIgfHwgb3B0aW9ucy5vbmx5RmlsZSkpXG5cdHtcblx0XHRsZXQgc3RhdCA9IGZzLnN0YXRTeW5jKHBhdGgpO1xuXG5cdFx0aWYgKG9wdGlvbnMub25seURpciAmJiAhc3RhdC5pc0RpcmVjdG9yeSgpKVxuXHRcdHtcblx0XHRcdGJvb2wgPSBmYWxzZTtcblx0XHR9XG5cdFx0ZWxzZSBpZiAob3B0aW9ucy5vbmx5RmlsZSAmJiAhc3RhdC5pc0ZpbGUoKSlcblx0XHR7XG5cdFx0XHRib29sID0gZmFsc2U7XG5cdFx0fVxuXHR9XG5cblx0Ly8gQHRzLWlnbm9yZVxuXHRkZWxldGUgb3B0aW9ucy5jd2Q7XG5cblx0cmV0dXJuIGJvb2w7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRPcHRpb25zPFQgZXh0ZW5kcyBJT3B0aW9ucz4ob3B0aW9uczogVCAmIElPcHRpb25zKTogVCAmIElPcHRpb25zXG5leHBvcnQgZnVuY3Rpb24gZ2V0T3B0aW9ucyhwYXRoczogc3RyaW5nW10pOiBJT3B0aW9uc1xuLy8gQHRzLWlnbm9yZVxuZXhwb3J0IGZ1bmN0aW9uIGdldE9wdGlvbnMob3B0aW9uczogSU9wdGlvbnMgfCBzdHJpbmdbXSk6IG9wdGlvbnMgaXMgSU9wdGlvbnNcbi8vIEB0cy1pZ25vcmVcbmV4cG9ydCBmdW5jdGlvbiBnZXRPcHRpb25zKG9wdGlvbnM6IElPcHRpb25zIHwgc3RyaW5nW10gPSB7fSlcbntcblx0aWYgKEFycmF5LmlzQXJyYXkob3B0aW9ucykpXG5cdHtcblx0XHRsZXQgcGF0aHM6IHN0cmluZ1tdO1xuXHRcdFtwYXRocywgb3B0aW9uc10gPSBbb3B0aW9ucywge30gYXMgSU9wdGlvbnNdO1xuXG5cdFx0b3B0aW9ucy5wYXRocyA9IHBhdGhzO1xuXHR9XG5cblx0b3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIG9wdGlvbnMpIGFzIElPcHRpb25zO1xuXG5cdC8vIHR5cGVzY3JpcHQga25vdyBvcHRpb25zIGlzIElPcHRpb25zXG5cdGlmIChvcHRpb25zLm9ubHlEaXIgfHwgb3B0aW9ucy5leHRlbnNpb25zICYmICFvcHRpb25zLmV4dGVuc2lvbnMubGVuZ3RoKVxuXHR7XG5cdFx0ZGVsZXRlIG9wdGlvbnMuZXh0ZW5zaW9ucztcblx0fVxuXG5cdHJldHVybiBvcHRpb25zO1xufVxuXG4vKlxubGV0IGsgPSBzZWFyY2hGaXJzdFN5bmMoJ2luZGV4Jywge1xuXHRwYXRoczogW1xuXHRcdCcuJyxcblx0XHQnLi4nLFxuXHRcdCcuLi8uLicsXG5cdF0sXG5cdGV4dGVuc2lvbnM6IFtcblx0XHQnLnRzJyxcblx0XSxcbn0pO1xuXG5jb25zb2xlLmxvZyhrKTtcbiovXG5cbi8qXG5jb25zb2xlLmxvZyhzZWFyY2hHbG9iU3luYygnZnMvKicsIHtcblx0cGF0aHM6IFtcblx0XHQnLi4nLFxuXHRdLFxuXG5cdGV4dGVuc2lvbnM6IFtcblx0XHQnLmpzJyxcblx0XVxufSkpO1xuKi9cblxuZXhwb3J0IGRlZmF1bHQgc2VhcmNoRmlyc3RTeW5jO1xuIl19