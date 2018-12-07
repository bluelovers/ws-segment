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
    core_decorators_1.autobind
], LoaderClass);
exports.LoaderClass = LoaderClass;
exports.default = LoaderClass;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiX2NsYXNzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiX2NsYXNzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7R0FFRzs7Ozs7Ozs7QUFHSCxtREFBb0M7QUFDcEMscUNBQXVFO0FBQ3ZFLHlDQUEyRDtBQUMzRCxxQ0FBOEM7QUFDOUMscURBQTJDO0FBZTNDLElBQWEsV0FBVyxHQUF4QixNQUFhLFdBQVc7SUFLdkIsWUFBWSxVQUEwQixFQUFFLEVBQUUsR0FBRyxJQUFJO1FBSDFDLFlBQU8sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1FBSzFCLElBQUksT0FBTyxDQUFDLFNBQVMsRUFDckI7WUFDQyxJQUFJLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQzlDO1FBRUQsSUFBSSxPQUFPLENBQUMsYUFBYSxFQUN6QjtZQUNDLElBQUksQ0FBQyxhQUFhLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDdEQ7UUFFRCxJQUFJLE9BQU8sQ0FBQyxNQUFNLEVBQ2xCO1lBQ0MsSUFBSSxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN4QztRQUVELElBQUksT0FBTyxDQUFDLE1BQU0sRUFDbEI7WUFDQyxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN2RDtJQUNGLENBQUM7SUFFRCxNQUFNLENBQUMsTUFBTSxDQUFDLFVBQThCLEVBQUUsRUFBRSxHQUFHLElBQUk7UUFFdEQsT0FBTyxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztJQUNuQyxDQUFDO0lBRUQsU0FBUyxDQUFDLEtBQWE7UUFFdEIsT0FBTyxLQUFpQixDQUFBO0lBQ3pCLENB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LGtDQUFXO0FBbUl4QixrQkFBZSxXQUFXLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgdXNlciBvbiAyMDE4LzQvMTMvMDEzLlxuICovXG5cbmltcG9ydCAqIGFzIFByb21pc2UgZnJvbSAnYmx1ZWJpcmQnO1xuaW1wb3J0IHsgTEYgfSBmcm9tICdjcmxmLW5vcm1hbGl6ZSc7XG5pbXBvcnQgeyB3cmFwU3RyZWFtVG9Qcm9taXNlLCBJU3RyZWFtTGluZVdpdGhWYWx1ZSB9IGZyb20gJy4uL2ZzL2xpbmUnO1xuaW1wb3J0IGNyZWF0ZUxvYWRTdHJlYW0sIHsgSUNhbGxiYWNrIH0gZnJvbSAnLi4vZnMvc3RyZWFtJztcbmltcG9ydCBjcmVhdGVMb2FkU3RyZWFtU3luYyBmcm9tICcuLi9mcy9zeW5jJztcbmltcG9ydCB7IGF1dG9iaW5kIH0gZnJvbSAnY29yZS1kZWNvcmF0b3JzJztcblxuZXhwb3J0IHR5cGUgSU9wdGlvbnM8VCwgUj4gPSB7XG5cblx0cGFyc2VMaW5lPyhpbnB1dDogc3RyaW5nLCBvbGRGbj86IChpbnB1dDogc3RyaW5nKSA9PiBSKTogUixcblxuXHRtYXBwZXI/KGxpbmUpLFxuXG5cdGZpbHRlcj8obGluZSksXG5cblx0c3RyaW5naWZ5TGluZT8oZGF0YTogUik6IHN0cmluZyxcblxufTtcblxuQGF1dG9iaW5kXG5leHBvcnQgY2xhc3MgTG9hZGVyQ2xhc3M8VCwgUj5cbntcblx0cHVibGljIGRlZmF1bHQgPSB0aGlzLmxvYWQ7XG5cdHByb3RlY3RlZCBkZWZhdWx0T3B0aW9uczogSU9wdGlvbnM8VCwgUj47XG5cblx0Y29uc3RydWN0b3Iob3B0aW9uczogSU9wdGlvbnM8VCwgUj4gPSB7fSwgLi4uYXJndilcblx0e1xuXHRcdGlmIChvcHRpb25zLnBhcnNlTGluZSlcblx0XHR7XG5cdFx0XHR0aGlzLnBhcnNlTGluZSA9IG9wdGlvbnMucGFyc2VMaW5lLmJpbmQodGhpcyk7XG5cdFx0fVxuXG5cdFx0aWYgKG9wdGlvbnMuc3RyaW5naWZ5TGluZSlcblx0XHR7XG5cdFx0XHR0aGlzLnN0cmluZ2lmeUxpbmUgPSBvcHRpb25zLnN0cmluZ2lmeUxpbmUuYmluZCh0aGlzKTtcblx0XHR9XG5cblx0XHRpZiAob3B0aW9ucy5maWx0ZXIpXG5cdFx0e1xuXHRcdFx0dGhpcy5maWx0ZXIgPSBvcHRpb25zLmZpbHRlci5iaW5kKHRoaXMpO1xuXHRcdH1cblxuXHRcdGlmIChvcHRpb25zLm1hcHBlcilcblx0XHR7XG5cdFx0XHR0aGlzLmRlZmF1bHRPcHRpb25zLm1hcHBlciA9IG9wdGlvbnMubWFwcGVyLmJpbmQodGhpcyk7XG5cdFx0fVxuXHR9XG5cblx0c3RhdGljIGNyZWF0ZShvcHRpb25zOiBJT3B0aW9uczxhbnksIGFueT4gPSB7fSwgLi4uYXJndilcblx0e1xuXHRcdHJldHVybiBuZXcgdGhpcyhvcHRpb25zLCAuLi5hcmd2KTtcblx0fVxuXG5cdHBhcnNlTGluZShpbnB1dDogc3RyaW5nKTogUlxuXHR7XG5cdFx0cmV0dXJuIGlucHV0IGFzIGFueSBhcyBSXG5cdH1cblxuXHRzdHJpbmdpZnlMaW5lKGRhdGE6IFIpOiBzdHJpbmdcblx0e1xuXHRcdHJldHVybiBkYXRhLnRvU3RyaW5nKCk7XG5cdH1cblxuXHRzZXJpYWxpemUoZGF0YTogUltdKTogc3RyaW5nXG5cdHtcblx0XHRsZXQgc2VsZiA9IHRoaXM7XG5cblx0XHRyZXR1cm4gZGF0YS5tYXAoZnVuY3Rpb24gKGQpXG5cdFx0e1xuXHRcdFx0cmV0dXJuIHNlbGYuc3RyaW5naWZ5TGluZShkKTtcblx0XHR9KS5qb2luKExGKTtcblx0fVxuXG5cdGZpbHRlcihpbnB1dDogc3RyaW5nKVxuXHR7XG5cdFx0cmV0dXJuIGlucHV0XG5cdH1cblxuXHRsb2FkKGZpbGU6IHN0cmluZywgb3B0aW9uczogSU9wdGlvbnM8VCwgUj4gPSB7fSk6IFByb21pc2U8VD5cblx0e1xuXHRcdHJldHVybiB3cmFwU3RyZWFtVG9Qcm9taXNlKHRoaXMubG9hZFN0cmVhbShmaWxlLCBvcHRpb25zKSlcblx0XHRcdC50aGVuKGZ1bmN0aW9uIChzdHJlYW06IElTdHJlYW1MaW5lV2l0aFZhbHVlPFQ+KVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gc3RyZWFtLnZhbHVlO1xuXHRcdFx0fSlcblx0XHRcdDtcblx0fVxuXG5cdGxvYWRTeW5jKGZpbGU6IHN0cmluZywgb3B0aW9uczogSU9wdGlvbnM8VCwgUj4gPSB7fSlcblx0e1xuXHRcdGxldCByID0gdGhpcy5sb2FkU3RyZWFtU3luYyhmaWxlLCBvcHRpb25zKTtcblx0XHRsZXQgdmFsdWUgPSByLnZhbHVlO1xuXHRcdC8vIOippuWcluaJi+WLlea4hemZpOiomOaGtumrlOWNoOeUqFxuXHRcdHIgPSB1bmRlZmluZWQ7XG5cdFx0cmV0dXJuIHZhbHVlO1xuXHR9XG5cblx0bG9hZFN0cmVhbShmaWxlOiBzdHJpbmcsIG9wdGlvbnM6IElPcHRpb25zPFQsIFI+ID0ge30sIGNhbGxiYWNrPzogSUNhbGxiYWNrPFQ+KVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX2NyZWF0ZVN0cmVhbShjcmVhdGVMb2FkU3RyZWFtLCBmaWxlLCBvcHRpb25zLCBjYWxsYmFjaylcblx0fVxuXG5cdGxvYWRTdHJlYW1TeW5jKGZpbGU6IHN0cmluZywgb3B0aW9uczogSU9wdGlvbnM8VCwgUj4gPSB7fSwgY2FsbGJhY2s/OiBJQ2FsbGJhY2s8VD4pXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fY3JlYXRlU3RyZWFtKGNyZWF0ZUxvYWRTdHJlYW1TeW5jLCBmaWxlLCBvcHRpb25zLCBjYWxsYmFjaylcblx0fVxuXG5cdHByb3RlY3RlZCBfY3JlYXRlU3RyZWFtPFQ+KGZuU3RyZWFtOiB0eXBlb2YgY3JlYXRlTG9hZFN0cmVhbSxcblx0XHRmaWxlOiBzdHJpbmcsXG5cdFx0b3B0aW9uczogSU9wdGlvbnM8VCwgUj4gPSB7fSxcblx0XHRjYWxsYmFjaz86IElDYWxsYmFjazxUPlxuXHQpXG5cdHtcblx0XHRsZXQgc2VsZiA9IHRoaXM7XG5cblx0XHRsZXQgb3B0cyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuZGVmYXVsdE9wdGlvbnMsIG9wdGlvbnMpO1xuXG5cdFx0bGV0IHBhcnNlTGluZSA9IG9wdHMucGFyc2VMaW5lIHx8IHNlbGYucGFyc2VMaW5lO1xuXHRcdGxldCBmaWx0ZXIgPSBvcHRzLmZpbHRlciB8fCBzZWxmLmZpbHRlcjtcblxuXHRcdG9wdHMucGFyc2VMaW5lID0gcGFyc2VMaW5lO1xuXG5cdFx0bGV0IHN0cmVhbSA9IGZuU3RyZWFtPFQ+KGZpbGUsIHtcblxuXHRcdFx0Y2FsbGJhY2ssXG5cblx0XHRcdG1hcHBlcjogb3B0cy5tYXBwZXIgfHwgZnVuY3Rpb24gbWFwcGVyKGxpbmUpXG5cdFx0XHR7XG5cdFx0XHRcdGlmIChmaWx0ZXIpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsaW5lID0gZmlsdGVyKGxpbmUpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKGxpbmUpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0cmV0dXJuIHBhcnNlTGluZShsaW5lLCBzZWxmLnBhcnNlTGluZSk7XG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cblx0XHR9KTtcblxuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRzdHJlYW0ucGlwZUxvYWRlciA9IHNlbGY7XG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdHN0cmVhbS5waXBlUnVudGltZU9wdGlvbnMgPSBvcHRzO1xuXG5cdFx0cmV0dXJuIHN0cmVhbTtcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBMb2FkZXJDbGFzcztcbiJdfQ==