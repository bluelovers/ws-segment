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
        deep: false,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZ2V0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7R0FFRzs7QUFFSCxzQ0FBc0M7QUFDdEMsNkJBQTZCO0FBQzdCLHlCQUF5QjtBQWF6QixhQUFhO0FBQ2IsU0FBZ0IsY0FBYyxDQUFDLElBQVksRUFBRSxPQUFpQjtJQUU3RCxPQUFPLEdBQUcsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBRTlCLElBQUksRUFBRSxHQUFhLEVBQUUsQ0FBQztJQUV0QixPQUFPLENBQUMsVUFBVSxHQUFHLE9BQU8sQ0FBQyxVQUFVLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUVoRCxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxVQUFVLEdBQUc7UUFFL0IsSUFBSSxJQUFJLEdBQUcsT0FBTyxDQUFDLFVBQVU7YUFDM0IsSUFBSSxDQUFDLFVBQVUsR0FBRztZQUVsQixJQUFJLEdBQUcsR0FBRyxlQUFlLENBQUMsSUFBSSxHQUFHLEdBQUcsRUFBRSxPQUFPLEVBQUUsR0FBRyxDQUFhLENBQUM7WUFFaEUsSUFBSSxHQUFHLENBQUMsTUFBTSxFQUNkO2dCQUNDLEVBQUUsR0FBRyxHQUFHLENBQUM7Z0JBRVQsT0FBTyxJQUFJLENBQUM7YUFDWjtRQUNGLENBQUMsQ0FBQyxDQUNGO1FBRUQsSUFBSSxJQUFJLElBQUksRUFBRSxDQUFDLE1BQU0sRUFDckI7WUFDQyxPQUFPLElBQUksQ0FBQztTQUNaO0lBQ0YsQ0FBQyxDQUFDLENBQUM7SUFFSCxPQUFPLEVBQUUsQ0FBQztBQUNYLENBQUM7QUEvQkQsd0NBK0JDO0FBRUQsU0FBZ0IsZUFBZSxDQUFDLElBQUksRUFBRSxPQUFpQixFQUFFLEdBQVk7SUFFcEUsSUFBSSxZQUFZLEdBQXFCO1FBQ3BDLGVBQWUsRUFBRSxJQUFJO1FBQ3JCLE1BQU0sRUFBRSxJQUFJO1FBRVosZUFBZSxFQUFFLE9BQU8sQ0FBQyxPQUFPO1FBQ2hDLFNBQVMsRUFBRSxD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QUVELE9BQU8sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxPQUFPLENBQWEsQ0FBQztJQUVqRCxzQ0FBc0M7SUFDdEMsSUFBSSxPQUFPLENBQUMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxVQUFVLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFDdkU7UUFDQyxPQUFPLE9BQU8sQ0FBQyxVQUFVLENBQUM7S0FDMUI7SUFFRCxPQUFPLE9BQU8sQ0FBQztBQUNoQixDQUFDO0FBbkJELGdDQW1CQztBQUVEOzs7Ozs7Ozs7Ozs7O0VBYUU7QUFFRjs7Ozs7Ozs7OztFQVVFO0FBRUYsa0JBQWUsZUFBZSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDcmVhdGVkIGJ5IHVzZXIgb24gMjAxOC80LzEzLzAxMy5cbiAqL1xuXG5pbXBvcnQgKiBhcyBGYXN0R2xvYiBmcm9tICdmYXN0LWdsb2InO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzJztcblxuZXhwb3J0IHR5cGUgSU9wdGlvbnMgPSB7XG5cdGV4dGVuc2lvbnM/OiBzdHJpbmdbXSxcblx0cGF0aHM6IHN0cmluZ1tdLFxuXG5cdG9ubHlEaXI/OiBib29sZWFuLFxuXHRvbmx5RmlsZT86IGJvb2xlYW4sXG59O1xuXG5leHBvcnQgZnVuY3Rpb24gc2VhcmNoR2xvYlN5bmMoZmlsZTogc3RyaW5nLCBvcHRpb25zOiBJT3B0aW9ucyk6IHN0cmluZ1tdXG4vLyBAdHMtaWdub3JlXG5leHBvcnQgZnVuY3Rpb24gc2VhcmNoR2xvYlN5bmMoZmlsZTogc3RyaW5nLCBwYXRocz86IHN0cmluZ1tdKTogc3RyaW5nW11cbi8vIEB0cy1pZ25vcmVcbmV4cG9ydCBmdW5jdGlvbiBzZWFyY2hHbG9iU3luYyhmaWxlOiBzdHJpbmcsIG9wdGlvbnM6IElPcHRpb25zKTogc3RyaW5nW11cbntcblx0b3B0aW9ucyA9IGdldE9wdGlvbnMob3B0aW9ucyk7XG5cblx0bGV0IGxzOiBzdHJpbmdbXSA9IFtdO1xuXG5cdG9wdGlvbnMuZXh0ZW5zaW9ucyA9IG9wdGlvbnMuZXh0ZW5zaW9ucyB8fCBbJyddO1xuXG5cdG9wdGlvbnMucGF0aHMuc29tZShmdW5jdGlvbiAoY3dkKVxuXHR7XG5cdFx0bGV0IGJvb2wgPSBvcHRpb25zLmV4dGVuc2lvbnNcblx0XHRcdC5zb21lKGZ1bmN0aW9uIChleHQpXG5cdFx0XHR7XG5cdFx0XHRcdGxldCByZXQgPSBfc2VhcmNoR2xvYlN5bmMoZmlsZSArIGV4dCwgb3B0aW9ucywgY3dkKSBhcyBzdHJpbmdbXTtcblxuXHRcdFx0XHRpZiAocmV0Lmxlbmd0aClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGxzID0gcmV0O1xuXG5cdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdH1cblx0XHRcdH0pXG5cdFx0O1xuXG5cdFx0aWYgKGJvb2wgfHwgbHMubGVuZ3RoKVxuXHRcdHtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblx0fSk7XG5cblx0cmV0dXJuIGxzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gX3NlYXJjaEdsb2JTeW5jKGZpbGUsIG9wdGlvbnM6IElPcHRpb25zLCBjd2Q/OiBzdHJpbmcpOiBzdHJpbmdbXVxue1xuXHRsZXQgZ2xvYl9vcHRpb25zOiBGYXN0R2xvYi5PcHRpb25zID0ge1xuXHRcdG1hcmtEaXJlY3RvcmllczogdHJ1ZSxcblx0XHR1bmlxdWU6IHRydWUsXG5cblx0XHRvbmx5RGlyZWN0b3JpZXM6IG9wdGlvbnMub25seURpcixcblx0XHRvbmx5RmlsZXM6ICFvcHRpb25zLm9ubHlEaXIsXG5cblx0XHRpZ25vcmU6IFtcblx0XHRcdCcuKicsXG5cdFx0XHQnKi5iYWsnLFxuXHRcdFx0Jyoub2xkJyxcblx0XHRdLFxuXG5cdFx0ZGVlcDogZmFsc2UsXG5cblx0XHRhYnNvbHV0ZTogdHJ1ZSxcblx0fTtcblxuXHRpZiAoY3dkKVxuXHR7XG5cdFx0Z2xvYl9vcHRpb25zLmN3ZCA9IGN3ZDtcblx0fVxuXG5cdHJldHVybiBGYXN0R2xvYi5zeW5jKGZpbGUsIGdsb2Jfb3B0aW9ucykgYXMgc3RyaW5nW107XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZWFyY2hGaXJzdFN5bmMoZmlsZTogc3RyaW5nLCBvcHRpb25zOiBJT3B0aW9ucyk6IHN0cmluZ1xuLy8gQHRzLWlnbm9yZVxuZXhwb3J0IGZ1bmN0aW9uIHNlYXJjaEZpcnN0U3luYyhmaWxlOiBzdHJpbmcsIHBhdGhzPzogc3RyaW5nW10pOiBzdHJpbmdcbi8vIEB0cy1pZ25vcmVcbmV4cG9ydCBmdW5jdGlvbiBzZWFyY2hGaXJzdFN5bmMoZmlsZTogc3RyaW5nLCBvcHRpb25zOiBJT3B0aW9ucyA9IHt9KTogc3RyaW5nXG57XG5cdGlmICh0eXBlb2YgZmlsZSAhPT0gJ3N0cmluZycgfHwgZmlsZSA9PT0gJycpXG5cdHtcblx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKCk7XG5cdH1cblxuXHRsZXQgZnA6IHN0cmluZztcblxuXHRvcHRpb25zID0gZ2V0T3B0aW9ucyhvcHRpb25zKTtcblxuXHRsZXQgYm9vbCA9IG9wdGlvbnMucGF0aHMuc29tZShmdW5jdGlvbiAoZGlyKVxuXHR7XG5cdFx0ZnAgPSBwYXRoLmpvaW4oZGlyLCBmaWxlKTtcblxuXHRcdGxldCBib29sOiBib29sZWFuO1xuXG5cdFx0Ly8gdHlwZXNjcmlwdCBkb24ndCBrbm93IHdoYXQgdHlwZSBhYm91dCBvcHRpb25zXG5cdFx0aWYgKChvcHRpb25zIGFzIElPcHRpb25zKS5leHRlbnNpb25zKVxuXHRcdHtcblx0XHRcdGZvciAobGV0IGV4dCBvZiAob3B0aW9ucyBhcyBJT3B0aW9ucykuZXh0ZW5zaW9ucylcblx0XHRcdHtcblx0XHRcdFx0bGV0IGZpbGUgPSBmcCArIGV4dDtcblx0XHRcdFx0Ym9vbCA9IGV4aXN0c1N5bmMoZmlsZSwgb3B0aW9ucyBhcyBJT3B0aW9ucyk7XG5cdFx0XHRcdGlmIChib29sKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0ZnAgPSBmaWxlO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGVsc2Vcblx0XHR7XG5cdFx0XHRib29sID0gZXhpc3RzU3luYyhmcCwgb3B0aW9ucyBhcyBJT3B0aW9ucyk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGJvb2w7XG5cdH0pO1xuXG5cdGlmIChib29sKVxuXHR7XG5cdFx0cmV0dXJuIHBhdGgucmVzb2x2ZShmcCk7XG5cdH1cblxuXHRyZXR1cm4gbnVsbDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGV4aXN0c1N5bmMocGF0aDogc3RyaW5nLCBvcHRpb25zOiB7XG5cdG9ubHlEaXI/OiBib29sZWFuLFxuXHRvbmx5RmlsZT86IGJvb2xlYW4sXG59ID0ge30pOiBib29sZWFuXG57XG5cdGxldCBib29sID0gZnMuZXhpc3RzU3luYyhwYXRoKTtcblxuXHRpZiAoYm9vbCAmJiAob3B0aW9ucy5vbmx5RGlyIHx8IG9wdGlvbnMub25seUZpbGUpKVxuXHR7XG5cdFx0bGV0IHN0YXQgPSBmcy5zdGF0U3luYyhwYXRoKTtcblxuXHRcdGlmIChvcHRpb25zLm9ubHlEaXIgJiYgIXN0YXQuaXNEaXJlY3RvcnkoKSlcblx0XHR7XG5cdFx0XHRib29sID0gZmFsc2U7XG5cdFx0fVxuXHRcdGVsc2UgaWYgKG9wdGlvbnMub25seUZpbGUgJiYgIXN0YXQuaXNGaWxlKCkpXG5cdFx0e1xuXHRcdFx0Ym9vbCA9IGZhbHNlO1xuXHRcdH1cblx0fVxuXG5cdC8vIEB0cy1pZ25vcmVcblx0ZGVsZXRlIG9wdGlvbnMuY3dkO1xuXG5cdHJldHVybiBib29sO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0T3B0aW9uczxUIGV4dGVuZHMgSU9wdGlvbnM+KG9wdGlvbnM6IFQgJiBJT3B0aW9ucyk6IFQgJiBJT3B0aW9uc1xuZXhwb3J0IGZ1bmN0aW9uIGdldE9wdGlvbnMocGF0aHM6IHN0cmluZ1tdKTogSU9wdGlvbnNcbi8vIEB0cy1pZ25vcmVcbmV4cG9ydCBmdW5jdGlvbiBnZXRPcHRpb25zKG9wdGlvbnM6IElPcHRpb25zIHwgc3RyaW5nW10pOiBvcHRpb25zIGlzIElPcHRpb25zXG4vLyBAdHMtaWdub3JlXG5leHBvcnQgZnVuY3Rpb24gZ2V0T3B0aW9ucyhvcHRpb25zOiBJT3B0aW9ucyB8IHN0cmluZ1tdID0ge30pXG57XG5cdGlmIChBcnJheS5pc0FycmF5KG9wdGlvbnMpKVxuXHR7XG5cdFx0bGV0IHBhdGhzOiBzdHJpbmdbXTtcblx0XHRbcGF0aHMsIG9wdGlvbnNdID0gW29wdGlvbnMsIHt9IGFzIElPcHRpb25zXTtcblxuXHRcdG9wdGlvbnMucGF0aHMgPSBwYXRocztcblx0fVxuXG5cdG9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCBvcHRpb25zKSBhcyBJT3B0aW9ucztcblxuXHQvLyB0eXBlc2NyaXB0IGtub3cgb3B0aW9ucyBpcyBJT3B0aW9uc1xuXHRpZiAob3B0aW9ucy5vbmx5RGlyIHx8IG9wdGlvbnMuZXh0ZW5zaW9ucyAmJiAhb3B0aW9ucy5leHRlbnNpb25zLmxlbmd0aClcblx0e1xuXHRcdGRlbGV0ZSBvcHRpb25zLmV4dGVuc2lvbnM7XG5cdH1cblxuXHRyZXR1cm4gb3B0aW9ucztcbn1cblxuLypcbmxldCBrID0gc2VhcmNoRmlyc3RTeW5jKCdpbmRleCcsIHtcblx0cGF0aHM6IFtcblx0XHQnLicsXG5cdFx0Jy4uJyxcblx0XHQnLi4vLi4nLFxuXHRdLFxuXHRleHRlbnNpb25zOiBbXG5cdFx0Jy50cycsXG5cdF0sXG59KTtcblxuY29uc29sZS5sb2coayk7XG4qL1xuXG4vKlxuY29uc29sZS5sb2coc2VhcmNoR2xvYlN5bmMoJ2ZzLyonLCB7XG5cdHBhdGhzOiBbXG5cdFx0Jy4uJyxcblx0XSxcblxuXHRleHRlbnNpb25zOiBbXG5cdFx0Jy5qcycsXG5cdF1cbn0pKTtcbiovXG5cbmV4cG9ydCBkZWZhdWx0IHNlYXJjaEZpcnN0U3luYztcbiJdfQ==