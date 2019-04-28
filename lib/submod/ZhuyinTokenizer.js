'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const mod_1 = require("../mod");
/**
 * 注音
 */
class ZhuyinTokenizer extends mod_1.SubSModuleTokenizer {
    constructor() {
        super(...arguments);
        this.name = 'ZhuyinTokenizer';
    }
    _cache(...argv) {
        super._cache(...argv);
    }
    split(words) {
        return this._splitUnset(words, this.splitZhuyin);
    }
    splitZhuyin(text, cur) {
        let ret = [];
        let self = this;
        let _r = /[\u31A0-\u31BA\u3105-\u312E]/u;
        if (!_r.test(text)) {
            return null;
        }
        text
            .split(/([\u31A0-\u31BA\u3105-\u312E]+)/u)
            .forEach(function (w, i) {
            if (w !== '') {
                if (_r.test(w)) {
                    ret.push(self.debugToken({
                        w,
                    }, {
                        [self.name]: true,
                    }, true));
                }
                else {
                    ret.push({
                        w,
                    });
                }
            }
        });
        return ret.length ? ret : null;
    }
}
exports.ZhuyinTokenizer = ZhuyinTokenizer;
exports.init = ZhuyinTokenizer.init.bind(ZhuyinTokenizer);
exports.default = ZhuyinTokenizer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiWmh1eWluVG9rZW5pemVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiWmh1eWluVG9rZW5pemVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7QUFFYixnQ0FBOEU7QUFPOUU7O0dBRUc7QUFDSCxNQUFhLGVBQWdCLFNBQVEseUJBQW1CO0lBQXhEOztRQUdDLFNBQUksR0FBRyxpQkFBaUIsQ0FBQztJQXVEMUIsQ0FBQztJQWxEVSxNQUFNLENBQUMsR0FBRyxJQUFJO1FBRXZCLEtBQUssQ0FBQyxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztJQUN2QixDQUFDO0lBRUQsS0FBSyxDQUFDLEtBQWM7UUFFbkIsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDbEQsQ0FBQztJQUVELFdBQVcsQ0FBQyxJQUFZLEVBQUUsR0FBWTtRQUVyQyxJQUFJLEdBQUcsR0FBWSxFQUFFLENBQUM7UUFDdEIsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBRWhCLElBQUksRUFBRSxHQUFHLCtCQUErQixDQUFDO1FBRXpDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUNsQjtZQUNDLE9BQU8sSUFBSSxDQUFDO1NBQ1o7UUFFRCxJQUFJO2FBQ0YsS0FBSyxDQUFDLGtDQUFrQyxDQUFDO2FBQ3pDLE9BQU8sQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDO1lBRXRCLElBQUksQ0FBQyxLQUFLLEVBQUUsRUFDWjtnQkFDQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQ2Q7b0JBQ0MsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDO3dCQUN4QixDQUFDO3FCQUNELEVBQUU7d0JBQ0YsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSTtxQkFDakIsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO2lCQUNWO3FCQUdEO29CQUNDLEdBQUcsQ0FBQyxJQUFJLENBQUM7d0JBQ1IsQ0FBQztxQkFDRCxDQUFDLENBQUM7aUJBQ0g7YUFDRDtRQUNGLENBQUMsQ0FBQyxDQUNGO1FBRUQsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztJQUNoQyxDQUFDO0NBRUQ7QUExREQsMENBMERDO0FBRVksUUFBQSxJQUFJLEdBQUcsZUFBZSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUF5QyxDQUFDO0FBRXZHLGtCQUFlLGVBQWUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IHsgU3ViU01vZHVsZSwgU3ViU01vZHVsZVRva2VuaXplciwgSVN1YlRva2VuaXplckNyZWF0ZSB9IGZyb20gJy4uL21vZCc7XG5pbXBvcnQgeyBTZWdtZW50LCBJV29yZCwgSURJQ1QsIElESUNUMiB9IGZyb20gJy4uL1NlZ21lbnQnO1xuaW1wb3J0IHsgZGVidWdUb2tlbiB9IGZyb20gJy4uL3V0aWwvZGVidWcnO1xuaW1wb3J0IFVTdHJpbmcgPSByZXF1aXJlKCd1bmktc3RyaW5nJyk7XG5pbXBvcnQgeyBkZWJ1ZyB9IGZyb20gJy4uL3V0aWwnO1xuaW1wb3J0IHsgSVdvcmREZWJ1Z0luZm8gfSBmcm9tICcuLi91dGlsL2luZGV4JztcblxuLyoqXG4gKiDms6jpn7NcbiAqL1xuZXhwb3J0IGNsYXNzIFpodXlpblRva2VuaXplciBleHRlbmRzIFN1YlNNb2R1bGVUb2tlbml6ZXJcbntcblxuXHRuYW1lID0gJ1podXlpblRva2VuaXplcic7XG5cblx0cHJvdGVjdGVkIF9UQUJMRTogSURJQ1Q8SVdvcmQ+O1xuXHRwcm90ZWN0ZWQgX1RBQkxFMjogSURJQ1QyPElXb3JkPjtcblxuXHRwcm90ZWN0ZWQgX2NhY2hlKC4uLmFyZ3YpXG5cdHtcblx0XHRzdXBlci5fY2FjaGUoLi4uYXJndik7XG5cdH1cblxuXHRzcGxpdCh3b3JkczogSVdvcmRbXSk6IElXb3JkW11cblx0e1xuXHRcdHJldHVybiB0aGlzLl9zcGxpdFVuc2V0KHdvcmRzLCB0aGlzLnNwbGl0Wmh1eWluKTtcblx0fVxuXG5cdHNwbGl0Wmh1eWluKHRleHQ6IHN0cmluZywgY3VyPzogbnVtYmVyKTogSVdvcmRbXVxuXHR7XG5cdFx0bGV0IHJldDogSVdvcmRbXSA9IFtdO1xuXHRcdGxldCBzZWxmID0gdGhpcztcblxuXHRcdGxldCBfciA9IC9bXFx1MzFBMC1cXHUzMUJBXFx1MzEwNS1cXHUzMTJFXS91O1xuXG5cdFx0aWYgKCFfci50ZXN0KHRleHQpKVxuXHRcdHtcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH1cblxuXHRcdHRleHRcblx0XHRcdC5zcGxpdCgvKFtcXHUzMUEwLVxcdTMxQkFcXHUzMTA1LVxcdTMxMkVdKykvdSlcblx0XHRcdC5mb3JFYWNoKGZ1bmN0aW9uICh3LCBpKVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAodyAhPT0gJycpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRpZiAoX3IudGVzdCh3KSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRyZXQucHVzaChzZWxmLmRlYnVnVG9rZW4oe1xuXHRcdFx0XHRcdFx0XHR3LFxuXHRcdFx0XHRcdFx0fSwge1xuXHRcdFx0XHRcdFx0XHRbc2VsZi5uYW1lXTogdHJ1ZSxcblx0XHRcdFx0XHRcdH0sIHRydWUpKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0cmV0LnB1c2goe1xuXHRcdFx0XHRcdFx0XHR3LFxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9KVxuXHRcdDtcblxuXHRcdHJldHVybiByZXQubGVuZ3RoID8gcmV0IDogbnVsbDtcblx0fVxuXG59XG5cbmV4cG9ydCBjb25zdCBpbml0ID0gWmh1eWluVG9rZW5pemVyLmluaXQuYmluZChaaHV5aW5Ub2tlbml6ZXIpIGFzIElTdWJUb2tlbml6ZXJDcmVhdGU8Wmh1eWluVG9rZW5pemVyPjtcblxuZXhwb3J0IGRlZmF1bHQgWmh1eWluVG9rZW5pemVyO1xuIl19