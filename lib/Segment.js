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
    doSegment(text, options = {}) {
        let me = this;
        options = this.getOptionsDoSegment(options);
        //console.dir(options);
        this.autoInit(this.options);
        let text_list = this._get_text(text)
            // @ts-ignore
            .split(this.SPLIT);
        text = undefined;
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
                let sret = me.tokenizer.split(section, me.modules.tokenizer);
                // 优化
                sret = me.optimizer.doOptimize(sret, me.modules.optimizer);
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
Segment.defaultOptionsDoSegment = {};
exports.Segment = Segment;
exports.default = Segment;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2VnbWVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIlNlZ21lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7R0FJRztBQUVILFlBQVksQ0FBQzs7QUFFYixhQUFhO0FBQ2IsYUFBYTtBQUNiLDZCQUE2QjtBQUM3QixrQ0FBMkQ7QUFDM0QsbUNBQXFDO0FBQ3JDLHFDQUE4QjtBQUM5QixpREFBbUQ7QUFFbkQsdUNBQXdFO0FBRXhFLHFDQUE4QjtBQUM5QixtREFBc0M7QUFDdEMsK0NBQXFEO0FBQ3JELDZDQUErQztBQUMvQywrQ0FBdUM7QUFDdkMsK0JBQTJFO0FBQzNFLHdDQUEwQztBQUcxQyxzREFBOEM7QUFFOUMsNENBQTRDO0FBQzVDLG1DQUEyQztBQUUzQzs7R0FFRztBQUNILE1BQWEsT0FBTztJQWlFbkIsWUFBWSxVQUEyQixFQUFFO1FBNUR6Qzs7Ozs7Ozs7O1dBU0c7UUFDSCxVQUFLLEdBQVcsd0NBQWtELENBQUM7UUFFbkU7Ozs7O1dBS0c7UUFDSCxpQkFBWSxHQUFrQixjQUErQixDQUFDO1FBRTlEOzs7V0FHRztRQUNILFdBQU0sR0FBRyxnQkFBTSxDQUFDO1FBQ2hCOzs7V0FHRztRQUNILFNBQUksR0FLQSxFQUFFLENBQUM7UUFDUCxZQUFPLEdBQUc7WUFDVDs7ZUFFRztZQUNILFNBQVMsRUFBRSxFQUFFO1lBQ2I7O2VBRUc7WUFDSCxTQUFTLEVBQUUsRUFBRTtTQUliLENBQUM7UUFLRixPQUFFLEdBRUUsRUFBRSxDQUFDO1FBRVAsWUFBTyxHQUFvQixFQUFFLENBQUM7UUFNN0IsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBRWxCLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztRQUV4RCxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksZUFBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3JDLElBQUksQ0FB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Q1osQ0FBQztJQUVEOzs7Ozs7O09BT0c7SUFDSCxPQUFPLENBQUMsS0FBYyxFQUFFLENBQWtCLEVBQUUsR0FBWTtRQUV2RCxHQUFHLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztRQUMzQixJQUFJLENBQUMsR0FBRyxPQUFPLENBQUMsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO1FBRTFDLE9BQU8sR0FBRyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQ3pCO1lBQ0MsSUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztnQkFBRSxPQUFPLEdBQUcsQ0FBQztZQUNuQyxHQUFHLEVBQUUsQ0FBQztTQUNOO1FBRUQsT0FBTyxDQUFDLENBQUMsQ0FBQztJQUNYLENBQUM7O0FBNzlCTSwrQkFBdUIsR0FBc0IsRUFBRSxDQUFDO0FBSHhELDBCQWkrQkM7QUE4R0Qsa0JBQWUsT0FBTyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiDliIbor43lmajmjqXlj6NcbiAqXG4gKiBAYXV0aG9yIOiAgembtzxsZWl6b25nbWluQGdtYWlsLmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbi8vIEB0cy1pZ25vcmVcbi8vIEB0cy1pZ25vcmVcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBzZWFyY2hGaXJzdFN5bmMsIHNlYXJjaEdsb2JTeW5jIH0gZnJvbSAnLi9mcy9nZXQnO1xuaW1wb3J0IHsgdXNlRGVmYXVsdCB9IGZyb20gJy4vaW5kZXgnO1xuaW1wb3J0IFBPU1RBRyBmcm9tICcuL1BPU1RBRyc7XG5pbXBvcnQgVGFibGVEaWN0QmxhY2tsaXN0IGZyb20gJy4vdGFibGUvYmxhY2tsaXN0JztcbmltcG9ydCBBYnN0cmFjdFRhYmxlRGljdENvcmUgZnJvbSAnLi90YWJsZS9jb3JlJztcbmltcG9ydCB7IElPcHRpb25zIGFzIElPcHRpb25zVGFibGVEaWN0LCBUYWJsZURpY3QgfSBmcm9tICcuL3RhYmxlL2RpY3QnO1xuXG5pbXBvcnQgTG9hZGVyIGZyb20gJy4vbG9hZGVyJztcbmltcG9ydCB7IGNybGYgfSBmcm9tICdjcmxmLW5vcm1hbGl6ZSc7XG5pbXBvcnQgeyBUYWJsZURpY3RTdG9wd29yZCB9IGZyb20gJy4vdGFibGUvc3RvcHdvcmQnO1xuaW1wb3J0IFRhYmxlRGljdFN5bm9ueW0gZnJvbSAnLi90YWJsZS9zeW5vbnltJztcbmltcG9ydCBTZWdtZW50RGljdCBmcm9tICdzZWdtZW50LWRpY3QnO1xuaW1wb3J0IHsgSVN1Yk9wdGltaXplciwgSVN1YlRva2VuaXplciwgT3B0aW1pemVyLCBUb2tlbml6ZXIgfSBmcm9tICcuL21vZCc7XG5pbXBvcnQgeyBkZWJ1Z1Rva2VuIH0gZnJvbSAnLi91dGlsL2RlYnVnJztcbmltcG9ydCB7IElXb3JkRGVidWcgfSBmcm9tICcuL3V0aWwvaW5kZXgnO1xuXG5pbXBvcnQgUHJvamVjdENvbmZpZyBmcm9tICcuLi9wcm9qZWN0LmNvbmZpZyc7XG5cbmltcG9ydCAqIGFzIGRlZXBtZXJnZSBmcm9tICdkZWVwbWVyZ2UtcGx1cyc7XG5pbXBvcnQgeyBFbnVtRGljdERhdGFiYXNlIH0gZnJvbSAnLi9jb25zdCc7XG5cbi8qKlxuICog5Yib5bu65YiG6K+N5Zmo5o6l5Y+jXG4gKi9cbmV4cG9ydCBjbGFzcyBTZWdtZW50XG57XG5cblx0c3RhdGljIGRlZmF1bHRPcHRpb25zRG9TZWdtZW50OiBJT3B0aW9uc0RvU2VnbWVudCA9IHt9O1xuXG5cdC8qKlxuXHQgKiDliIbmrrVcblx0ICpcblx0ICog55Sx5pa8IHNlZ21lbnQg5piv5Yip55So5bCN5YWn5a6555qE5YmN5b6M5paH5YiG5p6Q5L6G6YCy6KGM5YiG6KmeXG5cdCAqIOaJgOS7peWmguS9leWIh+WJsuauteiQveWwjeaWvOe1kOaenOWwseacg+eUoueUn+S4jeWQjOW9semfv1xuXHQgKlxuXHQgKiBgUmVnRXhwYCBvciDlhbfmnIkgYC5bU3ltYm9sLnNwbGl0XShpbnB1dDogc3RyaW5nLCBsaW1pdD86IG51bWJlcikgPT4gc3RyaW5nW11gIOeahOeJqeS7tlxuXHQgKlxuXHQgKiBAdHlwZSB7U2VnbWVudC5JU1BMSVR9XG5cdCAqL1xuXHRTUExJVDogSVNQTElUID0gLyhbXFxyXFxuXSt8XlvjgIBcXHMrXSt8W+OAgFxcc10rJHxb44CAXFxzXXsyLH0pL2dtIGFzIElTUExJVDtcblxuXHQvKipcblx0ICog5YiG5q615LmL5b6MIOWmguaenOespuWQiOS7peS4i+aineS7tiDliYfnm7TmjqXlv73nlaXliIbmnpBcblx0ICogYFJlZ0V4cGAgb3Ig5YW35pyJIGAudGVzdChpbnB1dDogc3RyaW5nKSA9PiBib29sZWFuYCDnmoTnianku7Zcblx0ICpcblx0ICogQHR5cGUge1NlZ21lbnQuSVNQTElUX0ZJTFRFUn1cblx0ICovXG5cdFNQTElUX0ZJTFRFUjogSVNQTElUX0ZJTFRFUiA9IC9eKFtcXHJcXG5dKykkL2cgYXMgSVNQTElUX0ZJTFRFUjtcblxuXHQvKipcblx0ICog6K+N5oCnXG5cdCAqIEB0eXBlIHtQT1NUQUd9XG5cdCAqL1xuXHRQT1NUQUcgPSBQT1NUQUc7XG5cdC8qKlxuXHQgKiDor43lhbjooahcblx0ICogQHR5cGUge3t9fVxuXHQgKi9cblx0RElDVDoge1xuXHRcdFNUT1BXT1JEPzogSURJQ1RfU1RPUFdPUkQsXG5cdFx0U1lOT05ZTT86IElESUNUX1NZTk9OWU0sXG5cblx0XHRba2V5OiBzdHJpbmddOiBJRElDVCxcblx0fSA9IHt9O1xuXHRtb2R1bGVzID0ge1xuXHRcdC8qKlxuXHRcdCAqIOWIhuivjeaooeWdl1xuXHRcdCAqL1xuXHRcdHRva2VuaXplcjogW10sXG5cdFx0LyoqXG5cdFx0ICog5LyY5YyW5qih5Z2XXG5cdFx0ICovXG5cdFx0b3B0aW1pemVyOiBbXSxcblx0fSBhcyB7XG5cdFx0dG9rZW5pemVyOiBJU3ViVG9rZW5pemVyW10sXG5cdFx0b3B0aW1pemVyOiBJU3ViT3B0aW1pemVyW10sXG5cdH07XG5cblx0dG9rZW5pemVyOiBUb2tlbml6ZXI7XG5cdG9wdGltaXplcjogT3B0aW1pemVyO1xuXG5cdGRiOiB7XG5cdFx0W2tleTogc3RyaW5nXTogVGFibGVEaWN0LFxuXHR9ID0ge307XG5cblx0b3B0aW9uczogSU9wdGlvbnNTZWdtZW50ID0ge307XG5cblx0aW5pdGVkPzogYm9vbGVhbjtcblxuXHRjb25zdHJ1Y3RvcihvcHRpb25zOiBJT3B0aW9uc1NlZ21lbnQgPSB7fSlcblx0e1xuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xuXG5cdFx0dGhpcy5vcHRpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5vcHRpb25zLCBvcHRpb25zKTtcblxuXHRcdHRoaXMudG9rZW5pemVyID0gbmV3IFRva2VuaXplcih0aGlzKTtcblx0XHR0aGlzLm9wdGltaXplciA9IG5ldyBPcHRpbWl6ZXIodGhpcyk7XG5cblx0XHRpZiAodGhpcy5vcHRpb25zLmRiKVxuXHRcdHtcblx0XHRcdHRoaXMub3B0aW9ucy5kYi5mb3JFYWNoKGZ1bmN0aW9uIChkYXRhKVxuXHRcdFx0e1xuXHRcdFx0XHRzZWxmLmRiW2RhdGEudHlwZV0gPSBkYXRhO1xuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0ZGVsZXRlIHRoaXMub3B0aW9ucy5kYjtcblx0fVxuXG5cdGdldERpY3REYXRhYmFzZTxSIGV4dGVuZHMgVGFibGVEaWN0U3lub255bT4odHlwZTogRW51bURpY3REYXRhYmFzZS5TWU5PTllNLFxuXHRcdGF1dG9jcmVhdGU/OiBib29sZWFuLFxuXHRcdGxpYlRhYmxlRGljdD86IHsgbmV3KC4uLmFyZ3YpOiBSIH0sXG5cdCk6IFJcblx0Z2V0RGljdERhdGFiYXNlPFIgZXh0ZW5kcyBUYWJsZURpY3Q+KHR5cGU6IEVudW1EaWN0RGF0YWJhc2UuVEFCTEUsIGF1dG9jcmVhdGU/OiBib29sZWFuLCBsaWJUYWJsZURpY3Q/OiB7IG5ldyguLi5hcmd2KTogUiB9KTogUlxuXHRnZXREaWN0RGF0YWJhc2U8UiBleHRlbmRzIFRhYmxlRGljdFN0b3B3b3JkPih0eXBlOiBFbnVtRGljdERhdGFiYXNlLlNUT1BXT1JELFxuXHRcdGF1dG9jcmVhdGU/OiBib29sZWFuLFxuXHRcdGxpYlRhYmxlRGljdD86IHsgbmV3KC4uLmFyZ3YpOiBSIH0sXG5cdCk6IFJcblx0Z2V0RGljdERhdGFiYXNlPFIgZXh0ZW5kcyBUYWJsZURpY3RCbGFja2xpc3Q+KHR5cGU6IEVudW1EaWN0RGF0YWJhc2UuQkxBQ0tMSVNULFxuXHRcdGF1dG9jcmVhdGU/OiBib29sZWFuLFxuXHRcdGxpYlRhYmxlRGljdD86IHsgbmV3KC4uLmFyZ3YpOiBSIH0sXG5cdCk6IFJcblx0Z2V0RGljdERhdGFiYXNlPFIgZXh0ZW5kcyBUYWJsZURpY3RCbGFja2xpc3Q+KHR5cGU6IEVudW1EaWN0RGF0YWJhc2UuQkxBQ0tMSVNUX0ZPUl9PUFRJTUlaRVIsXG5cdFx0YXV0b2NyZWF0ZT86IGJvb2xlYW4sXG5cdFx0bGliVGFibGVEaWN0PzogeyBuZXcoLi4uYXJndik6IFIgfSxcblx0KTogUlxuXHRnZXREaWN0RGF0YWJhc2U8UiBleHRlbmRzIEFic3RyYWN0VGFibGVEaWN0Q29yZTxhbnk+Pih0eXBlOiBzdHJpbmcgfCBFbnVtRGljdERhdGFiYXNlLFxuXHRcdGF1dG9jcmVhdGU/OiBib29sZWFuLFxuXHRcdGxpYlRhYmxlRGljdD86IHsgbmV3KC4uLmFyZ3YpOiBSIH0sXG5cdCk6IFJcblx0Z2V0RGljdERhdGFiYXNlKHR5cGU6IHN0cmluZywgYXV0b2NyZWF0ZT86IGJvb2xlYW4sIGxpYlRhYmxlRGljdD8pXG5cdHtcblx0XHRpZiAoKGF1dG9jcmVhdGUgfHwgdGhpcy5pbml0ZWQpICYmICF0aGlzLmRiW3R5cGVdKVxuXHRcdHtcblx0XHRcdGlmICh0eXBlID09IFRhYmxlRGljdFN5bm9ueW0udHlwZSlcblx0XHRcdHtcblx0XHRcdFx0bGliVGFibGVEaWN0ID0gbGliVGFibGVEaWN0IHx8IFRhYmxlRGljdFN5bm9ueW07XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmICh0eXBlID09IFRhYmxlRGljdFN0b3B3b3JkLnR5cGUpXG5cdFx0XHR7XG5cdFx0XHRcdGxpYlRhYmxlRGljdCA9IGxpYlRhYmxlRGljdCB8fCBUYWJsZURpY3RTdG9wd29yZDtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKHR5cGUgPT0gVGFibGVEaWN0QmxhY2tsaXN0LnR5cGUpXG5cdFx0XHR7XG5cdFx0XHRcdGxpYlRhYmxlRGljdCA9IGxpYlRhYmxlRGljdCB8fCBUYWJsZURpY3RTdG9wd29yZDtcblx0XHRcdH1cblx0XHRcdGVsc2Vcblx0XHRcdHtcblx0XHRcdFx0bGliVGFibGVEaWN0ID0gbGliVGFibGVEaWN0IHx8IFRhYmxlRGljdDtcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5kYlt0eXBlXSA9IG5ldyBsaWJUYWJsZURpY3QodHlwZSwgdGhpcy5vcHRpb25zLCB7XG5cdFx0XHRcdFRBQkxFOiB0aGlzLkRJQ1RbdHlwZV0sXG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0cmV0dXJuIHRoaXMuZGJbdHlwZV07XG5cdH1cblxuXHQvKipcblx0ICog6L295YWl5YiG6K+N5qih5Z2XXG5cdCAqXG5cdCAqIEBwYXJhbSB7U3RyaW5nfEFycmF5fE9iamVjdH0gbW9kdWxlIOaooeWdl+WQjeensCjmlbDnu4Qp5oiW5qih5Z2X5a+56LGhXG5cdCAqIEByZXR1cm4ge1NlZ21lbnR9XG5cdCAqL1xuXHR1c2UobW9kOiBJU3ViT3B0aW1pemVyLCAuLi5hcmd2KVxuXHR1c2UobW9kOiBJU3ViVG9rZW5pemVyLCAuLi5hcmd2KVxuXHR1c2UobW9kOiBBcnJheTxJU3ViVG9rZW5pemVyIHwgSVN1Yk9wdGltaXplciB8IHN0cmluZz4sIC4uLmFyZ3YpXG5cdHVzZShtb2Q6IHN0cmluZywgLi4uYXJndilcblx0dXNlKG1vZCwgLi4uYXJndilcblx0dXNlKG1vZCwgLi4uYXJndilcblx0e1xuXHRcdGxldCBtZSA9IHRoaXM7XG5cblx0XHRpZiAoQXJyYXkuaXNBcnJheShtb2QpKVxuXHRcdHtcblx0XHRcdG1vZC5mb3JFYWNoKGZ1bmN0aW9uIChtKVxuXHRcdFx0e1xuXHRcdFx0XHRtZS51c2UobSk7XG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0ZWxzZVxuXHRcdHtcblx0XHRcdGlmICh0eXBlb2YgbW9kID09ICdzdHJpbmcnKVxuXHRcdFx0e1xuXHRcdFx0XHQvL2NvbnNvbGUubG9nKCdtb2R1bGUnLCBtb2QpO1xuXG5cdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0Ly9sZXQgZmlsZW5hbWUgPSBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnbW9kdWxlJywgbW9kdWxlICsgJy5qcycpO1xuXHRcdFx0XHRsZXQgZmlsZW5hbWUgPSBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnc3VibW9kJywgbW9kKTtcblxuXHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdG1vZCA9IHJlcXVpcmUoZmlsZW5hbWUpO1xuXHRcdFx0fVxuXHRcdFx0Ly8g5Yid5aeL5YyW5bm25rOo5YaM5qih5Z2XXG5cdFx0XHRsZXQgYyA9IG1vZC5pbml0KHRoaXMsIC4uLmFyZ3YpO1xuXG5cdFx0XHRpZiAodHlwZW9mIGMgIT09ICd1bmRlZmluZWQnKVxuXHRcdFx0e1xuXHRcdFx0XHRtb2QgPSBjO1xuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLm1vZHVsZXNbbW9kLnR5cGVdLnB1c2gobW9kKTtcblx0XHR9XG5cblx0XHR0aGlzLmluaXRlZCA9IHRydWU7XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdF9yZXNvbHZlRGljdEZpbGVuYW1lKG5hbWU6IHN0cmluZywgcGF0aFBsdXM6IHN0cmluZ1tdID0gW10sIGV4dFBsdXM6IHN0cmluZ1tdID0gW10pOiBzdHJpbmcgfCBzdHJpbmdbXVxuXHR7XG5cdFx0bGV0IG9wdGlvbnMgPSB7XG5cdFx0XHRwYXRoczogW1xuXHRcdFx0XHQnJyxcblx0XHRcdFx0UHJvamVjdENvbmZpZy5kaWN0X3Jvb3QsXG5cblx0XHRcdFx0Li4ucGF0aFBsdXMsXG5cdFx0XHRcdHBhdGgucmVzb2x2ZShTZWdtZW50RGljdC5ESUNUX1JPT1QsICdzZWdtZW50JyksXG5cdFx0XHRdLFxuXHRcdFx0ZXh0ZW5zaW9uczogW1xuXHRcdFx0XHQnJyxcblx0XHRcdFx0Li4uZXh0UGx1cyxcblx0XHRcdFx0Jy51dGY4Jyxcblx0XHRcdFx0Jy50eHQnLFxuXHRcdFx0XSxcblxuXHRcdFx0b25seUZpbGU6IHRydWUsXG5cdFx0fTtcblxuXHRcdGlmIChuYW1lLmluZGV4T2YoJyonKSAhPSAtMSlcblx0XHR7XG5cdFx0XHRsZXQgbHMgPSBzZWFyY2hHbG9iU3luYyhuYW1lLCBvcHRpb25zKTtcblxuXHRcdFx0aWYgKCFscyB8fCAhbHMubGVuZ3RoKVxuXHRcdFx0e1xuXHRcdFx0XHR0aHJvdyBFcnJvcihgQ2Fubm90IGZpbmQgZGljdCBnbG9iIGZpbGUgXCIke25hbWV9XCIuYCk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBscztcblx0XHR9XG5cblx0XHRsZXQgZmlsZW5hbWUgPSBzZWFyY2hGaXJzdFN5bmMobmFtZSwgb3B0aW9ucyk7XG5cblx0XHRpZiAoIWZpbGVuYW1lKVxuXHRcdHtcblx0XHRcdC8vY29uc29sZS5sb2cobmFtZSwgcGF0aFBsdXMsIGV4dFBsdXMpO1xuXG5cdFx0XHR0aHJvdyBFcnJvcihgQ2Fubm90IGZpbmQgZGljdCBmaWxlIFwiJHtuYW1lfVwiLmApO1xuXHRcdH1cblxuXHRcdHJldHVybiBmaWxlbmFtZTtcblx0fVxuXG5cdC8qKlxuXHQgKiDovb3lhaXlrZflhbjmlofku7Zcblx0ICpcblx0ICogQHBhcmFtIHtTdHJpbmd9IG5hbWUg5a2X5YW45paH5Lu25ZCNXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlIOexu+Wei1xuXHQgKiBAcGFyYW0ge0Jvb2xlYW59IGNvbnZlcnRfdG9fbG93ZXIg5piv5ZCm5YWo6YOo6L2s5o2i5Li65bCP5YaZXG5cdCAqIEByZXR1cm4ge1NlZ21lbnR9XG5cdCAqL1xuXHRsb2FkRGljdChuYW1lOiBzdHJpbmcsIHR5cGU/OiBzdHJpbmcsIGNvbnZlcnRfdG9fbG93ZXI/OiBib29sZWFuLCBza2lwRXhpc3RzPzogYm9vbGVhbilcblx0e1xuXHRcdGxldCBmaWxlbmFtZSA9IHRoaXMuX3Jlc29sdmVEaWN0RmlsZW5hbWUobmFtZSk7XG5cblx0XHRpZiAoQXJyYXkuaXNBcnJheShmaWxlbmFtZSkpXG5cdFx0e1xuXHRcdFx0bGV0IHNlbGYgPSB0aGlzO1xuXG5cdFx0XHRmaWxlbmFtZS5mb3JFYWNoKHYgPT4gdGhpcy5sb2FkRGljdCh2LCB0eXBlLCBjb252ZXJ0X3RvX2xvd2VyLCBza2lwRXhpc3RzKSk7XG5cblx0XHRcdC8vY29uc29sZS5sb2coZmlsZW5hbWUpO1xuXG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9XG5cblx0XHRpZiAoIXR5cGUpIHR5cGUgPSAnVEFCTEUnOyAgICAgLy8g6buY6K6k5Li6VEFCTEVcblxuXHRcdGNvbnN0IGRiID0gdGhpcy5nZXREaWN0RGF0YWJhc2UodHlwZSwgdHJ1ZSk7XG5cblx0XHRjb25zdCBUQUJMRSA9IHRoaXMuRElDVFt0eXBlXSA9IGRiLlRBQkxFO1xuXHRcdGNvbnN0IFRBQkxFMiA9IHRoaXMuRElDVFt0eXBlICsgJzInXSA9IGRiLlRBQkxFMjtcblxuXHRcdC8qXG5cdFx0Ly8g5Yid5aeL5YyW6K+N5YW4XG5cdFx0aWYgKCF0aGlzLkRJQ1RbdHlwZV0pIHRoaXMuRElDVFt0eXBlXSA9IHt9O1xuXHRcdGlmICghdGhpcy5ESUNUW3R5cGUgKyAnMiddKSB0aGlzLkRJQ1RbdHlwZSArICcyJ10gPSB7fTtcblx0XHRsZXQgVEFCTEUgPSB0aGlzLkRJQ1RbdHlwZV07ICAgICAgICAvLyDor43lhbjooaggICfor40nID0+IHvlsZ7mgKd9XG5cdFx0bGV0IFRBQkxFMiA9IHRoaXMuRElDVFt0eXBlICsgJzInXTsgLy8g6K+N5YW46KGoICAn6ZW/5bqmJyA9PiAn6K+NJyA9PiDlsZ7mgKdcblx0XHQqL1xuXHRcdC8vIOWvvOWFpeaVsOaNrlxuXHRcdGNvbnN0IFBPU1RBRyA9IHRoaXMuUE9TVEFHO1xuXG5cdFx0bGV0IGRhdGEgPSBMb2FkZXIuU2VnbWVudERpY3RMb2FkZXIubG9hZFN5bmMoZmlsZW5hbWUpO1xuXG5cdFx0ZGF0YS5mb3JFYWNoKGZ1bmN0aW9uIChkYXRhKVxuXHRcdHtcblx0XHRcdGlmIChjb252ZXJ0X3RvX2xvd2VyKVxuXHRcdFx0e1xuXHRcdFx0XHRkYXRhWzBdID0gZGF0YVswXS50b0xvd2VyQ2FzZSgpO1xuXHRcdFx0fVxuXG5cdFx0XHRkYi5hZGQoZGF0YSwgc2tpcEV4aXN0cyk7XG5cblx0XHRcdC8qXG5cdFx0XHRsZXQgW3csIHAsIGZdID0gZGF0YTtcblxuXHRcdFx0aWYgKHcubGVuZ3RoID09IDApXG5cdFx0XHR7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcigpXG5cdFx0XHR9XG5cblx0XHRcdFRBQkxFW3ddID0geyBwLCBmLCB9O1xuXHRcdFx0aWYgKCFUQUJMRTJbdy5sZW5ndGhdKSBUQUJMRTJbdy5sZW5ndGhdID0ge307XG5cdFx0XHRUQUJMRTJbdy5sZW5ndGhdW3ddID0gVEFCTEVbd107XG5cdFx0XHQqL1xuXHRcdH0pO1xuXG5cdFx0ZGF0YSA9IHVuZGVmaW5lZDtcblxuXHRcdHRoaXMuaW5pdGVkID0gdHJ1ZTtcblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIOWPluivjeWFuOihqFxuXHQgKlxuXHQgKiBAcGFyYW0ge1N0cmluZ30gdHlwZSDnsbvlnotcblx0ICogQHJldHVybiB7b2JqZWN0fVxuXHQgKi9cblx0Z2V0RGljdCh0eXBlOiBFbnVtRGljdERhdGFiYXNlLlNUT1BXT1JEKTogSURJQ1RfU1RPUFdPUkRcblx0Z2V0RGljdCh0eXBlOiBFbnVtRGljdERhdGFiYXNlLlNZTk9OWU0pOiBJRElDVF9TWU5PTllNXG5cdGdldERpY3QodHlwZTogRW51bURpY3REYXRhYmFzZS5UQUJMRSk6IElESUNUPElXb3JkPlxuXHRnZXREaWN0KHR5cGU6IEVudW1EaWN0RGF0YWJhc2UuQkxBQ0tMSVNUKTogSURJQ1RfQkxBQ0tMSVNUXG5cdGdldERpY3QodHlwZTogRW51bURpY3REYXRhYmFzZS5CTEFDS0xJU1RfRk9SX09QVElNSVpFUik6IElESUNUX0JMQUNLTElTVFxuXHRnZXREaWN0KHR5cGU6ICdUQUJMRTInKTogSURJQ1QyPElXb3JkPlxuXHRnZXREaWN0KHR5cGU6IEVudW1EaWN0RGF0YWJhc2UpOiBJRElDVFxuXHRnZXREaWN0KHR5cGUpOiBJRElDVFxuXHRnZXREaWN0KHR5cGUpXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5ESUNUW3R5cGVdO1xuXHR9XG5cblx0LyoqXG5cdCAqIOi9veWFpeWQjOS5ieivjeivjeWFuFxuXHQgKlxuXHQgKiBAcGFyYW0ge1N0cmluZ30gbmFtZSDlrZflhbjmlofku7blkI1cblx0ICovXG5cdGxvYWRTeW5vbnltRGljdChuYW1lOiBzdHJpbmcsIHNraXBFeGlzdHM/OiBib29sZWFuKVxuXHR7XG5cdFx0bGV0IGZpbGVuYW1lID0gdGhpcy5fcmVzb2x2ZURpY3RGaWxlbmFtZShuYW1lLCBbXG5cdFx0XHRwYXRoLnJlc29sdmUoU2VnbWVudERpY3QuRElDVF9ST09ULCAnc3lub255bScpLFxuXHRcdF0pO1xuXG5cdFx0aWYgKEFycmF5LmlzQXJyYXkoZmlsZW5hbWUpKVxuXHRcdHtcblx0XHRcdGxldCBzZWxmID0gdGhpcztcblxuXHRcdFx0ZmlsZW5hbWUuZm9yRWFjaCh2ID0+IHRoaXMubG9hZFN5bm9ueW1EaWN0KHYsIHNraXBFeGlzdHMpKTtcblxuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fVxuXG5cdFx0bGV0IHR5cGUgPSAnU1lOT05ZTSc7XG5cblx0XHRjb25zdCBkYiA9IHRoaXMuZ2V0RGljdERhdGFiYXNlKHR5cGUsIHRydWUpO1xuXG5cdFx0Y29uc3QgVEFCTEUgPSB0aGlzLkRJQ1RbdHlwZV0gPSBkYi5UQUJMRTtcblxuXHRcdC8qXG5cdFx0Ly8g5Yid5aeL5YyW6K+N5YW4XG5cdFx0aWYgKCF0aGlzLkRJQ1RbdHlwZV0pIHRoaXMuRElDVFt0eXBlXSA9IHt9O1xuXHRcdC8vIOivjeWFuOihqCAgJ+WQjOS5ieivjScgPT4gJ+agh+WHhuivjSdcblx0XHRsZXQgVEFCTEUgPSB0aGlzLkRJQ1RbdHlwZV0gYXMgSURJQ1RfU1lOT05ZTTtcblx0XHQvLyDlr7zlhaXmlbDmja5cblx0XHQqL1xuXG5cdFx0bGV0IGRhdGEgPSBMb2FkZXIuU2VnbWVudFN5bm9ueW1Mb2FkZXIubG9hZFN5bmMoZmlsZW5hbWUpO1xuXG5cdFx0ZGF0YS5mb3JFYWNoKGZ1bmN0aW9uIChibG9ja3M6IHN0cmluZ1tdKVxuXHRcdHtcblx0XHRcdGRiLmFkZChibG9ja3MsIHNraXBFeGlzdHMpO1xuXG5cdFx0XHQvKlxuXHRcdFx0bGV0IFtuMSwgbjJdID0gYmxvY2tzO1xuXG5cdFx0XHRUQUJMRVtuMV0gPSBuMjtcblx0XHRcdGlmIChUQUJMRVtuMl0gPT09IG4xKVxuXHRcdFx0e1xuXHRcdFx0XHRkZWxldGUgVEFCTEVbbjJdO1xuXHRcdFx0fVxuXHRcdFx0Ki9cblx0XHR9KTtcblxuXHRcdC8vY29uc29sZS5sb2coVEFCTEUpO1xuXG5cdFx0ZGF0YSA9IHVuZGVmaW5lZDtcblxuXHRcdHRoaXMuaW5pdGVkID0gdHJ1ZTtcblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0cHJvdGVjdGVkIF9sb2FkQmxhY2tsaXN0RGljdChuYW1lOiBzdHJpbmcsIHR5cGU6IEVudW1EaWN0RGF0YWJhc2UpXG5cdHtcblx0XHRsZXQgZmlsZW5hbWUgPSB0aGlzLl9yZXNvbHZlRGljdEZpbGVuYW1lKG5hbWUsIFtcblx0XHRcdHBhdGgucmVzb2x2ZShTZWdtZW50RGljdC5ESUNUX1JPT1QsICdibGFja2xpc3QnKSxcblx0XHRdKTtcblxuXHRcdGlmIChBcnJheS5pc0FycmF5KGZpbGVuYW1lKSlcblx0XHR7XG5cdFx0XHRsZXQgc2VsZiA9IHRoaXM7XG5cblx0XHRcdGZpbGVuYW1lLmZvckVhY2godiA9PiB0aGlzLl9sb2FkQmxhY2tsaXN0RGljdCh2LCB0eXBlKSk7XG5cblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH1cblxuXHRcdGNvbnN0IGRiID0gdGhpcy5nZXREaWN0RGF0YWJhc2UodHlwZSwgdHJ1ZSk7XG5cblx0XHRjb25zdCBUQUJMRSA9IHRoaXMuRElDVFt0eXBlXSA9IGRiLlRBQkxFO1xuXG5cdFx0bGV0IGRhdGEgPSBMb2FkZXIuU2VnbWVudERpY3Rcblx0XHRcdC5yZXF1aXJlTG9hZGVyTW9kdWxlKCdsaW5lJylcblx0XHRcdC5sb2FkU3luYyhmaWxlbmFtZSwge1xuXHRcdFx0XHRmaWx0ZXIobGluZTogc3RyaW5nKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cmV0dXJuIGxpbmUudHJpbSgpO1xuXHRcdFx0XHR9LFxuXHRcdFx0fSlcblx0XHQ7XG5cblx0XHRkYXRhLmZvckVhY2godiA9PiBkYi5hZGQodikpO1xuXG5cdFx0ZGF0YSA9IHVuZGVmaW5lZDtcblxuXHRcdHRoaXMuaW5pdGVkID0gdHJ1ZTtcblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0bG9hZEJsYWNrbGlzdERpY3QobmFtZTogc3RyaW5nKVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX2xvYWRCbGFja2xpc3REaWN0KG5hbWUsIEVudW1EaWN0RGF0YWJhc2UuQkxBQ0tMSVNUKVxuXHR9XG5cblx0bG9hZEJsYWNrbGlzdE9wdGltaXplckRpY3QobmFtZTogc3RyaW5nKVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX2xvYWRCbGFja2xpc3REaWN0KG5hbWUsIEVudW1EaWN0RGF0YWJhc2UuQkxBQ0tMSVNUX0ZPUl9PUFRJTUlaRVIpXG5cdH1cblxuXHQvKipcblx0ICog6L295YWl5YGc5q2i56ym6K+N5YW4XG5cdCAqXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIOWtl+WFuOaWh+S7tuWQjVxuXHQgKi9cblx0bG9hZFN0b3B3b3JkRGljdChuYW1lOiBzdHJpbmcpXG5cdHtcblx0XHRsZXQgZmlsZW5hbWUgPSB0aGlzLl9yZXNvbHZlRGljdEZpbGVuYW1lKG5hbWUsIFtcblx0XHRcdHBhdGgucmVzb2x2ZShTZWdtZW50RGljdC5ESUNUX1JPT1QsICdzdG9wd29yZCcpLFxuXHRcdF0pO1xuXG5cdFx0aWYgKEFycmF5LmlzQXJyYXkoZmlsZW5hbWUpKVxuXHRcdHtcblx0XHRcdGxldCBzZWxmID0gdGhpcztcblxuXHRcdFx0ZmlsZW5hbWUuZm9yRWFjaCh2ID0+IHRoaXMubG9hZFN0b3B3b3JkRGljdCh2KSk7XG5cblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH1cblxuXHRcdGNvbnN0IHR5cGUgPSBFbnVtRGljdERhdGFiYXNlLlNUT1BXT1JEO1xuXG5cdFx0Y29uc3QgZGIgPSB0aGlzLmdldERpY3REYXRhYmFzZSh0eXBlLCB0cnVlKTtcblxuXHRcdGNvbnN0IFRBQkxFID0gdGhpcy5ESUNUW3R5cGVdID0gZGIuVEFCTEU7XG5cblx0XHRsZXQgZGF0YSA9IExvYWRlci5TZWdtZW50RGljdFxuXHRcdFx0LnJlcXVpcmVMb2FkZXJNb2R1bGUoJ2xpbmUnKVxuXHRcdFx0LmxvYWRTeW5jKGZpbGVuYW1lLCB7XG5cdFx0XHRcdGZpbHRlcihsaW5lOiBzdHJpbmcpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXR1cm4gbGluZS50cmltKCk7XG5cdFx0XHRcdH0sXG5cdFx0XHR9KVxuXHRcdDtcblxuXHRcdGRhdGEuZm9yRWFjaCh2ID0+IGRiLmFkZCh2KSk7XG5cblx0XHRkYXRhID0gdW5kZWZpbmVkO1xuXG5cdFx0dGhpcy5pbml0ZWQgPSB0cnVlO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICog5L2/55So6buY6K6k55qE6K+G5Yir5qih5Z2X5ZKM5a2X5YW45paH5Lu2XG5cdCAqIOWcqOS9v+eUqOmgkOioreWAvOeahOaDheazgeS4i++8jOS4jemcgOimgeS4u+WLleWRvOWPq+atpOWHveaVuFxuXHQgKlxuXHQgKiBAcmV0dXJuIHtTZWdtZW50fVxuXHQgKi9cblx0dXNlRGVmYXVsdCguLi5hcmd2KVxuXHR7XG5cdFx0dXNlRGVmYXVsdCh0aGlzLCAuLi5hcmd2KTtcblxuXHRcdHRoaXMuaW5pdGVkID0gdHJ1ZTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdFx0Lypcblx0XHR0aGlzXG5cdFx0XHQvLyDor4bliKvmqKHlnZdcblx0XHRcdC8vIOW8uuWItuWIhuWJsuexu+WNleivjeivhuWIq1xuXHRcdFx0LnVzZSgnVVJMVG9rZW5pemVyJykgICAgICAgICAgICAvLyBVUkzor4bliKtcblx0XHRcdC51c2UoJ1dpbGRjYXJkVG9rZW5pemVyJykgICAgICAgLy8g6YCa6YWN56ym77yM5b+F6aG75Zyo5qCH54K556ym5Y+36K+G5Yir5LmL5YmNXG5cdFx0XHQudXNlKCdQdW5jdHVhdGlvblRva2VuaXplcicpICAgIC8vIOagh+eCueespuWPt+ivhuWIq1xuXHRcdFx0LnVzZSgnRm9yZWlnblRva2VuaXplcicpICAgICAgICAvLyDlpJbmloflrZfnrKbjgIHmlbDlrZfor4bliKvvvIzlv4XpobvlnKjmoIfngrnnrKblj7for4bliKvkuYvlkI5cblx0XHRcdC8vIOS4reaWh+WNleivjeivhuWIq1xuXHRcdFx0LnVzZSgnRGljdFRva2VuaXplcicpICAgICAgICAgICAvLyDor43lhbjor4bliKtcblx0XHRcdC51c2UoJ0Noc05hbWVUb2tlbml6ZXInKSAgICAgICAgLy8g5Lq65ZCN6K+G5Yir77yM5bu66K6u5Zyo6K+N5YW46K+G5Yir5LmL5ZCOXG5cblx0XHRcdC8vIOS8mOWMluaooeWdl1xuXHRcdFx0LnVzZSgnRW1haWxPcHRpbWl6ZXInKSAgICAgICAgICAvLyDpgq7nrrHlnLDlnYDor4bliKtcblx0XHRcdC51c2UoJ0Noc05hbWVPcHRpbWl6ZXInKSAgICAgICAgLy8g5Lq65ZCN6K+G5Yir5LyY5YyWXG5cdFx0XHQudXNlKCdEaWN0T3B0aW1pemVyJykgICAgICAgICAgIC8vIOivjeWFuOivhuWIq+S8mOWMllxuXHRcdFx0LnVzZSgnRGF0ZXRpbWVPcHRpbWl6ZXInKSAgICAgICAvLyDml6XmnJ/ml7bpl7Tor4bliKvkvJjljJZcblxuXHRcdFx0Ly8g5a2X5YW45paH5Lu2XG5cdFx0XHQvLy5sb2FkRGljdCgnamllYmEnKSA8PT09IGJhZCBmaWxlXG5cblx0XHRcdC5sb2FkRGljdCgnZGljdDQnKVxuXG5cdFx0XHQubG9hZERpY3QoJ2NoYXInKVxuXG5cdFx0XHQubG9hZERpY3QoJ3BocmFzZXMnKVxuXHRcdFx0LmxvYWREaWN0KCdwaHJhc2VzMicpXG5cblx0XHRcdC5sb2FkRGljdCgnZGljdCcpICAgICAgICAgICAvLyDnm5jlj6Tor43lhbhcblx0XHRcdC5sb2FkRGljdCgnZGljdDInKSAgICAgICAgICAvLyDmianlsZXor43lhbjvvIjnlKjkuo7osIPmlbTljp/nm5jlj6Tor43lhbjvvIlcblx0XHRcdC5sb2FkRGljdCgnZGljdDMnKSAgICAgICAgICAvLyDmianlsZXor43lhbjvvIjnlKjkuo7osIPmlbTljp/nm5jlj6Tor43lhbjvvIlcblx0XHRcdC5sb2FkRGljdCgnbmFtZXMnKSAgICAgICAgICAvLyDluLjop4HlkI3or43jgIHkurrlkI1cblx0XHRcdC5sb2FkRGljdCgnd2lsZGNhcmQnLCAnV0lMRENBUkQnLCB0cnVlKSAgIC8vIOmAmumFjeesplxuXHRcdFx0LmxvYWRTeW5vbnltRGljdCgnc3lub255bScpICAgLy8g5ZCM5LmJ6K+NXG5cdFx0XHQubG9hZFN0b3B3b3JkRGljdCgnc3RvcHdvcmQnKSAvLyDlgZzmraLnrKZcblxuXHRcdFx0LmxvYWREaWN0KCdsYXp5L2JhZHdvcmQnKVxuXHRcdFx0LmxvYWREaWN0KCdsYXp5L2RpY3Rfc3lub255bScpXG5cblx0XHRcdC5sb2FkRGljdCgnbmFtZXMvZW4nKVxuXHRcdFx0LmxvYWREaWN0KCduYW1lcy9qcCcpXG5cdFx0XHQubG9hZERpY3QoJ2xhenkvaW5kZXgnKVxuXG5cdFx0O1xuXG5cdFx0dGhpcy5pbml0ZWQgPSB0cnVlO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdFx0Ki9cblx0fVxuXG5cdC8qKlxuXHQgKiDmraTlh73mlbjlj6rpnIDln7fooYzkuIDmrKHvvIzkuKbkuJTkuIDoiKzni4Dms4HkuIvkuI3pnIDopoHmiYvli5Xlkbzlj6tcblx0ICovXG5cdGF1dG9Jbml0KG9wdGlvbnM/OiB7XG5cdFx0YWxsX21vZD86IGJvb2xlYW4sXG5cdH0pXG5cdHtcblx0XHRpZiAoIXRoaXMuaW5pdGVkKVxuXHRcdHtcblx0XHRcdHRoaXMuaW5pdGVkID0gdHJ1ZTtcblxuXHRcdFx0aWYgKCF0aGlzLm1vZHVsZXMudG9rZW5pemVyLmxlbmd0aClcblx0XHRcdHtcblx0XHRcdFx0dGhpcy51c2VEZWZhdWx0KG9wdGlvbnMpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0Z2V0T3B0aW9uc0RvU2VnbWVudDxUIGV4dGVuZHMgSU9wdGlvbnNEb1NlZ21lbnQ+KG9wdGlvbnM/OiBUKTogVFxuXHR7XG5cdFx0cmV0dXJuIE9iamVjdC5hc3NpZ24oe30sXG5cdFx0XHRTZWdtZW50LmRlZmF1bHRPcHRpb25zRG9TZWdtZW50LFxuXHRcdFx0dGhpcy5vcHRpb25zLm9wdGlvbnNEb1NlZ21lbnQsXG5cdFx0XHRvcHRpb25zLFxuXHRcdCk7XG5cdH1cblxuXHRwcm90ZWN0ZWQgX2dldF90ZXh0KHRleHQ6IHN0cmluZyB8IEJ1ZmZlcik6IHN0cmluZ1xuXHR7XG5cdFx0dHJ5XG5cdFx0e1xuXHRcdFx0aWYgKEJ1ZmZlci5pc0J1ZmZlcih0ZXh0KSlcblx0XHRcdHtcblx0XHRcdFx0dGV4dCA9IHRleHQudG9TdHJpbmcoKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0Y2F0Y2ggKGUpXG5cdFx0e31cblx0XHRmaW5hbGx5XG5cdFx0e1xuXHRcdFx0aWYgKHR5cGVvZiB0ZXh0ICE9ICdzdHJpbmcnKVxuXHRcdFx0e1xuXHRcdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKGB0ZXh0IG11c3QgaXMgc3RyaW5nIG9yIEJ1ZmZlcmApXG5cdFx0XHR9XG5cblx0XHRcdHRleHQgPSBjcmxmKHRleHQpO1xuXHRcdH1cblxuXHRcdHJldHVybiB0ZXh0O1xuXHR9XG5cblx0YWRkQmxhY2tsaXN0KHdvcmQ6IHN0cmluZywgcmVtb3ZlPzogYm9vbGVhbilcblx0e1xuXHRcdGxldCBtZSA9IHRoaXM7XG5cblx0XHR0aGlzLmF1dG9Jbml0KHRoaXMub3B0aW9ucyk7XG5cblx0XHRjb25zdCBCTEFDS0xJU1QgPSBtZS5nZXREaWN0RGF0YWJhc2UoRW51bURpY3REYXRhYmFzZS5CTEFDS0xJU1QpO1xuXHRcdGNvbnN0IFRBQkxFID0gbWUuZ2V0RGljdERhdGFiYXNlKEVudW1EaWN0RGF0YWJhc2UuVEFCTEUpO1xuXG5cdFx0bGV0IGJvb2wgPSAhcmVtb3ZlO1xuXG5cdFx0aWYgKGJvb2wpXG5cdFx0e1xuXHRcdFx0QkxBQ0tMSVNULmFkZCh3b3JkKTtcblx0XHRcdFRBQkxFLnJlbW92ZSh3b3JkKTtcblx0XHR9XG5cdFx0ZWxzZVxuXHRcdHtcblx0XHRcdEJMQUNLTElTVC5yZW1vdmUod29yZClcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpc1xuXHR9XG5cblx0LyoqXG5cdCAqIHJlbW92ZSBrZXkgaW4gVEFCTEUgYnkgQkxBQ0tMSVNUXG5cdCAqL1xuXHRkb0JsYWNrbGlzdCgpXG5cdHtcblx0XHRsZXQgbWUgPSB0aGlzO1xuXG5cdFx0dGhpcy5hdXRvSW5pdCh0aGlzLm9wdGlvbnMpO1xuXG5cdFx0Y29uc3QgQkxBQ0tMSVNUID0gbWUuZ2V0RGljdChFbnVtRGljdERhdGFiYXNlLkJMQUNLTElTVCk7XG5cdFx0Y29uc3QgVEFCTEUgPSBtZS5nZXREaWN0RGF0YWJhc2UoRW51bURpY3REYXRhYmFzZS5UQUJMRSk7XG5cblx0XHRPYmplY3QuZW50cmllcyhCTEFDS0xJU1QpXG5cdFx0XHQuZm9yRWFjaChmdW5jdGlvbiAoW2tleSwgYm9vbF0pXG5cdFx0XHR7XG5cdFx0XHRcdGJvb2wgJiYgVEFCTEUucmVtb3ZlKGtleSlcblx0XHRcdH0pXG5cdFx0O1xuXG5cdFx0cmV0dXJuIHRoaXNcblx0fVxuXG5cdC8qKlxuXHQgKiDlvIDlp4vliIbor41cblx0ICpcblx0ICogQHBhcmFtIHtTdHJpbmd9IHRleHQg5paH5pysXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIOmAiemhuVxuXHQgKiAgIC0ge0Jvb2xlYW59IHNpbXBsZSDmmK/lkKbku4Xov5Tlm57ljZXor43lhoXlrrlcblx0ICogICAtIHtCb29sZWFufSBzdHJpcFB1bmN0dWF0aW9uIOWOu+mZpOagh+eCueespuWPt1xuXHQgKiAgIC0ge0Jvb2xlYW59IGNvbnZlcnRTeW5vbnltIOi9rOaNouWQjOS5ieivjVxuXHQgKiAgIC0ge0Jvb2xlYW59IHN0cmlwU3RvcHdvcmQg5Y676Zmk5YGc5q2i56ymXG5cdCAqIEByZXR1cm4ge0FycmF5fVxuXHQgKi9cblx0ZG9TZWdtZW50KHRleHQ6IHN0cmluZyB8IEJ1ZmZlciwgb3B0aW9uczogSU9wdGlvbnNEb1NlZ21lbnQgJiB7XG5cdFx0c2ltcGxlOiB0cnVlLFxuXHR9KTogc3RyaW5nW11cblx0ZG9TZWdtZW50KHRleHQ6IHN0cmluZyB8IEJ1ZmZlciwgb3B0aW9ucz86IElPcHRpb25zRG9TZWdtZW50KTogSVdvcmRbXVxuXHRkb1NlZ21lbnQodGV4dCwgb3B0aW9uczogSU9wdGlvbnNEb1NlZ21lbnQgPSB7fSlcblx0e1xuXHRcdGxldCBtZSA9IHRoaXM7XG5cblx0XHRvcHRpb25zID0gdGhpcy5nZXRPcHRpb25zRG9TZWdtZW50KG9wdGlvbnMpO1xuXG5cdFx0Ly9jb25zb2xlLmRpcihvcHRpb25zKTtcblxuXHRcdHRoaXMuYXV0b0luaXQodGhpcy5vcHRpb25zKTtcblxuXHRcdGxldCB0ZXh0X2xpc3QgPSB0aGlzLl9nZXRfdGV4dCh0ZXh0KVxuXHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0LnNwbGl0KHRoaXMuU1BMSVQpXG5cdFx0O1xuXHRcdHRleHQgPSB1bmRlZmluZWQ7XG5cblx0XHQvLyDlsIbmlofmnKzmjInnhafmjaLooYznrKbliIblibLmiJDlpJrmrrXvvIzlubbpgJDkuIDliIbor41cblx0XHRsZXQgcmV0ID0gdGV4dF9saXN0LnJlZHVjZShmdW5jdGlvbiAocmV0LCBzZWN0aW9uKVxuXHRcdHtcblx0XHRcdC8vY29uc29sZS5kaXIoc2VjdGlvbik7XG5cblx0XHRcdGlmIChtZS5TUExJVF9GSUxURVIudGVzdChzZWN0aW9uKSlcblx0XHRcdHtcblx0XHRcdFx0cmV0ID0gcmV0LmNvbmNhdCh7IHc6IHNlY3Rpb24gfSk7XG5cblx0XHRcdFx0c2VjdGlvbiA9IFtdO1xuXHRcdFx0fVxuXG5cdFx0XHQvL3NlY3Rpb24gPSBzZWN0aW9uLnRyaW0oKTtcblx0XHRcdGlmIChzZWN0aW9uLmxlbmd0aCA+IDApXG5cdFx0XHR7XG5cdFx0XHRcdC8vIOWIhuivjVxuXHRcdFx0XHRsZXQgc3JldCA9IG1lLnRva2VuaXplci5zcGxpdChzZWN0aW9uLCBtZS5tb2R1bGVzLnRva2VuaXplcik7XG5cblx0XHRcdFx0Ly8g5LyY5YyWXG5cdFx0XHRcdHNyZXQgPSBtZS5vcHRpbWl6ZXIuZG9PcHRpbWl6ZShzcmV0LCBtZS5tb2R1bGVzLm9wdGltaXplcik7XG5cblx0XHRcdFx0Ly8g6L+e5o6l5YiG6K+N57uT5p6cXG5cdFx0XHRcdGlmIChzcmV0Lmxlbmd0aCA+IDApXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXQgPSByZXQuY29uY2F0KHNyZXQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiByZXQ7XG5cdFx0fSwgW10pO1xuXG5cdFx0Ly8g5Y676Zmk5qCH54K556ym5Y+3XG5cdFx0aWYgKG9wdGlvbnMuc3RyaXBQdW5jdHVhdGlvbilcblx0XHR7XG5cdFx0XHRyZXQgPSByZXQuZmlsdGVyKGZ1bmN0aW9uIChpdGVtKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gaXRlbS5wICE9PSBQT1NUQUcuRF9XO1xuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0aWYgKG9wdGlvbnMuY29udmVydFN5bm9ueW0pXG5cdFx0e1xuXHRcdFx0cmV0ID0gdGhpcy5jb252ZXJ0U3lub255bShyZXQpO1xuXHRcdH1cblxuXHRcdC8qXG5cdFx0Ly8g6L2s5o2i5ZCM5LmJ6K+NXG5cdFx0ZnVuY3Rpb24gY29udmVydFN5bm9ueW0obGlzdClcblx0XHR7XG5cdFx0XHRsZXQgY291bnQgPSAwO1xuXHRcdFx0bGV0IFRBQkxFID0gbWUuZ2V0RGljdCgnU1lOT05ZTScpO1xuXHRcdFx0bGlzdCA9IGxpc3QubWFwKGZ1bmN0aW9uIChpdGVtKVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAoaXRlbS53IGluIFRBQkxFKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Y291bnQrKztcblx0XHRcdFx0XHQvL3JldHVybiB7IHc6IFRBQkxFW2l0ZW0ud10sIHA6IGl0ZW0ucCB9O1xuXG5cdFx0XHRcdFx0aXRlbS5vdyA9IGl0ZW0udztcblx0XHRcdFx0XHRpdGVtLncgPSBUQUJMRVtpdGVtLnddO1xuXG5cdFx0XHRcdFx0cmV0dXJuIGl0ZW07XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cmV0dXJuIGl0ZW07XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdFx0cmV0dXJuIHsgY291bnQ6IGNvdW50LCBsaXN0OiBsaXN0IH07XG5cdFx0fVxuXG5cdFx0aWYgKG9wdGlvbnMuY29udmVydFN5bm9ueW0pXG5cdFx0e1xuXHRcdFx0bGV0IHJlc3VsdDtcblx0XHRcdGRvXG5cdFx0XHR7XG5cdFx0XHRcdHJlc3VsdCA9IGNvbnZlcnRTeW5vbnltKHJldCk7XG5cdFx0XHRcdHJldCA9IHJlc3VsdC5saXN0O1xuXHRcdFx0fVxuXHRcdFx0d2hpbGUgKHJlc3VsdC5jb3VudCA+IDApO1xuXHRcdH1cblx0XHQqL1xuXG5cdFx0Ly8g5Y676Zmk5YGc5q2i56ymXG5cdFx0aWYgKG9wdGlvbnMuc3RyaXBTdG9wd29yZClcblx0XHR7XG5cdFx0XHRsZXQgU1RPUFdPUkQgPSBtZS5nZXREaWN0KCdTVE9QV09SRCcpO1xuXHRcdFx0cmV0ID0gcmV0LmZpbHRlcihmdW5jdGlvbiAoaXRlbSlcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuICEoaXRlbS53IGluIFNUT1BXT1JEKTtcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdGlmIChvcHRpb25zLnN0cmlwU3BhY2UpXG5cdFx0e1xuXHRcdFx0cmV0ID0gcmV0LmZpbHRlcihmdW5jdGlvbiAoaXRlbSlcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuICEvXlxccyskL2cudGVzdChpdGVtLncpO1xuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0Ly8g5LuF6L+U5Zue5Y2V6K+N5YaF5a65XG5cdFx0aWYgKG9wdGlvbnMuc2ltcGxlKVxuXHRcdHtcblx0XHRcdHJldCA9IHJldC5tYXAoZnVuY3Rpb24gKGl0ZW0pXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiBpdGVtLnc7XG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gcmV0O1xuXHR9XG5cblx0LyoqXG5cdCAqIOi9rOaNouWQjOS5ieivjVxuXHQgKi9cblx0Y29udmVydFN5bm9ueW0ocmV0OiBJV29yZERlYnVnW10sIHNob3djb3VudDogdHJ1ZSk6IHsgY291bnQ6IG51bWJlciwgbGlzdDogSVdvcmREZWJ1Z1tdIH1cblx0Y29udmVydFN5bm9ueW0ocmV0OiBJV29yZERlYnVnW10sIHNob3djb3VudD86IGJvb2xlYW4pOiBJV29yZERlYnVnW11cblx0Y29udmVydFN5bm9ueW0ocmV0OiBJV29yZERlYnVnW10sIHNob3djb3VudD86IGJvb2xlYW4pXG5cdHtcblx0XHRjb25zdCBtZSA9IHRoaXM7XG5cdFx0bGV0IFRBQkxFID0gbWUuZ2V0RGljdCgnU1lOT05ZTScpO1xuXHRcdGxldCBUQUJMRURJQ1QgPSBtZS5nZXREaWN0KCdUQUJMRScpO1xuXG5cdFx0bGV0IHRvdGFsX2NvdW50ID0gMDtcblxuXHRcdC8vY29uc3QgUkFXID0gU3ltYm9sLmZvcignUkFXJyk7XG5cblx0XHQvLyDovazmjaLlkIzkuYnor41cblx0XHRmdW5jdGlvbiBfY29udmVydFN5bm9ueW0obGlzdDogSVdvcmREZWJ1Z1tdKVxuXHRcdHtcblx0XHRcdGxldCBjb3VudCA9IDA7XG5cdFx0XHRsaXN0ID0gbGlzdC5yZWR1Y2UoZnVuY3Rpb24gKGEsIGl0ZW06IElXb3JkRGVidWcpXG5cdFx0XHR7XG5cdFx0XHRcdGxldCBib29sOiBib29sZWFuO1xuXHRcdFx0XHRsZXQgdyA9IGl0ZW0udztcblx0XHRcdFx0bGV0IG53OiBzdHJpbmc7XG5cblx0XHRcdFx0bGV0IGRlYnVnID0gZGVidWdUb2tlbihpdGVtKTtcblxuXHRcdFx0XHRpZiAodyBpbiBUQUJMRSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGJvb2wgPSB0cnVlO1xuXHRcdFx0XHRcdG53ID0gVEFCTEVbd107XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSBpZiAoZGVidWcuYXV0b0NyZWF0ZSAmJiAhZGVidWcuY29udmVydFN5bm9ueW0gJiYgIWl0ZW0ub3cgJiYgaXRlbS5tICYmIGl0ZW0ubS5sZW5ndGgpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRudyA9IGl0ZW0ubS5yZWR1Y2UoZnVuY3Rpb24gKGE6IHN0cmluZ1tdLCBiKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGlmICh0eXBlb2YgYiA9PSAnc3RyaW5nJylcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0YS5wdXNoKGIpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0ZWxzZSBpZiAoYi53IGluIFRBQkxFKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRhLnB1c2goVEFCTEVbYi53XSk7XG5cdFx0XHRcdFx0XHRcdGJvb2wgPSB0cnVlO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRhLnB1c2goYi53KTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0cmV0dXJuIGE7XG5cdFx0XHRcdFx0fSwgW10pLmpvaW4oJycpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKGJvb2wpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRjb3VudCsrO1xuXHRcdFx0XHRcdHRvdGFsX2NvdW50Kys7XG5cdFx0XHRcdFx0Ly9yZXR1cm4geyB3OiBUQUJMRVtpdGVtLnddLCBwOiBpdGVtLnAgfTtcblxuXHRcdFx0XHRcdGxldCBwID0gaXRlbS5wO1xuXG5cdFx0XHRcdFx0aWYgKHcgaW4gVEFCTEVESUNUKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHAgPSBUQUJMRURJQ1Rbd10ucCB8fCBwO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmIChwICYgbWUuUE9TVEFHLkJBRClcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRwID0gcCBeIG1lLlBPU1RBRy5CQUQ7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0bGV0IGl0ZW1fbmV3ID0gZGVidWdUb2tlbih7XG5cdFx0XHRcdFx0XHQuLi5pdGVtLFxuXG5cdFx0XHRcdFx0XHR3OiBudyxcblx0XHRcdFx0XHRcdG93OiB3LFxuXHRcdFx0XHRcdFx0cCxcblx0XHRcdFx0XHRcdG9wOiBpdGVtLnAsXG5cblx0XHRcdFx0XHRcdC8vW1JBV106IGl0ZW0sXG5cblx0XHRcdFx0XHRcdC8vc291cmNlOiBpdGVtLFxuXHRcdFx0XHRcdH0sIHtcblx0XHRcdFx0XHRcdGNvbnZlcnRTeW5vbnltOiB0cnVlLFxuXHRcdFx0XHRcdFx0Ly9fc291cmNlOiBpdGVtLFxuXG5cdFx0XHRcdFx0XHQvKipcblx0XHRcdFx0XHRcdCAqIEpTT04uc3RyaW5naWZ5XG5cdFx0XHRcdFx0XHQgKiBhdm9pZCBUeXBlRXJyb3I6IENvbnZlcnRpbmcgY2lyY3VsYXIgc3RydWN0dXJlIHRvIEpTT05cblx0XHRcdFx0XHRcdCAqL1xuXHRcdFx0XHRcdFx0X3NvdXJjZTogZGVlcG1lcmdlKHt9LCBpdGVtKSBhcyBJV29yZERlYnVnLFxuXG5cdFx0XHRcdFx0fSwgdHJ1ZSk7XG5cblx0XHRcdFx0XHRhLnB1c2goaXRlbV9uZXcpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGEucHVzaChpdGVtKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiBhO1xuXHRcdFx0fSwgW10pO1xuXHRcdFx0cmV0dXJuIHsgY291bnQ6IGNvdW50LCBsaXN0OiBsaXN0IH07XG5cdFx0fVxuXG5cdFx0bGV0IHJlc3VsdDogeyBjb3VudDogbnVtYmVyLCBsaXN0OiBJV29yZERlYnVnW10gfTtcblx0XHRkb1xuXHRcdHtcblx0XHRcdHJlc3VsdCA9IF9jb252ZXJ0U3lub255bShyZXQpO1xuXHRcdFx0cmV0ID0gcmVzdWx0Lmxpc3Q7XG5cdFx0fVxuXHRcdHdoaWxlIChyZXN1bHQuY291bnQgPiAwKTtcblxuXHRcdGlmIChzaG93Y291bnQpXG5cdFx0e1xuXHRcdFx0cmV0dXJuIHsgY291bnQ6IHRvdGFsX2NvdW50LCBsaXN0OiByZXQgfTtcblx0XHR9XG5cblx0XHRyZXR1cm4gcmV0O1xuXHR9XG5cblx0LyoqXG5cdCAqIOWwhuWNleivjeaVsOe7hOi/nuaOpeaIkOWtl+espuS4slxuXHQgKlxuXHQgKiBAcGFyYW0ge0FycmF5fSB3b3JkcyDljZXor43mlbDnu4Rcblx0ICogQHJldHVybiB7U3RyaW5nfVxuXHQgKi9cblx0c3RyaW5naWZ5KHdvcmRzOiBBcnJheTxJV29yZCB8IHN0cmluZz4sIC4uLmFyZ3YpOiBzdHJpbmdcblx0e1xuXHRcdHJldHVybiBTZWdtZW50LnN0cmluZ2lmeSh3b3JkcywgLi4uYXJndik7XG5cdH1cblxuXHRzdGF0aWMgc3RyaW5naWZ5KHdvcmRzOiBBcnJheTxJV29yZCB8IHN0cmluZz4sIC4uLmFyZ3YpOiBzdHJpbmdcblx0e1xuXHRcdHJldHVybiB3b3Jkcy5tYXAoZnVuY3Rpb24gKGl0ZW0pXG5cdFx0e1xuXHRcdFx0aWYgKHR5cGVvZiBpdGVtID09PSAnc3RyaW5nJylcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIGl0ZW07XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmICgndycgaW4gaXRlbSlcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIGl0ZW0udztcblx0XHRcdH1cblx0XHRcdGVsc2Vcblx0XHRcdHtcblx0XHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcihgbm90IGEgdmFsaWQgc2VnbWVudCByZXN1bHQgbGlzdGApXG5cdFx0XHR9XG5cdFx0fSkuam9pbignJyk7XG5cdH1cblxuXHQvKipcblx0ICog5qC55o2u5p+Q5Liq5Y2V6K+N5oiW6K+N5oCn5p2l5YiG5Ymy5Y2V6K+N5pWw57uEXG5cdCAqXG5cdCAqIEBwYXJhbSB7QXJyYXl9IHdvcmRzIOWNleivjeaVsOe7hFxuXHQgKiBAcGFyYW0ge051bWJlcnxTdHJpbmd9IHMg55So5LqO5YiG5Ymy55qE5Y2V6K+N5oiW6K+N5oCnXG5cdCAqIEByZXR1cm4ge0FycmF5fVxuXHQgKi9cblx0c3BsaXQod29yZHM6IElXb3JkW10sIHM6IHN0cmluZyB8IG51bWJlcik6IElXb3JkW11cblx0e1xuXHRcdGxldCByZXQgPSBbXTtcblx0XHRsZXQgbGFzdGkgPSAwO1xuXHRcdGxldCBpID0gMDtcblx0XHRsZXQgZiA9IHR5cGVvZiBzID09PSAnc3RyaW5nJyA/ICd3JyA6ICdwJztcblxuXHRcdHdoaWxlIChpIDwgd29yZHMubGVuZ3RoKVxuXHRcdHtcblx0XHRcdGlmICh3b3Jkc1tpXVtmXSA9PSBzKVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAobGFzdGkgPCBpKSByZXQucHVzaCh3b3Jkcy5zbGljZShsYXN0aSwgaSkpO1xuXHRcdFx0XHRyZXQucHVzaCh3b3Jkcy5zbGljZShpLCBpICsgMSkpO1xuXHRcdFx0XHRpKys7XG5cdFx0XHRcdGxhc3RpID0gaTtcblx0XHRcdH1cblx0XHRcdGVsc2Vcblx0XHRcdHtcblx0XHRcdFx0aSsrO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAobGFzdGkgPCB3b3Jkcy5sZW5ndGggLSAxKVxuXHRcdHtcblx0XHRcdHJldC5wdXNoKHdvcmRzLnNsaWNlKGxhc3RpLCB3b3Jkcy5sZW5ndGgpKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gcmV0O1xuXHR9XG5cblx0LyoqXG5cdCAqIOWcqOWNleivjeaVsOe7hOS4reafpeaJvuafkOS4gOS4quWNleivjeaIluivjeaAp+aJgOWcqOeahOS9jee9rlxuXHQgKlxuXHQgKiBAcGFyYW0ge0FycmF5fSB3b3JkcyDljZXor43mlbDnu4Rcblx0ICogQHBhcmFtIHtOdW1iZXJ8U3RyaW5nfSBzIOimgeafpeaJvueahOWNleivjeaIluivjeaAp1xuXHQgKiBAcGFyYW0ge051bWJlcn0gY3VyIOW8gOWni+S9jee9rlxuXHQgKiBAcmV0dXJuIHtOdW1iZXJ9IOaJvuS4jeWIsO+8jOi/lOWbni0xXG5cdCAqL1xuXHRpbmRleE9mKHdvcmRzOiBJV29yZFtdLCBzOiBzdHJpbmcgfCBudW1iZXIsIGN1cj86IG51bWJlcilcblx0e1xuXHRcdGN1ciA9IGlzTmFOKGN1cikgPyAwIDogY3VyO1xuXHRcdGxldCBmID0gdHlwZW9mIHMgPT09ICdzdHJpbmcnID8gJ3cnIDogJ3AnO1xuXG5cdFx0d2hpbGUgKGN1ciA8IHdvcmRzLmxlbmd0aClcblx0XHR7XG5cdFx0XHRpZiAod29yZHNbY3VyXVtmXSA9PSBzKSByZXR1cm4gY3VyO1xuXHRcdFx0Y3VyKys7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIC0xO1xuXHR9XG59XG5cbmV4cG9ydCBuYW1lc3BhY2UgU2VnbWVudFxue1xuXG5cdGV4cG9ydCB0eXBlIElTUExJVCA9IFJlZ0V4cCB8IHN0cmluZyB8IHtcblx0XHRbU3ltYm9sLnNwbGl0XShpbnB1dDogc3RyaW5nLCBsaW1pdD86IG51bWJlcik6IHN0cmluZ1tdLFxuXHR9O1xuXG5cdGV4cG9ydCB0eXBlIElTUExJVF9GSUxURVIgPSBSZWdFeHAgfCB7XG5cdFx0dGVzdChpbnB1dDogc3RyaW5nKTogYm9vbGVhbixcblx0fTtcblxuXHRleHBvcnQgaW50ZXJmYWNlIElESUNUPFQgPSBhbnk+XG5cdHtcblx0XHRba2V5OiBzdHJpbmddOiBULFxuXHR9XG5cblx0ZXhwb3J0IGludGVyZmFjZSBJRElDVDI8VCA9IGFueT5cblx0e1xuXHRcdFtrZXk6IG51bWJlcl06IElESUNUPFQ+LFxuXHR9XG5cblx0ZXhwb3J0IHR5cGUgSU9wdGlvbnNTZWdtZW50ID0gSU9wdGlvbnNUYWJsZURpY3QgJiB7XG5cdFx0ZGI/OiBUYWJsZURpY3RbXSxcblx0XHRvcHRpb25zRG9TZWdtZW50PzogSU9wdGlvbnNEb1NlZ21lbnQsXG5cblx0XHRhbGxfbW9kPzogYm9vbGVhbixcblxuXHRcdG1heENodW5rQ291bnQ/OiBudW1iZXIsXG5cdH07XG5cblx0ZXhwb3J0IHR5cGUgSURJQ1RfU1lOT05ZTSA9IElESUNUPHN0cmluZz47XG5cdGV4cG9ydCB0eXBlIElESUNUX1NUT1BXT1JEID0gSURJQ1Q8Ym9vbGVhbj47XG5cdGV4cG9ydCB0eXBlIElESUNUX0JMQUNLTElTVCA9IElESUNUPGJvb2xlYW4+O1xuXG5cdGV4cG9ydCBpbnRlcmZhY2UgSVdvcmRcblx0e1xuXHRcdHc6IHN0cmluZyxcblx0XHQvKipcblx0XHQgKiDoqZ7mgKdcblx0XHQgKi9cblx0XHRwPzogbnVtYmVyLFxuXHRcdC8qKlxuXHRcdCAqIOipnuaAp+WQjeeosVxuXHRcdCAqL1xuXHRcdHBzPzogc3RyaW5nLFxuXHRcdHBwPzogc3RyaW5nLFxuXHRcdC8qKlxuXHRcdCAqIOasiumHjVxuXHRcdCAqL1xuXHRcdGY/OiBudW1iZXIsXG5cdFx0LyoqXG5cdFx0ICog5byA5aeL5L2N572uXG5cdFx0ICovXG5cdFx0Yz86IG51bWJlcixcblx0XHQvKipcblx0XHQgKiDlkIjkvbXpoIXnm65cblx0XHQgKi9cblx0XHRtPzogQXJyYXk8SVdvcmQgfCBzdHJpbmc+LFxuXG5cdFx0Ly9jb252ZXJ0U3lub255bT86IGJvb2xlYW4sXG5cdFx0Ly9hdXRvQ3JlYXRlPzogYm9vbGVhbixcblxuXHRcdC8qKlxuXHRcdCAqIOS7o+ihqOWOn+eUn+WtmOWcqOaWvOWtl+WFuOWFp+eahOmgheebrlxuXHRcdCAqL1xuXHRcdHM/OiBib29sZWFuLFxuXHRcdG9zPzogYm9vbGVhbixcblx0fVxuXG5cdGV4cG9ydCBpbnRlcmZhY2UgSU9wdGlvbnNEb1NlZ21lbnRcblx0e1xuXHRcdC8qKlxuXHRcdCAqIOS4jei/lOWbnuivjeaAp1xuXHRcdCAqL1xuXHRcdHNpbXBsZT86IGJvb2xlYW4sXG5cblx0XHQvKipcblx0XHQgKiDljrvpmaTmoIfngrnnrKblj7dcblx0XHQgKi9cblx0XHRzdHJpcFB1bmN0dWF0aW9uPzogYm9vbGVhbixcblxuXHRcdC8qKlxuXHRcdCAqIOi9rOaNouWQjOS5ieivjVxuXHRcdCAqL1xuXHRcdGNvbnZlcnRTeW5vbnltPzogYm9vbGVhbixcblxuXHRcdC8qKlxuXHRcdCAqIOWOu+mZpOWBnOatouesplxuXHRcdCAqL1xuXHRcdHN0cmlwU3RvcHdvcmQ/OiBib29sZWFuLFxuXG5cdFx0c3RyaXBTcGFjZT86IGJvb2xlYW4sXG5cdH1cbn1cblxuZXhwb3J0IGltcG9ydCBJT3B0aW9uc1NlZ21lbnQgPSBTZWdtZW50LklPcHRpb25zU2VnbWVudDtcbmV4cG9ydCBpbXBvcnQgSVdvcmQgPSBTZWdtZW50LklXb3JkO1xuZXhwb3J0IGltcG9ydCBJT3B0aW9uc0RvU2VnbWVudCA9IFNlZ21lbnQuSU9wdGlvbnNEb1NlZ21lbnQ7XG5leHBvcnQgaW1wb3J0IElESUNUX1NZTk9OWU0gPSBTZWdtZW50LklESUNUX1NZTk9OWU07XG5leHBvcnQgaW1wb3J0IElESUNUX1NUT1BXT1JEID0gU2VnbWVudC5JRElDVF9TVE9QV09SRDtcbmV4cG9ydCBpbXBvcnQgSURJQ1RfQkxBQ0tMSVNUID0gU2VnbWVudC5JRElDVF9CTEFDS0xJU1Q7XG5cbmV4cG9ydCBpbXBvcnQgSURJQ1QgPSBTZWdtZW50LklESUNUO1xuZXhwb3J0IGltcG9ydCBJRElDVDIgPSBTZWdtZW50LklESUNUMjtcblxuZXhwb3J0IGltcG9ydCBJU1BMSVQgPSBTZWdtZW50LklTUExJVDtcbmV4cG9ydCBpbXBvcnQgSVNQTElUX0ZJTFRFUiA9IFNlZ21lbnQuSVNQTElUX0ZJTFRFUjtcblxuZXhwb3J0IGRlZmF1bHQgU2VnbWVudDtcbiJdfQ==