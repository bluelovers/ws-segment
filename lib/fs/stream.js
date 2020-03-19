"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLoadStream = void 0;
const line_1 = require("./line");
function createLoadStream(file, options = {}) {
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
    let stream = line_1.createStreamLine(file, options.mapper, {
        onready: options.onready,
        ondata: options.ondata,
        onclose() {
            if (options.callback) {
                options.callback.call(this, null, stream.value, stream);
            }
        },
    });
    return stream;
}
exports.createLoadStream = createLoadStream;
exports.default = createLoadStream;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RyZWFtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsic3RyZWFtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLGlDQUFnRTtBQU9oRSxTQUFnQixnQkFBZ0IsQ0FBSSxJQUFZLEVBQUUsVUFTOUMsRUFBRTtJQUdMLE9BQU8sQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDLE9BQU8sSUFBSSxVQUFVLEdBQUcsRUFBRSxHQUFHLElBQUk7UUFFMUQsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxJQUFJLEVBQUUsQ0FBQztJQUMvQixDQUFDLENBQUM7SUFFRixPQUFPLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLElBQUksVUFBVSxJQUFJO1FBRWhELE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQyxDQUFDO0lBRUYsT0FBTyxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxJQUFJLFVBQVUsSUFBSTtRQUVoRCxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLElBQUksRUFBRSxDQUFDO1FBQzlCLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3ZCLENBQUMsQ0FBQztJQUVGLElBQUksTUFBTSxHQUE4Qix1QkFBZ0IsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLE1BQU0sRUFBRTtRQUU5RSxPQUFPLEVBQUUsT0FBTyxDQUFDLE9BQU87UUFFeEIsTUFBTSxFQUFFLE9BQU8sQ0FBQyxNQUFNO1FBRXRCLE9BQU87WUFFTixJQUFJLE9BQU8sQ0FBQyxRQUFRLEVBQ3BCO2dCQUNDLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQTthQUN2RDtRQUNGLENBQUM7S0FDRCxDQUFDLENBQUM7SUFFSCxPQUFPLE1BQU0sQ0FBQztBQUNmLENBQUM7QUE1Q0QsNENBNENDO0FBRUQsa0JBQWUsZ0JBQWdCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBjcmVhdGVTdHJlYW1MaW5lLCBJU3RyZWFtTGluZVdpdGhWYWx1ZSB9IGZyb20gJy4vbGluZSc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgSUNhbGxiYWNrPFQ+XG57XG5cdChlcnI6IEVycm9yLCBkYXRhPzogVCwgc3RyZWFtPzogSVN0cmVhbUxpbmVXaXRoVmFsdWU8VD4pOiB2b2lkXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVMb2FkU3RyZWFtPFQ+KGZpbGU6IHN0cmluZywgb3B0aW9uczoge1xuXG5cdG1hcHBlcj8obGluZTogc3RyaW5nKSxcblx0b25kYXRhPyhkYXRhKSxcblxuXHRjYWxsYmFjaz86IElDYWxsYmFjazxUPixcblxuXHRvbnJlYWR5PyguLi5hcmd2KSxcblxufSA9IHt9KTogSVN0cmVhbUxpbmVXaXRoVmFsdWU8VD5cbntcblxuXHRvcHRpb25zLm9ucmVhZHkgPSBvcHRpb25zLm9ucmVhZHkgfHwgZnVuY3Rpb24gKHNyYywgLi4uYXJndilcblx0e1xuXHRcdHRoaXMudmFsdWUgPSB0aGlzLnZhbHVlIHx8IFtdO1xuXHR9O1xuXG5cdG9wdGlvbnMubWFwcGVyID0gb3B0aW9ucy5tYXBwZXIgfHwgZnVuY3Rpb24gKGRhdGEpXG5cdHtcblx0XHRyZXR1cm4gZGF0YTtcblx0fTtcblxuXHRvcHRpb25zLm9uZGF0YSA9IG9wdGlvbnMub25kYXRhIHx8IGZ1bmN0aW9uIChkYXRhKVxuXHR7XG5cdFx0dGhpcy52YWx1ZSA9IHRoaXMudmFsdWUgfHwgW107XG5cdFx0dGhpcy52YWx1ZS5wdXNoKGRhdGEpO1xuXHR9O1xuXG5cdGxldCBzdHJlYW06IElTdHJlYW1MaW5lV2l0aFZhbHVlPGFueT4gPSBjcmVhdGVTdHJlYW1MaW5lKGZpbGUsIG9wdGlvbnMubWFwcGVyLCB7XG5cblx0XHRvbnJlYWR5OiBvcHRpb25zLm9ucmVhZHksXG5cblx0XHRvbmRhdGE6IG9wdGlvbnMub25kYXRhLFxuXG5cdFx0b25jbG9zZSgpXG5cdFx0e1xuXHRcdFx0aWYgKG9wdGlvbnMuY2FsbGJhY2spXG5cdFx0XHR7XG5cdFx0XHRcdG9wdGlvbnMuY2FsbGJhY2suY2FsbCh0aGlzLCBudWxsLCBzdHJlYW0udmFsdWUsIHN0cmVhbSlcblx0XHRcdH1cblx0XHR9LFxuXHR9KTtcblxuXHRyZXR1cm4gc3RyZWFtO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjcmVhdGVMb2FkU3RyZWFtO1xuIl19