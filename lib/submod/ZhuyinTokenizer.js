'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = exports.ZhuyinTokenizer = void 0;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiWmh1eWluVG9rZW5pemVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiWmh1eWluVG9rZW5pemVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7O0FBRWIsZ0NBQThFO0FBTzlFOztHQUVHO0FBQ0gsTUFBYSxlQUFnQixTQUFRLHlCQUFtQjtJQUF4RDs7UUFHQyxTQUFJLEdBQUcsaUJBQWlCLENBQUM7SUF1RDFCLENBQUM7SUFsRFUsTUFBTSxDQUFDLEdBQUcsSUFBSTtRQUV2QixLQUFLLENBQUMsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7SUFDdkIsQ0FBQztJQUVELEtBQUssQ0FBQyxLQUFjO1FBRW5CLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ2xELENBQUM7SUFFRCxXQUFXLENBQUMsSUFBWSxFQUFFLEdBQVk7UUFFckMsSUFBSSxHQUFHLEdBQVksRUFBRSxDQUFDO1FBQ3RCLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQztRQUVoQixJQUFJLEVBQUUsR0FBRywrQkFBK0IsQ0FBQztRQUV6QyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFDbEI7WUFDQyxPQUFPLElBQUksQ0FBQztTQUNaO1FBRUQsSUFBSTthQUNGLEtBQUssQ0FBQyxrQ0FBa0MsQ0FBQzthQUN6QyxPQUFPLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQztZQUV0QixJQUFJLENBQUMsS0FBSyxFQUFFLEVBQ1o7Z0JBQ0MsSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUNkO29CQUNDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQzt3QkFDeEIsQ0FBQztxQkFDRCxFQUFFO3dCQUNGLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUk7cUJBQ2pCLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztpQkFDVjtxQkFHRDtvQkFDQyxHQUFHLENBQUMsSUFBSSxDQUFDO3dCQUNSLENBQUM7cUJBQ0QsQ0FBQyxDQUFDO2lCQUNIO2FBQ0Q7UUFDRixDQUFDLENBQUMsQ0FDRjtRQUVELE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7SUFDaEMsQ0FBQztDQUVEO0FBMURELDBDQTBEQztBQUVZLFFBQUEsSUFBSSxHQUFHLGVBQWUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBeUMsQ0FBQztBQUV2RyxrQkFBZSxlQUFlLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbmltcG9ydCB7IFN1YlNNb2R1bGUsIFN1YlNNb2R1bGVUb2tlbml6ZXIsIElTdWJUb2tlbml6ZXJDcmVhdGUgfSBmcm9tICcuLi9tb2QnO1xuaW1wb3J0IHsgU2VnbWVudCwgSVdvcmQsIElESUNULCBJRElDVDIgfSBmcm9tICcuLi9TZWdtZW50JztcbmltcG9ydCB7IGRlYnVnVG9rZW4gfSBmcm9tICcuLi91dGlsL2RlYnVnJztcbmltcG9ydCBVU3RyaW5nIGZyb20gJ3VuaS1zdHJpbmcnO1xuaW1wb3J0IHsgZGVidWcgfSBmcm9tICcuLi91dGlsJztcbmltcG9ydCB7IElXb3JkRGVidWdJbmZvIH0gZnJvbSAnLi4vdXRpbC9pbmRleCc7XG5cbi8qKlxuICog5rOo6Z+zXG4gKi9cbmV4cG9ydCBjbGFzcyBaaHV5aW5Ub2tlbml6ZXIgZXh0ZW5kcyBTdWJTTW9kdWxlVG9rZW5pemVyXG57XG5cblx0bmFtZSA9ICdaaHV5aW5Ub2tlbml6ZXInO1xuXG5cdHByb3RlY3RlZCBfVEFCTEU6IElESUNUPElXb3JkPjtcblx0cHJvdGVjdGVkIF9UQUJMRTI6IElESUNUMjxJV29yZD47XG5cblx0cHJvdGVjdGVkIF9jYWNoZSguLi5hcmd2KVxuXHR7XG5cdFx0c3VwZXIuX2NhY2hlKC4uLmFyZ3YpO1xuXHR9XG5cblx0c3BsaXQod29yZHM6IElXb3JkW10pOiBJV29yZFtdXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fc3BsaXRVbnNldCh3b3JkcywgdGhpcy5zcGxpdFpodXlpbik7XG5cdH1cblxuXHRzcGxpdFpodXlpbih0ZXh0OiBzdHJpbmcsIGN1cj86IG51bWJlcik6IElXb3JkW11cblx0e1xuXHRcdGxldCByZXQ6IElXb3JkW10gPSBbXTtcblx0XHRsZXQgc2VsZiA9IHRoaXM7XG5cblx0XHRsZXQgX3IgPSAvW1xcdTMxQTAtXFx1MzFCQVxcdTMxMDUtXFx1MzEyRV0vdTtcblxuXHRcdGlmICghX3IudGVzdCh0ZXh0KSlcblx0XHR7XG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9XG5cblx0XHR0ZXh0XG5cdFx0XHQuc3BsaXQoLyhbXFx1MzFBMC1cXHUzMUJBXFx1MzEwNS1cXHUzMTJFXSspL3UpXG5cdFx0XHQuZm9yRWFjaChmdW5jdGlvbiAodywgaSlcblx0XHRcdHtcblx0XHRcdFx0aWYgKHcgIT09ICcnKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0aWYgKF9yLnRlc3QodykpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0cmV0LnB1c2goc2VsZi5kZWJ1Z1Rva2VuKHtcblx0XHRcdFx0XHRcdFx0dyxcblx0XHRcdFx0XHRcdH0sIHtcblx0XHRcdFx0XHRcdFx0W3NlbGYubmFtZV06IHRydWUsXG5cdFx0XHRcdFx0XHR9LCB0cnVlKSk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHJldC5wdXNoKHtcblx0XHRcdFx0XHRcdFx0dyxcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSlcblx0XHQ7XG5cblx0XHRyZXR1cm4gcmV0Lmxlbmd0aCA/IHJldCA6IG51bGw7XG5cdH1cblxufVxuXG5leHBvcnQgY29uc3QgaW5pdCA9IFpodXlpblRva2VuaXplci5pbml0LmJpbmQoWmh1eWluVG9rZW5pemVyKSBhcyBJU3ViVG9rZW5pemVyQ3JlYXRlPFpodXlpblRva2VuaXplcj47XG5cbmV4cG9ydCBkZWZhdWx0IFpodXlpblRva2VuaXplcjtcbiJdfQ==