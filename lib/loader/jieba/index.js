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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7O0FBRUgsd0NBQTBFO0FBRTFFLDRDQUE4RDtBQUM5RCx3Q0FBaUQ7QUFLakQ7Ozs7RUFJRTtBQUNGLFNBQWdCLFNBQVMsQ0FBQyxLQUFhO0lBRXRDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLEtBQUs7U0FDckIsT0FBTyxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUM7U0FDeEIsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUNkO0lBRUQsSUFBSSxDQUFDLEtBQUssRUFBRSxFQUNaO1FBQ0MsQ0FBQyxHQUFHLFNBQVMsQ0FBQztLQUNkO0lBQ0QsSUFBSSxDQUFDLEtBQUssRUFBRSxFQUNaO1FBQ0MsQ0FBQyxHQUFHLFNBQVMsQ0FBQztLQUNkO0lBRUQsSUFBSSxPQUFPLENBQUMsSUFBSSxXQUFXLElBQUksQ0FBQyxJQUFJLEVBQUUsRUFDdEM7UUFDQyxJQUFJLE9BQU8sQ0FBQyxJQUFJLFFBQVEsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFDdEQ7WUFDQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQztTQUN4QjtLQUNEO0lBRUQsSUFBSSxPQUFPLENBQUMsSUFBSSxRQUFRLEVBQ3hCO1FBQ0MsYUFBYTtRQUNiLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDZDtJQUVELElBQUksQ0FBQyxHQUFHLEVBQ1I7UUFDQyxNQUFNLElBQUksY0FBYyxDQUFDLEdBQUcsS0FBSyxFQUFFLENBQUMsQ0FBQztLQUNyQztJQUVELE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBa0IsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUNyQyxDQUFDO0FBcENELDhCQW9DQztBQUVELFNBQWdCLElBQUksQ0FBQyxJQUFZO0lBRWhDLE9BQU8sMEJBQW1CLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQzFDLElBQUksQ0FBQyxVQUFVLE1BQW1DO1FBRWxELE9BQU8sTUFBTSxDQUFDLEtBQUssQ0FBQztJQUNyQixDQUFDLENBQUMsQ0FDRDtBQUNILENBQUM7QUFSRCxvQkFRQztBQUVELFNBQWdCLFFBQVEsQ0FBQyxJQUFZO0lBRXBDLE9BQU8sY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQztBQUNuQyxDQUFDO0FBSEQsNEJBR0M7QUFFRCxTQUFnQixhQUFhLENBQVEsUUFBaUMsRUFBRSxJQUFZLEVBQUUsUUFBMkI7SUFFaEgsT0FBTyxRQUFRLENBQVEsSUFBSSxFQUFFO1FBRTVCLFFBQVE7UUFFUixNQUFNLENBQUMsSUFBSTtZQUVWLElBQUksSUFBSSxFQUNSO2dCQUNDLE9BQU8sU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ3ZCO1FBQ0YsQ0FBQztLQUVELENBQUMsQ0FBQztBQUNKLENBQUM7QUFmRCxzQ0FlQztBQUVELFNBQWdCLFVBQVUsQ0FBQyxJQUFZLEVBQUUsUUFBMkI7SUFFbkUsT0FBTyxhQUFhLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFBO0FBQ3ZELENBQUM7QUFIRCxnQ0FHQztBQUVELFNBQWdCLGNBQWMsQ0FBQyxJQUFZLEVBQUUsUUFBMkI7SUFFdkUsT0FBTyxhQUFhLENBQUMsY0FBb0IsRUFBRSxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUE7QUFDM0QsQ0FBQztBQUhELHdDQUdDO0FBRUQsa0JBQWUsSUFBSSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDcmVhdGVkIGJ5IHVzZXIgb24gMjAxOC8zLzE0LzAxNC5cbiAqL1xuXG5pbXBvcnQgeyB3cmFwU3RyZWFtVG9Qcm9taXNlLCBJU3RyZWFtTGluZVdpdGhWYWx1ZSB9IGZyb20gJy4uLy4uL2ZzL2xpbmUnO1xuaW1wb3J0ICogYXMgUHJvbWlzZSBmcm9tICdibHVlYmlyZCc7XG5pbXBvcnQgY3JlYXRlTG9hZFN0cmVhbSwgeyBJQ2FsbGJhY2sgfSBmcm9tICcuLi8uLi9mcy9zdHJlYW0nO1xuaW1wb3J0IGNyZWF0ZUxvYWRTdHJlYW1TeW5jIGZyb20gJy4uLy4uL2ZzL3N5bmMnO1xuXG5leHBvcnQgdHlwZSBJRGljdFJvdyA9IFtzdHJpbmcsIG51bWJlciwgc3RyaW5nXTtcbmV4cG9ydCB0eXBlIElEaWN0ID0gSURpY3RSb3dbXTtcblxuLyoqXG4gKiDkupHorqHnrpdcbiAqIOiTnee/lCBuelxuICog5Yy65Z2X6ZO+IDEwIG56XG4qL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlTGluZShpbnB1dDogc3RyaW5nKTogSURpY3RSb3dcbntcblx0bGV0IFtzdHIsIG4sIHNdID0gaW5wdXRcblx0XHQucmVwbGFjZSgvXlxccyt8XFxzKyQvLCAnJylcblx0XHQuc3BsaXQoL1xccysvZylcblx0O1xuXG5cdGlmIChuID09PSAnJylcblx0e1xuXHRcdG4gPSB1bmRlZmluZWQ7XG5cdH1cblx0aWYgKHMgPT09ICcnKVxuXHR7XG5cdFx0cyA9IHVuZGVmaW5lZDtcblx0fVxuXG5cdGlmICh0eXBlb2YgcyA9PSAndW5kZWZpbmVkJyB8fCBzID09ICcnKVxuXHR7XG5cdFx0aWYgKHR5cGVvZiBuID09ICdzdHJpbmcnICYmICEvXlxcZCsoPzpcXC5cXGQrKT8kLy50ZXN0KG4pKVxuXHRcdHtcblx0XHRcdFtuLCBzXSA9IFt1bmRlZmluZWQsIG5dO1xuXHRcdH1cblx0fVxuXG5cdGlmICh0eXBlb2YgbiA9PSAnc3RyaW5nJylcblx0e1xuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRuID0gTnVtYmVyKG4pO1xuXHR9XG5cblx0aWYgKCFzdHIpXG5cdHtcblx0XHR0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoYCR7aW5wdXR9YCk7XG5cdH1cblxuXHRyZXR1cm4gW3N0ciwgbiBhcyBhbnkgYXMgbnVtYmVyLCBzXTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxvYWQoZmlsZTogc3RyaW5nKTogUHJvbWlzZTxJRGljdD5cbntcblx0cmV0dXJuIHdyYXBTdHJlYW1Ub1Byb21pc2UobG9hZFN0cmVhbShmaWxlKSlcblx0XHQudGhlbihmdW5jdGlvbiAoc3RyZWFtOiBJU3RyZWFtTGluZVdpdGhWYWx1ZTxJRGljdD4pXG5cdFx0e1xuXHRcdFx0cmV0dXJuIHN0cmVhbS52YWx1ZTtcblx0XHR9KVxuXHRcdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxvYWRTeW5jKGZpbGU6IHN0cmluZylcbntcblx0cmV0dXJuIGxvYWRTdHJlYW1TeW5jKGZpbGUpLnZhbHVlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gX2NyZWF0ZVN0cmVhbTxJRGljdD4oZm5TdHJlYW06IHR5cGVvZiBjcmVhdGVMb2FkU3RyZWFtLCBmaWxlOiBzdHJpbmcsIGNhbGxiYWNrPzogSUNhbGxiYWNrPElEaWN0Pilcbntcblx0cmV0dXJuIGZuU3RyZWFtPElEaWN0PihmaWxlLCB7XG5cblx0XHRjYWxsYmFjayxcblxuXHRcdG1hcHBlcihsaW5lKVxuXHRcdHtcblx0XHRcdGlmIChsaW5lKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gcGFyc2VMaW5lKGxpbmUpO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0fSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsb2FkU3RyZWFtKGZpbGU6IHN0cmluZywgY2FsbGJhY2s/OiBJQ2FsbGJhY2s8SURpY3Q+KVxue1xuXHRyZXR1cm4gX2NyZWF0ZVN0cmVhbShjcmVhdGVMb2FkU3RyZWFtLCBmaWxlLCBjYWxsYmFjaylcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxvYWRTdHJlYW1TeW5jKGZpbGU6IHN0cmluZywgY2FsbGJhY2s/OiBJQ2FsbGJhY2s8SURpY3Q+KVxue1xuXHRyZXR1cm4gX2NyZWF0ZVN0cmVhbShjcmVhdGVMb2FkU3RyZWFtU3luYywgZmlsZSwgY2FsbGJhY2spXG59XG5cbmV4cG9ydCBkZWZhdWx0IGxvYWQ7XG4iXX0=