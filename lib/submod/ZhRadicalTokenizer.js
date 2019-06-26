'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const mod_1 = require("../mod");
/**
 * 此模組目前無任何用處與效果
 *
 * @todo 部首
 */
class ZhRadicalTokenizer extends mod_1.SubSModuleTokenizer {
    constructor() {
        super(...arguments);
        this.name = 'ZhRadicalTokenizer';
    }
    _cache(...argv) {
        super._cache(...argv);
    }
    split(words) {
        return this._splitUnset(words, this.splitZhRadical);
    }
    splitZhRadical(text, cur) {
        let ret = [];
        let self = this;
        let _r = /[\u4136\u4137]/u;
        if (!_r.test(text)) {
            return null;
        }
        text
            .split(/([\u4136\u4137]+)/u)
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
exports.ZhRadicalTokenizer = ZhRadicalTokenizer;
exports.init = ZhRadicalTokenizer.init.bind(ZhRadicalTokenizer);
exports.default = ZhRadicalTokenizer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiWmhSYWRpY2FsVG9rZW5pemVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiWmhSYWRpY2FsVG9rZW5pemVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7QUFFYixnQ0FBOEU7QUFPOUU7Ozs7R0FJRztBQUNILE1BQWEsa0JBQW1CLFNBQVEseUJBQW1CO0lBQTNEOztRQUdDLFNBQUksR0FBRyxvQkFBb0IsQ0FBQztJQXNEN0IsQ0FBQztJQWpEVSxNQUFNLENBQUMsR0FBRyxJQUFJO1FBRXZCLEtBQUssQ0FBQyxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztJQUN2QixDQUFDO0lBRUQsS0FBSyxDQUFDLEtBQWM7UUFFbkIsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7SUFDckQsQ0FBQztJQUVELGNBQWMsQ0FBQyxJQUFZLEVBQUUsR0FBWTtRQUV4QyxJQUFJLEdBQUcsR0FBWSxFQUFFLENBQUM7UUFDdEIsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBRWhCLElBQUksRUFBRSxHQUFHLGlCQUFpQixDQUFDO1FBRTNCLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUNsQjtZQUNDLE9BQU8sSUFBSSxDQUFDO1NBQ1o7UUFFRCxJQUFJO2FBQ0YsS0FBSyxDQUFDLG9CQUFvQixDQUFDO2FBQzNCLE9BQU8sQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDO1lBRXRCLElBQUksQ0FBQyxLQUFLLEVBQUUsRUFDWjtnQkFDQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQ2Q7b0JBQ0MsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDO3dCQUN4QixDQUFDO3FCQUNELEVBQUU7d0JBQ0YsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSTtxQkFDakIsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO2lCQUNWO3FCQUVEO29CQUNDLEdBQUcsQ0FBQyxJQUFJLENBQUM7d0JBQ1IsQ0FBQztxQkFDRCxDQUFDLENBQUM7aUJBQ0g7YUFDRDtRQUNGLENBQUMsQ0FBQyxDQUNGO1FBRUQsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztJQUNoQyxDQUFDO0NBRUQ7QUF6REQsZ0RBeURDO0FBRVksUUFBQSxJQUFJLEdBQUcsa0JBQWtCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBNEMsQ0FBQztBQUVoSCxrQkFBZSxrQkFBa0IsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IHsgU3ViU01vZHVsZSwgU3ViU01vZHVsZVRva2VuaXplciwgSVN1YlRva2VuaXplckNyZWF0ZSB9IGZyb20gJy4uL21vZCc7XG5pbXBvcnQgeyBTZWdtZW50LCBJV29yZCwgSURJQ1QsIElESUNUMiB9IGZyb20gJy4uL1NlZ21lbnQnO1xuaW1wb3J0IHsgZGVidWdUb2tlbiB9IGZyb20gJy4uL3V0aWwvZGVidWcnO1xuaW1wb3J0IFVTdHJpbmcgZnJvbSAndW5pLXN0cmluZyc7XG5pbXBvcnQgeyBkZWJ1ZyB9IGZyb20gJy4uL3V0aWwnO1xuaW1wb3J0IHsgSVdvcmREZWJ1Z0luZm8gfSBmcm9tICcuLi91dGlsL2luZGV4JztcblxuLyoqXG4gKiDmraTmqKHntYTnm67liY3nhKHku7vkvZXnlKjomZXoiIfmlYjmnpxcbiAqXG4gKiBAdG9kbyDpg6jpppZcbiAqL1xuZXhwb3J0IGNsYXNzIFpoUmFkaWNhbFRva2VuaXplciBleHRlbmRzIFN1YlNNb2R1bGVUb2tlbml6ZXJcbntcblxuXHRuYW1lID0gJ1poUmFkaWNhbFRva2VuaXplcic7XG5cblx0cHJvdGVjdGVkIF9UQUJMRTogSURJQ1Q8SVdvcmQ+O1xuXHRwcm90ZWN0ZWQgX1RBQkxFMjogSURJQ1QyPElXb3JkPjtcblxuXHRwcm90ZWN0ZWQgX2NhY2hlKC4uLmFyZ3YpXG5cdHtcblx0XHRzdXBlci5fY2FjaGUoLi4uYXJndik7XG5cdH1cblxuXHRzcGxpdCh3b3JkczogSVdvcmRbXSk6IElXb3JkW11cblx0e1xuXHRcdHJldHVybiB0aGlzLl9zcGxpdFVuc2V0KHdvcmRzLCB0aGlzLnNwbGl0WmhSYWRpY2FsKTtcblx0fVxuXG5cdHNwbGl0WmhSYWRpY2FsKHRleHQ6IHN0cmluZywgY3VyPzogbnVtYmVyKTogSVdvcmRbXVxuXHR7XG5cdFx0bGV0IHJldDogSVdvcmRbXSA9IFtdO1xuXHRcdGxldCBzZWxmID0gdGhpcztcblxuXHRcdGxldCBfciA9IC9bXFx1NDEzNlxcdTQxMzddL3U7XG5cblx0XHRpZiAoIV9yLnRlc3QodGV4dCkpXG5cdFx0e1xuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXG5cdFx0dGV4dFxuXHRcdFx0LnNwbGl0KC8oW1xcdTQxMzZcXHU0MTM3XSspL3UpXG5cdFx0XHQuZm9yRWFjaChmdW5jdGlvbiAodywgaSlcblx0XHRcdHtcblx0XHRcdFx0aWYgKHcgIT09ICcnKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0aWYgKF9yLnRlc3QodykpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0cmV0LnB1c2goc2VsZi5kZWJ1Z1Rva2VuKHtcblx0XHRcdFx0XHRcdFx0dyxcblx0XHRcdFx0XHRcdH0sIHtcblx0XHRcdFx0XHRcdFx0W3NlbGYubmFtZV06IHRydWUsXG5cdFx0XHRcdFx0XHR9LCB0cnVlKSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRyZXQucHVzaCh7XG5cdFx0XHRcdFx0XHRcdHcsXG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0pXG5cdFx0O1xuXG5cdFx0cmV0dXJuIHJldC5sZW5ndGggPyByZXQgOiBudWxsO1xuXHR9XG5cbn1cblxuZXhwb3J0IGNvbnN0IGluaXQgPSBaaFJhZGljYWxUb2tlbml6ZXIuaW5pdC5iaW5kKFpoUmFkaWNhbFRva2VuaXplcikgYXMgSVN1YlRva2VuaXplckNyZWF0ZTxaaFJhZGljYWxUb2tlbml6ZXI+O1xuXG5leHBvcnQgZGVmYXVsdCBaaFJhZGljYWxUb2tlbml6ZXI7XG4iXX0=