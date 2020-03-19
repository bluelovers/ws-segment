"use strict";
/**
 * Created by user on 2018/4/11/011.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.wrapStreamToPromise = exports.readFileLine = exports.createStreamLine = exports.byLine = void 0;
const fs = require("fs");
const split2 = require("split2");
const path = require("path");
const Promise = require("bluebird");
const stream_pipe_1 = require("stream-pipe");
function byLine(fn, options = {}) {
    if (typeof fn == 'object') {
        [options, fn] = [fn, undefined];
    }
    fn = fn || options.mapper;
    let wts = split2(fn);
    wts.on('pipe', function (src) {
        const self = this;
        this.pipeFrom = src;
        let pipeStat = null;
        if (typeof src.bytesTotal == 'number') {
            self.bytesSize = src.bytesTotal;
        }
        else if (src.fd) {
            pipeStat = fs.fstatSync(src.fd);
            self.bytesSize = pipeStat.size;
        }
        else if (src.path) {
            let p = src.path;
            if (src.cwd && !path.isAbsolute(src.path)) {
                p = path.resolve(src.cwd, src.path);
            }
            pipeStat = fs.statSync(p);
            self.bytesSize = pipeStat.size;
        }
        else {
            self.bytesSize = null;
        }
        this.pipeStat = pipeStat;
        src
            .on('close', function (...argv) {
            self.emit('close', ...argv);
        })
            .on('ready', function (...argv) {
            self.emit('ready', ...argv);
        });
    });
    Object.keys(options)
        .forEach(function (key) {
        if (key.indexOf('on') == 0 && options[key]) {
            wts.on(key.slice(2), options[key]);
        }
    });
    return wts;
}
exports.byLine = byLine;
function createStreamLine(file, fn, options) {
    return stream_pipe_1.createReadStream(file)
        .pipe(byLine(fn, options));
}
exports.createStreamLine = createStreamLine;
function readFileLine(file, fn, options) {
    return wrapStreamToPromise(createStreamLine(file, fn, options));
}
exports.readFileLine = readFileLine;
function wrapStreamToPromise(stream) {
    let resolve, reject;
    let promise = new Promise(function () {
        resolve = arguments[0];
        reject = arguments[1];
    });
    stream
        .on('close', function (...argv) {
        resolve(this);
        //console.log('d.close', ...argv);
    })
        .on('finish', function (...argv) {
        resolve(this);
        //console.log('d.close', ...argv);
    })
        .on('error', function (...argv) {
        reject(...argv);
    });
    promise.stream = stream;
    // @ts-ignore
    promise = promise.bind(stream);
    promise.stream = stream;
    return promise;
}
exports.wrapStreamToPromise = wrapStreamToPromise;
/*
let p = readFileLine('../.gitignore', {

    mapper(data: string)
    {
        return data;
    },

});

p.stream.on('data', function (data)
{
    console.log(data);
});

p.then(function (d: IPipe<ReadStream, NodeJS.WritableStream>)
{
    console.log(this === p.stream, d === this);
});
*/
exports.default = exports;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGluZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImxpbmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztHQUVHOzs7QUFFSCx5QkFBMEI7QUFDMUIsaUNBQWtDO0FBQ2xDLDZCQUE4QjtBQUM5QixvQ0FBcUM7QUFHckMsNkNBQXNEO0FBZXRELFNBQWdCLE1BQU0sQ0FBQyxFQUFHLEVBQUUsVUFBb0IsRUFBRTtJQUVqRCxJQUFJLE9BQU8sRUFBRSxJQUFJLFFBQVEsRUFDekI7UUFDQyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxTQUFTLENBQUMsQ0FBQztLQUNoQztJQUVELEVBQUUsR0FBRyxFQUFFLElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQztJQUUxQixJQUFJLEdBQUcsR0FBRyxNQUFNLENBQUMsRUFBRSxDQUFnQixDQUFDO0lBRXBDLEdBQUcsQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLFVBQVUsR0FBRztRQUUzQixNQUFNLElBQUksR0FBRyxJQUFJLENBQUM7UUFFbEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxHQUFHLENBQUM7UUFDcEIsSUFBSSxRQUFRLEdBQUcsSUFBZ0IsQ0FBQztRQUVoQyxJQUFJLE9BQU8sR0FBRyxDQUFDLFVBQVUsSUFBSSxRQUFRLEVBQ3JDO1lBQ0MsSUFBSSxDQUFDLFNBQVMsR0FBRyxHQUFHLENBQUMsVUFBVSxDQUFDO1NBQ2hDO2FBQ0ksSUFBSSxHQUFHLENBQUMsRUFBRSxFQUNmO1lBQ0MsUUFBUSxHQUFHLEVBQUUsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBRWhDLElBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQztTQUMvQjthQUNJLElBQUksR0FBRyxDQUFDLElBQUksRUFDakI7WUFDQyxJQUFJLENBQUMsR0FBVyxHQUFHLENBQUMsSUFBSSxDQUFDO1lBRXpCLElBQUksR0FBRyxDQUFDLEdBQUcsSUFBSSxD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QUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7SUFFeEIsT0FBTyxPQUFPLENBQUM7QUFDaEIsQ0FBQztBQWpDRCxrREFpQ0M7QUFZRDs7Ozs7Ozs7Ozs7Ozs7Ozs7OztFQW1CRTtBQUVGLGtCQUFlLE9BQWtDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgdXNlciBvbiAyMDE4LzQvMTEvMDExLlxuICovXG5cbmltcG9ydCBmcyA9IHJlcXVpcmUoJ2ZzJyk7XG5pbXBvcnQgc3BsaXQyID0gcmVxdWlyZSgnc3BsaXQyJyk7XG5pbXBvcnQgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcbmltcG9ydCBQcm9taXNlID0gcmVxdWlyZSgnYmx1ZWJpcmQnKTtcbmltcG9ydCBzdHJlYW0gPSByZXF1aXJlKCdzdHJlYW0nKTtcblxuaW1wb3J0IHsgY3JlYXRlUmVhZFN0cmVhbSwgSVBpcGUgfSBmcm9tICdzdHJlYW0tcGlwZSc7XG5pbXBvcnQgeyBSZWFkU3RyZWFtIH0gZnJvbSAnc3RyZWFtLXBpcGUvZnMnO1xuXG5leHBvcnQgdHlwZSBJT3B0aW9ucyA9IHtcblxuXHRtYXBwZXI/KGRhdGE6IHN0cmluZyksXG5cblx0b25waXBlPyhzcmMpLFxuXHRvbmNsb3NlPyguLi5hcmd2KSxcblx0b25maW5pc2g/KC4uLmFyZ3YpLFxuXHRvbnJlYWR5PyguLi5hcmd2KSxcblx0b25kYXRhPyguLi5hcmd2KSxcblxufVxuXG5leHBvcnQgZnVuY3Rpb24gYnlMaW5lKGZuPywgb3B0aW9uczogSU9wdGlvbnMgPSB7fSlcbntcblx0aWYgKHR5cGVvZiBmbiA9PSAnb2JqZWN0Jylcblx0e1xuXHRcdFtvcHRpb25zLCBmbl0gPSBbZm4sIHVuZGVmaW5lZF07XG5cdH1cblxuXHRmbiA9IGZuIHx8IG9wdGlvbnMubWFwcGVyO1xuXG5cdGxldCB3dHMgPSBzcGxpdDIoZm4pIGFzIElTdHJlYW1MaW5lO1xuXG5cdHd0cy5vbigncGlwZScsIGZ1bmN0aW9uIChzcmMpXG5cdHtcblx0XHRjb25zdCBzZWxmID0gdGhpcztcblxuXHRcdHRoaXMucGlwZUZyb20gPSBzcmM7XG5cdFx0bGV0IHBpcGVTdGF0ID0gbnVsbCBhcyBmcy5TdGF0cztcblxuXHRcdGlmICh0eXBlb2Ygc3JjLmJ5dGVzVG90YWwgPT0gJ251bWJlcicpXG5cdFx0e1xuXHRcdFx0c2VsZi5ieXRlc1NpemUgPSBzcmMuYnl0ZXNUb3RhbDtcblx0XHR9XG5cdFx0ZWxzZSBpZiAoc3JjLmZkKVxuXHRcdHtcblx0XHRcdHBpcGVTdGF0ID0gZnMuZnN0YXRTeW5jKHNyYy5mZCk7XG5cblx0XHRcdHNlbGYuYnl0ZXNTaXplID0gcGlwZVN0YXQuc2l6ZTtcblx0XHR9XG5cdFx0ZWxzZSBpZiAoc3JjLnBhdGgpXG5cdFx0e1xuXHRcdFx0bGV0IHA6IHN0cmluZyA9IHNyYy5wYXRoO1xuXG5cdFx0XHRpZiAoc3JjLmN3ZCAmJiAhcGF0aC5pc0Fic29sdXRlKHNyYy5wYXRoKSlcblx0XHRcdHtcblx0XHRcdFx0cCA9IHBhdGgucmVzb2x2ZShzcmMuY3dkLCBzcmMucGF0aCk7XG5cdFx0XHR9XG5cblx0XHRcdHBpcGVTdGF0ID0gZnMuc3RhdFN5bmMocCk7XG5cblx0XHRcdHNlbGYuYnl0ZXNTaXplID0gcGlwZVN0YXQuc2l6ZTtcblx0XHR9XG5cdFx0ZWxzZVxuXHRcdHtcblx0XHRcdHNlbGYuYnl0ZXNTaXplID0gbnVsbDtcblx0XHR9XG5cblx0XHR0aGlzLnBpcGVTdGF0ID0gcGlwZVN0YXQ7XG5cblx0XHRzcmNcblx0XHRcdC5vbignY2xvc2UnLCBmdW5jdGlvbiAoLi4uYXJndilcblx0XHRcdHtcblx0XHRcdFx0c2VsZi5lbWl0KCdjbG9zZScsIC4uLmFyZ3YpO1xuXHRcdFx0fSlcblx0XHRcdC5vbigncmVhZHknLCBmdW5jdGlvbiAoLi4uYXJndilcblx0XHRcdHtcblx0XHRcdFx0c2VsZi5lbWl0KCdyZWFkeScsIC4uLmFyZ3YpO1xuXHRcdFx0fSlcblx0XHQ7XG5cdH0pO1xuXG5cdE9iamVjdC5rZXlzKG9wdGlvbnMpXG5cdFx0LmZvckVhY2goZnVuY3Rpb24gKGtleSlcblx0XHR7XG5cdFx0XHRpZiAoa2V5LmluZGV4T2YoJ29uJykgPT0gMCAmJiBvcHRpb25zW2tleV0pXG5cdFx0XHR7XG5cdFx0XHRcdHd0cy5vbihrZXkuc2xpY2UoMiksIG9wdGlvbnNba2V5XSk7XG5cdFx0XHR9XG5cdFx0fSlcblx0O1xuXG5cdHJldHVybiB3dHM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTdHJlYW1MaW5lKGZpbGU6IHN0cmluZywgb3B0aW9uczogSU9wdGlvbnMpOiBJU3RyZWFtTGluZVxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVN0cmVhbUxpbmUoZmlsZTogc3RyaW5nLCBmbj86IChkYXRhOiBzdHJpbmcpID0+IGFueSwgb3B0aW9ucz86IElPcHRpb25zKTogSVN0cmVhbUxpbmVcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTdHJlYW1MaW5lKGZpbGU6IHN0cmluZywgZm4/LCBvcHRpb25zPzogSU9wdGlvbnMpXG57XG5cdHJldHVybiBjcmVhdGVSZWFkU3RyZWFtKGZpbGUpXG5cdFx0LnBpcGUoYnlMaW5lKGZuLCBvcHRpb25zKSlcblx0XHQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWFkRmlsZUxpbmUoZmlsZTogc3RyaW5nLCBvcHRpb25zOiBJT3B0aW9ucyk6IElQcm9taXNlU3RyZWFtPElTdHJlYW1MaW5lPlxuZXhwb3J0IGZ1bmN0aW9uIHJlYWRGaWxlTGluZShmaWxlOiBzdHJpbmcsIGZuPzogKGRhdGE6IHN0cmluZykgPT4gYW55LCBvcHRpb25zPzogSU9wdGlvbnMpOiBJUHJvbWlzZVN0cmVhbTxJU3RyZWFtTGluZT5cbmV4cG9ydCBmdW5jdGlvbiByZWFkRmlsZUxpbmUoZmlsZTogc3RyaW5nLCBmbj8sIG9wdGlvbnM/OiBJT3B0aW9ucylcbntcblx0cmV0dXJuIHdyYXBTdHJlYW1Ub1Byb21pc2UoY3JlYXRlU3RyZWFtTGluZShmaWxlLCBmbiwgb3B0aW9ucykpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gd3JhcFN0cmVhbVRvUHJvbWlzZTxUIGV4dGVuZHMgTm9kZUpTLldyaXRhYmxlU3RyZWFtPihzdHJlYW06IFQpOiBJUHJvbWlzZVN0cmVhbTxUPlxue1xuXHRsZXQgcmVzb2x2ZSwgcmVqZWN0O1xuXG5cdGxldCBwcm9taXNlID0gbmV3IFByb21pc2UoZnVuY3Rpb24gKClcblx0e1xuXHRcdHJlc29sdmUgPSBhcmd1bWVudHNbMF07XG5cdFx0cmVqZWN0ID0gYXJndW1lbnRzWzFdO1xuXHR9KSBhcyBJUHJvbWlzZVN0cmVhbTxUPjtcblxuXHRzdHJlYW1cblx0XHQub24oJ2Nsb3NlJywgZnVuY3Rpb24gKC4uLmFyZ3YpXG5cdFx0e1xuXHRcdFx0cmVzb2x2ZSh0aGlzKTtcblx0XHRcdC8vY29uc29sZS5sb2coJ2QuY2xvc2UnLCAuLi5hcmd2KTtcblx0XHR9KVxuXHRcdC5vbignZmluaXNoJywgZnVuY3Rpb24gKC4uLmFyZ3YpXG5cdFx0e1xuXHRcdFx0cmVzb2x2ZSh0aGlzKTtcblx0XHRcdC8vY29uc29sZS5sb2coJ2QuY2xvc2UnLCAuLi5hcmd2KTtcblx0XHR9KVxuXHRcdC5vbignZXJyb3InLCBmdW5jdGlvbiAoLi4uYXJndilcblx0XHR7XG5cdFx0XHRyZWplY3QoLi4uYXJndik7XG5cdFx0fSlcblx0O1xuXG5cdHByb21pc2Uuc3RyZWFtID0gc3RyZWFtO1xuXHQvLyBAdHMtaWdub3JlXG5cdHByb21pc2UgPSBwcm9taXNlLmJpbmQoc3RyZWFtKTtcblx0cHJvbWlzZS5zdHJlYW0gPSBzdHJlYW07XG5cblx0cmV0dXJuIHByb21pc2U7XG59XG5cbmV4cG9ydCB0eXBlIElTdHJlYW1MaW5lID0gSVBpcGU8UmVhZFN0cmVhbSwgTm9kZUpTLldyaXRhYmxlU3RyZWFtPjtcblxuZXhwb3J0IHR5cGUgSVN0cmVhbUxpbmVXaXRoVmFsdWU8VD4gPSBJU3RyZWFtTGluZSAmIHtcblx0dmFsdWU/OiBULFxufTtcblxuZXhwb3J0IHR5cGUgSVByb21pc2VTdHJlYW08VD4gPSBQcm9taXNlPFQ+ICYge1xuXHRzdHJlYW06IFQsXG59O1xuXG4vKlxubGV0IHAgPSByZWFkRmlsZUxpbmUoJy4uLy5naXRpZ25vcmUnLCB7XG5cblx0bWFwcGVyKGRhdGE6IHN0cmluZylcblx0e1xuXHRcdHJldHVybiBkYXRhO1xuXHR9LFxuXG59KTtcblxucC5zdHJlYW0ub24oJ2RhdGEnLCBmdW5jdGlvbiAoZGF0YSlcbntcblx0Y29uc29sZS5sb2coZGF0YSk7XG59KTtcblxucC50aGVuKGZ1bmN0aW9uIChkOiBJUGlwZTxSZWFkU3RyZWFtLCBOb2RlSlMuV3JpdGFibGVTdHJlYW0+KVxue1xuXHRjb25zb2xlLmxvZyh0aGlzID09PSBwLnN0cmVhbSwgZCA9PT0gdGhpcyk7XG59KTtcbiovXG5cbmV4cG9ydCBkZWZhdWx0IGV4cG9ydHMgYXMgdHlwZW9mIGltcG9ydCgnLi9saW5lJyk7XG4iXX0=