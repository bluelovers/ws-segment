"use strict";
/**
 * Created by user on 2018/3/14/014.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadStreamSync = exports.loadStream = exports._createStream = exports.loadSync = exports.load = exports.parseLine = void 0;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7OztBQUVILHdDQUEwRTtBQUUxRSw0Q0FBOEQ7QUFDOUQsd0NBQWlEO0FBS2pEOzs7O0VBSUU7QUFDRixTQUFnQixTQUFTLENBQUMsS0FBYTtJQUV0QyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxLQUFLO1NBQ3JCLE9BQU8sQ0FBQyxXQUFXLEVBQUUsRUFBRSxDQUFDO1NBQ3hCLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FDZDtJQUVELElBQUksQ0FBQyxLQUFLLEVBQUUsRUFDWjtRQUNDLENBQUMsR0FBRyxTQUFTLENBQUM7S0FDZDtJQUNELElBQUksQ0FBQyxLQUFLLEVBQUUsRUFDWjtRQUNDLENBQUMsR0FBRyxTQUFTLENBQUM7S0FDZDtJQUVELElBQUksT0FBTyxDQUFDLElBQUksV0FBVyxJQUFJLENBQUMsSUFBSSxFQUFFLEVBQ3RDO1FBQ0MsSUFBSSxPQUFPLENBQUMsSUFBSSxRQUFRLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQ3REO1lBQ0MsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUM7U0FDeEI7S0FDRDtJQUVELElBQUksT0FBTyxDQUFDLElBQUksUUFBUSxFQUN4QjtRQUNDLGFBQWE7UUFDYixDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ2Q7SUFFRCxJQUFJLENBQUMsR0FBRyxFQUNSO1FBQ0MsTUFBTSxJQUFJLGNBQWMsQ0FBQyxHQUFHLEtBQUssRUFBRSxDQUFDLENBQUM7S0FDckM7SUFFRCxPQUFPLENBQUMsR0FBRyxFQUFFLENBQWtCLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDckMsQ0FBQztBQXBDRCw4QkFvQ0M7QUFFRCxTQUFnQixJQUFJLENBQUMsSUFBWTtJQUVoQyxPQUFPLDBCQUFtQixDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUMxQyxJQUFJLENBQUMsVUFBVSxNQUFtQztRQUVsRCxPQUFPLE1BQU0sQ0FBQyxLQUFLLENBQUM7SUFDckIsQ0FBQyxDQUFDLENBQ0Q7QUFDSCxDQUFDO0FBUkQsb0JBUUM7QUFFRCxTQUFnQixRQUFRLENBQUMsSUFBWTtJQUVwQyxPQUFPLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUM7QUFDbkMsQ0FBQztBQUhELDRCQUdDO0FBRUQsU0FBZ0IsYUFBYSxDQUFRLFFBQWlDLEVBQUUsSUFBWSxFQUFFLFFBQTJCO0lBRWhILE9BQU8sUUFBUSxDQUFRLElBQUksRUFBRTtRQUU1QixRQUFRO1FBRVIsTUFBTSxDQUFDLElBQUk7WUFFVixJQUFJLElBQUksRUFDUjtnQkFDQyxPQUFPLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUN2QjtRQUNGLENBQUM7S0FFRCxDQUFDLENBQUM7QUFDSixDQUFDO0FBZkQsc0NBZUM7QUFFRCxTQUFnQixVQUFVLENBQUMsSUFBWSxFQUFFLFFBQTJCO0lBRW5FLE9BQU8sYUFBYSxDQUFDLGdCQUFnQixFQUFFLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQTtBQUN2RCxDQUFDO0FBSEQsZ0NBR0M7QUFFRCxTQUFnQixjQUFjLENBQUMsSUFBWSxFQUFFLFFBQTJCO0lBRXZFLE9BQU8sYUFBYSxDQUFDLGNBQW9CLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFBO0FBQzNELENBQUM7QUFIRCx3Q0FHQztBQUVELGtCQUFlLElBQUksQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTgvMy8xNC8wMTQuXG4gKi9cblxuaW1wb3J0IHsgd3JhcFN0cmVhbVRvUHJvbWlzZSwgSVN0cmVhbUxpbmVXaXRoVmFsdWUgfSBmcm9tICcuLi8uLi9mcy9saW5lJztcbmltcG9ydCBQcm9taXNlID0gcmVxdWlyZSgnYmx1ZWJpcmQnKTtcbmltcG9ydCBjcmVhdGVMb2FkU3RyZWFtLCB7IElDYWxsYmFjayB9IGZyb20gJy4uLy4uL2ZzL3N0cmVhbSc7XG5pbXBvcnQgY3JlYXRlTG9hZFN0cmVhbVN5bmMgZnJvbSAnLi4vLi4vZnMvc3luYyc7XG5cbmV4cG9ydCB0eXBlIElEaWN0Um93ID0gW3N0cmluZywgbnVtYmVyLCBzdHJpbmddO1xuZXhwb3J0IHR5cGUgSURpY3QgPSBJRGljdFJvd1tdO1xuXG4vKipcbiAqIOS6keiuoeeul1xuICog6JOd57+UIG56XG4gKiDljLrlnZfpk74gMTAgbnpcbiovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VMaW5lKGlucHV0OiBzdHJpbmcpOiBJRGljdFJvd1xue1xuXHRsZXQgW3N0ciwgbiwgc10gPSBpbnB1dFxuXHRcdC5yZXBsYWNlKC9eXFxzK3xcXHMrJC8sICcnKVxuXHRcdC5zcGxpdCgvXFxzKy9nKVxuXHQ7XG5cblx0aWYgKG4gPT09ICcnKVxuXHR7XG5cdFx0biA9IHVuZGVmaW5lZDtcblx0fVxuXHRpZiAocyA9PT0gJycpXG5cdHtcblx0XHRzID0gdW5kZWZpbmVkO1xuXHR9XG5cblx0aWYgKHR5cGVvZiBzID09ICd1bmRlZmluZWQnIHx8IHMgPT0gJycpXG5cdHtcblx0XHRpZiAodHlwZW9mIG4gPT0gJ3N0cmluZycgJiYgIS9eXFxkKyg/OlxcLlxcZCspPyQvLnRlc3QobikpXG5cdFx0e1xuXHRcdFx0W24sIHNdID0gW3VuZGVmaW5lZCwgbl07XG5cdFx0fVxuXHR9XG5cblx0aWYgKHR5cGVvZiBuID09ICdzdHJpbmcnKVxuXHR7XG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdG4gPSBOdW1iZXIobik7XG5cdH1cblxuXHRpZiAoIXN0cilcblx0e1xuXHRcdHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihgJHtpbnB1dH1gKTtcblx0fVxuXG5cdHJldHVybiBbc3RyLCBuIGFzIGFueSBhcyBudW1iZXIsIHNdO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbG9hZChmaWxlOiBzdHJpbmcpOiBQcm9taXNlPElEaWN0Plxue1xuXHRyZXR1cm4gd3JhcFN0cmVhbVRvUHJvbWlzZShsb2FkU3RyZWFtKGZpbGUpKVxuXHRcdC50aGVuKGZ1bmN0aW9uIChzdHJlYW06IElTdHJlYW1MaW5lV2l0aFZhbHVlPElEaWN0Pilcblx0XHR7XG5cdFx0XHRyZXR1cm4gc3RyZWFtLnZhbHVlO1xuXHRcdH0pXG5cdFx0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbG9hZFN5bmMoZmlsZTogc3RyaW5nKVxue1xuXHRyZXR1cm4gbG9hZFN0cmVhbVN5bmMoZmlsZSkudmFsdWU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBfY3JlYXRlU3RyZWFtPElEaWN0PihmblN0cmVhbTogdHlwZW9mIGNyZWF0ZUxvYWRTdHJlYW0sIGZpbGU6IHN0cmluZywgY2FsbGJhY2s/OiBJQ2FsbGJhY2s8SURpY3Q+KVxue1xuXHRyZXR1cm4gZm5TdHJlYW08SURpY3Q+KGZpbGUsIHtcblxuXHRcdGNhbGxiYWNrLFxuXG5cdFx0bWFwcGVyKGxpbmUpXG5cdFx0e1xuXHRcdFx0aWYgKGxpbmUpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiBwYXJzZUxpbmUobGluZSk7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHR9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxvYWRTdHJlYW0oZmlsZTogc3RyaW5nLCBjYWxsYmFjaz86IElDYWxsYmFjazxJRGljdD4pXG57XG5cdHJldHVybiBfY3JlYXRlU3RyZWFtKGNyZWF0ZUxvYWRTdHJlYW0sIGZpbGUsIGNhbGxiYWNrKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbG9hZFN0cmVhbVN5bmMoZmlsZTogc3RyaW5nLCBjYWxsYmFjaz86IElDYWxsYmFjazxJRGljdD4pXG57XG5cdHJldHVybiBfY3JlYXRlU3RyZWFtKGNyZWF0ZUxvYWRTdHJlYW1TeW5jLCBmaWxlLCBjYWxsYmFjaylcbn1cblxuZXhwb3J0IGRlZmF1bHQgbG9hZDtcbiJdfQ==