"use strict";
/**
 * 分词器接口
 *
 * @author 老雷<leizongmin@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SegmentCore = void 0;
const index_1 = require("../mod/index");
const split_1 = require("./methods/split");
const indexOf_1 = require("./methods/indexOf");
const convertSynonym_1 = require("./methods/convertSynonym");
const listModules_1 = require("./methods/listModules");
const _get_text_1 = require("./methods/_get_text");
const getOptionsDoSegment_1 = require("./methods/getOptionsDoSegment");
const useModules_1 = require("./methods/useModules");
const doSegment_1 = require("./methods/doSegment");
const ids_1 = require("@novel-segment/postag/lib/postag/ids");
const stringify_1 = require("@novel-segment/stringify");
/**
 * 创建分词器接口
 */
class SegmentCore {
    constructor(options = {}) {
        /**
         * 分段
         *
         * 由於 segment 是利用對內容的前後文分析來進行分詞
         * 所以如何切割段落對於結果就會產生不同影響
         *
         * `RegExp` or 具有 `.[Symbol.split](input: string, limit?: number) => string[]` 的物件
         *
         * @type {Segment.ISPLIT}
         */
        this.SPLIT = /([\r\n]+|^[　\s]+|[　\s]+$|[　\s]{2,})/gm;
        /**
         * 分段之後 如果符合以下條件 則直接忽略分析
         * `RegExp` or 具有 `.test(input: string) => boolean` 的物件
         *
         * @type {Segment.ISPLIT_FILTER}
         */
        this.SPLIT_FILTER = /^([\r\n]+)$/g;
        /**
         * 词性
         * @type {POSTAG}
         */
        this.POSTAG = ids_1.POSTAG;
        /**
         * 词典表
         * @type {{}}
         */
        this.DICT = {};
        this.modules = {
            /**
             * 分词模块
             */
            tokenizer: [],
            /**
             * 优化模块
             */
            optimizer: [],
        };
        this.db = {};
        this.options = {};
        const self = this;
        this.options = Object.assign({}, this.options, options);
        this.tokenizer = new index_1.Tokenizer(this);
        this.optimizer = new index_1.Optimizer(this);
        if (this.options.db) {
            this.options.db.forEach(function (data) {
                self.db[data.type] = data;
            });
        }
        delete this.options.db;
    }
    getDictDatabase(type, autocreate, libTableDict) {
        // @ts-ignore
        return this.db[type];
    }
    use(mod, ...argv) {
        (0, useModules_1.useModules)(this, mod, ...argv);
        return this;
    }
    getDict(type) {
        return this.DICT[type];
    }
    getOptionsDoSegment(options) {
        return (0, getOptionsDoSegment_1.getOptionsDoSegment)(options, this.options.optionsDoSegment);
    }
    _get_text(text) {
        return (0, _get_text_1._get_text)(text);
    }
    addBlacklist(word, remove) {
        let me = this;
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
        const BLACKLIST = me.getDict("BLACKLIST" /* EnumDictDatabase.BLACKLIST */);
        const TABLE = me.getDictDatabase("TABLE" /* EnumDictDatabase.TABLE */);
        Object.entries(BLACKLIST)
            .forEach(function ([key, bool]) {
            bool && TABLE.remove(key);
        });
        return this;
    }
    listModules(options = {}) {
        options = this.getOptionsDoSegment(options);
        return (0, listModules_1.listModules)(this.modules, options);
    }
    doSegment(text, options = {}) {
        const me = this;
        options = me.getOptionsDoSegment(options);
        //console.dir(options);
        let text_list = me._get_text(text)
            // @ts-ignore
            .split(this.SPLIT);
        text = undefined;
        const mods = me.listModules(options).enable;
        // 将文本按照换行符分割成多段，并逐一分词
        let ret = text_list.reduce(function (ret, section) {
            //console.dir(section);
            if (me.SPLIT_FILTER.test(section)) {
                ret = ret.concat({ w: section });
                // @ts-ignore
                section = [];
            }
            //section = section.trim();
            if (section.length > 0) {
                // 分词
                let sret = me.tokenizer.split(section, mods.tokenizer);
                // 优化
                sret = me.optimizer.doOptimize(sret, mods.optimizer);
                // 连接分词结果
                if (sret.length > 0) {
                    ret = ret.concat(sret);
                }
            }
            return ret;
        }, []);
        // 去除标点符号
        if (options.stripPunctuation) {
            ret = (0, doSegment_1._doSegmentStripPOSTAG)(ret, ids_1.POSTAG.D_W);
        }
        if (options.convertSynonym) {
            ret = this.convertSynonym(ret);
        }
        // 去除停止符
        if (options.stripStopword) {
            ret = (0, doSegment_1._doSegmentStripStopword)(ret, me.getDict('STOPWORD'));
        }
        if (options.stripSpace) {
            ret = (0, doSegment_1._doSegmentStripSpace)(ret);
        }
        // 仅返回单词内容
        if (options.simple) {
            ret = (0, doSegment_1._doSegmentSimple)(ret);
        }
        return ret;
    }
    convertSynonym(ret, showcount) {
        return (0, convertSynonym_1.convertSynonym)(ret, {
            showcount,
            DICT_SYNONYM: this.getDict("SYNONYM" /* EnumDictDatabase.SYNONYM */),
            DICT_TABLE: this.getDict("TABLE" /* EnumDictDatabase.TABLE */),
            POSTAG: this.POSTAG,
        });
    }
    /**
     * 将单词数组连接成字符串
     *
     * @param {Array} words 单词数组
     * @return {String}
     */
    stringify(words, ...argv) {
        return (0, stringify_1.stringify)(words, ...argv);
    }
    /**
     * 将单词数组连接成字符串
     *
     * @param {Array} words 单词数组
     * @return {String}
     */
    static stringify(words, ...argv) {
        return (0, stringify_1.stringify)(words, ...argv);
    }
    /**
     * 根据某个单词或词性来分割单词数组
     *
     * @param {Array} words 单词数组
     * @param {Number|String} s 用于分割的单词或词性
     * @return {Array}
     */
    split(words, s, ...argv) {
        return (0, split_1.split)(words, s, ...argv);
    }
    /**
     * 在单词数组中查找某一个单词或词性所在的位置
     *
     * @param {Array} words 单词数组
     * @param {Number|String} s 要查找的单词或词性
     * @param {Number} cur 开始位置
     * @return {Number} 找不到，返回-1
     */
    indexOf(words, s, cur, ...argv) {
        return (0, indexOf_1.indexOf)(words, cur, ...argv);
    }
}
exports.SegmentCore = SegmentCore;
exports.default = SegmentCore;
//# sourceMappingURL=core.js.map