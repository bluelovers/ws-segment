"use strict";
/**
 * Created by user on 2018/4/13/013.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const crlf_normalize_1 = require("crlf-normalize");
const line_1 = require("../fs/line");
const stream_1 = require("../fs/stream");
const sync_1 = require("../fs/sync");
const core_decorators_1 = require("core-decorators");
let LoaderClass = class LoaderClass {
    constructor(options = {}, ...argv) {
        this.default = this.load;
        if (options.parseLine) {
            this.parseLine = options.parseLine.bind(this);
        }
        if (options.stringifyLine) {
            this.stringifyLine = options.stringifyLine.bind(this);
        }
        if (options.filter) {
            this.filter = options.filter.bind(this);
        }
        if (options.mapper) {
            this.defaultOptions.mapper = options.mapper.bind(this);
        }
    }
    static create(options = {}, ...argv) {
        return new this(options, ...argv);
    }
    parseLine(input) {
        return input;
    }
    stringifyLine(data) {
        return data.toString();
    }
    serialize(data) {
        let self = this;
        return data.map(function (d) {
            return self.stringifyLine(d);
        }).join(crlf_normalize_1.LF);
    }
    filter(input) {
        return input;
    }
    load(file, options = {}) {
        return line_1.wrapStreamToPromise(this.loadStream(file, options))
            .then(function (stream) {
            return stream.value;
        });
    }
    loadSync(file, options = {}) {
        let r = this.loadStreamSync(file, options);
        let value = r.value;
        // 試圖手動清除記憶體占用
        r = undefined;
        return value;
    }
    loadStream(file, options = {}, callback) {
        return this._createStream(stream_1.default, file, options, callback);
    }
    loadStreamSync(file, options = {}, callback) {
        return this._createStream(sync_1.default, file, options, callback);
    }
    _createStream(fnStream, file, options = {}, callback) {
        let self = this;
        let opts = Object.assign({}, this.defaultOptions, options);
        let parseLine = opts.parseLine || self.parseLine;
        let filter = opts.filter || self.filter;
        opts.parseLine = parseLine;
        let stream = fnStream(file, {
            callback,
            mapper: opts.mapper || function mapper(line) {
                if (filter) {
                    line = filter(line);
                }
                if (line) {
                    // @ts-ignore
                    return parseLine(line, self.parseLine);
                }
            },
        });
        // @ts-ignore
        stream.pipeLoader = self;
        // @ts-ignore
        stream.pipeRuntimeOptions = opts;
        return stream;
    }
};
LoaderClass = __decorate([
    core_decorators_1.autobind,
    __metadata("design:paramtypes", [Object, Object])
], LoaderClass);
exports.LoaderClass = LoaderClass;
exports.default = LoaderClass;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiX2NsYXNzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiX2NsYXNzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7R0FFRzs7Ozs7Ozs7Ozs7QUFHSCxtREFBb0M7QUFDcEMscUNBQXVFO0FBQ3ZFLHlDQUEyRDtBQUMzRCxxQ0FBOEM7QUFDOUMscURBQTJDO0FBZTNDLElBQWEsV0FBVyxHQUF4QixNQUFhLFdBQVc7SUFLdkIsWUFBWSxVQUEwQixFQUFFLEVBQUUsR0FBRyxJQUFJO1FBSDFDLFlBQU8sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1FBSzFCLElBQUksT0FBTyxDQUFDLFNBQVMsRUFDckI7WUFDQyxJQUFJLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQzlDO1FBRUQsSUFBSSxPQUFPLENBQUMsYUFBYSxFQUN6QjtZQUNDLElBQUksQ0FBQyxhQUFhLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDdEQ7UUFFRCxJQUFJLE9BQU8sQ0FBQyxNQUFNLEVBQ2xCO1lBQ0MsSUFBSSxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN4QztRQUVELElBQUksT0FBTyxDQUFDLE1BQU0sRUFDbEI7WUFDQyxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN2RDtJQUNGLENBQUM7SUFFRCxNQUFNLENBQUMsTUFBTSxDQUFDLFVBQThCLEVBQUUsRUFBRSxHQUFHLElBQUk7UUFFdEQsT0FBTyxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztJQUNuQyxDQUFDO0lBRUQsU0FBUyxDQUFDLEtBQWE7UUFFdEIsT0FBTyxLQUFpQixDQUFBO0lBQ3pC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QWpJWSxrQ0FBVztBQW1JeEIsa0JBQWUsV0FBVyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDcmVhdGVkIGJ5IHVzZXIgb24gMjAxOC80LzEzLzAxMy5cbiAqL1xuXG5pbXBvcnQgUHJvbWlzZSA9IHJlcXVpcmUoJ2JsdWViaXJkJyk7XG5pbXBvcnQgeyBMRiB9IGZyb20gJ2NybGYtbm9ybWFsaXplJztcbmltcG9ydCB7IHdyYXBTdHJlYW1Ub1Byb21pc2UsIElTdHJlYW1MaW5lV2l0aFZhbHVlIH0gZnJvbSAnLi4vZnMvbGluZSc7XG5pbXBvcnQgY3JlYXRlTG9hZFN0cmVhbSwgeyBJQ2FsbGJhY2sgfSBmcm9tICcuLi9mcy9zdHJlYW0nO1xuaW1wb3J0IGNyZWF0ZUxvYWRTdHJlYW1TeW5jIGZyb20gJy4uL2ZzL3N5bmMnO1xuaW1wb3J0IHsgYXV0b2JpbmQgfSBmcm9tICdjb3JlLWRlY29yYXRvcnMnO1xuXG5leHBvcnQgdHlwZSBJT3B0aW9uczxULCBSPiA9IHtcblxuXHRwYXJzZUxpbmU/KGlucHV0OiBzdHJpbmcsIG9sZEZuPzogKGlucHV0OiBzdHJpbmcpID0+IFIpOiBSLFxuXG5cdG1hcHBlcj8obGluZSksXG5cblx0ZmlsdGVyPyhsaW5lKSxcblxuXHRzdHJpbmdpZnlMaW5lPyhkYXRhOiBSKTogc3RyaW5nLFxuXG59O1xuXG5AYXV0b2JpbmRcbmV4cG9ydCBjbGFzcyBMb2FkZXJDbGFzczxULCBSPlxue1xuXHRwdWJsaWMgZGVmYXVsdCA9IHRoaXMubG9hZDtcblx0cHJvdGVjdGVkIGRlZmF1bHRPcHRpb25zOiBJT3B0aW9uczxULCBSPjtcblxuXHRjb25zdHJ1Y3RvcihvcHRpb25zOiBJT3B0aW9uczxULCBSPiA9IHt9LCAuLi5hcmd2KVxuXHR7XG5cdFx0aWYgKG9wdGlvbnMucGFyc2VMaW5lKVxuXHRcdHtcblx0XHRcdHRoaXMucGFyc2VMaW5lID0gb3B0aW9ucy5wYXJzZUxpbmUuYmluZCh0aGlzKTtcblx0XHR9XG5cblx0XHRpZiAob3B0aW9ucy5zdHJpbmdpZnlMaW5lKVxuXHRcdHtcblx0XHRcdHRoaXMuc3RyaW5naWZ5TGluZSA9IG9wdGlvbnMuc3RyaW5naWZ5TGluZS5iaW5kKHRoaXMpO1xuXHRcdH1cblxuXHRcdGlmIChvcHRpb25zLmZpbHRlcilcblx0XHR7XG5cdFx0XHR0aGlzLmZpbHRlciA9IG9wdGlvbnMuZmlsdGVyLmJpbmQodGhpcyk7XG5cdFx0fVxuXG5cdFx0aWYgKG9wdGlvbnMubWFwcGVyKVxuXHRcdHtcblx0XHRcdHRoaXMuZGVmYXVsdE9wdGlvbnMubWFwcGVyID0gb3B0aW9ucy5tYXBwZXIuYmluZCh0aGlzKTtcblx0XHR9XG5cdH1cblxuXHRzdGF0aWMgY3JlYXRlKG9wdGlvbnM6IElPcHRpb25zPGFueSwgYW55PiA9IHt9LCAuLi5hcmd2KVxuXHR7XG5cdFx0cmV0dXJuIG5ldyB0aGlzKG9wdGlvbnMsIC4uLmFyZ3YpO1xuXHR9XG5cblx0cGFyc2VMaW5lKGlucHV0OiBzdHJpbmcpOiBSXG5cdHtcblx0XHRyZXR1cm4gaW5wdXQgYXMgYW55IGFzIFJcblx0fVxuXG5cdHN0cmluZ2lmeUxpbmUoZGF0YTogUik6IHN0cmluZ1xuXHR7XG5cdFx0cmV0dXJuIGRhdGEudG9TdHJpbmcoKTtcblx0fVxuXG5cdHNlcmlhbGl6ZShkYXRhOiBSW10pOiBzdHJpbmdcblx0e1xuXHRcdGxldCBzZWxmID0gdGhpcztcblxuXHRcdHJldHVybiBkYXRhLm1hcChmdW5jdGlvbiAoZClcblx0XHR7XG5cdFx0XHRyZXR1cm4gc2VsZi5zdHJpbmdpZnlMaW5lKGQpO1xuXHRcdH0pLmpvaW4oTEYpO1xuXHR9XG5cblx0ZmlsdGVyKGlucHV0OiBzdHJpbmcpXG5cdHtcblx0XHRyZXR1cm4gaW5wdXRcblx0fVxuXG5cdGxvYWQoZmlsZTogc3RyaW5nLCBvcHRpb25zOiBJT3B0aW9uczxULCBSPiA9IHt9KTogUHJvbWlzZTxUPlxuXHR7XG5cdFx0cmV0dXJuIHdyYXBTdHJlYW1Ub1Byb21pc2UodGhpcy5sb2FkU3RyZWFtKGZpbGUsIG9wdGlvbnMpKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKHN0cmVhbTogSVN0cmVhbUxpbmVXaXRoVmFsdWU8VD4pXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiBzdHJlYW0udmFsdWU7XG5cdFx0XHR9KVxuXHRcdFx0O1xuXHR9XG5cblx0bG9hZFN5bmMoZmlsZTogc3RyaW5nLCBvcHRpb25zOiBJT3B0aW9uczxULCBSPiA9IHt9KVxuXHR7XG5cdFx0bGV0IHIgPSB0aGlzLmxvYWRTdHJlYW1TeW5jKGZpbGUsIG9wdGlvbnMpO1xuXHRcdGxldCB2YWx1ZSA9IHIudmFsdWU7XG5cdFx0Ly8g6Kmm5ZyW5omL5YuV5riF6Zmk6KiY5oa26auU5Y2g55SoXG5cdFx0ciA9IHVuZGVmaW5lZDtcblx0XHRyZXR1cm4gdmFsdWU7XG5cdH1cblxuXHRsb2FkU3RyZWFtKGZpbGU6IHN0cmluZywgb3B0aW9uczogSU9wdGlvbnM8VCwgUj4gPSB7fSwgY2FsbGJhY2s/OiBJQ2FsbGJhY2s8VD4pXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fY3JlYXRlU3RyZWFtKGNyZWF0ZUxvYWRTdHJlYW0sIGZpbGUsIG9wdGlvbnMsIGNhbGxiYWNrKVxuXHR9XG5cblx0bG9hZFN0cmVhbVN5bmMoZmlsZTogc3RyaW5nLCBvcHRpb25zOiBJT3B0aW9uczxULCBSPiA9IHt9LCBjYWxsYmFjaz86IElDYWxsYmFjazxUPilcblx0e1xuXHRcdHJldHVybiB0aGlzLl9jcmVhdGVTdHJlYW0oY3JlYXRlTG9hZFN0cmVhbVN5bmMsIGZpbGUsIG9wdGlvbnMsIGNhbGxiYWNrKVxuXHR9XG5cblx0cHJvdGVjdGVkIF9jcmVhdGVTdHJlYW08VD4oZm5TdHJlYW06IHR5cGVvZiBjcmVhdGVMb2FkU3RyZWFtLFxuXHRcdGZpbGU6IHN0cmluZyxcblx0XHRvcHRpb25zOiBJT3B0aW9uczxULCBSPiA9IHt9LFxuXHRcdGNhbGxiYWNrPzogSUNhbGxiYWNrPFQ+XG5cdClcblx0e1xuXHRcdGxldCBzZWxmID0gdGhpcztcblxuXHRcdGxldCBvcHRzID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5kZWZhdWx0T3B0aW9ucywgb3B0aW9ucyk7XG5cblx0XHRsZXQgcGFyc2VMaW5lID0gb3B0cy5wYXJzZUxpbmUgfHwgc2VsZi5wYXJzZUxpbmU7XG5cdFx0bGV0IGZpbHRlciA9IG9wdHMuZmlsdGVyIHx8IHNlbGYuZmlsdGVyO1xuXG5cdFx0b3B0cy5wYXJzZUxpbmUgPSBwYXJzZUxpbmU7XG5cblx0XHRsZXQgc3RyZWFtID0gZm5TdHJlYW08VD4oZmlsZSwge1xuXG5cdFx0XHRjYWxsYmFjayxcblxuXHRcdFx0bWFwcGVyOiBvcHRzLm1hcHBlciB8fCBmdW5jdGlvbiBtYXBwZXIobGluZSlcblx0XHRcdHtcblx0XHRcdFx0aWYgKGZpbHRlcilcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGxpbmUgPSBmaWx0ZXIobGluZSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAobGluZSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0XHRyZXR1cm4gcGFyc2VMaW5lKGxpbmUsIHNlbGYucGFyc2VMaW5lKTtcblx0XHRcdFx0fVxuXHRcdFx0fSxcblxuXHRcdH0pO1xuXG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdHN0cmVhbS5waXBlTG9hZGVyID0gc2VsZjtcblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0c3RyZWFtLnBpcGVSdW50aW1lT3B0aW9ucyA9IG9wdHM7XG5cblx0XHRyZXR1cm4gc3RyZWFtO1xuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IExvYWRlckNsYXNzO1xuIl19