"use strict";
/**
 * Created by user on 2018/4/19/019.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const synonym_pangu_1 = require("./synonym.pangu");
/**
 * 請注意 這與原版 node-segment 的格式不同
 *
 * 原版為一對一 => 錯字,正字
 * 這裡為一對多 並且順序與原版相反 => 正字,錯字,...以,分隔更多字
 */
class TableDictSynonym extends synonym_pangu_1.TableDictSynonymPanGu {
    constructor(type = TableDictSynonym.type, options = {}, ...argv) {
        super(type, options, ...argv);
        /**
         * 緩存主KEY
         */
        this.TABLE2 = {};
    }
    add(data, skipExists) {
        if (!Array.isArray(data) || data.length < 2) {
            throw new TypeError(JSON.stringify(data));
        }
        let w = this._trim(data.shift());
        if (!w) {
            throw new TypeError(JSON.stringify(data));
        }
        let self = this;
        self.TABLE2[w] = self.TABLE2[w] || [];
        if (skipExists == null) {
            skipExists = true;
        }
        data.forEach(function (bw, index) {
            bw = self._trim(bw);
            if (!bw) {
                if (index == 0) {
                    throw new TypeError();
                }
                return;
            }
            if (skipExists && self.exists(bw) || bw in self.TABLE2) {
                return;
            }
            self.TABLE2[w].push(bw);
            self._add(bw, w);
            //skipExists = true;
        });
        return this;
    }
}
exports.TableDictSynonym = TableDictSynonym;
exports.default = TableDictSynonym;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3lub255bS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInN5bm9ueW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztHQUVHOztBQU9ILG1EQUF3RDtBQVV4RDs7Ozs7R0FLRztBQUNILE1BQWEsZ0JBQWlCLFNBQVEscUNBQXFCO0lBRzFELFlBQVksT0FBZSxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsVUFBb0IsRUFBRSxFQUFFLEdBQUcsSUFBSTtRQUVoRixLQUFLLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFBO1FBRzlCOztXQUVHO1FBQ0ksV0FBTSxHQUFvQixFQUFFLENBQUM7SUFMcEMsQ0FBQztJQU9ELEdBQUcsQ0FBQyxJQUE0QixFQUFFLFVBQW9CO1FBRXJELElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUMzQztZQUNDLE1BQU0sSUFBSSxTQUFTLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1NBQzFDO1FBRUQsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztRQUVqQyxJQUFJLENBQUMsQ0FBQyxFQUNOO1lBQ0MsTUFBTSxJQUFJLFNBQVMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7U0FDMUM7UUFFRCxJQUFJLElBQUksR0FBRyxJQUFJLENBQUM7UUFFaEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUV0QyxJQUFJLFVBQVUsSUFBSSxJQUFJLEVBQ3RCO1lBQ0MsVUFBVSxHQUFHLElBQUksQ0FBQztTQUNsQjtRQUVELElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLEVBQUUsS0FBSztZQUUvQixFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUVwQixJQUFJLENBQUMsRUFBRSxFQUNQO2dCQUNDLElBQUksS0FBSyxJQUFJLENBQUMsRUFDZDtvQkFDQyxNQUFNLElBQUksU0FBUyxFQUFFLENBQUM7aUJBQ3RCO2dCQUVELE9BQU87YUFDUDtZQUVELElBQUksVUFBVSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLElBQUksRUFBRSxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQ3REO2dCQUNDLE9BQU87YUFDUDtZQUVELElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3hCLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBRWpCLG9CQUFvQjtRQUNyQixDQUFDLENBQUMsQ0FBQztRQUVILE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztDQUVEO0FBaEVELDRDQWdFQztBQUVELGtCQUFlLGdCQUFnQixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDcmVhdGVkIGJ5IHVzZXIgb24gMjAxOC80LzE5LzAxOS5cbiAqL1xuXG5pbXBvcnQgeyBJRElDVF9TWU5PTllNLCBJV29yZCB9IGZyb20gJy4uL1NlZ21lbnQnO1xuaW1wb3J0IHsgSURpY3RSb3cgfSBmcm9tICdzZWdtZW50LWRpY3QvbGliL2xvYWRlci9zZWdtZW50JztcbmltcG9ydCBDamtDb252IGZyb20gJ2Nqay1jb252JztcbmltcG9ydCB7IHRleHRfbGlzdCB9IGZyb20gJy4uL3V0aWwvY2prJztcbmltcG9ydCBBYnN0cmFjdFRhYmxlRGljdENvcmUsIHsgSURJQ1QsIElESUNUMiwgSU9wdGlvbnMgfSBmcm9tICcuL2NvcmUnO1xuaW1wb3J0IHsgVGFibGVEaWN0U3lub255bVBhbkd1IH0gZnJvbSAnLi9zeW5vbnltLnBhbmd1JztcbmltcG9ydCBVU3RyaW5nIGZyb20gJ3VuaS1zdHJpbmcnO1xuXG5leHBvcnQgdHlwZSBBcnJheVR3b09yTW9yZTxUPiA9IHtcblx0MDogVCxcblx0MTogVCxcblx0W246IG51bWJlcl06IFQsXG5cdGxlbmd0aDogbnVtYmVyLFxufVxuXG4vKipcbiAqIOiri+azqOaEjyDpgJnoiIfljp/niYggbm9kZS1zZWdtZW50IOeahOagvOW8j+S4jeWQjFxuICpcbiAqIOWOn+eJiOeCuuS4gOWwjeS4gCA9PiDpjK/lrZcs5q2j5a2XXG4gKiDpgJnoo6HngrrkuIDlsI3lpJog5Lim5LiU6aCG5bqP6IiH5Y6f54mI55u45Y+NID0+IOato+WtlyzpjK/lrZcsLi4u5LulLOWIhumalOabtOWkmuWtl1xuICovXG5leHBvcnQgY2xhc3MgVGFibGVEaWN0U3lub255bSBleHRlbmRzIFRhYmxlRGljdFN5bm9ueW1QYW5HdVxue1xuXG5cdGNvbnN0cnVjdG9yKHR5cGU6IHN0cmluZyA9IFRhYmxlRGljdFN5bm9ueW0udHlwZSwgb3B0aW9uczogSU9wdGlvbnMgPSB7fSwgLi4uYXJndilcblx0e1xuXHRcdHN1cGVyKHR5cGUsIG9wdGlvbnMsIC4uLmFyZ3YpXG5cdH1cblxuXHQvKipcblx0ICog57ep5a2Y5Li7S0VZXG5cdCAqL1xuXHRwdWJsaWMgVEFCTEUyOiBJRElDVDxzdHJpbmdbXT4gPSB7fTtcblxuXHRhZGQoZGF0YTogQXJyYXlUd29Pck1vcmU8c3RyaW5nPiwgc2tpcEV4aXN0cz86IGJvb2xlYW4pXG5cdHtcblx0XHRpZiAoIUFycmF5LmlzQXJyYXkoZGF0YSkgfHwgZGF0YS5sZW5ndGggPCAyKVxuXHRcdHtcblx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IoSlNPTi5zdHJpbmdpZnkoZGF0YSkpO1xuXHRcdH1cblxuXHRcdGxldCB3ID0gdGhpcy5fdHJpbShkYXRhLnNoaWZ0KCkpO1xuXG5cdFx0aWYgKCF3KVxuXHRcdHtcblx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IoSlNPTi5zdHJpbmdpZnkoZGF0YSkpO1xuXHRcdH1cblxuXHRcdGxldCBzZWxmID0gdGhpcztcblxuXHRcdHNlbGYuVEFCTEUyW3ddID0gc2VsZi5UQUJMRTJbd10gfHwgW107XG5cblx0XHRpZiAoc2tpcEV4aXN0cyA9PSBudWxsKVxuXHRcdHtcblx0XHRcdHNraXBFeGlzdHMgPSB0cnVlO1xuXHRcdH1cblxuXHRcdGRhdGEuZm9yRWFjaChmdW5jdGlvbiAoYncsIGluZGV4KVxuXHRcdHtcblx0XHRcdGJ3ID0gc2VsZi5fdHJpbShidyk7XG5cblx0XHRcdGlmICghYncpXG5cdFx0XHR7XG5cdFx0XHRcdGlmIChpbmRleCA9PSAwKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcigpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoc2tpcEV4aXN0cyAmJiBzZWxmLmV4aXN0cyhidykgfHwgYncgaW4gc2VsZi5UQUJMRTIpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0c2VsZi5UQUJMRTJbd10ucHVzaChidyk7XG5cdFx0XHRzZWxmLl9hZGQoYncsIHcpO1xuXG5cdFx0XHQvL3NraXBFeGlzdHMgPSB0cnVlO1xuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxufVxuXG5leHBvcnQgZGVmYXVsdCBUYWJsZURpY3RTeW5vbnltXG4iXX0=