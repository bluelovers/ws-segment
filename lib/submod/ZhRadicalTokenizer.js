'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = exports.ZhRadicalTokenizer = void 0;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiWmhSYWRpY2FsVG9rZW5pemVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiWmhSYWRpY2FsVG9rZW5pemVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7O0FBRWIsZ0NBQThFO0FBTzlFOzs7O0dBSUc7QUFDSCxNQUFhLGtCQUFtQixTQUFRLHlCQUFtQjtJQUEzRDs7UUFHQyxTQUFJLEdBQUcsb0JBQW9CLENBQUM7SUFzRDdCLENBQUM7SUFqRFUsTUFBTSxDQUFDLEdBQUcsSUFBSTtRQUV2QixLQUFLLENBQUMsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7SUFDdkIsQ0FBQztJQUVELEtBQUssQ0FBQyxLQUFjO1FBRW5CLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQ3JELENBQUM7SUFFRCxjQUFjLENBQUMsSUFBWSxFQUFFLEdBQVk7UUFFeEMsSUFBSSxHQUFHLEdBQVksRUFBRSxDQUFDO1FBQ3RCLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQztRQUVoQixJQUFJLEVBQUUsR0FBRyxpQkFBaUIsQ0FBQztRQUUzQixJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFDbEI7WUFDQyxPQUFPLElBQUksQ0FBQztTQUNaO1FBRUQsSUFBSTthQUNGLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQzthQUMzQixPQUFPLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQztZQUV0QixJQUFJLENBQUMsS0FBSyxFQUFFLEVBQ1o7Z0JBQ0MsSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUNkO29CQUNDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQzt3QkFDeEIsQ0FBQztxQkFDRCxFQUFFO3dCQUNGLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUk7cUJBQ2pCLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztpQkFDVjtxQkFFRDtvQkFDQyxHQUFHLENBQUMsSUFBSSxDQUFDO3dCQUNSLENBQUM7cUJBQ0QsQ0FBQyxDQUFDO2lCQUNIO2FBQ0Q7UUFDRixDQUFDLENBQUMsQ0FDRjtRQUVELE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7SUFDaEMsQ0FBQztDQUVEO0FBekRELGdEQXlEQztBQUVZLFFBQUEsSUFBSSxHQUFHLGtCQUFrQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQTRDLENBQUM7QUFFaEgsa0JBQWUsa0JBQWtCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbmltcG9ydCB7IFN1YlNNb2R1bGUsIFN1YlNNb2R1bGVUb2tlbml6ZXIsIElTdWJUb2tlbml6ZXJDcmVhdGUgfSBmcm9tICcuLi9tb2QnO1xuaW1wb3J0IHsgU2VnbWVudCwgSVdvcmQsIElESUNULCBJRElDVDIgfSBmcm9tICcuLi9TZWdtZW50JztcbmltcG9ydCB7IGRlYnVnVG9rZW4gfSBmcm9tICcuLi91dGlsL2RlYnVnJztcbmltcG9ydCBVU3RyaW5nIGZyb20gJ3VuaS1zdHJpbmcnO1xuaW1wb3J0IHsgZGVidWcgfSBmcm9tICcuLi91dGlsJztcbmltcG9ydCB7IElXb3JkRGVidWdJbmZvIH0gZnJvbSAnLi4vdXRpbC9pbmRleCc7XG5cbi8qKlxuICog5q2k5qih57WE55uu5YmN54Sh5Lu75L2V55So6JmV6IiH5pWI5p6cXG4gKlxuICogQHRvZG8g6YOo6aaWXG4gKi9cbmV4cG9ydCBjbGFzcyBaaFJhZGljYWxUb2tlbml6ZXIgZXh0ZW5kcyBTdWJTTW9kdWxlVG9rZW5pemVyXG57XG5cblx0bmFtZSA9ICdaaFJhZGljYWxUb2tlbml6ZXInO1xuXG5cdHByb3RlY3RlZCBfVEFCTEU6IElESUNUPElXb3JkPjtcblx0cHJvdGVjdGVkIF9UQUJMRTI6IElESUNUMjxJV29yZD47XG5cblx0cHJvdGVjdGVkIF9jYWNoZSguLi5hcmd2KVxuXHR7XG5cdFx0c3VwZXIuX2NhY2hlKC4uLmFyZ3YpO1xuXHR9XG5cblx0c3BsaXQod29yZHM6IElXb3JkW10pOiBJV29yZFtdXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fc3BsaXRVbnNldCh3b3JkcywgdGhpcy5zcGxpdFpoUmFkaWNhbCk7XG5cdH1cblxuXHRzcGxpdFpoUmFkaWNhbCh0ZXh0OiBzdHJpbmcsIGN1cj86IG51bWJlcik6IElXb3JkW11cblx0e1xuXHRcdGxldCByZXQ6IElXb3JkW10gPSBbXTtcblx0XHRsZXQgc2VsZiA9IHRoaXM7XG5cblx0XHRsZXQgX3IgPSAvW1xcdTQxMzZcXHU0MTM3XS91O1xuXG5cdFx0aWYgKCFfci50ZXN0KHRleHQpKVxuXHRcdHtcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH1cblxuXHRcdHRleHRcblx0XHRcdC5zcGxpdCgvKFtcXHU0MTM2XFx1NDEzN10rKS91KVxuXHRcdFx0LmZvckVhY2goZnVuY3Rpb24gKHcsIGkpXG5cdFx0XHR7XG5cdFx0XHRcdGlmICh3ICE9PSAnJylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGlmIChfci50ZXN0KHcpKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHJldC5wdXNoKHNlbGYuZGVidWdUb2tlbih7XG5cdFx0XHRcdFx0XHRcdHcsXG5cdFx0XHRcdFx0XHR9LCB7XG5cdFx0XHRcdFx0XHRcdFtzZWxmLm5hbWVdOiB0cnVlLFxuXHRcdFx0XHRcdFx0fSwgdHJ1ZSkpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0cmV0LnB1c2goe1xuXHRcdFx0XHRcdFx0XHR3LFxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9KVxuXHRcdDtcblxuXHRcdHJldHVybiByZXQubGVuZ3RoID8gcmV0IDogbnVsbDtcblx0fVxuXG59XG5cbmV4cG9ydCBjb25zdCBpbml0ID0gWmhSYWRpY2FsVG9rZW5pemVyLmluaXQuYmluZChaaFJhZGljYWxUb2tlbml6ZXIpIGFzIElTdWJUb2tlbml6ZXJDcmVhdGU8WmhSYWRpY2FsVG9rZW5pemVyPjtcblxuZXhwb3J0IGRlZmF1bHQgWmhSYWRpY2FsVG9rZW5pemVyO1xuIl19