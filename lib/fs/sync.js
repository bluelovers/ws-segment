"use strict";
/**
 * Created by user on 2018/4/13/013.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReadableSync = exports.createReadStreamSync = exports.createStreamLineSync = exports.createLoadStreamSync = void 0;
const stream = require("stream");
const fs = require("fs");
const path = require("path");
const line_1 = require("./line");
function createLoadStreamSync(file, options = {}) {
    options.onready = options.onready || function (src, ...argv) {
        this.value = this.value || [];
    };
    options.mapper = options.mapper || function (data) {
        return data;
    };
    options.ondata = options.ondata || function (data) {
        this.value = this.value || [];
        this.value.push(data);
    };
    let stream = createStreamLineSync(file, options.mapper, {
        onready: options.onready,
        ondata: options.ondata,
        onclose() {
            if (options.callback) {
                options.callback.call(this, null, stream.value, stream);
            }
        }
    });
    // @ts-ignore
    stream.pipeFrom.run();
    return stream;
}
exports.createLoadStreamSync = createLoadStreamSync;
function createStreamLineSync(file, fn, options) {
    return createReadStreamSync(file)
        .pipe(line_1.byLine(fn, options));
}
exports.createStreamLineSync = createStreamLineSync;
function createReadStreamSync(file) {
    return new ReadableSync(file);
}
exports.createReadStreamSync = createReadStreamSync;
class ReadableSync extends stream.Readable {
    constructor(file) {
        super();
        this.fd = null;
        this.flags = 'r';
        this.bytesRead = 0;
        this.options = {
            readChunk: 1024,
        };
        this.path = file;
        if (typeof file === 'number') {
            this.fd = file;
        }
        else {
            if (typeof file == 'string') {
                this.path = path.resolve(file);
            }
            this.fd = fs.openSync(this.path, this.flags);
        }
        this.pause();
    }
    _read(size) {
        let buffers = [];
        let bytesRead;
        do {
            bytesRead = this.__read(size);
            if (bytesRead !== null) {
                buffers.push(bytesRead);
            }
        } while (bytesRead !== null);
        let bufferData = Buffer.concat(buffers);
        this.push(bufferData);
        //this._destroy(null, () => undefined);
        return bufferData;
    }
    __read(size) {
        //let readBuffer = new Buffer(this.options.readChunk);
        let readBuffer = Buffer.alloc(this.options.readChunk);
        let bytesRead = fs.readSync(this.fd, readBuffer, 0, this.options.readChunk, this.bytesRead);
        if (bytesRead === 0) {
            this.fdEnd = true;
            return null;
        }
        this.bytesRead += bytesRead;
        if (bytesRead < this.options.readChunk) {
            this.fdEnd = true;
            readBuffer = readBuffer.slice(0, bytesRead);
        }
        return readBuffer;
    }
    run() {
        this.resume();
        this.emit('ready', this);
        let i = 0;
        while (!this.fdEnd) {
            let k = this.read();
        }
        //let bufferData = this.__read(this.options.readChunk);
        //this.emit('data', bufferData);
        return this;
    }
}
exports.ReadableSync = ReadableSync;
exports.default = createLoadStreamSync;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3luYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInN5bmMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztHQUVHOzs7QUFFSCxpQ0FBa0M7QUFDbEMseUJBQTBCO0FBQzFCLDZCQUE4QjtBQUU5QixpQ0FBNkU7QUFHN0UsU0FBZ0Isb0JBQW9CLENBQUksSUFBWSxFQUFFLFVBU2xELEVBQUU7SUFFTCxPQUFPLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxPQUFPLElBQUksVUFBVSxHQUFHLEVBQUUsR0FBRyxJQUFJO1FBRTFELElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssSUFBSSxFQUFFLENBQUM7SUFDL0IsQ0FBQyxDQUFDO0lBRUYsT0FBTyxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxJQUFJLFVBQVUsSUFBSTtRQUVoRCxPQUFPLElBQUksQ0FBQztJQUNiLENBQUMsQ0FBQztJQUVGLE9BQU8sQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQU0sSUFBSSxVQUFVLElBQUk7UUFFaEQsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxJQUFJLEVBQUUsQ0FBQztRQUM5QixJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN2QixDQUFDLENBQUM7SUFFRixJQUFJLE1BQU0sR0FBOEIsb0JBQW9CLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxNQUFNLEVBQUU7UUFFbEYsT0FBTyxFQUFFLE9BQU8sQ0FBQyxPQUFPO1FBRXhCLE1BQU0sRUFBRSxPQUFPLENBQUMsTUFBTTtRQUN0QixPQUFPO1lBRU4sSUFBSSxPQUFPLENBQUMsUUFBUSxFQUNwQjtnQkFDQyxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLE1BQU0sQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUE7YUFDdkQ7UUFDRixDQUFDO0tBQ0QsQ0FBQyxDQUFD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Q0FBQztTQUM1QztRQUVELE9BQU8sVUFBVSxDQUFDO0lBQ25CLENBQUM7SUFFRCxHQUFHO1FBRUYsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBRWQsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFekIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRVYsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQ2xCO1lBQ0MsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1NBQ3BCO1FBRUQsdURBQXVEO1FBQ3ZELGdDQUFnQztRQUVoQyxPQUFPLElBQUksQ0FBQztJQUNiLENBQUM7Q0FDRDtBQXJHRCxvQ0FxR0M7QUFFRCxrQkFBZSxvQkFBb0IsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTgvNC8xMy8wMTMuXG4gKi9cblxuaW1wb3J0IHN0cmVhbSA9IHJlcXVpcmUoJ3N0cmVhbScpO1xuaW1wb3J0IGZzID0gcmVxdWlyZSgnZnMnKTtcbmltcG9ydCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuaW1wb3J0IEV2ZW50RW1pdHRlciA9IHJlcXVpcmUoJ2V2ZW50cycpO1xuaW1wb3J0IHsgYnlMaW5lLCBJT3B0aW9ucywgSVN0cmVhbUxpbmUsIElTdHJlYW1MaW5lV2l0aFZhbHVlIH0gZnJvbSAnLi9saW5lJztcbmltcG9ydCB7IElDYWxsYmFjayB9IGZyb20gJy4vc3RyZWFtJztcblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUxvYWRTdHJlYW1TeW5jPFQ+KGZpbGU6IHN0cmluZywgb3B0aW9uczoge1xuXG5cdG1hcHBlcj8obGluZTogc3RyaW5nKSxcblx0b25kYXRhPyhkYXRhKSxcblxuXHRjYWxsYmFjaz86IElDYWxsYmFjazxUPixcblxuXHRvbnJlYWR5PyguLi5hcmd2KSxcblxufSA9IHt9KTogSVN0cmVhbUxpbmVXaXRoVmFsdWU8VD5cbntcblx0b3B0aW9ucy5vbnJlYWR5ID0gb3B0aW9ucy5vbnJlYWR5IHx8IGZ1bmN0aW9uIChzcmMsIC4uLmFyZ3YpXG5cdHtcblx0XHR0aGlzLnZhbHVlID0gdGhpcy52YWx1ZSB8fCBbXTtcblx0fTtcblxuXHRvcHRpb25zLm1hcHBlciA9IG9wdGlvbnMubWFwcGVyIHx8IGZ1bmN0aW9uIChkYXRhKVxuXHR7XG5cdFx0cmV0dXJuIGRhdGE7XG5cdH07XG5cblx0b3B0aW9ucy5vbmRhdGEgPSBvcHRpb25zLm9uZGF0YSB8fCBmdW5jdGlvbiAoZGF0YSlcblx0e1xuXHRcdHRoaXMudmFsdWUgPSB0aGlzLnZhbHVlIHx8IFtdO1xuXHRcdHRoaXMudmFsdWUucHVzaChkYXRhKTtcblx0fTtcblxuXHRsZXQgc3RyZWFtOiBJU3RyZWFtTGluZVdpdGhWYWx1ZTxhbnk+ID0gY3JlYXRlU3RyZWFtTGluZVN5bmMoZmlsZSwgb3B0aW9ucy5tYXBwZXIsIHtcblxuXHRcdG9ucmVhZHk6IG9wdGlvbnMub25yZWFkeSxcblxuXHRcdG9uZGF0YTogb3B0aW9ucy5vbmRhdGEsXG5cdFx0b25jbG9zZSgpXG5cdFx0e1xuXHRcdFx0aWYgKG9wdGlvbnMuY2FsbGJhY2spXG5cdFx0XHR7XG5cdFx0XHRcdG9wdGlvbnMuY2FsbGJhY2suY2FsbCh0aGlzLCBudWxsLCBzdHJlYW0udmFsdWUsIHN0cmVhbSlcblx0XHRcdH1cblx0XHR9XG5cdH0pO1xuXG5cdC8vIEB0cy1pZ25vcmVcblx0c3RyZWFtLnBpcGVGcm9tLnJ1bigpO1xuXG5cdHJldHVybiBzdHJlYW07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTdHJlYW1MaW5lU3luYyhmaWxlOiBzdHJpbmcsIG9wdGlvbnM6IElPcHRpb25zKTogSVN0cmVhbUxpbmVcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTdHJlYW1MaW5lU3luYyhmaWxlOiBzdHJpbmcsIGZuPzogKGRhdGE6IHN0cmluZykgPT4gYW55LCBvcHRpb25zPzogSU9wdGlvbnMpOiBJU3RyZWFtTGluZVxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVN0cmVhbUxpbmVTeW5jKGZpbGU6IHN0cmluZywgZm4/LCBvcHRpb25zPzogSU9wdGlvbnMpXG57XG5cdHJldHVybiBjcmVhdGVSZWFkU3RyZWFtU3luYyhmaWxlKVxuXHRcdC5waXBlKGJ5TGluZShmbiwgb3B0aW9ucykpXG5cdFx0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlUmVhZFN0cmVhbVN5bmMoZmlsZTogc3RyaW5nKVxue1xuXHRyZXR1cm4gbmV3IFJlYWRhYmxlU3luYyhmaWxlKTtcbn1cblxuZXhwb3J0IGNsYXNzIFJlYWRhYmxlU3luYyBleHRlbmRzIHN0cmVhbS5SZWFkYWJsZVxue1xuXHRwcm90ZWN0ZWQgZmQ6IG51bWJlciA9IG51bGw7XG5cdHByb3RlY3RlZCBmbGFnczogc3RyaW5nIHwgbnVtYmVyID0gJ3InO1xuXHRwdWJsaWMgYnl0ZXNSZWFkOiBudW1iZXIgPSAwO1xuXHRwdWJsaWMgcGF0aDogc3RyaW5nO1xuXG5cdHByb3RlY3RlZCBmZEVuZDogYm9vbGVhbjtcblxuXHRwcm90ZWN0ZWQgb3B0aW9ucyA9IHtcblx0XHRyZWFkQ2h1bms6IDEwMjQsXG5cdH07XG5cblx0Y29uc3RydWN0b3IoZmlsZTogc3RyaW5nKVxuXHR7XG5cdFx0c3VwZXIoKTtcblxuXHRcdHRoaXMucGF0aCA9IGZpbGU7XG5cblx0XHRpZiAodHlwZW9mIGZpbGUgPT09ICdudW1iZXInKVxuXHRcdHtcblx0XHRcdHRoaXMuZmQgPSBmaWxlO1xuXHRcdH1cblx0XHRlbHNlXG5cdFx0e1xuXHRcdFx0aWYgKHR5cGVvZiBmaWxlID09ICdzdHJpbmcnKVxuXHRcdFx0e1xuXHRcdFx0XHR0aGlzLnBhdGggPSBwYXRoLnJlc29sdmUoZmlsZSk7XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMuZmQgPSBmcy5vcGVuU3luYyh0aGlzLnBhdGgsIHRoaXMuZmxhZ3MpO1xuXHRcdH1cblxuXHRcdHRoaXMucGF1c2UoKTtcblx0fVxuXG5cdF9yZWFkKHNpemU6IG51bWJlcik6IEJ1ZmZlclxuXHR7XG5cdFx0bGV0IGJ1ZmZlcnM6IEJ1ZmZlcltdID0gW107XG5cdFx0bGV0IGJ5dGVzUmVhZDogQnVmZmVyO1xuXG5cdFx0ZG9cblx0XHR7XG5cdFx0XHRieXRlc1JlYWQgPSB0aGlzLl9fcmVhZChzaXplKTtcblxuXHRcdFx0aWYgKGJ5dGVzUmVhZCAhPT0gbnVsbClcblx0XHRcdHtcblx0XHRcdFx0YnVmZmVycy5wdXNoKGJ5dGVzUmVhZCk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHdoaWxlIChieXRlc1JlYWQgIT09IG51bGwpO1xuXG5cdFx0bGV0IGJ1ZmZlckRhdGEgPSBCdWZmZXIuY29uY2F0KGJ1ZmZlcnMpO1xuXG5cdFx0dGhpcy5wdXNoKGJ1ZmZlckRhdGEpO1xuXHRcdC8vdGhpcy5fZGVzdHJveShudWxsLCAoKSA9PiB1bmRlZmluZWQpO1xuXG5cdFx0cmV0dXJuIGJ1ZmZlckRhdGE7XG5cdH1cblxuXHRfX3JlYWQoc2l6ZTogbnVtYmVyKTogQnVmZmVyXG5cdHtcblx0XHQvL2xldCByZWFkQnVmZmVyID0gbmV3IEJ1ZmZlcih0aGlzLm9wdGlvbnMucmVhZENodW5rKTtcblx0XHRsZXQgcmVhZEJ1ZmZlciA9IEJ1ZmZlci5hbGxvYyh0aGlzLm9wdGlvbnMucmVhZENodW5rKTtcblxuXHRcdGxldCBieXRlc1JlYWQgPSBmcy5yZWFkU3luYyh0aGlzLmZkLCByZWFkQnVmZmVyLCAwLCB0aGlzLm9wdGlvbnMucmVhZENodW5rLCB0aGlzLmJ5dGVzUmVhZCk7XG5cblx0XHRpZiAoYnl0ZXNSZWFkID09PSAwKVxuXHRcdHtcblx0XHRcdHRoaXMuZmRFbmQgPSB0cnVlO1xuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXG5cdFx0dGhpcy5ieXRlc1JlYWQgKz0gYnl0ZXNSZWFkO1xuXG5cdFx0aWYgKGJ5dGVzUmVhZCA8IHRoaXMub3B0aW9ucy5yZWFkQ2h1bmspIHtcblx0XHRcdHRoaXMuZmRFbmQgPSB0cnVlO1xuXHRcdFx0cmVhZEJ1ZmZlciA9IHJlYWRCdWZmZXIuc2xpY2UoMCwgYnl0ZXNSZWFkKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gcmVhZEJ1ZmZlcjtcblx0fVxuXG5cdHJ1bigpXG5cdHtcblx0XHR0aGlzLnJlc3VtZSgpO1xuXG5cdFx0dGhpcy5lbWl0KCdyZWFkeScsIHRoaXMpO1xuXG5cdFx0bGV0IGkgPSAwO1xuXG5cdFx0d2hpbGUgKCF0aGlzLmZkRW5kKVxuXHRcdHtcblx0XHRcdGxldCBrID0gdGhpcy5yZWFkKCk7XG5cdFx0fVxuXG5cdFx0Ly9sZXQgYnVmZmVyRGF0YSA9IHRoaXMuX19yZWFkKHRoaXMub3B0aW9ucy5yZWFkQ2h1bmspO1xuXHRcdC8vdGhpcy5lbWl0KCdkYXRhJywgYnVmZmVyRGF0YSk7XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBjcmVhdGVMb2FkU3RyZWFtU3luYztcbiJdfQ==