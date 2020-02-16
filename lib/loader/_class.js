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
let LoaderClass = /** @class */ (() => {
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
    return LoaderClass;
})();
exports.LoaderClass = LoaderClass;
exports.default = LoaderClass;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiX2NsYXNzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiX2NsYXNzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7R0FFRzs7Ozs7Ozs7Ozs7QUFHSCxtREFBb0M7QUFDcEMscUNBQXVFO0FBQ3ZFLHlDQUEyRDtBQUMzRCxxQ0FBOEM7QUFDOUMscURBQTJDO0FBZTNDO0lBQUEsSUFBYSxXQUFXLEdBQXhCLE1BQWEsV0FBVztRQUt2QixZQUFZLFVBQTBCLEVBQUUsRUFBRSxHQUFHLElBQUk7WUFIMUMsWUFBTyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7WUFLMUIsSUFBSSxPQUFPLENBQUMsU0FBUyxFQUNyQjtnQkFDQyxJQUFJLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQzlDO1lBRUQsSUFBSSxPQUFPLENBQUMsYUFBYSxFQUN6QjtnQkFDQyxJQUFJLENBQUMsYUFBYSxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ3REO1lBRUQsSUFBSSxPQUFPLENBQUMsTUFBTSxFQUNsQjtnQkFDQyxJQUFJLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ3hDO1lBRUQsSUFBSSxPQUFPLENBQUMsTUFBTSxFQUNsQjtnQkFDQyxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUN2RDtRQUNGLENBQUM7UUFFRCxNQUFNLENBQUMsTUFBTSxDQUFDLFVBQThCLEVBQUUsRUFBRSxHQUFHLElBQUk7WUFFdEQsT0FBTyxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUNuQyxDQUFDO1FBRUQsU0FBUyxDQUFDLEtBQWE7WUFFdEIsT0FBTyxLQUFpQixD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SSxXQUFXLENBaUl2QjtJQUFELGtCQUFDO0tBQUE7QUFqSVksa0NBQVc7QUFtSXhCLGtCQUFlLFdBQVcsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTgvNC8xMy8wMTMuXG4gKi9cblxuaW1wb3J0IFByb21pc2UgPSByZXF1aXJlKCdibHVlYmlyZCcpO1xuaW1wb3J0IHsgTEYgfSBmcm9tICdjcmxmLW5vcm1hbGl6ZSc7XG5pbXBvcnQgeyB3cmFwU3RyZWFtVG9Qcm9taXNlLCBJU3RyZWFtTGluZVdpdGhWYWx1ZSB9IGZyb20gJy4uL2ZzL2xpbmUnO1xuaW1wb3J0IGNyZWF0ZUxvYWRTdHJlYW0sIHsgSUNhbGxiYWNrIH0gZnJvbSAnLi4vZnMvc3RyZWFtJztcbmltcG9ydCBjcmVhdGVMb2FkU3RyZWFtU3luYyBmcm9tICcuLi9mcy9zeW5jJztcbmltcG9ydCB7IGF1dG9iaW5kIH0gZnJvbSAnY29yZS1kZWNvcmF0b3JzJztcblxuZXhwb3J0IHR5cGUgSU9wdGlvbnM8VCwgUj4gPSB7XG5cblx0cGFyc2VMaW5lPyhpbnB1dDogc3RyaW5nLCBvbGRGbj86IChpbnB1dDogc3RyaW5nKSA9PiBSKTogUixcblxuXHRtYXBwZXI/KGxpbmUpLFxuXG5cdGZpbHRlcj8obGluZSksXG5cblx0c3RyaW5naWZ5TGluZT8oZGF0YTogUik6IHN0cmluZyxcblxufTtcblxuQGF1dG9iaW5kXG5leHBvcnQgY2xhc3MgTG9hZGVyQ2xhc3M8VCwgUj5cbntcblx0cHVibGljIGRlZmF1bHQgPSB0aGlzLmxvYWQ7XG5cdHByb3RlY3RlZCBkZWZhdWx0T3B0aW9uczogSU9wdGlvbnM8VCwgUj47XG5cblx0Y29uc3RydWN0b3Iob3B0aW9uczogSU9wdGlvbnM8VCwgUj4gPSB7fSwgLi4uYXJndilcblx0e1xuXHRcdGlmIChvcHRpb25zLnBhcnNlTGluZSlcblx0XHR7XG5cdFx0XHR0aGlzLnBhcnNlTGluZSA9IG9wdGlvbnMucGFyc2VMaW5lLmJpbmQodGhpcyk7XG5cdFx0fVxuXG5cdFx0aWYgKG9wdGlvbnMuc3RyaW5naWZ5TGluZSlcblx0XHR7XG5cdFx0XHR0aGlzLnN0cmluZ2lmeUxpbmUgPSBvcHRpb25zLnN0cmluZ2lmeUxpbmUuYmluZCh0aGlzKTtcblx0XHR9XG5cblx0XHRpZiAob3B0aW9ucy5maWx0ZXIpXG5cdFx0e1xuXHRcdFx0dGhpcy5maWx0ZXIgPSBvcHRpb25zLmZpbHRlci5iaW5kKHRoaXMpO1xuXHRcdH1cblxuXHRcdGlmIChvcHRpb25zLm1hcHBlcilcblx0XHR7XG5cdFx0XHR0aGlzLmRlZmF1bHRPcHRpb25zLm1hcHBlciA9IG9wdGlvbnMubWFwcGVyLmJpbmQodGhpcyk7XG5cdFx0fVxuXHR9XG5cblx0c3RhdGljIGNyZWF0ZShvcHRpb25zOiBJT3B0aW9uczxhbnksIGFueT4gPSB7fSwgLi4uYXJndilcblx0e1xuXHRcdHJldHVybiBuZXcgdGhpcyhvcHRpb25zLCAuLi5hcmd2KTtcblx0fVxuXG5cdHBhcnNlTGluZShpbnB1dDogc3RyaW5nKTogUlxuXHR7XG5cdFx0cmV0dXJuIGlucHV0IGFzIGFueSBhcyBSXG5cdH1cblxuXHRzdHJpbmdpZnlMaW5lKGRhdGE6IFIpOiBzdHJpbmdcblx0e1xuXHRcdHJldHVybiBkYXRhLnRvU3RyaW5nKCk7XG5cdH1cblxuXHRzZXJpYWxpemUoZGF0YTogUltdKTogc3RyaW5nXG5cdHtcblx0XHRsZXQgc2VsZiA9IHRoaXM7XG5cblx0XHRyZXR1cm4gZGF0YS5tYXAoZnVuY3Rpb24gKGQpXG5cdFx0e1xuXHRcdFx0cmV0dXJuIHNlbGYuc3RyaW5naWZ5TGluZShkKTtcblx0XHR9KS5qb2luKExGKTtcblx0fVxuXG5cdGZpbHRlcihpbnB1dDogc3RyaW5nKVxuXHR7XG5cdFx0cmV0dXJuIGlucHV0XG5cdH1cblxuXHRsb2FkKGZpbGU6IHN0cmluZywgb3B0aW9uczogSU9wdGlvbnM8VCwgUj4gPSB7fSk6IFByb21pc2U8VD5cblx0e1xuXHRcdHJldHVybiB3cmFwU3RyZWFtVG9Qcm9taXNlKHRoaXMubG9hZFN0cmVhbShmaWxlLCBvcHRpb25zKSlcblx0XHRcdC50aGVuKGZ1bmN0aW9uIChzdHJlYW06IElTdHJlYW1MaW5lV2l0aFZhbHVlPFQ+KVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gc3RyZWFtLnZhbHVlO1xuXHRcdFx0fSlcblx0XHRcdDtcblx0fVxuXG5cdGxvYWRTeW5jKGZpbGU6IHN0cmluZywgb3B0aW9uczogSU9wdGlvbnM8VCwgUj4gPSB7fSlcblx0e1xuXHRcdGxldCByID0gdGhpcy5sb2FkU3RyZWFtU3luYyhmaWxlLCBvcHRpb25zKTtcblx0XHRsZXQgdmFsdWUgPSByLnZhbHVlO1xuXHRcdC8vIOippuWcluaJi+WLlea4hemZpOiomOaGtumrlOWNoOeUqFxuXHRcdHIgPSB1bmRlZmluZWQ7XG5cdFx0cmV0dXJuIHZhbHVlO1xuXHR9XG5cblx0bG9hZFN0cmVhbShmaWxlOiBzdHJpbmcsIG9wdGlvbnM6IElPcHRpb25zPFQsIFI+ID0ge30sIGNhbGxiYWNrPzogSUNhbGxiYWNrPFQ+KVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX2NyZWF0ZVN0cmVhbShjcmVhdGVMb2FkU3RyZWFtLCBmaWxlLCBvcHRpb25zLCBjYWxsYmFjaylcblx0fVxuXG5cdGxvYWRTdHJlYW1TeW5jKGZpbGU6IHN0cmluZywgb3B0aW9uczogSU9wdGlvbnM8VCwgUj4gPSB7fSwgY2FsbGJhY2s/OiBJQ2FsbGJhY2s8VD4pXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fY3JlYXRlU3RyZWFtKGNyZWF0ZUxvYWRTdHJlYW1TeW5jLCBmaWxlLCBvcHRpb25zLCBjYWxsYmFjaylcblx0fVxuXG5cdHByb3RlY3RlZCBfY3JlYXRlU3RyZWFtPFQ+KGZuU3RyZWFtOiB0eXBlb2YgY3JlYXRlTG9hZFN0cmVhbSxcblx0XHRmaWxlOiBzdHJpbmcsXG5cdFx0b3B0aW9uczogSU9wdGlvbnM8VCwgUj4gPSB7fSxcblx0XHRjYWxsYmFjaz86IElDYWxsYmFjazxUPlxuXHQpXG5cdHtcblx0XHRsZXQgc2VsZiA9IHRoaXM7XG5cblx0XHRsZXQgb3B0cyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuZGVmYXVsdE9wdGlvbnMsIG9wdGlvbnMpO1xuXG5cdFx0bGV0IHBhcnNlTGluZSA9IG9wdHMucGFyc2VMaW5lIHx8IHNlbGYucGFyc2VMaW5lO1xuXHRcdGxldCBmaWx0ZXIgPSBvcHRzLmZpbHRlciB8fCBzZWxmLmZpbHRlcjtcblxuXHRcdG9wdHMucGFyc2VMaW5lID0gcGFyc2VMaW5lO1xuXG5cdFx0bGV0IHN0cmVhbSA9IGZuU3RyZWFtPFQ+KGZpbGUsIHtcblxuXHRcdFx0Y2FsbGJhY2ssXG5cblx0XHRcdG1hcHBlcjogb3B0cy5tYXBwZXIgfHwgZnVuY3Rpb24gbWFwcGVyKGxpbmUpXG5cdFx0XHR7XG5cdFx0XHRcdGlmIChmaWx0ZXIpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsaW5lID0gZmlsdGVyKGxpbmUpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKGxpbmUpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0cmV0dXJuIHBhcnNlTGluZShsaW5lLCBzZWxmLnBhcnNlTGluZSk7XG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cblx0XHR9KTtcblxuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRzdHJlYW0ucGlwZUxvYWRlciA9IHNlbGY7XG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdHN0cmVhbS5waXBlUnVudGltZU9wdGlvbnMgPSBvcHRzO1xuXG5cdFx0cmV0dXJuIHN0cmVhbTtcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBMb2FkZXJDbGFzcztcbiJdfQ==