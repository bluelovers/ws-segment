"use strict";
/**
 * Created by user on 2018/3/14/014.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Loader = exports.serialize = exports.stringifyLine = exports.parseLine = exports.loadStreamSync = exports.loadStream = exports.loadSync = exports.load = void 0;
const _class_1 = require("../_class");
const libLoader = new _class_1.LoaderClass({
    parseLine(input) {
        let ret = input
            .replace(/^\s+|\s+$/, '')
            .split(',');
        if (ret.length < 2) {
            throw new ReferenceError(`${input}`);
        }
        return ret.map(function (s) {
            s = s
                .replace(/^\s+|\s+$/, '')
                .trim();
            if (s == '') {
                throw new ReferenceError(`${input}`);
            }
            return s;
        });
    },
    filter(line) {
        line = line
            .replace(/\uFEFF/g, '')
            .trim()
            .replace(/^\s+|\s+$/, '');
        if (line && line.indexOf('\/\/') != 0) {
            return line;
        }
    },
});
exports.load = libLoader.load;
exports.loadSync = libLoader.loadSync;
exports.loadStream = libLoader.loadStream;
exports.loadStreamSync = libLoader.loadStreamSync;
exports.parseLine = libLoader.parseLine;
exports.stringifyLine = libLoader.stringifyLine;
exports.serialize = libLoader.serialize;
exports.Loader = libLoader;
exports.default = libLoader.load;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3lub255bS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInN5bm9ueW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztHQUVHOzs7QUFNSCxzQ0FBd0M7QUFLeEMsTUFBTSxTQUFTLEdBQUcsSUFBSSxvQkFBVyxDQUFrQjtJQUNsRCxTQUFTLENBQUMsS0FBYTtRQUV0QixJQUFJLEdBQUcsR0FBRyxLQUFLO2FBQ2IsT0FBTyxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUM7YUFDeEIsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUNYO1FBRUQsSUFBSSxHQUFHLENBQUMsTUFBTSxHQUFHLENBQUMsRUFDbEI7WUFDQyxNQUFNLElBQUksY0FBYyxDQUFDLEdBQUcsS0FBSyxFQUFFLENBQUMsQ0FBQztTQUNyQztRQUVELE9BQU8sR0FBRyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQVM7WUFFakMsQ0FBQyxHQUFHLENBQUM7aUJBQ0gsT0FBTyxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUM7aUJBQ3hCLElBQUksRUFBRSxDQUNQO1lBRUQsSUFBSSxDQUFDLElBQUksRUFBRSxFQUNYO2dCQUNDLE1BQU0sSUFBSSxjQUFjLENBQUMsR0FBRyxLQUFLLEVBQUUsQ0FBQyxDQUFDO2FBQ3JDO1lBRUQsT0FBTyxDQUFDLENBQUM7UUFDVixDQUFDLENBQUMsQ0FBQztJQUNKLENBQUM7SUFFRCxNQUFNLENBQUMsSUFBWTtRQUVsQixJQUFJLEdBQUcsSUFBSTthQUNULE9BQU8sQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDO2FBQ3RCLElBQUksRUFBRTthQUNOLE9BQU8sQ0FBQyxXQUFXLEVBQUUsRUFBRSxDQUFDLENBQ3pCO1FBRUQsSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQ3JDO1lBQ0MsT0FBTyxJQUFJLENBQUM7U0FDWjtJQUNGLENBQUM7Q0FFRCxDQUFDLENBQUM7QUFFVSxRQUFBLElBQUksR0FBRyxTQUFTLENBQUMsSUFBNkIsQ0FBQztBQUMvQyxRQUFBLFFBQVEsR0FBRyxTQUFTLENBQUMsUUFBcUMsQ0FBQztBQUUzRCxRQUFBLFVBQVUsR0FBRyxTQUFTLENBQUMsVUFBeUMsQ0FBQztBQUNqRSxRQUFBLGNBQWMsR0FBRyxTQUFTLENBQUMsY0FBaUQsQ0FBQztBQUU3RSxRQUFBLFNBQVMsR0FBRyxTQUFTLENBQUMsU0FBdUMsQ0FBQztBQUM5RCxRQUFBLGFBQWEsR0FBRyxTQUFTLENBQUMsYUFBK0MsQ0FBQztBQUUxRSxRQUFBLFNBQVMsR0FBRyxTQUFTLENBQUMsU0FBdUMsQ0FBQztBQUU5RCxRQUFBLE1BQU0sR0FBRyxTQUFTLENBQUM7QUFFaEMsa0JBQWUsU0FBUyxDQUFDLElBQUksQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTgvMy8xNC8wMTQuXG4gKi9cblxuaW1wb3J0IHsgd3JhcFN0cmVhbVRvUHJvbWlzZSwgSVN0cmVhbUxpbmVXaXRoVmFsdWUgfSBmcm9tICcuLi8uLi9mcy9saW5lJztcbmltcG9ydCBQcm9taXNlID0gcmVxdWlyZSgnYmx1ZWJpcmQnKTtcbmltcG9ydCBjcmVhdGVMb2FkU3RyZWFtLCB7IElDYWxsYmFjayB9IGZyb20gJy4uLy4uL2ZzL3N0cmVhbSc7XG5pbXBvcnQgY3JlYXRlTG9hZFN0cmVhbVN5bmMgZnJvbSAnLi4vLi4vZnMvc3luYyc7XG5pbXBvcnQgeyBMb2FkZXJDbGFzcyB9IGZyb20gJy4uL19jbGFzcyc7XG5cbmV4cG9ydCB0eXBlIElEaWN0Um93ID0gc3RyaW5nW107XG5leHBvcnQgdHlwZSBJRGljdCA9IElEaWN0Um93W107XG5cbmNvbnN0IGxpYkxvYWRlciA9IG5ldyBMb2FkZXJDbGFzczxJRGljdCwgSURpY3RSb3c+KHtcblx0cGFyc2VMaW5lKGlucHV0OiBzdHJpbmcpOiBJRGljdFJvd1xuXHR7XG5cdFx0bGV0IHJldCA9IGlucHV0XG5cdFx0XHQucmVwbGFjZSgvXlxccyt8XFxzKyQvLCAnJylcblx0XHRcdC5zcGxpdCgnLCcpXG5cdFx0O1xuXG5cdFx0aWYgKHJldC5sZW5ndGggPCAyKVxuXHRcdHtcblx0XHRcdHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihgJHtpbnB1dH1gKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gcmV0Lm1hcChmdW5jdGlvbiAoczogc3RyaW5nKVxuXHRcdHtcblx0XHRcdHMgPSBzXG5cdFx0XHRcdC5yZXBsYWNlKC9eXFxzK3xcXHMrJC8sICcnKVxuXHRcdFx0XHQudHJpbSgpXG5cdFx0XHQ7XG5cblx0XHRcdGlmIChzID09ICcnKVxuXHRcdFx0e1xuXHRcdFx0XHR0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoYCR7aW5wdXR9YCk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBzO1xuXHRcdH0pO1xuXHR9LFxuXG5cdGZpbHRlcihsaW5lOiBzdHJpbmcpXG5cdHtcblx0XHRsaW5lID0gbGluZVxuXHRcdFx0LnJlcGxhY2UoL1xcdUZFRkYvZywgJycpXG5cdFx0XHQudHJpbSgpXG5cdFx0XHQucmVwbGFjZSgvXlxccyt8XFxzKyQvLCAnJylcblx0XHQ7XG5cblx0XHRpZiAobGluZSAmJiBsaW5lLmluZGV4T2YoJ1xcL1xcLycpICE9IDApXG5cdFx0e1xuXHRcdFx0cmV0dXJuIGxpbmU7XG5cdFx0fVxuXHR9LFxuXG59KTtcblxuZXhwb3J0IGNvbnN0IGxvYWQgPSBsaWJMb2FkZXIubG9hZCBhcyB0eXBlb2YgbGliTG9hZGVyLmxvYWQ7XG5leHBvcnQgY29uc3QgbG9hZFN5bmMgPSBsaWJMb2FkZXIubG9hZFN5bmMgYXMgdHlwZW9mIGxpYkxvYWRlci5sb2FkU3luYztcblxuZXhwb3J0IGNvbnN0IGxvYWRTdHJlYW0gPSBsaWJMb2FkZXIubG9hZFN0cmVhbSBhcyB0eXBlb2YgbGliTG9hZGVyLmxvYWRTdHJlYW07XG5leHBvcnQgY29uc3QgbG9hZFN0cmVhbVN5bmMgPSBsaWJMb2FkZXIubG9hZFN0cmVhbVN5bmMgYXMgdHlwZW9mIGxpYkxvYWRlci5sb2FkU3RyZWFtU3luYztcblxuZXhwb3J0IGNvbnN0IHBhcnNlTGluZSA9IGxpYkxvYWRlci5wYXJzZUxpbmUgYXMgdHlwZW9mIGxpYkxvYWRlci5wYXJzZUxpbmU7XG5leHBvcnQgY29uc3Qgc3RyaW5naWZ5TGluZSA9IGxpYkxvYWRlci5zdHJpbmdpZnlMaW5lIGFzIHR5cGVvZiBsaWJMb2FkZXIuc3RyaW5naWZ5TGluZTtcblxuZXhwb3J0IGNvbnN0IHNlcmlhbGl6ZSA9IGxpYkxvYWRlci5zZXJpYWxpemUgYXMgdHlwZW9mIGxpYkxvYWRlci5zZXJpYWxpemU7XG5cbmV4cG9ydCBjb25zdCBMb2FkZXIgPSBsaWJMb2FkZXI7XG5cbmV4cG9ydCBkZWZhdWx0IGxpYkxvYWRlci5sb2FkO1xuIl19