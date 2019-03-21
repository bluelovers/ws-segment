"use strict";
/**
 * Created by user on 2019/3/20.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const StrUtil = require("str-util");
const list_1 = require("cjk-conv/lib/zh/table/list");
function getCjkName(w, USE_CJK_MODE) {
    let cjk_id = list_1.slugify(w, true);
    return StrUtil.toHalfWidth(cjk_id);
}
exports.getCjkName = getCjkName;
exports.default = exports;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImNvbnYudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztHQUVHOztBQUVILG9DQUFxQztBQUNyQyxxREFBK0Q7QUFFL0QsU0FBZ0IsVUFBVSxDQUFDLENBQVMsRUFBRSxZQUFvQjtJQUV6RCxJQUFJLE1BQU0sR0FBRyxjQUFPLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBRTlCLE9BQU8sT0FBTyxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNwQyxDQUFDO0FBTEQsZ0NBS0M7QUFFRCxrQkFBZSxPQUFrQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDcmVhdGVkIGJ5IHVzZXIgb24gMjAxOS8zLzIwLlxuICovXG5cbmltcG9ydCBTdHJVdGlsID0gcmVxdWlyZSgnc3RyLXV0aWwnKTtcbmltcG9ydCB7IHRleHRMaXN0LCBzbHVnaWZ5IH0gZnJvbSAnY2prLWNvbnYvbGliL3poL3RhYmxlL2xpc3QnO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q2prTmFtZSh3OiBzdHJpbmcsIFVTRV9DSktfTU9ERTogbnVtYmVyKVxue1xuXHRsZXQgY2prX2lkID0gc2x1Z2lmeSh3LCB0cnVlKTtcblxuXHRyZXR1cm4gU3RyVXRpbC50b0hhbGZXaWR0aChjamtfaWQpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBleHBvcnRzIGFzIHR5cGVvZiBpbXBvcnQoJy4vY29udicpO1xuIl19