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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiX2NsYXNzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiX2NsYXNzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7R0FFRzs7Ozs7Ozs7QUFHSCxtREFBb0M7QUFDcEMscUNBQXVFO0FBQ3ZFLHlDQUEyRDtBQUMzRCxxQ0FBOEM7QUFDOUMscURBQTJDO0FBZTNDLElBQWEsV0FBVyxHQUF4QixNQUFhLFdBQVc7SUFLdkIsWUFBWSxVQUEwQixFQUFFLEVBQUUsR0FBRyxJQUFJO1FBSDFDLFlBQU8sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1FBSzFCLElBQUksT0FBTyxDQUFDLFNBQVMsRUFDckI7WUFDQyxJQUFJLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQzlDO1FBRUQsSUFBSSxPQUFPLENBQUMsYUFBYSxFQUN6QjtZQUNDLElBQUksQ0FBQyxhQUFhLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDdEQ7UUFFRCxJQUFJLE9BQU8sQ0FBQyxNQUFNLEVBQ2xCO1lBQ0MsSUFBSSxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN4QztRQUVELElBQUksT0FBTyxDQUFDLE1BQU0sRUFDbEI7WUFDQyxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN2RDtJQUNGLENBQUM7SUFFRCxNQUFNLENBQUMsTUFBTSxDQUFDLFVBQThCLEVBQUUsRUFBRSxHQUFHLElBQUk7UUFFdEQsT0FBTyxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztJQUNuQyxDQUFDO0lBRUQsU0FBUyxDQUFDLEtBQWE7UUFFdEIsT0FBTyxLQUFpQixDQUFBO0lBQ3pCLENB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LGtDQUFXO0FBbUl4QixrQkFBZSxXQUFXLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgdXNlciBvbiAyMDE4LzQvMTMvMDEzLlxuICovXG5cbmltcG9ydCBQcm9taXNlID0gcmVxdWlyZSgnYmx1ZWJpcmQnKTtcbmltcG9ydCB7IExGIH0gZnJvbSAnY3JsZi1ub3JtYWxpemUnO1xuaW1wb3J0IHsgd3JhcFN0cmVhbVRvUHJvbWlzZSwgSVN0cmVhbUxpbmVXaXRoVmFsdWUgfSBmcm9tICcuLi9mcy9saW5lJztcbmltcG9ydCBjcmVhdGVMb2FkU3RyZWFtLCB7IElDYWxsYmFjayB9IGZyb20gJy4uL2ZzL3N0cmVhbSc7XG5pbXBvcnQgY3JlYXRlTG9hZFN0cmVhbVN5bmMgZnJvbSAnLi4vZnMvc3luYyc7XG5pbXBvcnQgeyBhdXRvYmluZCB9IGZyb20gJ2NvcmUtZGVjb3JhdG9ycyc7XG5cbmV4cG9ydCB0eXBlIElPcHRpb25zPFQsIFI+ID0ge1xuXG5cdHBhcnNlTGluZT8oaW5wdXQ6IHN0cmluZywgb2xkRm4/OiAoaW5wdXQ6IHN0cmluZykgPT4gUik6IFIsXG5cblx0bWFwcGVyPyhsaW5lKSxcblxuXHRmaWx0ZXI/KGxpbmUpLFxuXG5cdHN0cmluZ2lmeUxpbmU/KGRhdGE6IFIpOiBzdHJpbmcsXG5cbn07XG5cbkBhdXRvYmluZFxuZXhwb3J0IGNsYXNzIExvYWRlckNsYXNzPFQsIFI+XG57XG5cdHB1YmxpYyBkZWZhdWx0ID0gdGhpcy5sb2FkO1xuXHRwcm90ZWN0ZWQgZGVmYXVsdE9wdGlvbnM6IElPcHRpb25zPFQsIFI+O1xuXG5cdGNvbnN0cnVjdG9yKG9wdGlvbnM6IElPcHRpb25zPFQsIFI+ID0ge30sIC4uLmFyZ3YpXG5cdHtcblx0XHRpZiAob3B0aW9ucy5wYXJzZUxpbmUpXG5cdFx0e1xuXHRcdFx0dGhpcy5wYXJzZUxpbmUgPSBvcHRpb25zLnBhcnNlTGluZS5iaW5kKHRoaXMpO1xuXHRcdH1cblxuXHRcdGlmIChvcHRpb25zLnN0cmluZ2lmeUxpbmUpXG5cdFx0e1xuXHRcdFx0dGhpcy5zdHJpbmdpZnlMaW5lID0gb3B0aW9ucy5zdHJpbmdpZnlMaW5lLmJpbmQodGhpcyk7XG5cdFx0fVxuXG5cdFx0aWYgKG9wdGlvbnMuZmlsdGVyKVxuXHRcdHtcblx0XHRcdHRoaXMuZmlsdGVyID0gb3B0aW9ucy5maWx0ZXIuYmluZCh0aGlzKTtcblx0XHR9XG5cblx0XHRpZiAob3B0aW9ucy5tYXBwZXIpXG5cdFx0e1xuXHRcdFx0dGhpcy5kZWZhdWx0T3B0aW9ucy5tYXBwZXIgPSBvcHRpb25zLm1hcHBlci5iaW5kKHRoaXMpO1xuXHRcdH1cblx0fVxuXG5cdHN0YXRpYyBjcmVhdGUob3B0aW9uczogSU9wdGlvbnM8YW55LCBhbnk+ID0ge30sIC4uLmFyZ3YpXG5cdHtcblx0XHRyZXR1cm4gbmV3IHRoaXMob3B0aW9ucywgLi4uYXJndik7XG5cdH1cblxuXHRwYXJzZUxpbmUoaW5wdXQ6IHN0cmluZyk6IFJcblx0e1xuXHRcdHJldHVybiBpbnB1dCBhcyBhbnkgYXMgUlxuXHR9XG5cblx0c3RyaW5naWZ5TGluZShkYXRhOiBSKTogc3RyaW5nXG5cdHtcblx0XHRyZXR1cm4gZGF0YS50b1N0cmluZygpO1xuXHR9XG5cblx0c2VyaWFsaXplKGRhdGE6IFJbXSk6IHN0cmluZ1xuXHR7XG5cdFx0bGV0IHNlbGYgPSB0aGlzO1xuXG5cdFx0cmV0dXJuIGRhdGEubWFwKGZ1bmN0aW9uIChkKVxuXHRcdHtcblx0XHRcdHJldHVybiBzZWxmLnN0cmluZ2lmeUxpbmUoZCk7XG5cdFx0fSkuam9pbihMRik7XG5cdH1cblxuXHRmaWx0ZXIoaW5wdXQ6IHN0cmluZylcblx0e1xuXHRcdHJldHVybiBpbnB1dFxuXHR9XG5cblx0bG9hZChmaWxlOiBzdHJpbmcsIG9wdGlvbnM6IElPcHRpb25zPFQsIFI+ID0ge30pOiBQcm9taXNlPFQ+XG5cdHtcblx0XHRyZXR1cm4gd3JhcFN0cmVhbVRvUHJvbWlzZSh0aGlzLmxvYWRTdHJlYW0oZmlsZSwgb3B0aW9ucykpXG5cdFx0XHQudGhlbihmdW5jdGlvbiAoc3RyZWFtOiBJU3RyZWFtTGluZVdpdGhWYWx1ZTxUPilcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIHN0cmVhbS52YWx1ZTtcblx0XHRcdH0pXG5cdFx0XHQ7XG5cdH1cblxuXHRsb2FkU3luYyhmaWxlOiBzdHJpbmcsIG9wdGlvbnM6IElPcHRpb25zPFQsIFI+ID0ge30pXG5cdHtcblx0XHRsZXQgciA9IHRoaXMubG9hZFN0cmVhbVN5bmMoZmlsZSwgb3B0aW9ucyk7XG5cdFx0bGV0IHZhbHVlID0gci52YWx1ZTtcblx0XHQvLyDoqablnJbmiYvli5XmuIXpmaToqJjmhrbpq5TljaDnlKhcblx0XHRyID0gdW5kZWZpbmVkO1xuXHRcdHJldHVybiB2YWx1ZTtcblx0fVxuXG5cdGxvYWRTdHJlYW0oZmlsZTogc3RyaW5nLCBvcHRpb25zOiBJT3B0aW9uczxULCBSPiA9IHt9LCBjYWxsYmFjaz86IElDYWxsYmFjazxUPilcblx0e1xuXHRcdHJldHVybiB0aGlzLl9jcmVhdGVTdHJlYW0oY3JlYXRlTG9hZFN0cmVhbSwgZmlsZSwgb3B0aW9ucywgY2FsbGJhY2spXG5cdH1cblxuXHRsb2FkU3RyZWFtU3luYyhmaWxlOiBzdHJpbmcsIG9wdGlvbnM6IElPcHRpb25zPFQsIFI+ID0ge30sIGNhbGxiYWNrPzogSUNhbGxiYWNrPFQ+KVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX2NyZWF0ZVN0cmVhbShjcmVhdGVMb2FkU3RyZWFtU3luYywgZmlsZSwgb3B0aW9ucywgY2FsbGJhY2spXG5cdH1cblxuXHRwcm90ZWN0ZWQgX2NyZWF0ZVN0cmVhbTxUPihmblN0cmVhbTogdHlwZW9mIGNyZWF0ZUxvYWRTdHJlYW0sXG5cdFx0ZmlsZTogc3RyaW5nLFxuXHRcdG9wdGlvbnM6IElPcHRpb25zPFQsIFI+ID0ge30sXG5cdFx0Y2FsbGJhY2s/OiBJQ2FsbGJhY2s8VD5cblx0KVxuXHR7XG5cdFx0bGV0IHNlbGYgPSB0aGlzO1xuXG5cdFx0bGV0IG9wdHMgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLmRlZmF1bHRPcHRpb25zLCBvcHRpb25zKTtcblxuXHRcdGxldCBwYXJzZUxpbmUgPSBvcHRzLnBhcnNlTGluZSB8fCBzZWxmLnBhcnNlTGluZTtcblx0XHRsZXQgZmlsdGVyID0gb3B0cy5maWx0ZXIgfHwgc2VsZi5maWx0ZXI7XG5cblx0XHRvcHRzLnBhcnNlTGluZSA9IHBhcnNlTGluZTtcblxuXHRcdGxldCBzdHJlYW0gPSBmblN0cmVhbTxUPihmaWxlLCB7XG5cblx0XHRcdGNhbGxiYWNrLFxuXG5cdFx0XHRtYXBwZXI6IG9wdHMubWFwcGVyIHx8IGZ1bmN0aW9uIG1hcHBlcihsaW5lKVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAoZmlsdGVyKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bGluZSA9IGZpbHRlcihsaW5lKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmIChsaW5lKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRcdHJldHVybiBwYXJzZUxpbmUobGluZSwgc2VsZi5wYXJzZUxpbmUpO1xuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXG5cdFx0fSk7XG5cblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0c3RyZWFtLnBpcGVMb2FkZXIgPSBzZWxmO1xuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRzdHJlYW0ucGlwZVJ1bnRpbWVPcHRpb25zID0gb3B0cztcblxuXHRcdHJldHVybiBzdHJlYW07XG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgTG9hZGVyQ2xhc3M7XG4iXX0=