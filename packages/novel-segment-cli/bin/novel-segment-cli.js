#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const yargs_1 = tslib_1.__importDefault(require("yargs"));
const index_1 = require("../index");
const ncu_1 = require("../lib/ncu");
const util_1 = require("../lib/util");
const bluebird_1 = tslib_1.__importDefault(require("bluebird"));
const upath2_1 = tslib_1.__importDefault(require("upath2"));
const fs_iconv_1 = tslib_1.__importDefault(require("fs-iconv"));
const fast_glob_1 = tslib_1.__importDefault(require("@bluelovers/fast-glob"));
const array_hyper_unique_1 = require("array-hyper-unique");
let cli_argv;
// @ts-ignore
cli_argv = yargs_1.default
    .option('file', {
    alias: ['f'],
    requiresArg: true,
    normalize: true,
    array: true,
    group: 'file',
    desc: `處理的檔案，可同時處理多個檔案`,
})
    .option('glob', {
    alias: ['g'],
    requiresArg: true,
    array: true,
    group: 'file',
})
    .option('text', {
    alias: ['t'],
    requiresArg: true,
    group: 'text',
    desc: `處理的文字，可搭配其他 cli 程式一起使用`,
})
    .option('mapSeries', {
    boolean: true,
    group: 'file',
    desc: `按照順序並且每次只處理一個檔案`,
})
    .option('createDir', {
    boolean: true,
    group: 'file',
    desc: `允許當目標資料夾不存在時自動建立`,
})
    .option('overwrite', {
    boolean: true,
})
    .option('useGlobalCache', {
    boolean: true,
})
    .option('outDir', {
    alias: ['o'],
    desc: `將處理後的結果儲存到目標資料夾`,
    requiresArg: true,
    normalize: true,
    group: 'file',
})
    .option('convertToZhTw', {
    boolean: true,
    desc: `是否在轉換後轉為繁體`,
})
    .option('crlf', {
    boolean: true,
    desc: `轉換換行符號`,
})
    .version()
    .help()
    .argv;
//console.log(cli_argv);
let err;
bluebird_1.default.resolve()
    .tap(function () {
    if (!cli_argv.text && (0, ncu_1.notNpxMaybe)(upath2_1.default.join(__dirname, '..'))) {
        let k = [
            (0, ncu_1.checkUpdateSelf)(),
            (0, ncu_1.checkUpdate)('novel-segment'),
            (0, ncu_1.checkUpdate)('segment-dict'),
        ]
            .forEach(function (data) {
            try {
                //data.notify();
            }
            catch (e) {
            }
        });
    }
})
    .catchReturn(null)
    .then(async function () {
    let options = {
        useGlobalCache: cli_argv.useGlobalCache,
        convertToZhTw: cli_argv.convertToZhTw,
        crlf: cli_argv.crlf,
    };
    if (!cli_argv.text && !cli_argv.file) {
        cli_argv.glob = cli_argv.glob || ['*.txt'];
    }
    if (cli_argv.text) {
        util_1.console.log(await (0, index_1.processText)(cli_argv.text, options));
    }
    else if (cli_argv.file || cli_argv.glob) {
        if (cli_argv.outDir) {
            let k = upath2_1.default.resolve(cli_argv.outDir);
            let exists = fs_iconv_1.default.existsSync(cli_argv.outDir);
            if (!cli_argv.outDir
                || (!cli_argv.createDir
                    && !exists)
                || k === upath2_1.default.resolve(__dirname)
                || k === upath2_1.default.resolve(upath2_1.default.join(__dirname, '..'))) {
                let msg = `不合法的 outDir 路徑 ${k}`;
                if (!exists) {
                    msg += `，該目錄不存在`;
                }
                throw new index_1.SegmentCliError(msg);
            }
        }
        let files = cli_argv.file || [];
        if (cli_argv.glob && cli_argv.glob.length) {
            await fast_glob_1.default.async(cli_argv.glob, {
                cwd: process.cwd(),
            })
                .then(ls => {
                if (ls.length) {
                    files = files.concat(ls);
                    files = (0, array_hyper_unique_1.array_unique)(files);
                }
            });
        }
        (0, util_1.freeGC)();
        await (cli_argv.mapSeries ?
            bluebird_1.default.mapSeries(files, loopEach)
            : bluebird_1.default.map(files, loopEach))
            .catch(setError)
            .tap(function () {
            (0, util_1.freeGC)();
        });
        async function loopEach(file, index, len) {
            return (0, index_1.processFile)(file, options)
                .tap(async function (text) {
                if (!text.length) {
                    util_1.console.gray.info(`[${index + 1}/${len}]`, file);
                    return;
                }
                util_1.console.info(`[${index + 1}/${len}]`, file);
                let p;
                if (cli_argv.outDir) {
                    p = fs_iconv_1.default.outputFile(upath2_1.default.join(cli_argv.outDir, upath2_1.default.basename(file)), text);
                }
                else {
                    p = fs_iconv_1.default.writeFile(file, text);
                }
                return p
                    .catch(setError);
            });
        }
    }
    else if (!err) {
        yargs_1.default.showHelp();
    }
})
    .catch(setError)
    .catch(function (e) {
    if (e instanceof ErrorStop) {
    }
    else if (e instanceof index_1.SegmentCliError) {
    }
    else {
        return bluebird_1.default.reject(e);
    }
})
    .then(function () {
    if (err) {
        //			yargs.showHelp();
        process.exit(1);
    }
    return null;
});
function setError(e) {
    let lastError = err;
    err = e;
    if (e instanceof index_1.SegmentCliError) {
        util_1.console.error(e.message);
        return bluebird_1.default.reject(new ErrorStop(e, lastError));
    }
    else {
        return bluebird_1.default.reject(e);
    }
}
class ErrorStop extends Error {
    constructor(e, lastError) {
        if (typeof e == 'string') {
            super(e);
        }
        else {
            super();
            this.currentError = e;
            this.lastError = lastError;
        }
    }
}
//# sourceMappingURL=novel-segment-cli.js.map