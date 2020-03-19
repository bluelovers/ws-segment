"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableDictStopword = void 0;
const line_1 = require("./line");
/**
 * 原版 node-segment 的格式
 */
let TableDictStopword = /** @class */ (() => {
    class TableDictStopword extends line_1.default {
        constructor(type = TableDictStopword.type, options = {}, ...argv) {
            super(type, options, ...argv);
        }
    }
    TableDictStopword.type = 'STOPWORD';
    return TableDictStopword;
})();
exports.TableDictStopword = TableDictStopword;
exports.default = TableDictStopword;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RvcHdvcmQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJzdG9wd29yZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFNQSxpQ0FBbUM7QUFFbkM7O0dBRUc7QUFDSDtJQUFBLE1BQWEsaUJBQWtCLFNBQVEsY0FBYTtRQUluRCxZQUFZLE9BQWUsaUJBQWlCLENBQUMsSUFBSSxFQUFFLFVBQW9CLEVBQUUsRUFBRSxHQUFHLElBQUk7WUFFakYsS0FBSyxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQTtRQUM5QixDQUFDOztJQUxlLHNCQUFJLEdBQUcsVUFBVSxDQUFDO0lBTW5DLHdCQUFDO0tBQUE7QUFSWSw4Q0FBaUI7QUFVOUIsa0JBQWUsaUJBQWlCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJRElDVF9TWU5PTllNLCBJV29yZCB9IGZyb20gJy4uL1NlZ21lbnQnO1xuaW1wb3J0IHsgSURpY3RSb3csIHN0cmluZ2lmeUxpbmUgfSBmcm9tICdzZWdtZW50LWRpY3QvbGliL2xvYWRlci9saW5lJztcbmltcG9ydCBDamtDb252IGZyb20gJ2Nqay1jb252JztcbmltcG9ydCB7IGNsb25lRGVlcCB9IGZyb20gJy4uL3V0aWwnO1xuaW1wb3J0IHsgdGV4dF9saXN0IH0gZnJvbSAnLi4vdXRpbC9jamsnO1xuaW1wb3J0IEFic3RyYWN0VGFibGVEaWN0Q29yZSwgeyBJRElDVCwgSURJQ1QyLCBJT3B0aW9ucyB9IGZyb20gJy4vY29yZSc7XG5pbXBvcnQgVGFibGVEaWN0TGluZSBmcm9tICcuL2xpbmUnO1xuXG4vKipcbiAqIOWOn+eJiCBub2RlLXNlZ21lbnQg55qE5qC85byPXG4gKi9cbmV4cG9ydCBjbGFzcyBUYWJsZURpY3RTdG9wd29yZCBleHRlbmRzIFRhYmxlRGljdExpbmVcbntcblx0c3RhdGljIHJlYWRvbmx5IHR5cGUgPSAnU1RPUFdPUkQnO1xuXG5cdGNvbnN0cnVjdG9yKHR5cGU6IHN0cmluZyA9IFRhYmxlRGljdFN0b3B3b3JkLnR5cGUsIG9wdGlvbnM6IElPcHRpb25zID0ge30sIC4uLmFyZ3YpXG5cdHtcblx0XHRzdXBlcih0eXBlLCBvcHRpb25zLCAuLi5hcmd2KVxuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFRhYmxlRGljdFN0b3B3b3JkXG4iXX0=