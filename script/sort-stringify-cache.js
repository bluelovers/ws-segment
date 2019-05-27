"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const worker_threads_1 = require("worker_threads");
const lineByLine = require("n-readlines");
const project_config_1 = require("../project.config");
const path = require("upath2");
const index_1 = require("segment-dict/lib/loader/segment/index");
const uni_string_1 = require("uni-string");
const util_1 = require("@novel-segment/util");
const transliteration_1 = require("transliteration");
const fs = require("fs-extra");
const cjk_conv_1 = require("cjk-conv");
const fast_glob_1 = require("fast-glob");
const util_2 = require("segment-dict/script/util");
const array_hyper_unique_1 = require("array-hyper-unique");
const line_1 = require("segment-dict/lib/loader/line");
const debug_color2_1 = require("debug-color2");
const greedy_1 = require("cjk-conv/lib/zh/table/greedy");
const pinyin = require("pinyin");
const table_1 = require("cjk-conv/lib/zh/table");
let CWD = path.join(project_config_1.default.temp_root);
var EnumC1;
(function (EnumC1) {
    EnumC1["char"] = "char";
    EnumC1["other"] = "other";
    EnumC1["eng"] = "eng";
})(EnumC1 || (EnumC1 = {}));
if (worker_threads_1.isMainThread) {
    log("This is the main thread", worker_threads_1.threadId);
    let workerOptions = {
        workerData: {
            time: new Date,
        },
    };
    let w1 = new worker_threads_1.Worker(__filename, workerOptions);
    //let w2 = new Worker(__filename, workerOptions);
    //	const subChannel = new MessageChannel();
    //
    //	w2.postMessage({
    //		hereIsYourPort: subChannel.port1
    //	}, [subChannel.port1]);
    //	w1.postMessage({
    //		hereIsYourPort: subChannel.port2
    //	}, [subChannel.port2]);
    let timeDiff;
    const CWD_SAVETO = path.join(CWD, 'cache');
    fs.removeSync(CWD_SAVETO);
    w1.on('message', (msg) => {
        timeDiff = msg.timeDiff;
        //console.dir(msg);
        log(msg.index, msg.list.length);
        let cache = {
            char: [],
            other: [],
            eng: [],
        };
        {
            let i = 'a'.codePointAt(0);
            let j = 'z'.codePointAt(0);
            while (i <= j) {
                cache[String.fromCodePoint(i)] = [];
                i++;
            }
        }
        cache = msg.list.reduce(function (cache, cur) {
            // @ts-ignore
            let { c1, line } = cur;
            cache[c1] = cache[c1] || [];
            cache[c1].push(Buffer.from(line).toString());
            return cache;
        }, cache);
        Object.entries(cache).forEach(async function ([c1, ls]) {
            if (!/^[a-z0-9]$/i.test(c1)) {
                c1 = '0/' + c1;
            }
            let file = path.join(CWD_SAVETO, c1 + '.txt');
            fs.ensureFileSync(file);
            if (!ls.length) {
                return;
            }
            return fs.appendFileSync(file, ls.join('\n') + '\n');
        });
        //fs.appendFile()
    });
    w1.on('error', debug_color2_1.console.error);
    w1.on('exit', (code) => {
        let bool = true;
        try {
            let i = timeDiff.getTime() - workerOptions.workerData.time.getTime();
            log(i, timeDiff);
        }
        catch (e) {
            bool = false;
        }
        if (bool) {
            let ls = fast_glob_1.default.sync([
                '**/*.txt'
            ], {
                cwd: CWD_SAVETO,
                absolute: true,
            }).sort();
            let file2 = path.join(CWD, 'stringify.sorted.txt');
            fs.ensureFileSync(file2);
            fs.truncateSync(file2);
            let i2 = ls.reduce((a, file) => {
                log('[start]', path.relative(CWD_SAVETO, file));
                const liner = new lineByLine(file);
                let line;
                let index = 0;
                let list = [];
                while (line = liner.next()) {
                    let s = line.toString();
                    let data = index_1.parseLine(s);
                    let [w, p, f] = data;
                    let cur = {
                        // @ts-ignore
                        data,
                        line: s,
                        index: index++,
                        c1: "other" /* other */,
                        line_type: util_2.chkLineType(s),
                        cjk_id: util_1.getCjkName(w),
                    };
                    list.push(cur);
                    a++;
                }
                list = SortList(list);
                let out_list = list.map(v => v.line);
                out_list = array_hyper_unique_1.array_unique(out_list);
                let out_data = line_1.serialize(out_list);
                fs.outputFileSync(file, out_data + "\n\n");
                fs.appendFileSync(file2, out_data + "\n");
                log('[done]', path.relative(CWD_SAVETO, file));
                return a;
            }, 0);
            log(i2);
        }
        if (code != 0) {
            debug_color2_1.console.error(new Error(`Worker stopped with exit code ${code}`));
        }
        else {
            log(`Worker stopped`);
        }
    });
}
else {
    //	parentPort.once('message', (value) => {
    //		value.hereIsYourPort.postMessage('hello');
    //		value.hereIsYourPort.on('message', msg => {
    //			console.log(`thread ${threadId}: receive ${msg}`);
    //		});
    //	});
    //the worker's code
    debug_color2_1.console.dir(worker_threads_1.workerData, {
        colors: true,
    });
    //	log(workerData.re.test(' '));
    let file = path.join(CWD, 'stringify.txt');
    const liner = new lineByLine(file);
    let line;
    let lineNumber = 0;
    let count = 0;
    let c1_old;
    let list = [];
    while (line = liner.next()) {
        //console.log('Line ' + lineNumber + ': ' + line.toString('ascii'));
        let index = lineNumber++;
        let data = index_1.parseLine(line.toString());
        let cur = {
            data,
            line,
            index,
            c1: "other" /* other */,
        };
        let [w, p, f] = cur.data;
        let len = uni_string_1.default.size(w);
        let c1_now;
        if (len > 1) {
            c1_now = getCid(w);
            if (!c1_now) {
                debug_color2_1.console.log(c1_now, w);
                throw new Error(`${w}, ${c1_now}`);
            }
        }
        else if (len === 1) {
            c1_now = "char" /* char */;
        }
        else {
            c1_now = "other" /* other */;
        }
        cur.c1 = c1_now;
        if (count >= 10000) {
            worker_threads_1.parentPort.postMessage({
                index,
                list,
            });
            list = [];
            count = 0;
        }
        list.push(cur);
        c1_old = c1_now;
        count++;
    }
    log('end of line reached', lineNumber);
    worker_threads_1.workerData.count = lineNumber;
    worker_threads_1.parentPort.postMessage({
        timeDiff: new Date,
        index: lineNumber,
        list,
    });
}
function log(...argv) {
    debug_color2_1.console.log(`[thread:${worker_threads_1.threadId}]`, ...argv);
}
function getCid(w) {
    w = uni_string_1.default.slice(w, 0, 1).toLocaleLowerCase();
    if (/^[a-z0-9]$/i.test(w)) {
        return "eng" /* eng */;
    }
    let s = util_1.getCjkName(w);
    let r = transliteration_1.slugify(s);
    if (!r) {
        try {
            r = transliteration_1.slugify(pinyin(s)[0][0]);
        }
        catch (e) {
        }
    }
    if (!r) {
        try {
            r = transliteration_1.slugify(pinyin(w)[0][0]);
        }
        catch (e) {
        }
    }
    if (!r) {
        r = transliteration_1.slugify(greedy_1.greedyTableReplace(s));
    }
    if (!r) {
        let arr = table_1.default.auto(s, {
            safe: false,
            greedyTable: 2,
        });
        if (arr.length) {
            r = transliteration_1.slugify(arr[1] || arr[0]);
        }
    }
    if (!r) {
        let arr = table_1.default.auto(w, {
            safe: false,
            greedyTable: 2,
        });
        if (arr.length) {
            r = transliteration_1.slugify(arr[1] || arr[0]);
        }
    }
    if (!r) {
        r = transliteration_1.slugify(cjk_conv_1.cjk2zhs(s));
    }
    if (!r) {
        r = transliteration_1.slugify(cjk_conv_1.cjk2zht(s));
    }
    if (!r) {
        r = transliteration_1.slugify(cjk_conv_1.cjk2zhs(w));
    }
    if (!r) {
        r = transliteration_1.slugify(cjk_conv_1.cjk2zht(w));
    }
    if (!r) {
        r = transliteration_1.slugify(w);
    }
    if (!r) {
        r = w;
    }
    let r2 = uni_string_1.default.slice(r, 0, 1);
    if (!/^[a-z0-9]$/i.test(r2)) {
        r2 = "other" /* other */;
    }
    return r2.toLocaleLowerCase();
}
function SortList(ls) {
    // @ts-ignore
    return ls.sort(function (a, b) {
        if (a.line_type == util_2.EnumLineType.COMMENT_TAG
            || b.line_type == util_2.EnumLineType.COMMENT_TAG) {
            return (a.index - b.index);
        }
        else if (a.line_type == util_2.EnumLineType.COMMENT
            || b.line_type == util_2.EnumLineType.COMMENT) {
            return (a.index - b.index);
        }
        let ret = util_1.zhDictCompare(a.cjk_id, b.cjk_id)
            || (a.index - b.index)
            || 0;
        return ret;
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic29ydC1zdHJpbmdpZnktY2FjaGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJzb3J0LXN0cmluZ2lmeS1jYWNoZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG1EQVF3QjtBQUN4QiwwQ0FBMkM7QUFDM0Msc0RBQThDO0FBQzlDLCtCQUErQjtBQUMvQixpRUFBK0g7QUFDL0gsMkNBQWlDO0FBQ2pDLDhDQUFnRTtBQUNoRSxxREFBNEU7QUFDNUUsK0JBQWdDO0FBRWhDLHVDQUE0QztBQUU1Qyx5Q0FBaUM7QUFDakMsbURBQXdGO0FBQ3hGLDJEQUFrRDtBQUNsRCx1REFBeUQ7QUFDekQsK0NBQXVEO0FBQ3ZELHlEQUFrRTtBQUNsRSxpQ0FBa0M7QUFDbEMsaURBQTZDO0FBRTdDLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsd0JBQWEsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUU3QyxJQUFXLE1BS1Y7QUFMRCxXQUFXLE1BQU07SUFFaEIsdUJBQWEsQ0FBQTtJQUNiLHlCQUFlLENBQUE7SUFDZixxQkFBVyxDQUFBO0FBQ1osQ0FBQyxFQUxVLE1BQU0sS0FBTixNQUFNLFFBS2hCO0FBRUQsSUFBSSw2QkFBWSxFQUNoQjtJQUNDLEdBQUcsQ0FBQyx5QkFBeUIsRUFBRSx5QkFBUSxDQUFDLENBQUM7SUFFekMsSUFBSSxhQUFhLEdBQUc7UUFDbkIsVUFBVSxFQUFFO1lBQ1gsSUFBSSxFQUFFLElBQUksSUFBSTtTQUdkO0tBQ0QsQ0FBQztJQUVGLElBQUksRUFBRSxHQUFHLElBQUksdUJBQU0sQ0FBQyxVQUFVLEVBQUUsYUFBYSxDQUFDLENBQUM7SUFDL0MsaURBQWlEO0lBRWxELDJDQUEyQztJQUMzQyxFQUFFO0lBQ0YsbUJBQW1CO0lBQ25CLG9DQUFvQztJQUNwQywwQkFBMEI7SUFDMUIsbUJBQW1CO0lBQ25CLG9DQUFvQztJQUNwQywwQkFBMEI7SUFFekIsSUFBSSxRQUFjLENBQUM7SUFFbkIsTUFBTSxVQUFVLEdBQUcs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SUFBSSxtQkFBWSxDQUFDLFdBQVc7ZUFDcEMsQ0FBQyxDQUFDLFNBQVMsSUFBSSxtQkFBWSxDQUFDLFdBQVcsRUFFM0M7WUFDQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDM0I7YUFDSSxJQUNKLENBQUMsQ0FBQyxTQUFTLElBQUksbUJBQVksQ0FBQyxPQUFPO2VBQ2hDLENBQUMsQ0FBQyxTQUFTLElBQUksbUJBQVksQ0FBQyxPQUFPLEVBRXZDO1lBQ0MsT0FBTyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQzNCO1FBRUQsSUFBSSxHQUFHLEdBQUcsb0JBQWEsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUM7ZUFDdkMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUM7ZUFDbkIsQ0FBQyxDQUNKO1FBRUQsT0FBTyxHQUFHLENBQUM7SUFDWixDQUFDLENBQUMsQ0FBQTtBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuXHRXb3JrZXIsXG5cdGlzTWFpblRocmVhZCxcblx0cGFyZW50UG9ydCxcblx0d29ya2VyRGF0YSxcblx0dGhyZWFkSWQsXG5cdE1lc3NhZ2VDaGFubmVsLFxuXHRNZXNzYWdlUG9ydCxcbn0gZnJvbSAnd29ya2VyX3RocmVhZHMnO1xuaW1wb3J0IGxpbmVCeUxpbmUgPSByZXF1aXJlKCduLXJlYWRsaW5lcycpO1xuaW1wb3J0IFByb2plY3RDb25maWcgZnJvbSAnLi4vcHJvamVjdC5jb25maWcnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tIFwidXBhdGgyXCI7XG5pbXBvcnQgeyBJRGljdFJvdywgcGFyc2VMaW5lIGFzIHBhcnNlTGluZVNlZ21lbnQsIHNlcmlhbGl6ZSBhcyBzZXJpYWxpemVTZWdtZW50IH0gZnJvbSAnc2VnbWVudC1kaWN0L2xpYi9sb2FkZXIvc2VnbWVudC9pbmRleCc7XG5pbXBvcnQgVVN0cmluZyBmcm9tICd1bmktc3RyaW5nJztcbmltcG9ydCB7IGdldENqa05hbWUsIHpoRGljdENvbXBhcmUgfSBmcm9tICdAbm92ZWwtc2VnbWVudC91dGlsJztcbmltcG9ydCB7IHRyYW5zbGl0ZXJhdGUgYXMgdHIsIHNsdWdpZnkgYXMgc2x1Z2lmeVRyIH0gZnJvbSAndHJhbnNsaXRlcmF0aW9uJztcbmltcG9ydCBmcyA9IHJlcXVpcmUoJ2ZzLWV4dHJhJyk7XG5pbXBvcnQgQmx1ZWJpcmQgPSByZXF1aXJlKCdibHVlYmlyZCcpO1xuaW1wb3J0IHsgY2prMnpocywgY2prMnpodCB9IGZyb20gJ2Nqay1jb252JztcbmltcG9ydCBTdHJVdGlsID0gcmVxdWlyZSgnc3RyLXV0aWwnKTtcbmltcG9ydCBGYXN0R2xvYiBmcm9tICdmYXN0LWdsb2InO1xuaW1wb3J0IHsgY2hrTGluZVR5cGUsIEVudW1MaW5lVHlwZSwgSUxvYWREaWN0RmlsZVJvdzIgfSBmcm9tICdzZWdtZW50LWRpY3Qvc2NyaXB0L3V0aWwnO1xuaW1wb3J0IHsgYXJyYXlfdW5pcXVlIH0gZnJvbSAnYXJyYXktaHlwZXItdW5pcXVlJztcbmltcG9ydCB7IHNlcmlhbGl6ZSB9IGZyb20gJ3NlZ21lbnQtZGljdC9saWIvbG9hZGVyL2xpbmUnO1xuaW1wb3J0IHsgY29uc29sZSwgY2hhbGtCeUNvbnNvbGUgfSBmcm9tICdkZWJ1Zy1jb2xvcjInO1xuaW1wb3J0IHsgZ3JlZWR5VGFibGVSZXBsYWNlIH0gZnJvbSAnY2prLWNvbnYvbGliL3poL3RhYmxlL2dyZWVkeSc7XG5pbXBvcnQgcGlueWluID0gcmVxdWlyZShcInBpbnlpblwiKTtcbmltcG9ydCBsaWJUYWJsZSBmcm9tICdjamstY29udi9saWIvemgvdGFibGUnO1xuXG5sZXQgQ1dEID0gcGF0aC5qb2luKFByb2plY3RDb25maWcudGVtcF9yb290KTtcblxuY29uc3QgZW51bSBFbnVtQzFcbntcblx0Y2hhciA9ICdjaGFyJyxcblx0b3RoZXIgPSAnb3RoZXInLFxuXHRlbmcgPSAnZW5nJyxcbn1cblxuaWYgKGlzTWFpblRocmVhZClcbntcblx0bG9nKFwiVGhpcyBpcyB0aGUgbWFpbiB0aHJlYWRcIiwgdGhyZWFkSWQpO1xuXG5cdGxldCB3b3JrZXJPcHRpb25zID0ge1xuXHRcdHdvcmtlckRhdGE6IHtcblx0XHRcdHRpbWU6IG5ldyBEYXRlLFxuXHRcdFx0Ly9jb3VudDogMCxcblx0XHRcdC8vcmU6IC8gICAvaWcsXG5cdFx0fSxcblx0fTtcblxuXHRsZXQgdzEgPSBuZXcgV29ya2VyKF9fZmlsZW5hbWUsIHdvcmtlck9wdGlvbnMpO1xuXHQvL2xldCB3MiA9IG5ldyBXb3JrZXIoX19maWxlbmFtZSwgd29ya2VyT3B0aW9ucyk7XG5cbi8vXHRjb25zdCBzdWJDaGFubmVsID0gbmV3IE1lc3NhZ2VDaGFubmVsKCk7XG4vL1xuLy9cdHcyLnBvc3RNZXNzYWdlKHtcbi8vXHRcdGhlcmVJc1lvdXJQb3J0OiBzdWJDaGFubmVsLnBvcnQxXG4vL1x0fSwgW3N1YkNoYW5uZWwucG9ydDFdKTtcbi8vXHR3MS5wb3N0TWVzc2FnZSh7XG4vL1x0XHRoZXJlSXNZb3VyUG9ydDogc3ViQ2hhbm5lbC5wb3J0MlxuLy9cdH0sIFtzdWJDaGFubmVsLnBvcnQyXSk7XG5cblx0bGV0IHRpbWVEaWZmOiBEYXRlO1xuXG5cdGNvbnN0IENXRF9TQVZFVE8gPSBwYXRoLmpvaW4oQ1dELCAnY2FjaGUnKTtcblxuXHRmcy5yZW1vdmVTeW5jKENXRF9TQVZFVE8pO1xuXG5cdHcxLm9uKCdtZXNzYWdlJywgKG1zZykgPT5cblx0e1xuXG5cdFx0dGltZURpZmYgPSBtc2cudGltZURpZmY7XG5cblx0XHQvL2NvbnNvbGUuZGlyKG1zZyk7XG5cblx0XHRsb2cobXNnLmluZGV4LCBtc2cubGlzdC5sZW5ndGgpO1xuXG5cdFx0bGV0IGNhY2hlID0ge1xuXHRcdFx0Y2hhcjogW10sXG5cdFx0XHRvdGhlcjogW10sXG5cdFx0XHRlbmc6IFtdLFxuXHRcdH0gYXMge1xuXHRcdFx0W2sgaW4gRW51bUMxIHwgc3RyaW5nXTogc3RyaW5nW107XG5cdFx0fTtcblxuXHRcdHtcblx0XHRcdGxldCBpID0gJ2EnLmNvZGVQb2ludEF0KDApO1xuXHRcdFx0bGV0IGogPSAneicuY29kZVBvaW50QXQoMCk7XG5cblx0XHRcdHdoaWxlIChpIDw9IGopXG5cdFx0XHR7XG5cdFx0XHRcdGNhY2hlW1N0cmluZy5mcm9tQ29kZVBvaW50KGkpXSA9IFtdO1xuXG5cdFx0XHRcdGkrKztcblx0XHRcdH1cblx0XHR9XG5cblx0XHRjYWNoZSA9IG1zZy5saXN0LnJlZHVjZShmdW5jdGlvbiAoY2FjaGUsIGN1cilcblx0XHR7XG5cblx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdGxldCB7IGMxLCBsaW5lIH0gPSBjdXI7XG5cblx0XHRcdGNhY2hlW2MxXSA9IGNhY2hlW2MxXSB8fCBbXTtcblxuXHRcdFx0Y2FjaGVbYzFdLnB1c2goQnVmZmVyLmZyb20obGluZSkudG9TdHJpbmcoKSk7XG5cblx0XHRcdHJldHVybiBjYWNoZVxuXHRcdH0sIGNhY2hlKVxuXHRcdDtcblxuXHRcdE9iamVjdC5lbnRyaWVzKGNhY2hlKS5mb3JFYWNoKGFzeW5jIGZ1bmN0aW9uIChbYzEsIGxzXSlcblx0XHR7XG5cdFx0XHRpZiAoIS9eW2EtejAtOV0kL2kudGVzdChjMSkpXG5cdFx0XHR7XG5cdFx0XHRcdGMxID0gJzAvJyArIGMxO1xuXHRcdFx0fVxuXG5cdFx0XHRsZXQgZmlsZSA9IHBhdGguam9pbihDV0RfU0FWRVRPLCBjMSArICcudHh0Jyk7XG5cblx0XHRcdGZzLmVuc3VyZUZpbGVTeW5jKGZpbGUpO1xuXG5cdFx0XHRpZiAoIWxzLmxlbmd0aClcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gZnMuYXBwZW5kRmlsZVN5bmMoZmlsZSwgbHMuam9pbignXFxuJykgKyAnXFxuJylcblx0XHR9KTtcblxuXHRcdC8vZnMuYXBwZW5kRmlsZSgpXG5cblx0fSk7XG5cblx0dzEub24oJ2Vycm9yJywgY29uc29sZS5lcnJvcik7XG5cdHcxLm9uKCdleGl0JywgKGNvZGUpID0+XG5cdHtcblxuXHRcdGxldCBib29sID0gdHJ1ZTtcblxuXHRcdHRyeVxuXHRcdHtcblx0XHRcdGxldCBpID0gdGltZURpZmYuZ2V0VGltZSgpIC0gd29ya2VyT3B0aW9ucy53b3JrZXJEYXRhLnRpbWUuZ2V0VGltZSgpO1xuXG5cdFx0XHRsb2coaSwgdGltZURpZmYpO1xuXHRcdH1cblx0XHRjYXRjaCAoZSlcblx0XHR7XG5cdFx0XHRib29sID0gZmFsc2U7XG5cdFx0fVxuXG5cdFx0aWYgKGJvb2wpXG5cdFx0e1xuXHRcdFx0bGV0IGxzID0gRmFzdEdsb2Iuc3luYzxzdHJpbmc+KFtcblx0XHRcdFx0JyoqLyoudHh0J1xuXHRcdFx0XSwge1xuXHRcdFx0XHRjd2Q6IENXRF9TQVZFVE8sXG5cdFx0XHRcdGFic29sdXRlOiB0cnVlLFxuXHRcdFx0fSkuc29ydCgpO1xuXG5cdFx0XHRsZXQgZmlsZTIgPSBwYXRoLmpvaW4oQ1dELCAnc3RyaW5naWZ5LnNvcnRlZC50eHQnKTtcblxuXHRcdFx0ZnMuZW5zdXJlRmlsZVN5bmMoZmlsZTIpO1xuXHRcdFx0ZnMudHJ1bmNhdGVTeW5jKGZpbGUyKTtcblxuXHRcdFx0bGV0IGkyID0gbHMucmVkdWNlKChhLCBmaWxlOiBzdHJpbmcpID0+IHtcblxuXHRcdFx0XHRsb2coJ1tzdGFydF0nLCBwYXRoLnJlbGF0aXZlKENXRF9TQVZFVE8sIGZpbGUpKTtcblxuXHRcdFx0XHRjb25zdCBsaW5lciA9IG5ldyBsaW5lQnlMaW5lKGZpbGUpO1xuXHRcdFx0XHRsZXQgbGluZTogQnVmZmVyO1xuXG5cdFx0XHRcdGxldCBpbmRleCA9IDA7XG5cblx0XHRcdFx0bGV0IGxpc3Q6IElMb2FkRGljdEZpbGVSb3cyW10gPSBbXTtcblxuXHRcdFx0XHR3aGlsZSAobGluZSA9IGxpbmVyLm5leHQoKSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGxldCBzID0gbGluZS50b1N0cmluZygpO1xuXHRcdFx0XHRcdGxldCBkYXRhID0gcGFyc2VMaW5lU2VnbWVudChzKTtcblx0XHRcdFx0XHRsZXQgW3csIHAsIGZdID0gZGF0YTtcblxuXHRcdFx0XHRcdGxldCBjdXI6IElMb2FkRGljdEZpbGVSb3cyID0ge1xuXHRcdFx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRcdFx0ZGF0YSxcblx0XHRcdFx0XHRcdGxpbmU6IHMsXG5cdFx0XHRcdFx0XHRpbmRleDogaW5kZXgrKyxcblx0XHRcdFx0XHRcdGMxOiBFbnVtQzEub3RoZXIgYXMgc3RyaW5nLFxuXHRcdFx0XHRcdFx0bGluZV90eXBlOiBjaGtMaW5lVHlwZShzKSxcblx0XHRcdFx0XHRcdGNqa19pZDogZ2V0Q2prTmFtZSh3KSxcblx0XHRcdFx0XHR9O1xuXG5cdFx0XHRcdFx0bGlzdC5wdXNoKGN1cik7XG5cblx0XHRcdFx0XHRhKys7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRsaXN0ID0gU29ydExpc3QoIGxpc3QpO1xuXG5cdFx0XHRcdGxldCBvdXRfbGlzdCA9IGxpc3QubWFwKHYgPT4gdi5saW5lKTtcblxuXHRcdFx0XHRvdXRfbGlzdCA9IGFycmF5X3VuaXF1ZShvdXRfbGlzdCk7XG5cblx0XHRcdFx0bGV0IG91dF9kYXRhID0gc2VyaWFsaXplKG91dF9saXN0KTtcblxuXHRcdFx0XHRmcy5vdXRwdXRGaWxlU3luYyhmaWxlLCBvdXRfZGF0YSArIFwiXFxuXFxuXCIpO1xuXG5cdFx0XHRcdGZzLmFwcGVuZEZpbGVTeW5jKGZpbGUyLCBvdXRfZGF0YSArIFwiXFxuXCIpO1xuXG5cdFx0XHRcdGxvZygnW2RvbmVdJywgcGF0aC5yZWxhdGl2ZShDV0RfU0FWRVRPLCBmaWxlKSk7XG5cblx0XHRcdFx0cmV0dXJuIGE7XG5cdFx0XHR9LCAwKTtcblxuXHRcdFx0bG9nKGkyKVxuXHRcdH1cblxuXHRcdGlmIChjb2RlICE9IDApXG5cdFx0e1xuXHRcdFx0Y29uc29sZS5lcnJvcihuZXcgRXJyb3IoYFdvcmtlciBzdG9wcGVkIHdpdGggZXhpdCBjb2RlICR7Y29kZX1gKSlcblx0XHR9XG5cdFx0ZWxzZVxuXHRcdHtcblx0XHRcdGxvZyhgV29ya2VyIHN0b3BwZWRgKVxuXHRcdH1cblx0fSk7XG5cbn1cbmVsc2Vcbntcbi8vXHRwYXJlbnRQb3J0Lm9uY2UoJ21lc3NhZ2UnLCAodmFsdWUpID0+IHtcbi8vXHRcdHZhbHVlLmhlcmVJc1lvdXJQb3J0LnBvc3RNZXNzYWdlKCdoZWxsbycpO1xuLy9cdFx0dmFsdWUuaGVyZUlzWW91clBvcnQub24oJ21lc3NhZ2UnLCBtc2cgPT4ge1xuLy9cdFx0XHRjb25zb2xlLmxvZyhgdGhyZWFkICR7dGhyZWFkSWR9OiByZWNlaXZlICR7bXNnfWApO1xuLy9cdFx0fSk7XG4vL1x0fSk7XG5cblx0Ly90aGUgd29ya2VyJ3MgY29kZVxuXG5cdGNvbnNvbGUuZGlyKHdvcmtlckRhdGEsIHtcblx0XHRjb2xvcnM6IHRydWUsXG5cdH0pO1xuXG4vL1x0bG9nKHdvcmtlckRhdGEucmUudGVzdCgnICcpKTtcblxuXHRsZXQgZmlsZSA9IHBhdGguam9pbihDV0QsICdzdHJpbmdpZnkudHh0Jyk7XG5cblx0Y29uc3QgbGluZXIgPSBuZXcgbGluZUJ5TGluZShmaWxlKTtcblxuXHRsZXQgbGluZTogQnVmZmVyO1xuXHRsZXQgbGluZU51bWJlciA9IDA7XG5cdGxldCBjb3VudCA9IDA7XG5cblx0bGV0IGMxX29sZDogc3RyaW5nO1xuXG5cdGxldCBsaXN0ID0gW107XG5cblx0d2hpbGUgKGxpbmUgPSBsaW5lci5uZXh0KCkpXG5cdHtcblx0XHQvL2NvbnNvbGUubG9nKCdMaW5lICcgKyBsaW5lTnVtYmVyICsgJzogJyArIGxpbmUudG9TdHJpbmcoJ2FzY2lpJykpO1xuXG5cdFx0bGV0IGluZGV4ID0gbGluZU51bWJlcisrO1xuXG5cdFx0bGV0IGRhdGEgPSBwYXJzZUxpbmVTZWdtZW50KGxpbmUudG9TdHJpbmcoKSk7XG5cblx0XHRsZXQgY3VyID0ge1xuXHRcdFx0ZGF0YSxcblx0XHRcdGxpbmUsXG5cdFx0XHRpbmRleCxcblx0XHRcdGMxOiBFbnVtQzEub3RoZXIgYXMgc3RyaW5nLFxuXHRcdH07XG5cblx0XHRsZXQgW3csIHAsIGZdID0gY3VyLmRhdGE7XG5cblx0XHRsZXQgbGVuID0gVVN0cmluZy5zaXplKHcpO1xuXG5cdFx0bGV0IGMxX25vdzogc3RyaW5nO1xuXG5cdFx0aWYgKGxlbiA+IDEpXG5cdFx0e1xuXHRcdFx0YzFfbm93ID0gZ2V0Q2lkKHcpO1xuXG5cdFx0XHRpZiAoIWMxX25vdylcblx0XHRcdHtcblx0XHRcdFx0Y29uc29sZS5sb2coYzFfbm93LCB3KTtcblxuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoYCR7d30sICR7YzFfbm93fWApO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRlbHNlIGlmIChsZW4gPT09IDEpXG5cdFx0e1xuXHRcdFx0YzFfbm93ID0gRW51bUMxLmNoYXI7XG5cdFx0fVxuXHRcdGVsc2Vcblx0XHR7XG5cdFx0XHRjMV9ub3cgPSBFbnVtQzEub3RoZXI7XG5cdFx0fVxuXG5cdFx0Y3VyLmMxID0gYzFfbm93O1xuXG5cdFx0aWYgKGNvdW50ID49IDEwMDAwKVxuXHRcdHtcblx0XHRcdHBhcmVudFBvcnQucG9zdE1lc3NhZ2Uoe1xuXG5cdFx0XHRcdGluZGV4LFxuXHRcdFx0XHRsaXN0LFxuXG5cdFx0XHR9KTtcblxuXHRcdFx0bGlzdCA9IFtdO1xuXG5cdFx0XHRjb3VudCA9IDA7XG5cdFx0fVxuXG5cdFx0bGlzdC5wdXNoKGN1cik7XG5cblx0XHRjMV9vbGQgPSBjMV9ub3c7XG5cblx0XHRjb3VudCsrO1xuXHR9XG5cblx0bG9nKCdlbmQgb2YgbGluZSByZWFjaGVkJywgbGluZU51bWJlcik7XG5cblx0d29ya2VyRGF0YS5jb3VudCA9IGxpbmVOdW1iZXI7XG5cblx0cGFyZW50UG9ydC5wb3N0TWVzc2FnZSh7XG5cdFx0dGltZURpZmY6IG5ldyBEYXRlLFxuXHRcdGluZGV4OiBsaW5lTnVtYmVyLFxuXHRcdGxpc3QsXG5cdH0pO1xuXG59XG5cbmZ1bmN0aW9uIGxvZyguLi5hcmd2KVxue1xuXHRjb25zb2xlLmxvZyhgW3RocmVhZDoke3RocmVhZElkfV1gLCAuLi5hcmd2KTtcbn1cblxuZnVuY3Rpb24gZ2V0Q2lkKHc6IHN0cmluZylcbntcblx0dyA9IFVTdHJpbmcuc2xpY2UodywgMCwgMSkudG9Mb2NhbGVMb3dlckNhc2UoKTtcblxuXHRpZiAoL15bYS16MC05XSQvaS50ZXN0KHcpKVxuXHR7XG5cdFx0cmV0dXJuIEVudW1DMS5lbmc7XG5cdH1cblxuXHRsZXQgcyA9IGdldENqa05hbWUodyk7XG5cblx0bGV0IHIgPSBzbHVnaWZ5VHIocyk7XG5cblx0aWYgKCFyKVxuXHR7XG5cdFx0dHJ5XG5cdFx0e1xuXHRcdFx0ciA9IHNsdWdpZnlUcihwaW55aW4ocylbMF1bMF0pO1xuXHRcdH1cblx0XHRjYXRjaCAoZSlcblx0XHR7XG5cblx0XHR9XG5cdH1cblxuXHRpZiAoIXIpXG5cdHtcblx0XHR0cnlcblx0XHR7XG5cdFx0XHRyID0gc2x1Z2lmeVRyKHBpbnlpbih3KVswXVswXSk7XG5cdFx0fVxuXHRcdGNhdGNoIChlKVxuXHRcdHtcblxuXHRcdH1cblx0fVxuXG5cdGlmICghcilcblx0e1xuXHRcdHIgPSBzbHVnaWZ5VHIoZ3JlZWR5VGFibGVSZXBsYWNlKHMpKTtcblx0fVxuXG5cdGlmICghcilcblx0e1xuXHRcdGxldCBhcnIgPSBsaWJUYWJsZS5hdXRvKHMsIHtcblx0XHRcdHNhZmU6IGZhbHNlLFxuXHRcdFx0Z3JlZWR5VGFibGU6IDIsXG5cdFx0fSk7XG5cblx0XHRpZiAoYXJyLmxlbmd0aClcblx0XHR7XG5cdFx0XHRyID0gc2x1Z2lmeVRyKGFyclsxXSB8fCBhcnJbMF0pO1xuXHRcdH1cblx0fVxuXG5cdGlmICghcilcblx0e1xuXHRcdGxldCBhcnIgPSBsaWJUYWJsZS5hdXRvKHcsIHtcblx0XHRcdHNhZmU6IGZhbHNlLFxuXHRcdFx0Z3JlZWR5VGFibGU6IDIsXG5cdFx0fSk7XG5cblx0XHRpZiAoYXJyLmxlbmd0aClcblx0XHR7XG5cdFx0XHRyID0gc2x1Z2lmeVRyKGFyclsxXSB8fCBhcnJbMF0pO1xuXHRcdH1cblx0fVxuXG5cdGlmICghcilcblx0e1xuXHRcdHIgPSBzbHVnaWZ5VHIoY2prMnpocyhzKSk7XG5cdH1cblxuXHRpZiAoIXIpXG5cdHtcblx0XHRyID0gc2x1Z2lmeVRyKGNqazJ6aHQocykpO1xuXHR9XG5cblx0aWYgKCFyKVxuXHR7XG5cdFx0ciA9IHNsdWdpZnlUcihjamsyemhzKHcpKTtcblx0fVxuXG5cdGlmICghcilcblx0e1xuXHRcdHIgPSBzbHVnaWZ5VHIoY2prMnpodCh3KSk7XG5cdH1cblxuXHRpZiAoIXIpXG5cdHtcblx0XHRyID0gc2x1Z2lmeVRyKHcpO1xuXHR9XG5cblx0aWYgKCFyKVxuXHR7XG5cdFx0ciA9IHc7XG5cdH1cblxuXHRsZXQgcjIgPSBVU3RyaW5nLnNsaWNlKHIsIDAsIDEpO1xuXG5cdGlmICghL15bYS16MC05XSQvaS50ZXN0KHIyKSlcblx0e1xuXHRcdHIyID0gRW51bUMxLm90aGVyO1xuXHR9XG5cblx0cmV0dXJuIHIyLnRvTG9jYWxlTG93ZXJDYXNlKClcbn1cblxuZnVuY3Rpb24gU29ydExpc3Q8VCA9IElMb2FkRGljdEZpbGVSb3cyPihsczogVFtdKVxue1xuXHQvLyBAdHMtaWdub3JlXG5cdHJldHVybiBscy5zb3J0KGZ1bmN0aW9uIChhOiBJTG9hZERpY3RGaWxlUm93MiwgYjogSUxvYWREaWN0RmlsZVJvdzIpXG5cdHtcblx0XHRpZiAoXG5cdFx0XHRhLmxpbmVfdHlwZSA9PSBFbnVtTGluZVR5cGUuQ09NTUVOVF9UQUdcblx0XHRcdHx8IGIubGluZV90eXBlID09IEVudW1MaW5lVHlwZS5DT01NRU5UX1RBR1xuXHRcdClcblx0XHR7XG5cdFx0XHRyZXR1cm4gKGEuaW5kZXggLSBiLmluZGV4KTtcblx0XHR9XG5cdFx0ZWxzZSBpZiAoXG5cdFx0XHRhLmxpbmVfdHlwZSA9PSBFbnVtTGluZVR5cGUuQ09NTUVOVFxuXHRcdFx0fHwgYi5saW5lX3R5cGUgPT0gRW51bUxpbmVUeXBlLkNPTU1FTlRcblx0XHQpXG5cdFx0e1xuXHRcdFx0cmV0dXJuIChhLmluZGV4IC0gYi5pbmRleCk7XG5cdFx0fVxuXG5cdFx0bGV0IHJldCA9IHpoRGljdENvbXBhcmUoYS5jamtfaWQsIGIuY2prX2lkKVxuXHRcdFx0fHwgKGEuaW5kZXggLSBiLmluZGV4KVxuXHRcdFx0fHwgMFxuXHRcdDtcblxuXHRcdHJldHVybiByZXQ7XG5cdH0pXG59XG4iXX0=