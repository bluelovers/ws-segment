/**
 * 分词器接口
 *
 * @author 老雷<leizongmin@gmail.com>
 */
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-ignore
// @ts-ignore
const path = require("path");
const get_1 = require("./fs/get");
const index_1 = require("./index");
const POSTAG_1 = require("./POSTAG");
const blacklist_1 = require("./table/blacklist");
const dict_1 = require("./table/dict");
const loader_1 = require("./loader");
const crlf_normalize_1 = require("crlf-normalize");
const stopword_1 = require("./table/stopword");
const synonym_1 = require("./table/synonym");
const segment_dict_1 = require("segment-dict");
const mod_1 = require("./mod");
const debug_1 = require("./util/debug");
const project_config_1 = require("../project.config");
const deepmerge = require("deepmerge-plus");
const const_1 = require("./const");
/**
 * 创建分词器接口
 */
class Segment {
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
        this.SPLIT = /([\r\n]+|^[　\s+]+|[　\s]+$|[　\s]{2,})/gm;
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
        this.POSTAG = POSTAG_1.default;
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
        this.tokenizer = new mod_1.Tokenizer(this);
        this.optimizer = new mod_1.Optimizer(this);
        if (this.options.db) {
            this.options.db.forEach(function (data) {
                self.db[data.type] = data;
            });
        }
        delete this.options.db;
    }
    getDictDatabase(type, autocreate, libTableDict) {
        if ((autocreate || this.inited) && !this.db[type]) {
            if (type == synonym_1.default.type) {
                libTableDict = libTableDict || synonym_1.default;
            }
            else if (type == stopword_1.TableDictStopword.type) {
                libTableDict = libTableDict || stopword_1.TableDictStopword;
            }
            else if (type == blacklist_1.default.type) {
                libTableDict = libTableDict || stopword_1.TableDictStopword;
            }
            else {
                libTableDict = libTableDict || dict_1.TableDict;
            }
            this.db[type] = new libTableDict(type, this.options, {
                TABLE: this.DICT[type],
            });
        }
        // @ts-ignore
        return this.db[type];
    }
    use(mod, ...argv) {
        let me = this;
        if (Array.isArray(mod)) {
            mod.forEach(function (m) {
                me.use(m);
            });
        }
        else if (me.options && me.options.disableModules && me.options.disableModules.includes(mod)) {
            console.warn(`can't use this mod, because it got disable: ${mod}`);
        }
        else {
            if (typeof mod == 'string') {
                //console.log('module', mod);
                // @ts-ignore
                //let filename = path.resolve(__dirname, 'module', module + '.js');
                let filename = path.resolve(__dirname, 'submod', mod);
                // @ts-ignore
                mod = require(filename);
            }
            // 初始化并注册模块
            let c = mod.init(this, ...argv);
            if (typeof c !== 'undefined') {
                mod = c;
            }
            this.modules[mod.type].push(mod);
        }
        this.inited = true;
        return this;
    }
    _resolveDictFilename(name, pathPlus = [], extPlus = []) {
        let options = {
            paths: [
                '',
                project_config_1.default.dict_root,
                ...pathPlus,
                path.resolve(segment_dict_1.default.DICT_ROOT, 'segment'),
            ],
            extensions: [
                '',
                ...extPlus,
                '.utf8',
                '.txt',
            ],
            onlyFile: true,
        };
        if (name.indexOf('*') != -1) {
            let ls = get_1.searchGlobSync(name, options);
            if (!ls || !ls.length) {
                throw Error(`Cannot find dict glob file "${name}".`);
            }
            return ls;
        }
        let filename = get_1.searchFirstSync(name, options);
        if (!filename) {
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
            type = 'TABLE'; // 默认为TABLE
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
    getDict(type) {
        return this.DICT[type];
    }
    /**
     * 载入同义词词典
     *
     * @param {String} name 字典文件名
     */
    loadSynonymDict(name, skipExists) {
        let filename = this._resolveDictFilename(name, [
            path.resolve(segment_dict_1.default.DICT_ROOT, 'synonym'),
        ]);
        if (Array.isArray(filename)) {
            let self = this;
            filename.forEach(v => this.loadSynonymDict(v, skipExists));
            return this;
        }
        let type = 'SYNONYM';
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
            path.resolve(segment_dict_1.default.DICT_ROOT, 'blacklist'),
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
    loadBlacklistDict(name) {
        return this._loadBlacklistDict(name, const_1.EnumDictDatabase.BLACKLIST);
    }
    loadBlacklistOptimizerDict(name) {
        return this._loadBlacklistDict(name, const_1.EnumDictDatabase.BLACKLIST_FOR_OPTIMIZER);
    }
    /**
     * 载入停止符词典
     *
     * @param {String} name 字典文件名
     */
    loadStopwordDict(name) {
        let filename = this._resolveDictFilename(name, [
            path.resolve(segment_dict_1.default.DICT_ROOT, 'stopword'),
        ]);
        if (Array.isArray(filename)) {
            let self = this;
            filename.forEach(v => this.loadStopwordDict(v));
            return this;
        }
        const type = const_1.EnumDictDatabase.STOPWORD;
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
     * 使用默认的识别模块和字典文件
     * 在使用預設值的情況下，不需要主動呼叫此函數
     *
     * @return {Segment}
     */
    useDefault(...argv) {
        index_1.useDefault(this, ...argv);
        this.inited = true;
        return this;
        /*
        this
            // 识别模块
            // 强制分割类单词识别
            .use('URLTokenizer')            // URL识别
            .use('WildcardTokenizer')       // 通配符，必须在标点符号识别之前
            .use('PunctuationTokenizer')    // 标点符号识别
            .use('ForeignTokenizer')        // 外文字符、数字识别，必须在标点符号识别之后
            // 中文单词识别
            .use('DictTokenizer')           // 词典识别
            .use('ChsNameTokenizer')        // 人名识别，建议在词典识别之后

            // 优化模块
            .use('EmailOptimizer')          // 邮箱地址识别
            .use('ChsNameOptimizer')        // 人名识别优化
            .use('DictOptimizer')           // 词典识别优化
            .use('DatetimeOptimizer')       // 日期时间识别优化

            // 字典文件
            //.loadDict('jieba') <=== bad file

            .loadDict('dict4')

            .loadDict('char')

            .loadDict('phrases')
            .loadDict('phrases2')

            .loadDict('dict')           // 盘古词典
            .loadDict('dict2')          // 扩展词典（用于调整原盘古词典）
            .loadDict('dict3')          // 扩展词典（用于调整原盘古词典）
            .loadDict('names')          // 常见名词、人名
            .loadDict('wildcard', 'WILDCARD', true)   // 通配符
            .loadSynonymDict('synonym')   // 同义词
            .loadStopwordDict('stopword') // 停止符

            .loadDict('lazy/badword')
            .loadDict('lazy/dict_synonym')

            .loadDict('names/en')
            .loadDict('names/jp')
            .loadDict('lazy/index')

        ;

        this.inited = true;

        return this;
        */
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
    getOptionsDoSegment(options) {
        return Object.assign({}, Segment.defaultOptionsDoSegment, this.options.optionsDoSegment, options);
    }
    _get_text(text) {
        try {
            if (Buffer.isBuffer(text)) {
                text = text.toString();
            }
        }
        catch (e) { }
        finally {
            if (typeof text != 'string') {
                throw new TypeError(`text must is string or Buffer`);
            }
            text = crlf_normalize_1.crlf(text);
        }
        return text;
    }
    addBlacklist(word, remove) {
        let me = this;
        this.autoInit(this.options);
        const BLACKLIST = me.getDictDatabase(const_1.EnumDictDatabase.BLACKLIST);
        const TABLE = me.getDictDatabase(const_1.EnumDictDatabase.TABLE);
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
        const BLACKLIST = me.getDict(const_1.EnumDictDatabase.BLACKLIST);
        const TABLE = me.getDictDatabase(const_1.EnumDictDatabase.TABLE);
        Object.entries(BLACKLIST)
            .forEach(function ([key, bool]) {
            bool && TABLE.remove(key);
        });
        return this;
    }
    listModules(options = {}) {
        let me = this;
        options = this.getOptionsDoSegment(options);
        let ret = {
            enable: {
                tokenizer: [],
                optimizer: [],
            },
            disable: {
                tokenizer: [],
                optimizer: [],
            },
        };
        if (options && options.disableModules) {
            me.modules.tokenizer
                .forEach(function (mod) {
                let bool;
                if (mod.name) {
                    if (options.disableModules.includes(mod.name)) {
                        bool = true;
                    }
                }
                else {
                    if (options.disableModules.includes(mod)) {
                        bool = true;
                    }
                }
                ret[bool ? 'disable' : 'enable'].tokenizer.push(mod);
            });
            me.modules.optimizer
                .forEach(function (mod) {
                let bool;
                if (mod.name) {
                    if (options.disableModules.includes(mod.name)) {
                        bool = true;
                    }
                }
                else {
                    if (options.disableModules.includes(mod)) {
                        bool = true;
                    }
                }
                ret[bool ? 'disable' : 'enable'].optimizer.push(mod);
            });
        }
        else {
            ret.enable.tokenizer = me.modules.tokenizer.slice();
            ret.enable.optimizer = me.modules.optimizer.slice();
        }
        return ret;
    }
    doSegment(text, options = {}) {
        let me = this;
        options = this.getOptionsDoSegment(options);
        //console.dir(options);
        this.autoInit(this.options);
        let text_list = this._get_text(text)
            // @ts-ignore
            .split(this.SPLIT);
        text = undefined;
        const mods = this.listModules(options).enable;
        // 将文本按照换行符分割成多段，并逐一分词
        let ret = text_list.reduce(function (ret, section) {
            //console.dir(section);
            if (me.SPLIT_FILTER.test(section)) {
                ret = ret.concat({ w: section });
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
            ret = ret.filter(function (item) {
                return item.p !== POSTAG_1.default.D_W;
            });
        }
        if (options.convertSynonym) {
            ret = this.convertSynonym(ret);
        }
        /*
        // 转换同义词
        function convertSynonym(list)
        {
            let count = 0;
            let TABLE = me.getDict('SYNONYM');
            list = list.map(function (item)
            {
                if (item.w in TABLE)
                {
                    count++;
                    //return { w: TABLE[item.w], p: item.p };

                    item.ow = item.w;
                    item.w = TABLE[item.w];

                    return item;
                }
                else
                {
                    return item;
                }
            });
            return { count: count, list: list };
        }

        if (options.convertSynonym)
        {
            let result;
            do
            {
                result = convertSynonym(ret);
                ret = result.list;
            }
            while (result.count > 0);
        }
        */
        // 去除停止符
        if (options.stripStopword) {
            let STOPWORD = me.getDict('STOPWORD');
            ret = ret.filter(function (item) {
                return !(item.w in STOPWORD);
            });
        }
        if (options.stripSpace) {
            ret = ret.filter(function (item) {
                return !/^\s+$/g.test(item.w);
            });
        }
        // 仅返回单词内容
        if (options.simple) {
            ret = ret.map(function (item) {
                return item.w;
            });
        }
        return ret;
    }
    convertSynonym(ret, showcount) {
        const me = this;
        let TABLE = me.getDict('SYNONYM');
        let TABLEDICT = me.getDict('TABLE');
        let total_count = 0;
        //const RAW = Symbol.for('RAW');
        // 转换同义词
        function _convertSynonym(list) {
            let count = 0;
            list = list.reduce(function (a, item) {
                let bool;
                let w = item.w;
                let nw;
                let debug = debug_1.debugToken(item);
                if (w in TABLE) {
                    bool = true;
                    nw = TABLE[w];
                }
                else if (debug.autoCreate && !debug.convertSynonym && !item.ow && item.m && item.m.length) {
                    nw = item.m.reduce(function (a, b) {
                        if (typeof b == 'string') {
                            a.push(b);
                        }
                        else if (b.w in TABLE) {
                            a.push(TABLE[b.w]);
                            bool = true;
                        }
                        else {
                            a.push(b.w);
                        }
                        return a;
                    }, []).join('');
                }
                if (bool) {
                    count++;
                    total_count++;
                    //return { w: TABLE[item.w], p: item.p };
                    let p = item.p;
                    if (w in TABLEDICT) {
                        p = TABLEDICT[w].p || p;
                    }
                    if (p & me.POSTAG.BAD) {
                        p = p ^ me.POSTAG.BAD;
                    }
                    let item_new = debug_1.debugToken({
                        ...item,
                        w: nw,
                        ow: w,
                        p,
                        op: item.p,
                    }, {
                        convertSynonym: true,
                        //_source: item,
                        /**
                         * JSON.stringify
                         * avoid TypeError: Converting circular structure to JSON
                         */
                        _source: deepmerge({}, item),
                    }, true);
                    a.push(item_new);
                }
                else {
                    a.push(item);
                }
                return a;
            }, []);
            return { count: count, list: list };
        }
        let result;
        do {
            result = _convertSynonym(ret);
            ret = result.list;
        } while (result.count > 0);
        if (showcount) {
            return { count: total_count, list: ret };
        }
        return ret;
    }
    /**
     * 将单词数组连接成字符串
     *
     * @param {Array} words 单词数组
     * @return {String}
     */
    stringify(words, ...argv) {
        return Segment.stringify(words, ...argv);
    }
    static stringify(words, ...argv) {
        return words.map(function (item) {
            if (typeof item === 'string') {
                return item;
            }
            else if ('w' in item) {
                return item.w;
            }
            else {
                throw new TypeError(`not a valid segment result list`);
            }
        }).join('');
    }
    /**
     * 根据某个单词或词性来分割单词数组
     *
     * @param {Array} words 单词数组
     * @param {Number|String} s 用于分割的单词或词性
     * @return {Array}
     */
    split(words, s) {
        let ret = [];
        let lasti = 0;
        let i = 0;
        let f = typeof s === 'string' ? 'w' : 'p';
        while (i < words.length) {
            if (words[i][f] == s) {
                if (lasti < i)
                    ret.push(words.slice(lasti, i));
                ret.push(words.slice(i, i + 1));
                i++;
                lasti = i;
            }
            else {
                i++;
            }
        }
        if (lasti < words.length - 1) {
            ret.push(words.slice(lasti, words.length));
        }
        return ret;
    }
    /**
     * 在单词数组中查找某一个单词或词性所在的位置
     *
     * @param {Array} words 单词数组
     * @param {Number|String} s 要查找的单词或词性
     * @param {Number} cur 开始位置
     * @return {Number} 找不到，返回-1
     */
    indexOf(words, s, cur) {
        cur = isNaN(cur) ? 0 : cur;
        let f = typeof s === 'string' ? 'w' : 'p';
        while (cur < words.length) {
            if (words[cur][f] == s)
                return cur;
            cur++;
        }
        return -1;
    }
}
exports.Segment = Segment;
Segment.defaultOptionsDoSegment = {};
exports.default = Segment;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2VnbWVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIlNlZ21lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7R0FJRztBQUVILFlBQVksQ0FBQzs7QUFFYixhQUFhO0FBQ2IsYUFBYTtBQUNiLDZCQUE4QjtBQUM5QixrQ0FBMkQ7QUFDM0QsbUNBQXFDO0FBQ3JDLHFDQUE4QjtBQUM5QixpREFBbUQ7QUFFbkQsdUNBQXdFO0FBRXhFLHFDQUE4QjtBQUM5QixtREFBc0M7QUFDdEMsK0NBQXFEO0FBQ3JELDZDQUErQztBQUMvQywrQ0FBdUM7QUFDdkMsK0JBQTJFO0FBQzNFLHdDQUEwQztBQUcxQyxzREFBOEM7QUFFOUMsNENBQTZDO0FBQzdDLG1DQUEyQztBQUczQzs7R0FFRztBQUNILE1BQWEsT0FBTztJQWlFbkIsWUFBWSxVQUEyQixFQUFFO1FBNUR6Qzs7Ozs7Ozs7O1dBU0c7UUFDSCxVQUFLLEdBQVcsd0NBQWtELENBQUM7UUFFbkU7Ozs7O1dBS0c7UUFDSCxpQkFBWSxHQUFrQixjQUErQixDQUFDO1FBRTlEOzs7V0FHRztRQUNILFdBQU0sR0FBRyxnQkFBTSxDQUFDO1FBQ2hCOzs7V0FHRztRQUNILFNBQUksR0FLQSxFQUFFLENBQUM7UUFDUCxZQUFPLEdBQUc7WUFDVDs7ZUFFRztZQUNILFNBQVMsRUFBRSxFQUFFO1lBQ2I7O2VBRUc7WUFDSCxTQUFTLEVBQUUsRUFBRTtTQUliLENBQUM7UUFLRixPQUFFLEdBRUUsRUFBRSxDQUFDO1FBRVAsWUFBTyxHQUFvQixFQUFFLENBQUM7UUFNN0IsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBRWxCLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztRQUV4RCxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksZUFBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3JDLElBQUksQ0FB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Q0FBQyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7UUFFMUMsT0FBTyxHQUFHLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFDekI7WUFDQyxJQUFJLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO2dCQUFFLE9BQU8sR0FBRyxDQUFDO1lBQ25DLEdBQUcsRUFBRSxDQUFDO1NBQ047UUFFRCxPQUFPLENBQUMsQ0FBQyxDQUFDO0lBQ1gsQ0FBQzs7QUFsakNGLDBCQW1qQ0M7QUFoakNPLCtCQUF1QixHQUFzQixFQUFFLENBQUM7QUFtcUN4RCxrQkFBZSxPQUFPLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIOWIhuivjeWZqOaOpeWPo1xuICpcbiAqIEBhdXRob3Ig6ICB6Zu3PGxlaXpvbmdtaW5AZ21haWwuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuLy8gQHRzLWlnbm9yZVxuLy8gQHRzLWlnbm9yZVxuaW1wb3J0IHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5pbXBvcnQgeyBzZWFyY2hGaXJzdFN5bmMsIHNlYXJjaEdsb2JTeW5jIH0gZnJvbSAnLi9mcy9nZXQnO1xuaW1wb3J0IHsgdXNlRGVmYXVsdCB9IGZyb20gJy4vaW5kZXgnO1xuaW1wb3J0IFBPU1RBRyBmcm9tICcuL1BPU1RBRyc7XG5pbXBvcnQgVGFibGVEaWN0QmxhY2tsaXN0IGZyb20gJy4vdGFibGUvYmxhY2tsaXN0JztcbmltcG9ydCBBYnN0cmFjdFRhYmxlRGljdENvcmUgZnJvbSAnLi90YWJsZS9jb3JlJztcbmltcG9ydCB7IElPcHRpb25zIGFzIElPcHRpb25zVGFibGVEaWN0LCBUYWJsZURpY3QgfSBmcm9tICcuL3RhYmxlL2RpY3QnO1xuXG5pbXBvcnQgTG9hZGVyIGZyb20gJy4vbG9hZGVyJztcbmltcG9ydCB7IGNybGYgfSBmcm9tICdjcmxmLW5vcm1hbGl6ZSc7XG5pbXBvcnQgeyBUYWJsZURpY3RTdG9wd29yZCB9IGZyb20gJy4vdGFibGUvc3RvcHdvcmQnO1xuaW1wb3J0IFRhYmxlRGljdFN5bm9ueW0gZnJvbSAnLi90YWJsZS9zeW5vbnltJztcbmltcG9ydCBTZWdtZW50RGljdCBmcm9tICdzZWdtZW50LWRpY3QnO1xuaW1wb3J0IHsgSVN1Yk9wdGltaXplciwgSVN1YlRva2VuaXplciwgT3B0aW1pemVyLCBUb2tlbml6ZXIgfSBmcm9tICcuL21vZCc7XG5pbXBvcnQgeyBkZWJ1Z1Rva2VuIH0gZnJvbSAnLi91dGlsL2RlYnVnJztcbmltcG9ydCB7IElXb3JkRGVidWcgfSBmcm9tICcuL3V0aWwvaW5kZXgnO1xuXG5pbXBvcnQgUHJvamVjdENvbmZpZyBmcm9tICcuLi9wcm9qZWN0LmNvbmZpZyc7XG5cbmltcG9ydCBkZWVwbWVyZ2UgPSByZXF1aXJlKCdkZWVwbWVyZ2UtcGx1cycpO1xuaW1wb3J0IHsgRW51bURpY3REYXRhYmFzZSB9IGZyb20gJy4vY29uc3QnO1xuaW1wb3J0IHsgRU5VTV9TVUJNT0RTLCBFTlVNX1NVQk1PRFNfTkFNRSwgRU5VTV9TVUJNT0RTX09USEVSIH0gZnJvbSAnLi9tb2QvaW5kZXgnO1xuXG4vKipcbiAqIOWIm+W7uuWIhuivjeWZqOaOpeWPo1xuICovXG5leHBvcnQgY2xhc3MgU2VnbWVudFxue1xuXG5cdHN0YXRpYyBkZWZhdWx0T3B0aW9uc0RvU2VnbWVudDogSU9wdGlvbnNEb1NlZ21lbnQgPSB7fTtcblxuXHQvKipcblx0ICog5YiG5q61XG5cdCAqXG5cdCAqIOeUseaWvCBzZWdtZW50IOaYr+WIqeeUqOWwjeWFp+WuueeahOWJjeW+jOaWh+WIhuaekOS+humAsuihjOWIhuipnlxuXHQgKiDmiYDku6XlpoLkvZXliIflibLmrrXokL3lsI3mlrzntZDmnpzlsLHmnIPnlKLnlJ/kuI3lkIzlvbHpn79cblx0ICpcblx0ICogYFJlZ0V4cGAgb3Ig5YW35pyJIGAuW1N5bWJvbC5zcGxpdF0oaW5wdXQ6IHN0cmluZywgbGltaXQ/OiBudW1iZXIpID0+IHN0cmluZ1tdYCDnmoTnianku7Zcblx0ICpcblx0ICogQHR5cGUge1NlZ21lbnQuSVNQTElUfVxuXHQgKi9cblx0U1BMSVQ6IElTUExJVCA9IC8oW1xcclxcbl0rfF5b44CAXFxzK10rfFvjgIBcXHNdKyR8W+OAgFxcc117Mix9KS9nbSBhcyBJU1BMSVQ7XG5cblx0LyoqXG5cdCAqIOWIhuauteS5i+W+jCDlpoLmnpznrKblkIjku6XkuIvmop3ku7Yg5YmH55u05o6l5b+955Wl5YiG5p6QXG5cdCAqIGBSZWdFeHBgIG9yIOWFt+aciSBgLnRlc3QoaW5wdXQ6IHN0cmluZykgPT4gYm9vbGVhbmAg55qE54mp5Lu2XG5cdCAqXG5cdCAqIEB0eXBlIHtTZWdtZW50LklTUExJVF9GSUxURVJ9XG5cdCAqL1xuXHRTUExJVF9GSUxURVI6IElTUExJVF9GSUxURVIgPSAvXihbXFxyXFxuXSspJC9nIGFzIElTUExJVF9GSUxURVI7XG5cblx0LyoqXG5cdCAqIOivjeaAp1xuXHQgKiBAdHlwZSB7UE9TVEFHfVxuXHQgKi9cblx0UE9TVEFHID0gUE9TVEFHO1xuXHQvKipcblx0ICog6K+N5YW46KGoXG5cdCAqIEB0eXBlIHt7fX1cblx0ICovXG5cdERJQ1Q6IHtcblx0XHRTVE9QV09SRD86IElESUNUX1NUT1BXT1JELFxuXHRcdFNZTk9OWU0/OiBJRElDVF9TWU5PTllNLFxuXG5cdFx0W2tleTogc3RyaW5nXTogSURJQ1QsXG5cdH0gPSB7fTtcblx0bW9kdWxlcyA9IHtcblx0XHQvKipcblx0XHQgKiDliIbor43mqKHlnZdcblx0XHQgKi9cblx0XHR0b2tlbml6ZXI6IFtdLFxuXHRcdC8qKlxuXHRcdCAqIOS8mOWMluaooeWdl1xuXHRcdCAqL1xuXHRcdG9wdGltaXplcjogW10sXG5cdH0gYXMge1xuXHRcdHRva2VuaXplcjogSVN1YlRva2VuaXplcltdLFxuXHRcdG9wdGltaXplcjogSVN1Yk9wdGltaXplcltdLFxuXHR9O1xuXG5cdHRva2VuaXplcjogVG9rZW5pemVyO1xuXHRvcHRpbWl6ZXI6IE9wdGltaXplcjtcblxuXHRkYjoge1xuXHRcdFtrZXk6IHN0cmluZ106IFRhYmxlRGljdCxcblx0fSA9IHt9O1xuXG5cdG9wdGlvbnM6IElPcHRpb25zU2VnbWVudCA9IHt9O1xuXG5cdGluaXRlZD86IGJvb2xlYW47XG5cblx0Y29uc3RydWN0b3Iob3B0aW9uczogSU9wdGlvbnNTZWdtZW50ID0ge30pXG5cdHtcblx0XHRjb25zdCBzZWxmID0gdGhpcztcblxuXHRcdHRoaXMub3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMub3B0aW9ucywgb3B0aW9ucyk7XG5cblx0XHR0aGlzLnRva2VuaXplciA9IG5ldyBUb2tlbml6ZXIodGhpcyk7XG5cdFx0dGhpcy5vcHRpbWl6ZXIgPSBuZXcgT3B0aW1pemVyKHRoaXMpO1xuXG5cdFx0aWYgKHRoaXMub3B0aW9ucy5kYilcblx0XHR7XG5cdFx0XHR0aGlzLm9wdGlvbnMuZGIuZm9yRWFjaChmdW5jdGlvbiAoZGF0YSlcblx0XHRcdHtcblx0XHRcdFx0c2VsZi5kYltkYXRhLnR5cGVdID0gZGF0YTtcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdGRlbGV0ZSB0aGlzLm9wdGlvbnMuZGI7XG5cdH1cblxuXHRnZXREaWN0RGF0YWJhc2U8UiBleHRlbmRzIFRhYmxlRGljdFN5bm9ueW0+KHR5cGU6IEVudW1EaWN0RGF0YWJhc2UuU1lOT05ZTSxcblx0XHRhdXRvY3JlYXRlPzogYm9vbGVhbixcblx0XHRsaWJUYWJsZURpY3Q/OiB7IG5ldyguLi5hcmd2KTogUiB9LFxuXHQpOiBSXG5cdGdldERpY3REYXRhYmFzZTxSIGV4dGVuZHMgVGFibGVEaWN0Pih0eXBlOiBFbnVtRGljdERhdGFiYXNlLlRBQkxFLCBhdXRvY3JlYXRlPzogYm9vbGVhbiwgbGliVGFibGVEaWN0PzogeyBuZXcoLi4uYXJndik6IFIgfSk6IFJcblx0Z2V0RGljdERhdGFiYXNlPFIgZXh0ZW5kcyBUYWJsZURpY3RTdG9wd29yZD4odHlwZTogRW51bURpY3REYXRhYmFzZS5TVE9QV09SRCxcblx0XHRhdXRvY3JlYXRlPzogYm9vbGVhbixcblx0XHRsaWJUYWJsZURpY3Q/OiB7IG5ldyguLi5hcmd2KTogUiB9LFxuXHQpOiBSXG5cdGdldERpY3REYXRhYmFzZTxSIGV4dGVuZHMgVGFibGVEaWN0QmxhY2tsaXN0Pih0eXBlOiBFbnVtRGljdERhdGFiYXNlLkJMQUNLTElTVCxcblx0XHRhdXRvY3JlYXRlPzogYm9vbGVhbixcblx0XHRsaWJUYWJsZURpY3Q/OiB7IG5ldyguLi5hcmd2KTogUiB9LFxuXHQpOiBSXG5cdGdldERpY3REYXRhYmFzZTxSIGV4dGVuZHMgVGFibGVEaWN0QmxhY2tsaXN0Pih0eXBlOiBFbnVtRGljdERhdGFiYXNlLkJMQUNLTElTVF9GT1JfT1BUSU1JWkVSLFxuXHRcdGF1dG9jcmVhdGU/OiBib29sZWFuLFxuXHRcdGxpYlRhYmxlRGljdD86IHsgbmV3KC4uLmFyZ3YpOiBSIH0sXG5cdCk6IFJcblx0Z2V0RGljdERhdGFiYXNlPFIgZXh0ZW5kcyBBYnN0cmFjdFRhYmxlRGljdENvcmU8YW55Pj4odHlwZTogc3RyaW5nIHwgRW51bURpY3REYXRhYmFzZSxcblx0XHRhdXRvY3JlYXRlPzogYm9vbGVhbixcblx0XHRsaWJUYWJsZURpY3Q/OiB7IG5ldyguLi5hcmd2KTogUiB9LFxuXHQpOiBSXG5cdGdldERpY3REYXRhYmFzZSh0eXBlOiBzdHJpbmcsIGF1dG9jcmVhdGU/OiBib29sZWFuLCBsaWJUYWJsZURpY3Q/KVxuXHR7XG5cdFx0aWYgKChhdXRvY3JlYXRlIHx8IHRoaXMuaW5pdGVkKSAmJiAhdGhpcy5kYlt0eXBlXSlcblx0XHR7XG5cdFx0XHRpZiAodHlwZSA9PSBUYWJsZURpY3RTeW5vbnltLnR5cGUpXG5cdFx0XHR7XG5cdFx0XHRcdGxpYlRhYmxlRGljdCA9IGxpYlRhYmxlRGljdCB8fCBUYWJsZURpY3RTeW5vbnltO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAodHlwZSA9PSBUYWJsZURpY3RTdG9wd29yZC50eXBlKVxuXHRcdFx0e1xuXHRcdFx0XHRsaWJUYWJsZURpY3QgPSBsaWJUYWJsZURpY3QgfHwgVGFibGVEaWN0U3RvcHdvcmQ7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmICh0eXBlID09IFRhYmxlRGljdEJsYWNrbGlzdC50eXBlKVxuXHRcdFx0e1xuXHRcdFx0XHRsaWJUYWJsZURpY3QgPSBsaWJUYWJsZURpY3QgfHwgVGFibGVEaWN0U3RvcHdvcmQ7XG5cdFx0XHR9XG5cdFx0XHRlbHNlXG5cdFx0XHR7XG5cdFx0XHRcdGxpYlRhYmxlRGljdCA9IGxpYlRhYmxlRGljdCB8fCBUYWJsZURpY3Q7XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMuZGJbdHlwZV0gPSBuZXcgbGliVGFibGVEaWN0KHR5cGUsIHRoaXMub3B0aW9ucywge1xuXHRcdFx0XHRUQUJMRTogdGhpcy5ESUNUW3R5cGVdLFxuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdHJldHVybiB0aGlzLmRiW3R5cGVdO1xuXHR9XG5cblx0LyoqXG5cdCAqIOi9veWFpeWIhuivjeaooeWdl1xuXHQgKlxuXHQgKiBAcGFyYW0ge1N0cmluZ3xBcnJheXxPYmplY3R9IG1vZHVsZSDmqKHlnZflkI3np7Ao5pWw57uEKeaIluaooeWdl+WvueixoVxuXHQgKiBAcmV0dXJuIHtTZWdtZW50fVxuXHQgKi9cblx0dXNlKG1vZDogSVN1Yk9wdGltaXplciwgLi4uYXJndilcblx0dXNlKG1vZDogSVN1YlRva2VuaXplciwgLi4uYXJndilcblx0dXNlKG1vZDogQXJyYXk8SVN1YlRva2VuaXplciB8IElTdWJPcHRpbWl6ZXIgfCBzdHJpbmc+LCAuLi5hcmd2KVxuXHR1c2UobW9kOiBzdHJpbmcsIC4uLmFyZ3YpXG5cdHVzZShtb2QsIC4uLmFyZ3YpXG5cdHVzZShtb2QsIC4uLmFyZ3YpXG5cdHtcblx0XHRsZXQgbWUgPSB0aGlzO1xuXG5cdFx0aWYgKEFycmF5LmlzQXJyYXkobW9kKSlcblx0XHR7XG5cdFx0XHRtb2QuZm9yRWFjaChmdW5jdGlvbiAobSlcblx0XHRcdHtcblx0XHRcdFx0bWUudXNlKG0pO1xuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdGVsc2UgaWYgKG1lLm9wdGlvbnMgJiYgbWUub3B0aW9ucy5kaXNhYmxlTW9kdWxlcyAmJiBtZS5vcHRpb25zLmRpc2FibGVNb2R1bGVzLmluY2x1ZGVzKG1vZCkpXG5cdFx0e1xuXHRcdFx0Y29uc29sZS53YXJuKGBjYW4ndCB1c2UgdGhpcyBtb2QsIGJlY2F1c2UgaXQgZ290IGRpc2FibGU6ICR7bW9kfWApXG5cdFx0fVxuXHRcdGVsc2Vcblx0XHR7XG5cdFx0XHRpZiAodHlwZW9mIG1vZCA9PSAnc3RyaW5nJylcblx0XHRcdHtcblx0XHRcdFx0Ly9jb25zb2xlLmxvZygnbW9kdWxlJywgbW9kKTtcblxuXHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdC8vbGV0IGZpbGVuYW1lID0gcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ21vZHVsZScsIG1vZHVsZSArICcuanMnKTtcblx0XHRcdFx0bGV0IGZpbGVuYW1lID0gcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ3N1Ym1vZCcsIG1vZCk7XG5cblx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRtb2QgPSByZXF1aXJlKGZpbGVuYW1lKTtcblx0XHRcdH1cblx0XHRcdC8vIOWIneWni+WMluW5tuazqOWGjOaooeWdl1xuXHRcdFx0bGV0IGMgPSBtb2QuaW5pdCh0aGlzLCAuLi5hcmd2KTtcblxuXHRcdFx0aWYgKHR5cGVvZiBjICE9PSAndW5kZWZpbmVkJylcblx0XHRcdHtcblx0XHRcdFx0bW9kID0gYztcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5tb2R1bGVzW21vZC50eXBlXS5wdXNoKG1vZCk7XG5cdFx0fVxuXG5cdFx0dGhpcy5pbml0ZWQgPSB0cnVlO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHRfcmVzb2x2ZURpY3RGaWxlbmFtZShuYW1lOiBzdHJpbmcsIHBhdGhQbHVzOiBzdHJpbmdbXSA9IFtdLCBleHRQbHVzOiBzdHJpbmdbXSA9IFtdKTogc3RyaW5nIHwgc3RyaW5nW11cblx0e1xuXHRcdGxldCBvcHRpb25zID0ge1xuXHRcdFx0cGF0aHM6IFtcblx0XHRcdFx0JycsXG5cdFx0XHRcdFByb2plY3RDb25maWcuZGljdF9yb290LFxuXG5cdFx0XHRcdC4uLnBhdGhQbHVzLFxuXHRcdFx0XHRwYXRoLnJlc29sdmUoU2VnbWVudERpY3QuRElDVF9ST09ULCAnc2VnbWVudCcpLFxuXHRcdFx0XSxcblx0XHRcdGV4dGVuc2lvbnM6IFtcblx0XHRcdFx0JycsXG5cdFx0XHRcdC4uLmV4dFBsdXMsXG5cdFx0XHRcdCcudXRmOCcsXG5cdFx0XHRcdCcudHh0Jyxcblx0XHRcdF0sXG5cblx0XHRcdG9ubHlGaWxlOiB0cnVlLFxuXHRcdH07XG5cblx0XHRpZiAobmFtZS5pbmRleE9mKCcqJykgIT0gLTEpXG5cdFx0e1xuXHRcdFx0bGV0IGxzID0gc2VhcmNoR2xvYlN5bmMobmFtZSwgb3B0aW9ucyk7XG5cblx0XHRcdGlmICghbHMgfHwgIWxzLmxlbmd0aClcblx0XHRcdHtcblx0XHRcdFx0dGhyb3cgRXJyb3IoYENhbm5vdCBmaW5kIGRpY3QgZ2xvYiBmaWxlIFwiJHtuYW1lfVwiLmApO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gbHM7XG5cdFx0fVxuXG5cdFx0bGV0IGZpbGVuYW1lID0gc2VhcmNoRmlyc3RTeW5jKG5hbWUsIG9wdGlvbnMpO1xuXG5cdFx0aWYgKCFmaWxlbmFtZSlcblx0XHR7XG5cdFx0XHQvL2NvbnNvbGUubG9nKG5hbWUsIHBhdGhQbHVzLCBleHRQbHVzKTtcblxuXHRcdFx0dGhyb3cgRXJyb3IoYENhbm5vdCBmaW5kIGRpY3QgZmlsZSBcIiR7bmFtZX1cIi5gKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gZmlsZW5hbWU7XG5cdH1cblxuXHQvKipcblx0ICog6L295YWl5a2X5YW45paH5Lu2XG5cdCAqXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIOWtl+WFuOaWh+S7tuWQjVxuXHQgKiBAcGFyYW0ge1N0cmluZ30gdHlwZSDnsbvlnotcblx0ICogQHBhcmFtIHtCb29sZWFufSBjb252ZXJ0X3RvX2xvd2VyIOaYr+WQpuWFqOmDqOi9rOaNouS4uuWwj+WGmVxuXHQgKiBAcmV0dXJuIHtTZWdtZW50fVxuXHQgKi9cblx0bG9hZERpY3QobmFtZTogc3RyaW5nLCB0eXBlPzogc3RyaW5nLCBjb252ZXJ0X3RvX2xvd2VyPzogYm9vbGVhbiwgc2tpcEV4aXN0cz86IGJvb2xlYW4pXG5cdHtcblx0XHRsZXQgZmlsZW5hbWUgPSB0aGlzLl9yZXNvbHZlRGljdEZpbGVuYW1lKG5hbWUpO1xuXG5cdFx0aWYgKEFycmF5LmlzQXJyYXkoZmlsZW5hbWUpKVxuXHRcdHtcblx0XHRcdGxldCBzZWxmID0gdGhpcztcblxuXHRcdFx0ZmlsZW5hbWUuZm9yRWFjaCh2ID0+IHRoaXMubG9hZERpY3QodiwgdHlwZSwgY29udmVydF90b19sb3dlciwgc2tpcEV4aXN0cykpO1xuXG5cdFx0XHQvL2NvbnNvbGUubG9nKGZpbGVuYW1lKTtcblxuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fVxuXG5cdFx0aWYgKCF0eXBlKSB0eXBlID0gJ1RBQkxFJzsgICAgIC8vIOm7mOiupOS4ulRBQkxFXG5cblx0XHRjb25zdCBkYiA9IHRoaXMuZ2V0RGljdERhdGFiYXNlKHR5cGUsIHRydWUpO1xuXG5cdFx0Y29uc3QgVEFCTEUgPSB0aGlzLkRJQ1RbdHlwZV0gPSBkYi5UQUJMRTtcblx0XHRjb25zdCBUQUJMRTIgPSB0aGlzLkRJQ1RbdHlwZSArICcyJ10gPSBkYi5UQUJMRTI7XG5cblx0XHQvKlxuXHRcdC8vIOWIneWni+WMluivjeWFuFxuXHRcdGlmICghdGhpcy5ESUNUW3R5cGVdKSB0aGlzLkRJQ1RbdHlwZV0gPSB7fTtcblx0XHRpZiAoIXRoaXMuRElDVFt0eXBlICsgJzInXSkgdGhpcy5ESUNUW3R5cGUgKyAnMiddID0ge307XG5cdFx0bGV0IFRBQkxFID0gdGhpcy5ESUNUW3R5cGVdOyAgICAgICAgLy8g6K+N5YW46KGoICAn6K+NJyA9PiB75bGe5oCnfVxuXHRcdGxldCBUQUJMRTIgPSB0aGlzLkRJQ1RbdHlwZSArICcyJ107IC8vIOivjeWFuOihqCAgJ+mVv+W6picgPT4gJ+ivjScgPT4g5bGe5oCnXG5cdFx0Ki9cblx0XHQvLyDlr7zlhaXmlbDmja5cblx0XHRjb25zdCBQT1NUQUcgPSB0aGlzLlBPU1RBRztcblxuXHRcdGxldCBkYXRhID0gTG9hZGVyLlNlZ21lbnREaWN0TG9hZGVyLmxvYWRTeW5jKGZpbGVuYW1lKTtcblxuXHRcdGRhdGEuZm9yRWFjaChmdW5jdGlvbiAoZGF0YSlcblx0XHR7XG5cdFx0XHRpZiAoY29udmVydF90b19sb3dlcilcblx0XHRcdHtcblx0XHRcdFx0ZGF0YVswXSA9IGRhdGFbMF0udG9Mb3dlckNhc2UoKTtcblx0XHRcdH1cblxuXHRcdFx0ZGIuYWRkKGRhdGEsIHNraXBFeGlzdHMpO1xuXG5cdFx0XHQvKlxuXHRcdFx0bGV0IFt3LCBwLCBmXSA9IGRhdGE7XG5cblx0XHRcdGlmICh3Lmxlbmd0aCA9PSAwKVxuXHRcdFx0e1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoKVxuXHRcdFx0fVxuXG5cdFx0XHRUQUJMRVt3XSA9IHsgcCwgZiwgfTtcblx0XHRcdGlmICghVEFCTEUyW3cubGVuZ3RoXSkgVEFCTEUyW3cubGVuZ3RoXSA9IHt9O1xuXHRcdFx0VEFCTEUyW3cubGVuZ3RoXVt3XSA9IFRBQkxFW3ddO1xuXHRcdFx0Ki9cblx0XHR9KTtcblxuXHRcdGRhdGEgPSB1bmRlZmluZWQ7XG5cblx0XHR0aGlzLmluaXRlZCA9IHRydWU7XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiDlj5bor43lhbjooahcblx0ICpcblx0ICogQHBhcmFtIHtTdHJpbmd9IHR5cGUg57G75Z6LXG5cdCAqIEByZXR1cm4ge29iamVjdH1cblx0ICovXG5cdGdldERpY3QodHlwZTogRW51bURpY3REYXRhYmFzZS5TVE9QV09SRCk6IElESUNUX1NUT1BXT1JEXG5cdGdldERpY3QodHlwZTogRW51bURpY3REYXRhYmFzZS5TWU5PTllNKTogSURJQ1RfU1lOT05ZTVxuXHRnZXREaWN0KHR5cGU6IEVudW1EaWN0RGF0YWJhc2UuVEFCTEUpOiBJRElDVDxJV29yZD5cblx0Z2V0RGljdCh0eXBlOiBFbnVtRGljdERhdGFiYXNlLkJMQUNLTElTVCk6IElESUNUX0JMQUNLTElTVFxuXHRnZXREaWN0KHR5cGU6IEVudW1EaWN0RGF0YWJhc2UuQkxBQ0tMSVNUX0ZPUl9PUFRJTUlaRVIpOiBJRElDVF9CTEFDS0xJU1Rcblx0Z2V0RGljdCh0eXBlOiAnVEFCTEUyJyk6IElESUNUMjxJV29yZD5cblx0Z2V0RGljdCh0eXBlOiBFbnVtRGljdERhdGFiYXNlKTogSURJQ1Rcblx0Z2V0RGljdCh0eXBlKTogSURJQ1Rcblx0Z2V0RGljdCh0eXBlKVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuRElDVFt0eXBlXTtcblx0fVxuXG5cdC8qKlxuXHQgKiDovb3lhaXlkIzkuYnor43or43lhbhcblx0ICpcblx0ICogQHBhcmFtIHtTdHJpbmd9IG5hbWUg5a2X5YW45paH5Lu25ZCNXG5cdCAqL1xuXHRsb2FkU3lub255bURpY3QobmFtZTogc3RyaW5nLCBza2lwRXhpc3RzPzogYm9vbGVhbilcblx0e1xuXHRcdGxldCBmaWxlbmFtZSA9IHRoaXMuX3Jlc29sdmVEaWN0RmlsZW5hbWUobmFtZSwgW1xuXHRcdFx0cGF0aC5yZXNvbHZlKFNlZ21lbnREaWN0LkRJQ1RfUk9PVCwgJ3N5bm9ueW0nKSxcblx0XHRdKTtcblxuXHRcdGlmIChBcnJheS5pc0FycmF5KGZpbGVuYW1lKSlcblx0XHR7XG5cdFx0XHRsZXQgc2VsZiA9IHRoaXM7XG5cblx0XHRcdGZpbGVuYW1lLmZvckVhY2godiA9PiB0aGlzLmxvYWRTeW5vbnltRGljdCh2LCBza2lwRXhpc3RzKSk7XG5cblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH1cblxuXHRcdGxldCB0eXBlID0gJ1NZTk9OWU0nO1xuXG5cdFx0Y29uc3QgZGIgPSB0aGlzLmdldERpY3REYXRhYmFzZSh0eXBlLCB0cnVlKTtcblxuXHRcdGNvbnN0IFRBQkxFID0gdGhpcy5ESUNUW3R5cGVdID0gZGIuVEFCTEU7XG5cblx0XHQvKlxuXHRcdC8vIOWIneWni+WMluivjeWFuFxuXHRcdGlmICghdGhpcy5ESUNUW3R5cGVdKSB0aGlzLkRJQ1RbdHlwZV0gPSB7fTtcblx0XHQvLyDor43lhbjooaggICflkIzkuYnor40nID0+ICfmoIflh4bor40nXG5cdFx0bGV0IFRBQkxFID0gdGhpcy5ESUNUW3R5cGVdIGFzIElESUNUX1NZTk9OWU07XG5cdFx0Ly8g5a+85YWl5pWw5o2uXG5cdFx0Ki9cblxuXHRcdGxldCBkYXRhID0gTG9hZGVyLlNlZ21lbnRTeW5vbnltTG9hZGVyLmxvYWRTeW5jKGZpbGVuYW1lKTtcblxuXHRcdGRhdGEuZm9yRWFjaChmdW5jdGlvbiAoYmxvY2tzOiBzdHJpbmdbXSlcblx0XHR7XG5cdFx0XHRkYi5hZGQoYmxvY2tzLCBza2lwRXhpc3RzKTtcblxuXHRcdFx0Lypcblx0XHRcdGxldCBbbjEsIG4yXSA9IGJsb2NrcztcblxuXHRcdFx0VEFCTEVbbjFdID0gbjI7XG5cdFx0XHRpZiAoVEFCTEVbbjJdID09PSBuMSlcblx0XHRcdHtcblx0XHRcdFx0ZGVsZXRlIFRBQkxFW24yXTtcblx0XHRcdH1cblx0XHRcdCovXG5cdFx0fSk7XG5cblx0XHQvL2NvbnNvbGUubG9nKFRBQkxFKTtcblxuXHRcdGRhdGEgPSB1bmRlZmluZWQ7XG5cblx0XHR0aGlzLmluaXRlZCA9IHRydWU7XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdHByb3RlY3RlZCBfbG9hZEJsYWNrbGlzdERpY3QobmFtZTogc3RyaW5nLCB0eXBlOiBFbnVtRGljdERhdGFiYXNlKVxuXHR7XG5cdFx0bGV0IGZpbGVuYW1lID0gdGhpcy5fcmVzb2x2ZURpY3RGaWxlbmFtZShuYW1lLCBbXG5cdFx0XHRwYXRoLnJlc29sdmUoU2VnbWVudERpY3QuRElDVF9ST09ULCAnYmxhY2tsaXN0JyksXG5cdFx0XSk7XG5cblx0XHRpZiAoQXJyYXkuaXNBcnJheShmaWxlbmFtZSkpXG5cdFx0e1xuXHRcdFx0bGV0IHNlbGYgPSB0aGlzO1xuXG5cdFx0XHRmaWxlbmFtZS5mb3JFYWNoKHYgPT4gdGhpcy5fbG9hZEJsYWNrbGlzdERpY3QodiwgdHlwZSkpO1xuXG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9XG5cblx0XHRjb25zdCBkYiA9IHRoaXMuZ2V0RGljdERhdGFiYXNlKHR5cGUsIHRydWUpO1xuXG5cdFx0Y29uc3QgVEFCTEUgPSB0aGlzLkRJQ1RbdHlwZV0gPSBkYi5UQUJMRTtcblxuXHRcdGxldCBkYXRhID0gTG9hZGVyLlNlZ21lbnREaWN0XG5cdFx0XHQucmVxdWlyZUxvYWRlck1vZHVsZSgnbGluZScpXG5cdFx0XHQubG9hZFN5bmMoZmlsZW5hbWUsIHtcblx0XHRcdFx0ZmlsdGVyKGxpbmU6IHN0cmluZylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHJldHVybiBsaW5lLnRyaW0oKTtcblx0XHRcdFx0fSxcblx0XHRcdH0pXG5cdFx0O1xuXG5cdFx0ZGF0YS5mb3JFYWNoKHYgPT4gZGIuYWRkKHYpKTtcblxuXHRcdGRhdGEgPSB1bmRlZmluZWQ7XG5cblx0XHR0aGlzLmluaXRlZCA9IHRydWU7XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdGxvYWRCbGFja2xpc3REaWN0KG5hbWU6IHN0cmluZylcblx0e1xuXHRcdHJldHVybiB0aGlzLl9sb2FkQmxhY2tsaXN0RGljdChuYW1lLCBFbnVtRGljdERhdGFiYXNlLkJMQUNLTElTVClcblx0fVxuXG5cdGxvYWRCbGFja2xpc3RPcHRpbWl6ZXJEaWN0KG5hbWU6IHN0cmluZylcblx0e1xuXHRcdHJldHVybiB0aGlzLl9sb2FkQmxhY2tsaXN0RGljdChuYW1lLCBFbnVtRGljdERhdGFiYXNlLkJMQUNLTElTVF9GT1JfT1BUSU1JWkVSKVxuXHR9XG5cblx0LyoqXG5cdCAqIOi9veWFpeWBnOatouespuivjeWFuFxuXHQgKlxuXHQgKiBAcGFyYW0ge1N0cmluZ30gbmFtZSDlrZflhbjmlofku7blkI1cblx0ICovXG5cdGxvYWRTdG9wd29yZERpY3QobmFtZTogc3RyaW5nKVxuXHR7XG5cdFx0bGV0IGZpbGVuYW1lID0gdGhpcy5fcmVzb2x2ZURpY3RGaWxlbmFtZShuYW1lLCBbXG5cdFx0XHRwYXRoLnJlc29sdmUoU2VnbWVudERpY3QuRElDVF9ST09ULCAnc3RvcHdvcmQnKSxcblx0XHRdKTtcblxuXHRcdGlmIChBcnJheS5pc0FycmF5KGZpbGVuYW1lKSlcblx0XHR7XG5cdFx0XHRsZXQgc2VsZiA9IHRoaXM7XG5cblx0XHRcdGZpbGVuYW1lLmZvckVhY2godiA9PiB0aGlzLmxvYWRTdG9wd29yZERpY3QodikpO1xuXG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9XG5cblx0XHRjb25zdCB0eXBlID0gRW51bURpY3REYXRhYmFzZS5TVE9QV09SRDtcblxuXHRcdGNvbnN0IGRiID0gdGhpcy5nZXREaWN0RGF0YWJhc2UodHlwZSwgdHJ1ZSk7XG5cblx0XHRjb25zdCBUQUJMRSA9IHRoaXMuRElDVFt0eXBlXSA9IGRiLlRBQkxFO1xuXG5cdFx0bGV0IGRhdGEgPSBMb2FkZXIuU2VnbWVudERpY3Rcblx0XHRcdC5yZXF1aXJlTG9hZGVyTW9kdWxlKCdsaW5lJylcblx0XHRcdC5sb2FkU3luYyhmaWxlbmFtZSwge1xuXHRcdFx0XHRmaWx0ZXIobGluZTogc3RyaW5nKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cmV0dXJuIGxpbmUudHJpbSgpO1xuXHRcdFx0XHR9LFxuXHRcdFx0fSlcblx0XHQ7XG5cblx0XHRkYXRhLmZvckVhY2godiA9PiBkYi5hZGQodikpO1xuXG5cdFx0ZGF0YSA9IHVuZGVmaW5lZDtcblxuXHRcdHRoaXMuaW5pdGVkID0gdHJ1ZTtcblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIOS9v+eUqOm7mOiupOeahOivhuWIq+aooeWdl+WSjOWtl+WFuOaWh+S7tlxuXHQgKiDlnKjkvb/nlKjpoJDoqK3lgLznmoTmg4Xms4HkuIvvvIzkuI3pnIDopoHkuLvli5Xlkbzlj6vmraTlh73mlbhcblx0ICpcblx0ICogQHJldHVybiB7U2VnbWVudH1cblx0ICovXG5cdHVzZURlZmF1bHQoLi4uYXJndilcblx0e1xuXHRcdHVzZURlZmF1bHQodGhpcywgLi4uYXJndik7XG5cblx0XHR0aGlzLmluaXRlZCA9IHRydWU7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHRcdC8qXG5cdFx0dGhpc1xuXHRcdFx0Ly8g6K+G5Yir5qih5Z2XXG5cdFx0XHQvLyDlvLrliLbliIblibLnsbvljZXor43or4bliKtcblx0XHRcdC51c2UoJ1VSTFRva2VuaXplcicpICAgICAgICAgICAgLy8gVVJM6K+G5YirXG5cdFx0XHQudXNlKCdXaWxkY2FyZFRva2VuaXplcicpICAgICAgIC8vIOmAmumFjeespu+8jOW/hemhu+WcqOagh+eCueespuWPt+ivhuWIq+S5i+WJjVxuXHRcdFx0LnVzZSgnUHVuY3R1YXRpb25Ub2tlbml6ZXInKSAgICAvLyDmoIfngrnnrKblj7for4bliKtcblx0XHRcdC51c2UoJ0ZvcmVpZ25Ub2tlbml6ZXInKSAgICAgICAgLy8g5aSW5paH5a2X56ym44CB5pWw5a2X6K+G5Yir77yM5b+F6aG75Zyo5qCH54K556ym5Y+36K+G5Yir5LmL5ZCOXG5cdFx0XHQvLyDkuK3mlofljZXor43or4bliKtcblx0XHRcdC51c2UoJ0RpY3RUb2tlbml6ZXInKSAgICAgICAgICAgLy8g6K+N5YW46K+G5YirXG5cdFx0XHQudXNlKCdDaHNOYW1lVG9rZW5pemVyJykgICAgICAgIC8vIOS6uuWQjeivhuWIq++8jOW7uuiuruWcqOivjeWFuOivhuWIq+S5i+WQjlxuXG5cdFx0XHQvLyDkvJjljJbmqKHlnZdcblx0XHRcdC51c2UoJ0VtYWlsT3B0aW1pemVyJykgICAgICAgICAgLy8g6YKu566x5Zyw5Z2A6K+G5YirXG5cdFx0XHQudXNlKCdDaHNOYW1lT3B0aW1pemVyJykgICAgICAgIC8vIOS6uuWQjeivhuWIq+S8mOWMllxuXHRcdFx0LnVzZSgnRGljdE9wdGltaXplcicpICAgICAgICAgICAvLyDor43lhbjor4bliKvkvJjljJZcblx0XHRcdC51c2UoJ0RhdGV0aW1lT3B0aW1pemVyJykgICAgICAgLy8g5pel5pyf5pe26Ze06K+G5Yir5LyY5YyWXG5cblx0XHRcdC8vIOWtl+WFuOaWh+S7tlxuXHRcdFx0Ly8ubG9hZERpY3QoJ2ppZWJhJykgPD09PSBiYWQgZmlsZVxuXG5cdFx0XHQubG9hZERpY3QoJ2RpY3Q0JylcblxuXHRcdFx0LmxvYWREaWN0KCdjaGFyJylcblxuXHRcdFx0LmxvYWREaWN0KCdwaHJhc2VzJylcblx0XHRcdC5sb2FkRGljdCgncGhyYXNlczInKVxuXG5cdFx0XHQubG9hZERpY3QoJ2RpY3QnKSAgICAgICAgICAgLy8g55uY5Y+k6K+N5YW4XG5cdFx0XHQubG9hZERpY3QoJ2RpY3QyJykgICAgICAgICAgLy8g5omp5bGV6K+N5YW477yI55So5LqO6LCD5pW05Y6f55uY5Y+k6K+N5YW477yJXG5cdFx0XHQubG9hZERpY3QoJ2RpY3QzJykgICAgICAgICAgLy8g5omp5bGV6K+N5YW477yI55So5LqO6LCD5pW05Y6f55uY5Y+k6K+N5YW477yJXG5cdFx0XHQubG9hZERpY3QoJ25hbWVzJykgICAgICAgICAgLy8g5bi46KeB5ZCN6K+N44CB5Lq65ZCNXG5cdFx0XHQubG9hZERpY3QoJ3dpbGRjYXJkJywgJ1dJTERDQVJEJywgdHJ1ZSkgICAvLyDpgJrphY3nrKZcblx0XHRcdC5sb2FkU3lub255bURpY3QoJ3N5bm9ueW0nKSAgIC8vIOWQjOS5ieivjVxuXHRcdFx0LmxvYWRTdG9wd29yZERpY3QoJ3N0b3B3b3JkJykgLy8g5YGc5q2i56ymXG5cblx0XHRcdC5sb2FkRGljdCgnbGF6eS9iYWR3b3JkJylcblx0XHRcdC5sb2FkRGljdCgnbGF6eS9kaWN0X3N5bm9ueW0nKVxuXG5cdFx0XHQubG9hZERpY3QoJ25hbWVzL2VuJylcblx0XHRcdC5sb2FkRGljdCgnbmFtZXMvanAnKVxuXHRcdFx0LmxvYWREaWN0KCdsYXp5L2luZGV4JylcblxuXHRcdDtcblxuXHRcdHRoaXMuaW5pdGVkID0gdHJ1ZTtcblxuXHRcdHJldHVybiB0aGlzO1xuXHRcdCovXG5cdH1cblxuXHQvKipcblx0ICog5q2k5Ye95pW45Y+q6ZyA5Z+36KGM5LiA5qyh77yM5Lim5LiU5LiA6Iis54uA5rOB5LiL5LiN6ZyA6KaB5omL5YuV5ZG85Y+rXG5cdCAqL1xuXHRhdXRvSW5pdChvcHRpb25zPzoge1xuXHRcdGFsbF9tb2Q/OiBib29sZWFuLFxuXHR9KVxuXHR7XG5cdFx0aWYgKCF0aGlzLmluaXRlZClcblx0XHR7XG5cdFx0XHR0aGlzLmluaXRlZCA9IHRydWU7XG5cblx0XHRcdGlmICghdGhpcy5tb2R1bGVzLnRva2VuaXplci5sZW5ndGgpXG5cdFx0XHR7XG5cdFx0XHRcdHRoaXMudXNlRGVmYXVsdChvcHRpb25zKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdGdldE9wdGlvbnNEb1NlZ21lbnQ8VCBleHRlbmRzIElPcHRpb25zRG9TZWdtZW50PihvcHRpb25zPzogVCk6IFRcblx0e1xuXHRcdHJldHVybiBPYmplY3QuYXNzaWduKHt9LFxuXHRcdFx0U2VnbWVudC5kZWZhdWx0T3B0aW9uc0RvU2VnbWVudCxcblx0XHRcdHRoaXMub3B0aW9ucy5vcHRpb25zRG9TZWdtZW50LFxuXHRcdFx0b3B0aW9ucyxcblx0XHQpO1xuXHR9XG5cblx0cHJvdGVjdGVkIF9nZXRfdGV4dCh0ZXh0OiBzdHJpbmcgfCBCdWZmZXIpOiBzdHJpbmdcblx0e1xuXHRcdHRyeVxuXHRcdHtcblx0XHRcdGlmIChCdWZmZXIuaXNCdWZmZXIodGV4dCkpXG5cdFx0XHR7XG5cdFx0XHRcdHRleHQgPSB0ZXh0LnRvU3RyaW5nKCk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGNhdGNoIChlKVxuXHRcdHt9XG5cdFx0ZmluYWxseVxuXHRcdHtcblx0XHRcdGlmICh0eXBlb2YgdGV4dCAhPSAnc3RyaW5nJylcblx0XHRcdHtcblx0XHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcihgdGV4dCBtdXN0IGlzIHN0cmluZyBvciBCdWZmZXJgKVxuXHRcdFx0fVxuXG5cdFx0XHR0ZXh0ID0gY3JsZih0ZXh0KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGV4dDtcblx0fVxuXG5cdGFkZEJsYWNrbGlzdCh3b3JkOiBzdHJpbmcsIHJlbW92ZT86IGJvb2xlYW4pXG5cdHtcblx0XHRsZXQgbWUgPSB0aGlzO1xuXG5cdFx0dGhpcy5hdXRvSW5pdCh0aGlzLm9wdGlvbnMpO1xuXG5cdFx0Y29uc3QgQkxBQ0tMSVNUID0gbWUuZ2V0RGljdERhdGFiYXNlKEVudW1EaWN0RGF0YWJhc2UuQkxBQ0tMSVNUKTtcblx0XHRjb25zdCBUQUJMRSA9IG1lLmdldERpY3REYXRhYmFzZShFbnVtRGljdERhdGFiYXNlLlRBQkxFKTtcblxuXHRcdGxldCBib29sID0gIXJlbW92ZTtcblxuXHRcdGlmIChib29sKVxuXHRcdHtcblx0XHRcdEJMQUNLTElTVC5hZGQod29yZCk7XG5cdFx0XHRUQUJMRS5yZW1vdmUod29yZCk7XG5cdFx0fVxuXHRcdGVsc2Vcblx0XHR7XG5cdFx0XHRCTEFDS0xJU1QucmVtb3ZlKHdvcmQpXG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXNcblx0fVxuXG5cdC8qKlxuXHQgKiByZW1vdmUga2V5IGluIFRBQkxFIGJ5IEJMQUNLTElTVFxuXHQgKi9cblx0ZG9CbGFja2xpc3QoKVxuXHR7XG5cdFx0bGV0IG1lID0gdGhpcztcblxuXHRcdHRoaXMuYXV0b0luaXQodGhpcy5vcHRpb25zKTtcblxuXHRcdGNvbnN0IEJMQUNLTElTVCA9IG1lLmdldERpY3QoRW51bURpY3REYXRhYmFzZS5CTEFDS0xJU1QpO1xuXHRcdGNvbnN0IFRBQkxFID0gbWUuZ2V0RGljdERhdGFiYXNlKEVudW1EaWN0RGF0YWJhc2UuVEFCTEUpO1xuXG5cdFx0T2JqZWN0LmVudHJpZXMoQkxBQ0tMSVNUKVxuXHRcdFx0LmZvckVhY2goZnVuY3Rpb24gKFtrZXksIGJvb2xdKVxuXHRcdFx0e1xuXHRcdFx0XHRib29sICYmIFRBQkxFLnJlbW92ZShrZXkpXG5cdFx0XHR9KVxuXHRcdDtcblxuXHRcdHJldHVybiB0aGlzXG5cdH1cblxuXHRsaXN0TW9kdWxlcyhvcHRpb25zOiBJT3B0aW9uc0RvU2VnbWVudCA9IHt9KVxuXHR7XG5cdFx0bGV0IG1lID0gdGhpcztcblxuXHRcdG9wdGlvbnMgPSB0aGlzLmdldE9wdGlvbnNEb1NlZ21lbnQob3B0aW9ucyk7XG5cblx0XHRsZXQgcmV0ID0ge1xuXHRcdFx0ZW5hYmxlOiB7XG5cdFx0XHRcdHRva2VuaXplcjogW10gYXMgSVN1YlRva2VuaXplcltdLFxuXHRcdFx0XHRvcHRpbWl6ZXI6IFtdIGFzIElTdWJPcHRpbWl6ZXJbXSxcblx0XHRcdH0sXG5cdFx0XHRkaXNhYmxlOiB7XG5cdFx0XHRcdHRva2VuaXplcjogW10gYXMgSVN1YlRva2VuaXplcltdLFxuXHRcdFx0XHRvcHRpbWl6ZXI6IFtdIGFzIElTdWJPcHRpbWl6ZXJbXSxcblx0XHRcdH0sXG5cdFx0fTtcblxuXHRcdGlmIChvcHRpb25zICYmIG9wdGlvbnMuZGlzYWJsZU1vZHVsZXMpXG5cdFx0e1xuXHRcdFx0bWUubW9kdWxlcy50b2tlbml6ZXJcblx0XHRcdFx0LmZvckVhY2goZnVuY3Rpb24gKG1vZClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGxldCBib29sOiBib29sZWFuO1xuXG5cdFx0XHRcdFx0aWYgKG1vZC5uYW1lKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGlmIChvcHRpb25zLmRpc2FibGVNb2R1bGVzLmluY2x1ZGVzKG1vZC5uYW1lKSlcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0Ym9vbCA9IHRydWU7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRpZiAob3B0aW9ucy5kaXNhYmxlTW9kdWxlcy5pbmNsdWRlcyhtb2QgYXMgYW55KSlcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0Ym9vbCA9IHRydWU7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0cmV0W2Jvb2wgPyAnZGlzYWJsZScgOiAnZW5hYmxlJ10udG9rZW5pemVyLnB1c2gobW9kKTtcblx0XHRcdFx0fSlcblx0XHRcdDtcblxuXHRcdFx0bWUubW9kdWxlcy5vcHRpbWl6ZXJcblx0XHRcdFx0LmZvckVhY2goZnVuY3Rpb24gKG1vZClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGxldCBib29sOiBib29sZWFuO1xuXG5cdFx0XHRcdFx0aWYgKG1vZC5uYW1lKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGlmIChvcHRpb25zLmRpc2FibGVNb2R1bGVzLmluY2x1ZGVzKG1vZC5uYW1lKSlcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0Ym9vbCA9IHRydWU7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRpZiAob3B0aW9ucy5kaXNhYmxlTW9kdWxlcy5pbmNsdWRlcyhtb2QgYXMgYW55KSlcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0Ym9vbCA9IHRydWU7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0cmV0W2Jvb2wgPyAnZGlzYWJsZScgOiAnZW5hYmxlJ10ub3B0aW1pemVyLnB1c2gobW9kKTtcblx0XHRcdFx0fSlcblx0XHRcdDtcblx0XHR9XG5cdFx0ZWxzZVxuXHRcdHtcblx0XHRcdHJldC5lbmFibGUudG9rZW5pemVyID0gbWUubW9kdWxlcy50b2tlbml6ZXIuc2xpY2UoKTtcblx0XHRcdHJldC5lbmFibGUub3B0aW1pemVyID0gbWUubW9kdWxlcy5vcHRpbWl6ZXIuc2xpY2UoKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gcmV0O1xuXHR9XG5cblx0LyoqXG5cdCAqIOW8gOWni+WIhuivjVxuXHQgKlxuXHQgKiBAcGFyYW0ge1N0cmluZ30gdGV4dCDmlofmnKxcblx0ICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMg6YCJ6aG5XG5cdCAqICAgLSB7Qm9vbGVhbn0gc2ltcGxlIOaYr+WQpuS7hei/lOWbnuWNleivjeWGheWuuVxuXHQgKiAgIC0ge0Jvb2xlYW59IHN0cmlwUHVuY3R1YXRpb24g5Y676Zmk5qCH54K556ym5Y+3XG5cdCAqICAgLSB7Qm9vbGVhbn0gY29udmVydFN5bm9ueW0g6L2s5o2i5ZCM5LmJ6K+NXG5cdCAqICAgLSB7Qm9vbGVhbn0gc3RyaXBTdG9wd29yZCDljrvpmaTlgZzmraLnrKZcblx0ICogQHJldHVybiB7QXJyYXl9XG5cdCAqL1xuXHRkb1NlZ21lbnQodGV4dDogc3RyaW5nIHwgQnVmZmVyLCBvcHRpb25zOiBJT3B0aW9uc0RvU2VnbWVudCAmIHtcblx0XHRzaW1wbGU6IHRydWUsXG5cdH0pOiBzdHJpbmdbXVxuXHRkb1NlZ21lbnQodGV4dDogc3RyaW5nIHwgQnVmZmVyLCBvcHRpb25zPzogSU9wdGlvbnNEb1NlZ21lbnQpOiBJV29yZFtdXG5cdGRvU2VnbWVudCh0ZXh0LCBvcHRpb25zOiBJT3B0aW9uc0RvU2VnbWVudCA9IHt9KVxuXHR7XG5cdFx0bGV0IG1lID0gdGhpcztcblxuXHRcdG9wdGlvbnMgPSB0aGlzLmdldE9wdGlvbnNEb1NlZ21lbnQob3B0aW9ucyk7XG5cblx0XHQvL2NvbnNvbGUuZGlyKG9wdGlvbnMpO1xuXG5cdFx0dGhpcy5hdXRvSW5pdCh0aGlzLm9wdGlvbnMpO1xuXG5cdFx0bGV0IHRleHRfbGlzdCA9IHRoaXMuX2dldF90ZXh0KHRleHQpXG5cdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHQuc3BsaXQodGhpcy5TUExJVClcblx0XHQ7XG5cdFx0dGV4dCA9IHVuZGVmaW5lZDtcblxuXHRcdGNvbnN0IG1vZHMgPSB0aGlzLmxpc3RNb2R1bGVzKG9wdGlvbnMpLmVuYWJsZTtcblxuXHRcdC8vIOWwhuaWh+acrOaMieeFp+aNouihjOespuWIhuWJsuaIkOWkmuaute+8jOW5tumAkOS4gOWIhuivjVxuXHRcdGxldCByZXQgPSB0ZXh0X2xpc3QucmVkdWNlKGZ1bmN0aW9uIChyZXQsIHNlY3Rpb24pXG5cdFx0e1xuXHRcdFx0Ly9jb25zb2xlLmRpcihzZWN0aW9uKTtcblxuXHRcdFx0aWYgKG1lLlNQTElUX0ZJTFRFUi50ZXN0KHNlY3Rpb24pKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXQgPSByZXQuY29uY2F0KHsgdzogc2VjdGlvbiB9KTtcblxuXHRcdFx0XHRzZWN0aW9uID0gW107XG5cdFx0XHR9XG5cblx0XHRcdC8vc2VjdGlvbiA9IHNlY3Rpb24udHJpbSgpO1xuXHRcdFx0aWYgKHNlY3Rpb24ubGVuZ3RoID4gMClcblx0XHRcdHtcblx0XHRcdFx0Ly8g5YiG6K+NXG5cdFx0XHRcdGxldCBzcmV0ID0gbWUudG9rZW5pemVyLnNwbGl0KHNlY3Rpb24sIG1vZHMudG9rZW5pemVyKTtcblxuXHRcdFx0XHQvLyDkvJjljJZcblx0XHRcdFx0c3JldCA9IG1lLm9wdGltaXplci5kb09wdGltaXplKHNyZXQsIG1vZHMub3B0aW1pemVyKTtcblxuXHRcdFx0XHQvLyDov57mjqXliIbor43nu5Pmnpxcblx0XHRcdFx0aWYgKHNyZXQubGVuZ3RoID4gMClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHJldCA9IHJldC5jb25jYXQoc3JldCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHJldDtcblx0XHR9LCBbXSk7XG5cblx0XHQvLyDljrvpmaTmoIfngrnnrKblj7dcblx0XHRpZiAob3B0aW9ucy5zdHJpcFB1bmN0dWF0aW9uKVxuXHRcdHtcblx0XHRcdHJldCA9IHJldC5maWx0ZXIoZnVuY3Rpb24gKGl0ZW0pXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiBpdGVtLnAgIT09IFBPU1RBRy5EX1c7XG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHRpZiAob3B0aW9ucy5jb252ZXJ0U3lub255bSlcblx0XHR7XG5cdFx0XHRyZXQgPSB0aGlzLmNvbnZlcnRTeW5vbnltKHJldCk7XG5cdFx0fVxuXG5cdFx0Lypcblx0XHQvLyDovazmjaLlkIzkuYnor41cblx0XHRmdW5jdGlvbiBjb252ZXJ0U3lub255bShsaXN0KVxuXHRcdHtcblx0XHRcdGxldCBjb3VudCA9IDA7XG5cdFx0XHRsZXQgVEFCTEUgPSBtZS5nZXREaWN0KCdTWU5PTllNJyk7XG5cdFx0XHRsaXN0ID0gbGlzdC5tYXAoZnVuY3Rpb24gKGl0ZW0pXG5cdFx0XHR7XG5cdFx0XHRcdGlmIChpdGVtLncgaW4gVEFCTEUpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRjb3VudCsrO1xuXHRcdFx0XHRcdC8vcmV0dXJuIHsgdzogVEFCTEVbaXRlbS53XSwgcDogaXRlbS5wIH07XG5cblx0XHRcdFx0XHRpdGVtLm93ID0gaXRlbS53O1xuXHRcdFx0XHRcdGl0ZW0udyA9IFRBQkxFW2l0ZW0ud107XG5cblx0XHRcdFx0XHRyZXR1cm4gaXRlbTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXR1cm4gaXRlbTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0XHRyZXR1cm4geyBjb3VudDogY291bnQsIGxpc3Q6IGxpc3QgfTtcblx0XHR9XG5cblx0XHRpZiAob3B0aW9ucy5jb252ZXJ0U3lub255bSlcblx0XHR7XG5cdFx0XHRsZXQgcmVzdWx0O1xuXHRcdFx0ZG9cblx0XHRcdHtcblx0XHRcdFx0cmVzdWx0ID0gY29udmVydFN5bm9ueW0ocmV0KTtcblx0XHRcdFx0cmV0ID0gcmVzdWx0Lmxpc3Q7XG5cdFx0XHR9XG5cdFx0XHR3aGlsZSAocmVzdWx0LmNvdW50ID4gMCk7XG5cdFx0fVxuXHRcdCovXG5cblx0XHQvLyDljrvpmaTlgZzmraLnrKZcblx0XHRpZiAob3B0aW9ucy5zdHJpcFN0b3B3b3JkKVxuXHRcdHtcblx0XHRcdGxldCBTVE9QV09SRCA9IG1lLmdldERpY3QoJ1NUT1BXT1JEJyk7XG5cdFx0XHRyZXQgPSByZXQuZmlsdGVyKGZ1bmN0aW9uIChpdGVtKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gIShpdGVtLncgaW4gU1RPUFdPUkQpO1xuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0aWYgKG9wdGlvbnMuc3RyaXBTcGFjZSlcblx0XHR7XG5cdFx0XHRyZXQgPSByZXQuZmlsdGVyKGZ1bmN0aW9uIChpdGVtKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gIS9eXFxzKyQvZy50ZXN0KGl0ZW0udyk7XG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHQvLyDku4Xov5Tlm57ljZXor43lhoXlrrlcblx0XHRpZiAob3B0aW9ucy5zaW1wbGUpXG5cdFx0e1xuXHRcdFx0cmV0ID0gcmV0Lm1hcChmdW5jdGlvbiAoaXRlbSlcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIGl0ZW0udztcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdHJldHVybiByZXQ7XG5cdH1cblxuXHQvKipcblx0ICog6L2s5o2i5ZCM5LmJ6K+NXG5cdCAqL1xuXHRjb252ZXJ0U3lub255bShyZXQ6IElXb3JkRGVidWdbXSwgc2hvd2NvdW50OiB0cnVlKTogeyBjb3VudDogbnVtYmVyLCBsaXN0OiBJV29yZERlYnVnW10gfVxuXHRjb252ZXJ0U3lub255bShyZXQ6IElXb3JkRGVidWdbXSwgc2hvd2NvdW50PzogYm9vbGVhbik6IElXb3JkRGVidWdbXVxuXHRjb252ZXJ0U3lub255bShyZXQ6IElXb3JkRGVidWdbXSwgc2hvd2NvdW50PzogYm9vbGVhbilcblx0e1xuXHRcdGNvbnN0IG1lID0gdGhpcztcblx0XHRsZXQgVEFCTEUgPSBtZS5nZXREaWN0KCdTWU5PTllNJyk7XG5cdFx0bGV0IFRBQkxFRElDVCA9IG1lLmdldERpY3QoJ1RBQkxFJyk7XG5cblx0XHRsZXQgdG90YWxfY291bnQgPSAwO1xuXG5cdFx0Ly9jb25zdCBSQVcgPSBTeW1ib2wuZm9yKCdSQVcnKTtcblxuXHRcdC8vIOi9rOaNouWQjOS5ieivjVxuXHRcdGZ1bmN0aW9uIF9jb252ZXJ0U3lub255bShsaXN0OiBJV29yZERlYnVnW10pXG5cdFx0e1xuXHRcdFx0bGV0IGNvdW50ID0gMDtcblx0XHRcdGxpc3QgPSBsaXN0LnJlZHVjZShmdW5jdGlvbiAoYSwgaXRlbTogSVdvcmREZWJ1Zylcblx0XHRcdHtcblx0XHRcdFx0bGV0IGJvb2w6IGJvb2xlYW47XG5cdFx0XHRcdGxldCB3ID0gaXRlbS53O1xuXHRcdFx0XHRsZXQgbnc6IHN0cmluZztcblxuXHRcdFx0XHRsZXQgZGVidWcgPSBkZWJ1Z1Rva2VuKGl0ZW0pO1xuXG5cdFx0XHRcdGlmICh3IGluIFRBQkxFKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Ym9vbCA9IHRydWU7XG5cdFx0XHRcdFx0bncgPSBUQUJMRVt3XTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIGlmIChkZWJ1Zy5hdXRvQ3JlYXRlICYmICFkZWJ1Zy5jb252ZXJ0U3lub255bSAmJiAhaXRlbS5vdyAmJiBpdGVtLm0gJiYgaXRlbS5tLmxlbmd0aClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdG53ID0gaXRlbS5tLnJlZHVjZShmdW5jdGlvbiAoYTogc3RyaW5nW10sIGIpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0aWYgKHR5cGVvZiBiID09ICdzdHJpbmcnKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRhLnB1c2goYik7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRlbHNlIGlmIChiLncgaW4gVEFCTEUpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGEucHVzaChUQUJMRVtiLnddKTtcblx0XHRcdFx0XHRcdFx0Ym9vbCA9IHRydWU7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGEucHVzaChiLncpO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRyZXR1cm4gYTtcblx0XHRcdFx0XHR9LCBbXSkuam9pbignJyk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoYm9vbClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGNvdW50Kys7XG5cdFx0XHRcdFx0dG90YWxfY291bnQrKztcblx0XHRcdFx0XHQvL3JldHVybiB7IHc6IFRBQkxFW2l0ZW0ud10sIHA6IGl0ZW0ucCB9O1xuXG5cdFx0XHRcdFx0bGV0IHAgPSBpdGVtLnA7XG5cblx0XHRcdFx0XHRpZiAodyBpbiBUQUJMRURJQ1QpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0cCA9IFRBQkxFRElDVFt3XS5wIHx8IHA7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0aWYgKHAgJiBtZS5QT1NUQUcuQkFEKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHAgPSBwIF4gbWUuUE9TVEFHLkJBRDtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRsZXQgaXRlbV9uZXcgPSBkZWJ1Z1Rva2VuKHtcblx0XHRcdFx0XHRcdC4uLml0ZW0sXG5cblx0XHRcdFx0XHRcdHc6IG53LFxuXHRcdFx0XHRcdFx0b3c6IHcsXG5cdFx0XHRcdFx0XHRwLFxuXHRcdFx0XHRcdFx0b3A6IGl0ZW0ucCxcblxuXHRcdFx0XHRcdFx0Ly9bUkFXXTogaXRlbSxcblxuXHRcdFx0XHRcdFx0Ly9zb3VyY2U6IGl0ZW0sXG5cdFx0XHRcdFx0fSwge1xuXHRcdFx0XHRcdFx0Y29udmVydFN5bm9ueW06IHRydWUsXG5cdFx0XHRcdFx0XHQvL19zb3VyY2U6IGl0ZW0sXG5cblx0XHRcdFx0XHRcdC8qKlxuXHRcdFx0XHRcdFx0ICogSlNPTi5zdHJpbmdpZnlcblx0XHRcdFx0XHRcdCAqIGF2b2lkIFR5cGVFcnJvcjogQ29udmVydGluZyBjaXJjdWxhciBzdHJ1Y3R1cmUgdG8gSlNPTlxuXHRcdFx0XHRcdFx0ICovXG5cdFx0XHRcdFx0XHRfc291cmNlOiBkZWVwbWVyZ2Uoe30sIGl0ZW0pIGFzIElXb3JkRGVidWcsXG5cblx0XHRcdFx0XHR9LCB0cnVlKTtcblxuXHRcdFx0XHRcdGEucHVzaChpdGVtX25ldyk7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0YS5wdXNoKGl0ZW0pO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIGE7XG5cdFx0XHR9LCBbXSk7XG5cdFx0XHRyZXR1cm4geyBjb3VudDogY291bnQsIGxpc3Q6IGxpc3QgfTtcblx0XHR9XG5cblx0XHRsZXQgcmVzdWx0OiB7IGNvdW50OiBudW1iZXIsIGxpc3Q6IElXb3JkRGVidWdbXSB9O1xuXHRcdGRvXG5cdFx0e1xuXHRcdFx0cmVzdWx0ID0gX2NvbnZlcnRTeW5vbnltKHJldCk7XG5cdFx0XHRyZXQgPSByZXN1bHQubGlzdDtcblx0XHR9XG5cdFx0d2hpbGUgKHJlc3VsdC5jb3VudCA+IDApO1xuXG5cdFx0aWYgKHNob3djb3VudClcblx0XHR7XG5cdFx0XHRyZXR1cm4geyBjb3VudDogdG90YWxfY291bnQsIGxpc3Q6IHJldCB9O1xuXHRcdH1cblxuXHRcdHJldHVybiByZXQ7XG5cdH1cblxuXHQvKipcblx0ICog5bCG5Y2V6K+N5pWw57uE6L+e5o6l5oiQ5a2X56ym5LiyXG5cdCAqXG5cdCAqIEBwYXJhbSB7QXJyYXl9IHdvcmRzIOWNleivjeaVsOe7hFxuXHQgKiBAcmV0dXJuIHtTdHJpbmd9XG5cdCAqL1xuXHRzdHJpbmdpZnkod29yZHM6IEFycmF5PElXb3JkIHwgc3RyaW5nPiwgLi4uYXJndik6IHN0cmluZ1xuXHR7XG5cdFx0cmV0dXJuIFNlZ21lbnQuc3RyaW5naWZ5KHdvcmRzLCAuLi5hcmd2KTtcblx0fVxuXG5cdHN0YXRpYyBzdHJpbmdpZnkod29yZHM6IEFycmF5PElXb3JkIHwgc3RyaW5nPiwgLi4uYXJndik6IHN0cmluZ1xuXHR7XG5cdFx0cmV0dXJuIHdvcmRzLm1hcChmdW5jdGlvbiAoaXRlbSlcblx0XHR7XG5cdFx0XHRpZiAodHlwZW9mIGl0ZW0gPT09ICdzdHJpbmcnKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gaXRlbTtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKCd3JyBpbiBpdGVtKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gaXRlbS53O1xuXHRcdFx0fVxuXHRcdFx0ZWxzZVxuXHRcdFx0e1xuXHRcdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKGBub3QgYSB2YWxpZCBzZWdtZW50IHJlc3VsdCBsaXN0YClcblx0XHRcdH1cblx0XHR9KS5qb2luKCcnKTtcblx0fVxuXG5cdC8qKlxuXHQgKiDmoLnmja7mn5DkuKrljZXor43miJbor43mgKfmnaXliIblibLljZXor43mlbDnu4Rcblx0ICpcblx0ICogQHBhcmFtIHtBcnJheX0gd29yZHMg5Y2V6K+N5pWw57uEXG5cdCAqIEBwYXJhbSB7TnVtYmVyfFN0cmluZ30gcyDnlKjkuo7liIblibLnmoTljZXor43miJbor43mgKdcblx0ICogQHJldHVybiB7QXJyYXl9XG5cdCAqL1xuXHRzcGxpdCh3b3JkczogSVdvcmRbXSwgczogc3RyaW5nIHwgbnVtYmVyKTogSVdvcmRbXVxuXHR7XG5cdFx0bGV0IHJldCA9IFtdO1xuXHRcdGxldCBsYXN0aSA9IDA7XG5cdFx0bGV0IGkgPSAwO1xuXHRcdGxldCBmID0gdHlwZW9mIHMgPT09ICdzdHJpbmcnID8gJ3cnIDogJ3AnO1xuXG5cdFx0d2hpbGUgKGkgPCB3b3Jkcy5sZW5ndGgpXG5cdFx0e1xuXHRcdFx0aWYgKHdvcmRzW2ldW2ZdID09IHMpXG5cdFx0XHR7XG5cdFx0XHRcdGlmIChsYXN0aSA8IGkpIHJldC5wdXNoKHdvcmRzLnNsaWNlKGxhc3RpLCBpKSk7XG5cdFx0XHRcdHJldC5wdXNoKHdvcmRzLnNsaWNlKGksIGkgKyAxKSk7XG5cdFx0XHRcdGkrKztcblx0XHRcdFx0bGFzdGkgPSBpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZVxuXHRcdFx0e1xuXHRcdFx0XHRpKys7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmIChsYXN0aSA8IHdvcmRzLmxlbmd0aCAtIDEpXG5cdFx0e1xuXHRcdFx0cmV0LnB1c2god29yZHMuc2xpY2UobGFzdGksIHdvcmRzLmxlbmd0aCkpO1xuXHRcdH1cblxuXHRcdHJldHVybiByZXQ7XG5cdH1cblxuXHQvKipcblx0ICog5Zyo5Y2V6K+N5pWw57uE5Lit5p+l5om+5p+Q5LiA5Liq5Y2V6K+N5oiW6K+N5oCn5omA5Zyo55qE5L2N572uXG5cdCAqXG5cdCAqIEBwYXJhbSB7QXJyYXl9IHdvcmRzIOWNleivjeaVsOe7hFxuXHQgKiBAcGFyYW0ge051bWJlcnxTdHJpbmd9IHMg6KaB5p+l5om+55qE5Y2V6K+N5oiW6K+N5oCnXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBjdXIg5byA5aeL5L2N572uXG5cdCAqIEByZXR1cm4ge051bWJlcn0g5om+5LiN5Yiw77yM6L+U5ZueLTFcblx0ICovXG5cdGluZGV4T2Yod29yZHM6IElXb3JkW10sIHM6IHN0cmluZyB8IG51bWJlciwgY3VyPzogbnVtYmVyKVxuXHR7XG5cdFx0Y3VyID0gaXNOYU4oY3VyKSA/IDAgOiBjdXI7XG5cdFx0bGV0IGYgPSB0eXBlb2YgcyA9PT0gJ3N0cmluZycgPyAndycgOiAncCc7XG5cblx0XHR3aGlsZSAoY3VyIDwgd29yZHMubGVuZ3RoKVxuXHRcdHtcblx0XHRcdGlmICh3b3Jkc1tjdXJdW2ZdID09IHMpIHJldHVybiBjdXI7XG5cdFx0XHRjdXIrKztcblx0XHR9XG5cblx0XHRyZXR1cm4gLTE7XG5cdH1cbn1cblxuZXhwb3J0IG5hbWVzcGFjZSBTZWdtZW50XG57XG5cblx0ZXhwb3J0IHR5cGUgSVNQTElUID0gUmVnRXhwIHwgc3RyaW5nIHwge1xuXHRcdFtTeW1ib2wuc3BsaXRdKGlucHV0OiBzdHJpbmcsIGxpbWl0PzogbnVtYmVyKTogc3RyaW5nW10sXG5cdH07XG5cblx0ZXhwb3J0IHR5cGUgSVNQTElUX0ZJTFRFUiA9IFJlZ0V4cCB8IHtcblx0XHR0ZXN0KGlucHV0OiBzdHJpbmcpOiBib29sZWFuLFxuXHR9O1xuXG5cdGV4cG9ydCBpbnRlcmZhY2UgSURJQ1Q8VCA9IGFueT5cblx0e1xuXHRcdFtrZXk6IHN0cmluZ106IFQsXG5cdH1cblxuXHRleHBvcnQgaW50ZXJmYWNlIElESUNUMjxUID0gYW55PlxuXHR7XG5cdFx0W2tleTogbnVtYmVyXTogSURJQ1Q8VD4sXG5cdH1cblxuXHRleHBvcnQgdHlwZSBJT3B0aW9uc1NlZ21lbnQgPSBJT3B0aW9uc1RhYmxlRGljdCAmIHtcblx0XHRkYj86IFRhYmxlRGljdFtdLFxuXHRcdG9wdGlvbnNEb1NlZ21lbnQ/OiBJT3B0aW9uc0RvU2VnbWVudCxcblxuXHRcdGFsbF9tb2Q/OiBib29sZWFuLFxuXG5cdFx0bWF4Q2h1bmtDb3VudD86IG51bWJlcixcblx0XHRtaW5DaHVua0NvdW50PzogbnVtYmVyLFxuXG5cdFx0ZGlzYWJsZU1vZHVsZXM/OiAoRU5VTV9TVUJNT0RTX05BTUUgfCB1bmtub3duKVtdLFxuXHR9O1xuXG5cdGV4cG9ydCB0eXBlIElESUNUX1NZTk9OWU0gPSBJRElDVDxzdHJpbmc+O1xuXHRleHBvcnQgdHlwZSBJRElDVF9TVE9QV09SRCA9IElESUNUPGJvb2xlYW4+O1xuXHRleHBvcnQgdHlwZSBJRElDVF9CTEFDS0xJU1QgPSBJRElDVDxib29sZWFuPjtcblxuXHRleHBvcnQgaW50ZXJmYWNlIElXb3JkXG5cdHtcblx0XHR3OiBzdHJpbmcsXG5cdFx0LyoqXG5cdFx0ICog6Kme5oCnXG5cdFx0ICovXG5cdFx0cD86IG51bWJlcixcblx0XHQvKipcblx0XHQgKiDoqZ7mgKflkI3nqLFcblx0XHQgKi9cblx0XHRwcz86IHN0cmluZyxcblx0XHRwcD86IHN0cmluZyxcblx0XHQvKipcblx0XHQgKiDmrIrph41cblx0XHQgKi9cblx0XHRmPzogbnVtYmVyLFxuXHRcdC8qKlxuXHRcdCAqIOW8gOWni+S9jee9rlxuXHRcdCAqL1xuXHRcdGM/OiBudW1iZXIsXG5cdFx0LyoqXG5cdFx0ICog5ZCI5L216aCF55uuXG5cdFx0ICovXG5cdFx0bT86IEFycmF5PElXb3JkIHwgc3RyaW5nPixcblxuXHRcdC8vY29udmVydFN5bm9ueW0/OiBib29sZWFuLFxuXHRcdC8vYXV0b0NyZWF0ZT86IGJvb2xlYW4sXG5cblx0XHQvKipcblx0XHQgKiDku6Pooajljp/nlJ/lrZjlnKjmlrzlrZflhbjlhafnmoTpoIXnm65cblx0XHQgKi9cblx0XHRzPzogYm9vbGVhbixcblx0XHRvcz86IGJvb2xlYW4sXG5cdH1cblxuXHRleHBvcnQgaW50ZXJmYWNlIElPcHRpb25zRG9TZWdtZW50XG5cdHtcblx0XHQvKipcblx0XHQgKiDkuI3ov5Tlm57or43mgKdcblx0XHQgKi9cblx0XHRzaW1wbGU/OiBib29sZWFuLFxuXG5cdFx0LyoqXG5cdFx0ICog5Y676Zmk5qCH54K556ym5Y+3XG5cdFx0ICovXG5cdFx0c3RyaXBQdW5jdHVhdGlvbj86IGJvb2xlYW4sXG5cblx0XHQvKipcblx0XHQgKiDovazmjaLlkIzkuYnor41cblx0XHQgKi9cblx0XHRjb252ZXJ0U3lub255bT86IGJvb2xlYW4sXG5cblx0XHQvKipcblx0XHQgKiDljrvpmaTlgZzmraLnrKZcblx0XHQgKi9cblx0XHRzdHJpcFN0b3B3b3JkPzogYm9vbGVhbixcblxuXHRcdHN0cmlwU3BhY2U/OiBib29sZWFuLFxuXG5cdFx0ZGlzYWJsZU1vZHVsZXM/OiAoRU5VTV9TVUJNT0RTX05BTUUgfCB1bmtub3duKVtdLFxuXHR9XG59XG5cbmV4cG9ydCBpbXBvcnQgSU9wdGlvbnNTZWdtZW50ID0gU2VnbWVudC5JT3B0aW9uc1NlZ21lbnQ7XG5leHBvcnQgaW1wb3J0IElXb3JkID0gU2VnbWVudC5JV29yZDtcbmV4cG9ydCBpbXBvcnQgSU9wdGlvbnNEb1NlZ21lbnQgPSBTZWdtZW50LklPcHRpb25zRG9TZWdtZW50O1xuZXhwb3J0IGltcG9ydCBJRElDVF9TWU5PTllNID0gU2VnbWVudC5JRElDVF9TWU5PTllNO1xuZXhwb3J0IGltcG9ydCBJRElDVF9TVE9QV09SRCA9IFNlZ21lbnQuSURJQ1RfU1RPUFdPUkQ7XG5leHBvcnQgaW1wb3J0IElESUNUX0JMQUNLTElTVCA9IFNlZ21lbnQuSURJQ1RfQkxBQ0tMSVNUO1xuXG5leHBvcnQgaW1wb3J0IElESUNUID0gU2VnbWVudC5JRElDVDtcbmV4cG9ydCBpbXBvcnQgSURJQ1QyID0gU2VnbWVudC5JRElDVDI7XG5cbmV4cG9ydCBpbXBvcnQgSVNQTElUID0gU2VnbWVudC5JU1BMSVQ7XG5leHBvcnQgaW1wb3J0IElTUExJVF9GSUxURVIgPSBTZWdtZW50LklTUExJVF9GSUxURVI7XG5cbmV4cG9ydCBkZWZhdWx0IFNlZ21lbnQ7XG4iXX0=