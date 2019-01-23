"use strict";
/**
 * Created by user on 2018/3/14/014.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const line_1 = require("../../fs/line");
const stream_1 = require("../../fs/stream");
const sync_1 = require("../../fs/sync");
/**
 * 云计算
 * 蓝翔 nz
 * 区块链 10 nz
*/
function parseLine(input) {
    let [str, n, s] = input
        .replace(/^\s+|\s+$/, '')
        .split(/\s+/g);
    if (n === '') {
        n = undefined;
    }
    if (s === '') {
        s = undefined;
    }
    if (typeof s == 'undefined' || s == '') {
        if (typeof n == 'string' && !/^\d+(?:\.\d+)?$/.test(n)) {
            [n, s] = [undefined, n];
        }
    }
    if (typeof n == 'string') {
        // @ts-ignore
        n = Number(n);
    }
    if (!str) {
        throw new ReferenceError(`${input}`);
    }
    return [str, n, s];
}
exports.parseLine = parseLine;
function load(file) {
    return line_1.wrapStreamToPromise(loadStream(file))
        .then(function (stream) {
        return stream.value;
    });
}
exports.load = load;
function loadSync(file) {
    return loadStreamSync(file).value;
}
exports.loadSync = loadSync;
function _createStream(fnStream, file, callback) {
    return fnStream(file, {
        callback,
        mapper(line) {
            if (line) {
                return parseLine(line);
            }
        },
    });
}
exports._createStream = _createStream;
function loadStream(file, callback) {
    return _createStream(stream_1.default, file, callback);
}
exports.loadStream = loadStream;
function loadStreamSync(file, callback) {
    return _createStream(sync_1.default, file, callback);
}
exports.loadStreamSync = loadStreamSync;
exports.default = load;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7O0FBRUgsd0NBQTBFO0FBRTFFLDRDQUE4RDtBQUM5RCx3Q0FBaUQ7QUFLakQ7Ozs7RUFJRTtBQUNGLFNBQWdCLFNBQVMsQ0FBQyxLQUFhO0lBRXRDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLEtBQUs7U0FDckIsT0FBTyxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUM7U0FDeEIsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUNkO0lBRUQsSUFBSSxDQUFDLEtBQUssRUFBRSxFQUNaO1FBQ0MsQ0FBQyxHQUFHLFNBQVMsQ0FBQztLQUNkO0lBQ0QsSUFBSSxDQUFDLEtBQUssRUFBRSxFQUNaO1FBQ0MsQ0FBQyxHQUFHLFNBQVMsQ0FBQztLQUNkO0lBRUQsSUFBSSxPQUFPLENBQUMsSUFBSSxXQUFXLElBQUksQ0FBQyxJQUFJLEVBQUUsRUFDdEM7UUFDQyxJQUFJLE9BQU8sQ0FBQyxJQUFJLFFBQVEsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFDdEQ7WUFDQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQztTQUN4QjtLQUNEO0lBRUQsSUFBSSxPQUFPLENBQUMsSUFBSSxRQUFRLEVBQ3hCO1FBQ0MsYUFBYTtRQUNiLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDZDtJQUVELElBQUksQ0FBQyxHQUFHLEVBQ1I7UUFDQyxNQUFNLElBQUksY0FBYyxDQUFDLEdBQUcsS0FBSyxFQUFFLENBQUMsQ0FBQztLQUNyQztJQUVELE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBa0IsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUNyQyxDQUFDO0FBcENELDhCQW9DQztBQUVELFNBQWdCLElBQUksQ0FBQyxJQUFZO0lBRWhDLE9BQU8sMEJBQW1CLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQzFDLElBQUksQ0FBQyxVQUFVLE1BQW1DO1FBRWxELE9BQU8sTUFBTSxDQUFDLEtBQUssQ0FBQztJQUNyQixDQUFDLENBQUMsQ0FDRDtBQUNILENBQUM7QUFSRCxvQkFRQztBQUVELFNBQWdCLFFBQVEsQ0FBQyxJQUFZO0lBRXBDLE9BQU8sY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQztBQUNuQyxDQUFDO0FBSEQsNEJBR0M7QUFFRCxTQUFnQixhQUFhLENBQVEsUUFBaUMsRUFBRSxJQUFZLEVBQUUsUUFBMkI7SUFFaEgsT0FBTyxRQUFRLENBQVEsSUFBSSxFQUFFO1FBRTVCLFFBQVE7UUFFUixNQUFNLENBQUMsSUFBSTtZQUVWLElBQUksSUFBSSxFQUNSO2dCQUNDLE9BQU8sU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ3ZCO1FBQ0YsQ0FBQztLQUVELENBQUMsQ0FBQztBQUNKLENBQUM7QUFmRCxzQ0FlQztBQUVELFNBQWdCLFVBQVUsQ0FBQyxJQUFZLEVBQUUsUUFBMkI7SUFFbkUsT0FBTyxhQUFhLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFBO0FBQ3ZELENBQUM7QUFIRCxnQ0FHQztBQUVELFNBQWdCLGNBQWMsQ0FBQyxJQUFZLEVBQUUsUUFBMkI7SUFFdkUsT0FBTyxhQUFhLENBQUMsY0FBb0IsRUFBRSxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUE7QUFDM0QsQ0FBQztBQUhELHdDQUdDO0FBRUQsa0JBQWUsSUFBSSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDcmVhdGVkIGJ5IHVzZXIgb24gMjAxOC8zLzE0LzAxNC5cbiAqL1xuXG5pbXBvcnQgeyB3cmFwU3RyZWFtVG9Qcm9taXNlLCBJU3RyZWFtTGluZVdpdGhWYWx1ZSB9IGZyb20gJy4uLy4uL2ZzL2xpbmUnO1xuaW1wb3J0IFByb21pc2UgPSByZXF1aXJlKCdibHVlYmlyZCcpO1xuaW1wb3J0IGNyZWF0ZUxvYWRTdHJlYW0sIHsgSUNhbGxiYWNrIH0gZnJvbSAnLi4vLi4vZnMvc3RyZWFtJztcbmltcG9ydCBjcmVhdGVMb2FkU3RyZWFtU3luYyBmcm9tICcuLi8uLi9mcy9zeW5jJztcblxuZXhwb3J0IHR5cGUgSURpY3RSb3cgPSBbc3RyaW5nLCBudW1iZXIsIHN0cmluZ107XG5leHBvcnQgdHlwZSBJRGljdCA9IElEaWN0Um93W107XG5cbi8qKlxuICog5LqR6K6h566XXG4gKiDok53nv5QgbnpcbiAqIOWMuuWdl+mTviAxMCBuelxuKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUxpbmUoaW5wdXQ6IHN0cmluZyk6IElEaWN0Um93XG57XG5cdGxldCBbc3RyLCBuLCBzXSA9IGlucHV0XG5cdFx0LnJlcGxhY2UoL15cXHMrfFxccyskLywgJycpXG5cdFx0LnNwbGl0KC9cXHMrL2cpXG5cdDtcblxuXHRpZiAobiA9PT0gJycpXG5cdHtcblx0XHRuID0gdW5kZWZpbmVkO1xuXHR9XG5cdGlmIChzID09PSAnJylcblx0e1xuXHRcdHMgPSB1bmRlZmluZWQ7XG5cdH1cblxuXHRpZiAodHlwZW9mIHMgPT0gJ3VuZGVmaW5lZCcgfHwgcyA9PSAnJylcblx0e1xuXHRcdGlmICh0eXBlb2YgbiA9PSAnc3RyaW5nJyAmJiAhL15cXGQrKD86XFwuXFxkKyk/JC8udGVzdChuKSlcblx0XHR7XG5cdFx0XHRbbiwgc10gPSBbdW5kZWZpbmVkLCBuXTtcblx0XHR9XG5cdH1cblxuXHRpZiAodHlwZW9mIG4gPT0gJ3N0cmluZycpXG5cdHtcblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0biA9IE51bWJlcihuKTtcblx0fVxuXG5cdGlmICghc3RyKVxuXHR7XG5cdFx0dGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKGAke2lucHV0fWApO1xuXHR9XG5cblx0cmV0dXJuIFtzdHIsIG4gYXMgYW55IGFzIG51bWJlciwgc107XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsb2FkKGZpbGU6IHN0cmluZyk6IFByb21pc2U8SURpY3Q+XG57XG5cdHJldHVybiB3cmFwU3RyZWFtVG9Qcm9taXNlKGxvYWRTdHJlYW0oZmlsZSkpXG5cdFx0LnRoZW4oZnVuY3Rpb24gKHN0cmVhbTogSVN0cmVhbUxpbmVXaXRoVmFsdWU8SURpY3Q+KVxuXHRcdHtcblx0XHRcdHJldHVybiBzdHJlYW0udmFsdWU7XG5cdFx0fSlcblx0XHQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsb2FkU3luYyhmaWxlOiBzdHJpbmcpXG57XG5cdHJldHVybiBsb2FkU3RyZWFtU3luYyhmaWxlKS52YWx1ZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIF9jcmVhdGVTdHJlYW08SURpY3Q+KGZuU3RyZWFtOiB0eXBlb2YgY3JlYXRlTG9hZFN0cmVhbSwgZmlsZTogc3RyaW5nLCBjYWxsYmFjaz86IElDYWxsYmFjazxJRGljdD4pXG57XG5cdHJldHVybiBmblN0cmVhbTxJRGljdD4oZmlsZSwge1xuXG5cdFx0Y2FsbGJhY2ssXG5cblx0XHRtYXBwZXIobGluZSlcblx0XHR7XG5cdFx0XHRpZiAobGluZSlcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIHBhcnNlTGluZShsaW5lKTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbG9hZFN0cmVhbShmaWxlOiBzdHJpbmcsIGNhbGxiYWNrPzogSUNhbGxiYWNrPElEaWN0Pilcbntcblx0cmV0dXJuIF9jcmVhdGVTdHJlYW0oY3JlYXRlTG9hZFN0cmVhbSwgZmlsZSwgY2FsbGJhY2spXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsb2FkU3RyZWFtU3luYyhmaWxlOiBzdHJpbmcsIGNhbGxiYWNrPzogSUNhbGxiYWNrPElEaWN0Pilcbntcblx0cmV0dXJuIF9jcmVhdGVTdHJlYW0oY3JlYXRlTG9hZFN0cmVhbVN5bmMsIGZpbGUsIGNhbGxiYWNrKVxufVxuXG5leHBvcnQgZGVmYXVsdCBsb2FkO1xuIl19