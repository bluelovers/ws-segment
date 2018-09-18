"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cacache = require("cacache");
const util_1 = require("./util");
const bluebird = require("bluebird");
const crypto = require("crypto");
const fs = require("fs-extra");
class Cacache {
    static getHashes() {
        return crypto.getHashes();
    }
    constructor(options) {
        options = options || {};
        if (!options.cachePath) {
            options.cachePath = util_1.getCacheDirPath();
        }
        this.cachePath = options.cachePath;
        if (!fs.existsSync(this.cachePath)) {
            throw new Error(`發生錯誤 快取目錄不存在 '${this.cachePath}'`);
        }
        util_1.debugConsole.debug(`cachePath: ${this.cachePath}`);
    }
    list() {
        return bluebird
            .resolve(cacache.ls(this.cachePath));
    }
    readData(key, options) {
        return bluebird
            .resolve(cacache.get(this.cachePath, key, options));
    }
    readJSON(key, options) {
        return this.readData(key, options)
            .then(function (ret) {
            let ret2 = ret;
            ret2.json = JSON.parse(ret2.data.toString());
            return ret2;
        });
    }
    readDataInfo(key, options) {
        return bluebird
            .resolve(cacache.get.info(this.cachePath, key, options));
    }
    hasContent(integrity) {
        return bluebird
            .resolve(cacache.get.hasContent(this.cachePath, integrity));
    }
    hasData(key, options) {
        let self = this;
        return bluebird
            .resolve()
            .bind(this)
            .then(async function () {
            let info = await self.readDataInfo(key);
            if (info
                && options
                && options.ttl
                && (info.time + options.ttl) <= Date.now()) {
                await self.remove(key);
                return null;
            }
            return info || null;
        });
    }
    writeData(key, data, options) {
        return bluebird
            .resolve(cacache.put(this.cachePath, key, data, options));
    }
    writeJSON(key, data, options) {
        return this.writeData(key, JSON.stringify(data), options);
    }
    removeAll() {
        return bluebird.resolve(cacache.rm.all(this.cachePath));
    }
    remove(key) {
        return bluebird.resolve(cacache.rm.entry(this.cachePath, key));
    }
    removeContent(data_integrity) {
        return bluebird.resolve(cacache.rm.content(this.cachePath, data_integrity));
    }
    clearMemoized() {
        cacache.clearMemoized();
        return bluebird.resolve();
    }
    createTempDirPath(options) {
        return bluebird.resolve(cacache.tmp.mkdir(this.cachePath, options));
    }
    withTempDirPath(options) {
        return new bluebird((resolve, reject) => {
            cacache.tmp.withTmp(this.cachePath, resolve, options);
        });
    }
}
exports.Cacache = Cacache;
exports.default = Cacache;
