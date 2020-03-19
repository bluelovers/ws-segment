"use strict";
/**
 * Created by user on 2018/4/13/013.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOptions = exports.existsSync = exports.searchFirstSync = exports._searchGlobSync = exports.searchGlobSync = void 0;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZ2V0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7R0FFRzs7O0FBRUgsc0NBQXNDO0FBQ3RDLDZCQUE2QjtBQUM3Qix5QkFBeUI7QUFhekIsYUFBYTtBQUNiLFNBQWdCLGNBQWMsQ0FBQyxJQUFZLEVBQUUsT0FBaUI7SUFFN0QsT0FBTyxHQUFHLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUU5QixJQUFJLEVBQUUsR0FBYSxFQUFFLENBQUM7SUFFdEIsT0FBTyxDQUFDLFVBQVUsR0FBRyxPQUFPLENBQUMsVUFBVSxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7SUFFaEQsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsVUFBVSxHQUFHO1FBRS9CLElBQUksSUFBSSxHQUFHLE9BQU8sQ0FBQyxVQUFVO2FBQzNCLElBQUksQ0FBQyxVQUFVLEdBQUc7WUFFbEIsSUFBSSxHQUFHLEdBQUcsZUFBZSxDQUFDLElBQUksR0FBRyxHQUFHLEVBQUUsT0FBTyxFQUFFLEdBQUcsQ0FBYSxDQUFDO1lBRWhFLElBQUksR0FBRyxDQUFDLE1BQU0sRUFDZDtnQkFDQyxFQUFFLEdBQUcsR0FBRyxDQUFDO2dCQUVULE9BQU8sSUFBSSxDQUFDO2FBQ1o7UUFDRixDQUFDLENBQUMsQ0FDRjtRQUVELElBQUksSUFBSSxJQUFJLEVBQUUsQ0FBQyxNQUFNLEVBQ3JCO1lBQ0MsT0FBTyxJQUFJLENBQUM7U0FDWjtJQUNGLENBQUMsQ0FBQyxDQUFDO0lBRUgsT0FBTyxFQUFFLENBQUM7QUFDWCxDQUFDO0FBL0JELHdDQStCQztBQUVELFNBQWdCLGVBQWUsQ0FBQyxJQUFJLEVBQUUsT0FBaUIsRUFBRSxHQUFZO0lBRXBFLElBQUksWUFBWSxHQUFxQjtRQUNwQyxlQUFlLEVBQUUsSUFBSTtRQUNyQixNQUFNLEVBQUUsSUFBSTtRQUVaLGVBQWUsRUFBRSxPQUFPLENBQUMsT0FBTztRQUNoQyxTQUFTLEVBQUUs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SUFFRCxPQUFPLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsT0FBTyxDQUFhLENBQUM7SUFFakQsc0NBQXNDO0lBQ3RDLElBQUksT0FBTyxDQUFDLE9BQU8sSUFBSSxPQUFPLENBQUMsVUFBVSxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQ3ZFO1FBQ0MsT0FBTyxPQUFPLENBQUMsVUFBVSxDQUFDO0tBQzFCO0lBRUQsT0FBTyxPQUFPLENBQUM7QUFDaEIsQ0FBQztBQW5CRCxnQ0FtQkM7QUFFRDs7Ozs7Ozs7Ozs7OztFQWFFO0FBRUY7Ozs7Ozs7Ozs7RUFVRTtBQUVGLGtCQUFlLGVBQWUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTgvNC8xMy8wMTMuXG4gKi9cblxuaW1wb3J0ICogYXMgRmFzdEdsb2IgZnJvbSAnZmFzdC1nbG9iJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5cbmV4cG9ydCB0eXBlIElPcHRpb25zID0ge1xuXHRleHRlbnNpb25zPzogc3RyaW5nW10sXG5cdHBhdGhzOiBzdHJpbmdbXSxcblxuXHRvbmx5RGlyPzogYm9vbGVhbixcblx0b25seUZpbGU/OiBib29sZWFuLFxufTtcblxuZXhwb3J0IGZ1bmN0aW9uIHNlYXJjaEdsb2JTeW5jKGZpbGU6IHN0cmluZywgb3B0aW9uczogSU9wdGlvbnMpOiBzdHJpbmdbXVxuLy8gQHRzLWlnbm9yZVxuZXhwb3J0IGZ1bmN0aW9uIHNlYXJjaEdsb2JTeW5jKGZpbGU6IHN0cmluZywgcGF0aHM/OiBzdHJpbmdbXSk6IHN0cmluZ1tdXG4vLyBAdHMtaWdub3JlXG5leHBvcnQgZnVuY3Rpb24gc2VhcmNoR2xvYlN5bmMoZmlsZTogc3RyaW5nLCBvcHRpb25zOiBJT3B0aW9ucyk6IHN0cmluZ1tdXG57XG5cdG9wdGlvbnMgPSBnZXRPcHRpb25zKG9wdGlvbnMpO1xuXG5cdGxldCBsczogc3RyaW5nW10gPSBbXTtcblxuXHRvcHRpb25zLmV4dGVuc2lvbnMgPSBvcHRpb25zLmV4dGVuc2lvbnMgfHwgWycnXTtcblxuXHRvcHRpb25zLnBhdGhzLnNvbWUoZnVuY3Rpb24gKGN3ZClcblx0e1xuXHRcdGxldCBib29sID0gb3B0aW9ucy5leHRlbnNpb25zXG5cdFx0XHQuc29tZShmdW5jdGlvbiAoZXh0KVxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgcmV0ID0gX3NlYXJjaEdsb2JTeW5jKGZpbGUgKyBleHQsIG9wdGlvbnMsIGN3ZCkgYXMgc3RyaW5nW107XG5cblx0XHRcdFx0aWYgKHJldC5sZW5ndGgpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRscyA9IHJldDtcblxuXHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHR9XG5cdFx0XHR9KVxuXHRcdDtcblxuXHRcdGlmIChib29sIHx8IGxzLmxlbmd0aClcblx0XHR7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cdH0pO1xuXG5cdHJldHVybiBscztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIF9zZWFyY2hHbG9iU3luYyhmaWxlLCBvcHRpb25zOiBJT3B0aW9ucywgY3dkPzogc3RyaW5nKTogc3RyaW5nW11cbntcblx0bGV0IGdsb2Jfb3B0aW9uczogRmFzdEdsb2IuT3B0aW9ucyA9IHtcblx0XHRtYXJrRGlyZWN0b3JpZXM6IHRydWUsXG5cdFx0dW5pcXVlOiB0cnVlLFxuXG5cdFx0b25seURpcmVjdG9yaWVzOiBvcHRpb25zLm9ubHlEaXIsXG5cdFx0b25seUZpbGVzOiAhb3B0aW9ucy5vbmx5RGlyLFxuXG5cdFx0aWdub3JlOiBbXG5cdFx0XHQnLionLFxuXHRcdFx0JyouYmFrJyxcblx0XHRcdCcqLm9sZCcsXG5cdFx0XSxcblxuXHRcdGRlZXA6IDAsXG5cblx0XHRhYnNvbHV0ZTogdHJ1ZSxcblx0fTtcblxuXHRpZiAoY3dkKVxuXHR7XG5cdFx0Z2xvYl9vcHRpb25zLmN3ZCA9IGN3ZDtcblx0fVxuXG5cdHJldHVybiBGYXN0R2xvYi5zeW5jKGZpbGUsIGdsb2Jfb3B0aW9ucykgYXMgc3RyaW5nW107XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZWFyY2hGaXJzdFN5bmMoZmlsZTogc3RyaW5nLCBvcHRpb25zOiBJT3B0aW9ucyk6IHN0cmluZ1xuLy8gQHRzLWlnbm9yZVxuZXhwb3J0IGZ1bmN0aW9uIHNlYXJjaEZpcnN0U3luYyhmaWxlOiBzdHJpbmcsIHBhdGhzPzogc3RyaW5nW10pOiBzdHJpbmdcbi8vIEB0cy1pZ25vcmVcbmV4cG9ydCBmdW5jdGlvbiBzZWFyY2hGaXJzdFN5bmMoZmlsZTogc3RyaW5nLCBvcHRpb25zOiBJT3B0aW9ucyA9IHt9KTogc3RyaW5nXG57XG5cdGlmICh0eXBlb2YgZmlsZSAhPT0gJ3N0cmluZycgfHwgZmlsZSA9PT0gJycpXG5cdHtcblx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKCk7XG5cdH1cblxuXHRsZXQgZnA6IHN0cmluZztcblxuXHRvcHRpb25zID0gZ2V0T3B0aW9ucyhvcHRpb25zKTtcblxuXHRsZXQgYm9vbCA9IG9wdGlvbnMucGF0aHMuc29tZShmdW5jdGlvbiAoZGlyKVxuXHR7XG5cdFx0ZnAgPSBwYXRoLmpvaW4oZGlyLCBmaWxlKTtcblxuXHRcdGxldCBib29sOiBib29sZWFuO1xuXG5cdFx0Ly8gdHlwZXNjcmlwdCBkb24ndCBrbm93IHdoYXQgdHlwZSBhYm91dCBvcHRpb25zXG5cdFx0aWYgKChvcHRpb25zIGFzIElPcHRpb25zKS5leHRlbnNpb25zKVxuXHRcdHtcblx0XHRcdGZvciAobGV0IGV4dCBvZiAob3B0aW9ucyBhcyBJT3B0aW9ucykuZXh0ZW5zaW9ucylcblx0XHRcdHtcblx0XHRcdFx0bGV0IGZpbGUgPSBmcCArIGV4dDtcblx0XHRcdFx0Ym9vbCA9IGV4aXN0c1N5bmMoZmlsZSwgb3B0aW9ucyBhcyBJT3B0aW9ucyk7XG5cdFx0XHRcdGlmIChib29sKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0ZnAgPSBmaWxlO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGVsc2Vcblx0XHR7XG5cdFx0XHRib29sID0gZXhpc3RzU3luYyhmcCwgb3B0aW9ucyBhcyBJT3B0aW9ucyk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGJvb2w7XG5cdH0pO1xuXG5cdGlmIChib29sKVxuXHR7XG5cdFx0cmV0dXJuIHBhdGgucmVzb2x2ZShmcCk7XG5cdH1cblxuXHRyZXR1cm4gbnVsbDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGV4aXN0c1N5bmMocGF0aDogc3RyaW5nLCBvcHRpb25zOiB7XG5cdG9ubHlEaXI/OiBib29sZWFuLFxuXHRvbmx5RmlsZT86IGJvb2xlYW4sXG59ID0ge30pOiBib29sZWFuXG57XG5cdGxldCBib29sID0gZnMuZXhpc3RzU3luYyhwYXRoKTtcblxuXHRpZiAoYm9vbCAmJiAob3B0aW9ucy5vbmx5RGlyIHx8IG9wdGlvbnMub25seUZpbGUpKVxuXHR7XG5cdFx0bGV0IHN0YXQgPSBmcy5zdGF0U3luYyhwYXRoKTtcblxuXHRcdGlmIChvcHRpb25zLm9ubHlEaXIgJiYgIXN0YXQuaXNEaXJlY3RvcnkoKSlcblx0XHR7XG5cdFx0XHRib29sID0gZmFsc2U7XG5cdFx0fVxuXHRcdGVsc2UgaWYgKG9wdGlvbnMub25seUZpbGUgJiYgIXN0YXQuaXNGaWxlKCkpXG5cdFx0e1xuXHRcdFx0Ym9vbCA9IGZhbHNlO1xuXHRcdH1cblx0fVxuXG5cdC8vIEB0cy1pZ25vcmVcblx0ZGVsZXRlIG9wdGlvbnMuY3dkO1xuXG5cdHJldHVybiBib29sO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0T3B0aW9uczxUIGV4dGVuZHMgSU9wdGlvbnM+KG9wdGlvbnM6IFQgJiBJT3B0aW9ucyk6IFQgJiBJT3B0aW9uc1xuZXhwb3J0IGZ1bmN0aW9uIGdldE9wdGlvbnMocGF0aHM6IHN0cmluZ1tdKTogSU9wdGlvbnNcbi8vIEB0cy1pZ25vcmVcbmV4cG9ydCBmdW5jdGlvbiBnZXRPcHRpb25zKG9wdGlvbnM6IElPcHRpb25zIHwgc3RyaW5nW10pOiBvcHRpb25zIGlzIElPcHRpb25zXG4vLyBAdHMtaWdub3JlXG5leHBvcnQgZnVuY3Rpb24gZ2V0T3B0aW9ucyhvcHRpb25zOiBJT3B0aW9ucyB8IHN0cmluZ1tdID0ge30pXG57XG5cdGlmIChBcnJheS5pc0FycmF5KG9wdGlvbnMpKVxuXHR7XG5cdFx0bGV0IHBhdGhzOiBzdHJpbmdbXTtcblx0XHRbcGF0aHMsIG9wdGlvbnNdID0gW29wdGlvbnMsIHt9IGFzIElPcHRpb25zXTtcblxuXHRcdG9wdGlvbnMucGF0aHMgPSBwYXRocztcblx0fVxuXG5cdG9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCBvcHRpb25zKSBhcyBJT3B0aW9ucztcblxuXHQvLyB0eXBlc2NyaXB0IGtub3cgb3B0aW9ucyBpcyBJT3B0aW9uc1xuXHRpZiAob3B0aW9ucy5vbmx5RGlyIHx8IG9wdGlvbnMuZXh0ZW5zaW9ucyAmJiAhb3B0aW9ucy5leHRlbnNpb25zLmxlbmd0aClcblx0e1xuXHRcdGRlbGV0ZSBvcHRpb25zLmV4dGVuc2lvbnM7XG5cdH1cblxuXHRyZXR1cm4gb3B0aW9ucztcbn1cblxuLypcbmxldCBrID0gc2VhcmNoRmlyc3RTeW5jKCdpbmRleCcsIHtcblx0cGF0aHM6IFtcblx0XHQnLicsXG5cdFx0Jy4uJyxcblx0XHQnLi4vLi4nLFxuXHRdLFxuXHRleHRlbnNpb25zOiBbXG5cdFx0Jy50cycsXG5cdF0sXG59KTtcblxuY29uc29sZS5sb2coayk7XG4qL1xuXG4vKlxuY29uc29sZS5sb2coc2VhcmNoR2xvYlN5bmMoJ2ZzLyonLCB7XG5cdHBhdGhzOiBbXG5cdFx0Jy4uJyxcblx0XSxcblxuXHRleHRlbnNpb25zOiBbXG5cdFx0Jy5qcycsXG5cdF1cbn0pKTtcbiovXG5cbmV4cG9ydCBkZWZhdWx0IHNlYXJjaEZpcnN0U3luYztcbiJdfQ==