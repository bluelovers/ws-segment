"use strict";
/**
 * 分词器接口
 *
 * @author 老雷<leizongmin@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Segment = void 0;
const tslib_1 = require("tslib");
const path_1 = tslib_1.__importDefault(require("path"));
const get_1 = require("./fs/get");
const table_blacklist_1 = require("@novel-segment/table-blacklist");
const table_dict_1 = require("@novel-segment/table-dict");
const loader_1 = tslib_1.__importDefault(require("./loader"));
const table_stopword_1 = require("@novel-segment/table-stopword");
const table_synonym_1 = require("@novel-segment/table-synonym");
const segment_dict_1 = tslib_1.__importDefault(require("segment-dict"));
const project_config_1 = tslib_1.__importDefault(require("../project.config"));
const core_1 = require("./segment/core");
const defaults_1 = require("./segment/defaults");
const index_1 = require("./defaults/index");
const useModules2_1 = require("./segment/methods/useModules2");
/**
 * 创建分词器接口
 */
class Segment extends core_1.SegmentCore {
    getDictDatabase(type, autocreate, libTableDict) {
        if ((autocreate || this.inited) && !this.db[type]) {
            if (type === table_synonym_1.TableDictSynonym.type) {
                libTableDict = libTableDict || table_synonym_1.TableDictSynonym;
            }
            else if (type === table_stopword_1.TableDictStopword.type) {
                libTableDict = libTableDict || table_stopword_1.TableDictStopword;
            }
            else if (type === table_blacklist_1.TableDictBlacklist.type || type === "BLACKLIST_FOR_OPTIMIZER" /* EnumDictDatabase.BLACKLIST_FOR_OPTIMIZER */ || type === "BLACKLIST_FOR_SYNONYM" /* EnumDictDatabase.BLACKLIST_FOR_SYNONYM */) {
                libTableDict = libTableDict || table_blacklist_1.TableDictBlacklist;
            }
            else {
                libTableDict = libTableDict || table_dict_1.TableDict;
            }
            this.db[type] = new libTableDict(type, this.options, {
                TABLE: this.DICT[type],
            });
        }
        return this.db[type];
    }
    use(mod, ...argv) {
        (0, useModules2_1.useModules)(this, mod, ...argv);
        this.inited = true;
        return this;
    }
    _resolveDictFilename(name, pathPlus = [], extPlus = []) {
        let options = {
            paths: [
                '',
                project_config_1.default.dict_root,
                ...pathPlus,
                path_1.default.resolve(segment_dict_1.default.DICT_ROOT, 'segment'),
            ],
            extensions: [
                '',
                ...extPlus,
                '.utf8',
                '.txt',
            ],
            onlyFile: true,
        };
        if (name.indexOf('*') !== -1) {
            let ls = (0, get_1.searchGlobSync)(name, options);
            if (!(ls === null || ls === void 0 ? void 0 : ls.length)) {
                throw Error(`Cannot find dict glob file "${name}".`);
            }
            return ls;
        }
        let filename = (0, get_1.searchFirstSync)(name, options);
        if (!(filename === null || filename === void 0 ? void 0 : filename.length)) {
            //console.log(name, pathPlus, extPlus);
            throw Error(`Cannot find dict file "${name}".`);
        }
        return filename;
    }
    /**
     * 载入字典文件
     *
     * @param {String} name 字典文件名
     * @param {String} type 类型
     * @param {Boolean} convert_to_lower 是否全部转换为小写
     * @return {Segment}
     */
    loadDict(name, type, convert_to_lower, skipExists) {
        let filename = this._resolveDictFilename(name);
        if (Array.isArray(filename)) {
            let self = this;
            filename.forEach(v => this.loadDict(v, type, convert_to_lower, skipExists));
            //console.log(filename);
            return this;
        }
        if (!type)
            type = "TABLE" /* EnumDictDatabase.TABLE */; // 默认为TABLE
        const db = this.getDictDatabase(type, true);
        const TABLE = this.DICT[type] = db.TABLE;
        const TABLE2 = this.DICT[type + '2'] = db.TABLE2;
        /*
        // 初始化词典
        if (!this.DICT[type]) this.DICT[type] = {};
        if (!this.DICT[type + '2']) this.DICT[type + '2'] = {};
        let TABLE = this.DICT[type];        // 词典表  '词' => {属性}
        let TABLE2 = this.DICT[type + '2']; // 词典表  '长度' => '词' => 属性
        */
        // 导入数据
        const POSTAG = this.POSTAG;
        let data = loader_1.default.SegmentDictLoader.loadSync(filename);
        data.forEach(function (data) {
            if (convert_to_lower) {
                data[0] = data[0].toLowerCase();
            }
            db.add(data, skipExists);
            /*
            let [w, p, f] = data;

            if (w.length == 0)
            {
                throw new Error()
            }

            TABLE[w] = { p, f, };
            if (!TABLE2[w.length]) TABLE2[w.length] = {};
            TABLE2[w.length][w] = TABLE[w];
            */
        });
        data = undefined;
        this.inited = true;
        return this;
    }
    /**
     * 载入同义词词典
     *
     * @param {String} name 字典文件名
     */
    loadSynonymDict(name, skipExists) {
        let filename = this._resolveDictFilename(name, [
            path_1.default.resolve(segment_dict_1.default.DICT_ROOT, 'synonym'),
        ]);
        if (Array.isArray(filename)) {
            let self = this;
            filename.forEach(v => this.loadSynonymDict(v, skipExists));
            return this;
        }
        const type = "SYNONYM" /* EnumDictDatabase.SYNONYM */;
        const db = this.getDictDatabase(type, true);
        const TABLE = this.DICT[type] = db.TABLE;
        /*
        // 初始化词典
        if (!this.DICT[type]) this.DICT[type] = {};
        // 词典表  '同义词' => '标准词'
        let TABLE = this.DICT[type] as IDICT_SYNONYM;
        // 导入数据
        */
        let data = loader_1.default.SegmentSynonymLoader.loadSync(filename);
        data.forEach(function (blocks) {
            db.add(blocks, skipExists);
            /*
            let [n1, n2] = blocks;

            TABLE[n1] = n2;
            if (TABLE[n2] === n1)
            {
                delete TABLE[n2];
            }
            */
        });
        //console.log(TABLE);
        data = undefined;
        this.inited = true;
        return this;
    }
    _loadBlacklistDict(name, type) {
        let filename = this._resolveDictFilename(name, [
            path_1.default.resolve(segment_dict_1.default.DICT_ROOT, 'blacklist'),
        ]);
        if (Array.isArray(filename)) {
            let self = this;
            filename.forEach(v => this._loadBlacklistDict(v, type));
            return this;
        }
        const db = this.getDictDatabase(type, true);
        const TABLE = this.DICT[type] = db.TABLE;
        let data = loader_1.default.SegmentDict
            .requireLoaderModule('line')
            .loadSync(filename, {
            filter(line) {
                return line.trim();
            },
        });
        data.forEach(v => db.add(v));
        data = undefined;
        this.inited = true;
        return this;
    }
    /**
     * 字典黑名單 在主字典內刪除此字典內有的條目
     */
    loadBlacklistDict(name) {
        return this._loadBlacklistDict(name, "BLACKLIST" /* EnumDictDatabase.BLACKLIST */);
    }
    /**
     * 優化器黑名單 會防止部分優化器去組合此字典內的詞
     * 例如 人名 自動組合之類
     */
    loadBlacklistOptimizerDict(name) {
        return this._loadBlacklistDict(name, "BLACKLIST_FOR_OPTIMIZER" /* EnumDictDatabase.BLACKLIST_FOR_OPTIMIZER */);
    }
    /**
     * 轉換黑名單 動態轉換字詞時會忽略此字典內的詞
     */
    loadBlacklistSynonymDict(name) {
        return this._loadBlacklistDict(name, "BLACKLIST_FOR_SYNONYM" /* EnumDictDatabase.BLACKLIST_FOR_SYNONYM */);
    }
    /**
     * 载入停止符词典
     *
     * @param {String} name 字典文件名
     */
    loadStopwordDict(name) {
        let filename = this._resolveDictFilename(name, [
            path_1.default.resolve(segment_dict_1.default.DICT_ROOT, 'stopword'),
        ]);
        if (Array.isArray(filename)) {
            let self = this;
            filename.forEach(v => this.loadStopwordDict(v));
            return this;
        }
        const type = "STOPWORD" /* EnumDictDatabase.STOPWORD */;
        const db = this.getDictDatabase(type, true);
        const TABLE = this.DICT[type] = db.TABLE;
        let data = loader_1.default.SegmentDict
            .requireLoaderModule('line')
            .loadSync(filename, {
            filter(line) {
                return line.trim();
            },
        });
        data.forEach(v => db.add(v));
        data = undefined;
        this.inited = true;
        return this;
    }
    useDefault(...argv) {
        (0, index_1.useDefault)(this, ...argv);
        this.inited = true;
        return this;
    }
    /**
     * 此函數只需執行一次，並且一般狀況下不需要手動呼叫
     */
    autoInit(options) {
        if (!this.inited) {
            this.inited = true;
            if (!this.modules.tokenizer.length) {
                this.useDefault(options);
            }
        }
        return this;
    }
    addBlacklist(word, remove) {
        let me = this;
        this.autoInit(this.options);
        const BLACKLIST = me.getDictDatabase("BLACKLIST" /* EnumDictDatabase.BLACKLIST */);
        const TABLE = me.getDictDatabase("TABLE" /* EnumDictDatabase.TABLE */);
        let bool = !remove;
        if (bool) {
            BLACKLIST.add(word);
            TABLE.remove(word);
        }
        else {
            BLACKLIST.remove(word);
        }
        return this;
    }
    /**
     * remove key in TABLE by BLACKLIST
     */
    doBlacklist() {
        let me = this;
        this.autoInit(this.options);
        const BLACKLIST = me.getDict("BLACKLIST" /* EnumDictDatabase.BLACKLIST */);
        const TABLE = me.getDictDatabase("TABLE" /* EnumDictDatabase.TABLE */);
        Object.entries(BLACKLIST)
            .forEach(function ([key, bool]) {
            bool && TABLE.remove(key);
        });
        return this;
    }
    doSegment(text, options = {}) {
        this.autoInit(this.options);
        return super.doSegment(text, options);
    }
}
exports.Segment = Segment;
Segment.defaultOptionsDoSegment = defaults_1.defaultOptionsDoSegment;
exports.default = Segment;
//# sourceMappingURL=Segment.js.map