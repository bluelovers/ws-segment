/**
 * 分词器接口
 *
 * @author 老雷<leizongmin@gmail.com>
 */
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
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
        if (autocreate && !this.db[type]) {
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
            this.db[type] = new libTableDict(type, this.options);
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
    loadBlacklistDict(name) {
        let filename = this._resolveDictFilename(name, [
            path.resolve(segment_dict_1.default.DICT_ROOT, 'blacklist'),
        ]);
        if (Array.isArray(filename)) {
            let self = this;
            filename.forEach(v => this.loadBlacklistDict(v));
            return this;
        }
        const type = 'BLACKLIST';
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
        const type = 'STOPWORD';
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
    /**
     * remove key in TABLE by BLACKLIST
     */
    doBlacklist() {
        let me = this;
        this.autoInit(this.options);
        const BLACKLIST = me.getDict('BLACKLIST');
        const TABLE = me.getDictDatabase('TABLE');
        Object.entries(BLACKLIST)
            .forEach(function ([key, bool]) {
            bool && TABLE.remove(key);
        });
        return this;
    }
    doSegment(text, options = {}) {
        let me = this;
        options = this.getOptionsDoSegment(options);
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
        const RAW = Symbol.for('RAW');
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
                    let item_new = debug_1.debugToken(Object.assign({}, item, { w: nw, ow: w, p, op: item.p }), {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2VnbWVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIlNlZ21lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7R0FJRztBQUVILFlBQVksQ0FBQzs7QUFJYixhQUFhO0FBQ2IsNkJBQTZCO0FBQzdCLGtDQUEyRDtBQUMzRCxtQ0FBcUM7QUFDckMscUNBQThCO0FBQzlCLGlEQUFtRDtBQUVuRCx1Q0FBdUY7QUFFdkYscUNBQThCO0FBQzlCLG1EQUEwQztBQUMxQywrQ0FBcUQ7QUFDckQsNkNBQStDO0FBRS9DLCtDQUF1QztBQUN2QywrQkFBOEY7QUFDOUYsd0NBQTBDO0FBRzFDLHNEQUE4QztBQUU5Qyw0Q0FBNEM7QUFFNUM7O0dBRUc7QUFDSCxNQUFhLE9BQU87SUFpRW5CLFlBQVksVUFBMkIsRUFBRTtRQTVEekM7Ozs7Ozs7OztXQVNHO1FBQ0gsVUFBSyxHQUFXLHdDQUFrRCxDQUFDO1FBRW5FOzs7OztXQUtHO1FBQ0gsaUJBQVksR0FBa0IsY0FBK0IsQ0FBQztRQUU5RDs7O1dBR0c7UUFDSCxXQUFNLEdBQUcsZ0JBQU0sQ0FBQztRQUNoQjs7O1dBR0c7UUFDSCxTQUFJLEdBS0EsRUFBRSxDQUFDO1FBQ1AsWUFBTyxHQUFHO1lBQ1Q7O2VBRUc7WUFDSCxTQUFTLEVBQUUsRUFBRTtZQUNiOztlQUVHO1lBQ0gsU0FBUyxFQUFFLEVBQUU7U0FJYixDQUFDO1FBS0YsT0FBRSxHQUVFLEVBQUUsQ0FBQztRQUVQLFlBQU8sR0FBb0IsRUFBRSxDQUFDO1FBTTdCLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQztRQUVsQixJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFFeEQsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLGVBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNyQyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksZUFBUyxD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QUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1NBQzNDO1FBRUQsT0FBTyxHQUFHLENBQUM7SUFDWixDQUFDO0lBRUQ7Ozs7Ozs7T0FPRztJQUNILE9BQU8sQ0FBQyxLQUFjLEVBQUUsQ0FBa0IsRUFBRSxHQUFZO1FBRXZELEdBQUcsR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO1FBQzNCLElBQUksQ0FBQyxHQUFHLE9BQU8sQ0FBQyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7UUFFMUMsT0FBTyxHQUFHLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFDekI7WUFDQyxJQUFJLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO2dCQUFFLE9BQU8sR0FBRyxDQUFDO1lBQ25DLEdBQUcsRUFBRSxDQUFDO1NBQ047UUFFRCxPQUFPLENBQUMsQ0FBQyxDQUFDO0lBQ1gsQ0FBQzs7QUFsN0JNLCtCQUF1QixHQUFzQixFQUFFLENBQUM7QUFIeEQsMEJBczdCQztBQTRHRCxrQkFBZSxPQUFPLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIOWIhuivjeWZqOaOpeWPo1xuICpcbiAqIEBhdXRob3Ig6ICB6Zu3PGxlaXpvbmdtaW5AZ21haWwuY29tPlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuLy8gQHRzLWlnbm9yZVxuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMnO1xuLy8gQHRzLWlnbm9yZVxuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IHNlYXJjaEZpcnN0U3luYywgc2VhcmNoR2xvYlN5bmMgfSBmcm9tICcuL2ZzL2dldCc7XG5pbXBvcnQgeyB1c2VEZWZhdWx0IH0gZnJvbSAnLi9pbmRleCc7XG5pbXBvcnQgUE9TVEFHIGZyb20gJy4vUE9TVEFHJztcbmltcG9ydCBUYWJsZURpY3RCbGFja2xpc3QgZnJvbSAnLi90YWJsZS9ibGFja2xpc3QnO1xuaW1wb3J0IEFic3RyYWN0VGFibGVEaWN0Q29yZSBmcm9tICcuL3RhYmxlL2NvcmUnO1xuaW1wb3J0IHsgVGFibGVEaWN0LCBJT3B0aW9ucyBhcyBJT3B0aW9uc1RhYmxlRGljdCwgSVRhYmxlRGljdFJvdyB9IGZyb20gJy4vdGFibGUvZGljdCc7XG5cbmltcG9ydCBMb2FkZXIgZnJvbSAnLi9sb2FkZXInO1xuaW1wb3J0IHsgY3JsZiwgTEYgfSBmcm9tICdjcmxmLW5vcm1hbGl6ZSc7XG5pbXBvcnQgeyBUYWJsZURpY3RTdG9wd29yZCB9IGZyb20gJy4vdGFibGUvc3RvcHdvcmQnO1xuaW1wb3J0IFRhYmxlRGljdFN5bm9ueW0gZnJvbSAnLi90YWJsZS9zeW5vbnltJztcbmltcG9ydCB7IGRlYnVnLCBJV29yZERlYnVnSW5mbyB9IGZyb20gJy4vdXRpbCc7XG5pbXBvcnQgU2VnbWVudERpY3QgZnJvbSAnc2VnbWVudC1kaWN0JztcbmltcG9ydCBnZXREZWZhdWx0TW9kTGlzdCwgeyBPcHRpbWl6ZXIsIElTdWJPcHRpbWl6ZXIsIFRva2VuaXplciwgSVN1YlRva2VuaXplciB9IGZyb20gJy4vbW9kJztcbmltcG9ydCB7IGRlYnVnVG9rZW4gfSBmcm9tICcuL3V0aWwvZGVidWcnO1xuaW1wb3J0IHsgSVdvcmREZWJ1ZyB9IGZyb20gJy4vdXRpbC9pbmRleCc7XG5cbmltcG9ydCBQcm9qZWN0Q29uZmlnIGZyb20gJy4uL3Byb2plY3QuY29uZmlnJztcblxuaW1wb3J0ICogYXMgZGVlcG1lcmdlIGZyb20gJ2RlZXBtZXJnZS1wbHVzJztcblxuLyoqXG4gKiDliJvlu7rliIbor43lmajmjqXlj6NcbiAqL1xuZXhwb3J0IGNsYXNzIFNlZ21lbnRcbntcblxuXHRzdGF0aWMgZGVmYXVsdE9wdGlvbnNEb1NlZ21lbnQ6IElPcHRpb25zRG9TZWdtZW50ID0ge307XG5cblx0LyoqXG5cdCAqIOWIhuautVxuXHQgKlxuXHQgKiDnlLHmlrwgc2VnbWVudCDmmK/liKnnlKjlsI3lhaflrrnnmoTliY3lvozmlofliIbmnpDkvobpgLLooYzliIboqZ5cblx0ICog5omA5Lul5aaC5L2V5YiH5Ymy5q616JC95bCN5pa857WQ5p6c5bCx5pyD55Si55Sf5LiN5ZCM5b2x6Z+/XG5cdCAqXG5cdCAqIGBSZWdFeHBgIG9yIOWFt+aciSBgLltTeW1ib2wuc3BsaXRdKGlucHV0OiBzdHJpbmcsIGxpbWl0PzogbnVtYmVyKSA9PiBzdHJpbmdbXWAg55qE54mp5Lu2XG5cdCAqXG5cdCAqIEB0eXBlIHtTZWdtZW50LklTUExJVH1cblx0ICovXG5cdFNQTElUOiBJU1BMSVQgPSAvKFtcXHJcXG5dK3xeW+OAgFxccytdK3xb44CAXFxzXSskfFvjgIBcXHNdezIsfSkvZ20gYXMgSVNQTElUO1xuXG5cdC8qKlxuXHQgKiDliIbmrrXkuYvlvowg5aaC5p6c56ym5ZCI5Lul5LiL5qKd5Lu2IOWJh+ebtOaOpeW/veeVpeWIhuaekFxuXHQgKiBgUmVnRXhwYCBvciDlhbfmnIkgYC50ZXN0KGlucHV0OiBzdHJpbmcpID0+IGJvb2xlYW5gIOeahOeJqeS7tlxuXHQgKlxuXHQgKiBAdHlwZSB7U2VnbWVudC5JU1BMSVRfRklMVEVSfVxuXHQgKi9cblx0U1BMSVRfRklMVEVSOiBJU1BMSVRfRklMVEVSID0gL14oW1xcclxcbl0rKSQvZyBhcyBJU1BMSVRfRklMVEVSO1xuXG5cdC8qKlxuXHQgKiDor43mgKdcblx0ICogQHR5cGUge1BPU1RBR31cblx0ICovXG5cdFBPU1RBRyA9IFBPU1RBRztcblx0LyoqXG5cdCAqIOivjeWFuOihqFxuXHQgKiBAdHlwZSB7e319XG5cdCAqL1xuXHRESUNUOiB7XG5cdFx0U1RPUFdPUkQ/OiBJRElDVF9TVE9QV09SRCxcblx0XHRTWU5PTllNPzogSURJQ1RfU1lOT05ZTSxcblxuXHRcdFtrZXk6IHN0cmluZ106IElESUNULFxuXHR9ID0ge307XG5cdG1vZHVsZXMgPSB7XG5cdFx0LyoqXG5cdFx0ICog5YiG6K+N5qih5Z2XXG5cdFx0ICovXG5cdFx0dG9rZW5pemVyOiBbXSxcblx0XHQvKipcblx0XHQgKiDkvJjljJbmqKHlnZdcblx0XHQgKi9cblx0XHRvcHRpbWl6ZXI6IFtdLFxuXHR9IGFzIHtcblx0XHR0b2tlbml6ZXI6IElTdWJUb2tlbml6ZXJbXSxcblx0XHRvcHRpbWl6ZXI6IElTdWJPcHRpbWl6ZXJbXSxcblx0fTtcblxuXHR0b2tlbml6ZXI6IFRva2VuaXplcjtcblx0b3B0aW1pemVyOiBPcHRpbWl6ZXI7XG5cblx0ZGI6IHtcblx0XHRba2V5OiBzdHJpbmddOiBUYWJsZURpY3QsXG5cdH0gPSB7fTtcblxuXHRvcHRpb25zOiBJT3B0aW9uc1NlZ21lbnQgPSB7fTtcblxuXHRpbml0ZWQ/OiBib29sZWFuO1xuXG5cdGNvbnN0cnVjdG9yKG9wdGlvbnM6IElPcHRpb25zU2VnbWVudCA9IHt9KVxuXHR7XG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XG5cblx0XHR0aGlzLm9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLm9wdGlvbnMsIG9wdGlvbnMpO1xuXG5cdFx0dGhpcy50b2tlbml6ZXIgPSBuZXcgVG9rZW5pemVyKHRoaXMpO1xuXHRcdHRoaXMub3B0aW1pemVyID0gbmV3IE9wdGltaXplcih0aGlzKTtcblxuXHRcdGlmICh0aGlzLm9wdGlvbnMuZGIpXG5cdFx0e1xuXHRcdFx0dGhpcy5vcHRpb25zLmRiLmZvckVhY2goZnVuY3Rpb24gKGRhdGEpXG5cdFx0XHR7XG5cdFx0XHRcdHNlbGYuZGJbZGF0YS50eXBlXSA9IGRhdGE7XG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHRkZWxldGUgdGhpcy5vcHRpb25zLmRiO1xuXHR9XG5cblx0Z2V0RGljdERhdGFiYXNlPFIgZXh0ZW5kcyBUYWJsZURpY3RTeW5vbnltPih0eXBlOiAnU1lOT05ZTScsXG5cdFx0YXV0b2NyZWF0ZT86IGJvb2xlYW4sXG5cdFx0bGliVGFibGVEaWN0PzogeyBuZXcoLi4uYXJndik6IFIgfSxcblx0KTogUlxuXHRnZXREaWN0RGF0YWJhc2U8UiBleHRlbmRzIFRhYmxlRGljdD4odHlwZTogJ1RBQkxFJywgYXV0b2NyZWF0ZT86IGJvb2xlYW4sIGxpYlRhYmxlRGljdD86IHsgbmV3KC4uLmFyZ3YpOiBSIH0pOiBSXG5cdGdldERpY3REYXRhYmFzZTxSIGV4dGVuZHMgVGFibGVEaWN0U3RvcHdvcmQ+KHR5cGU6ICdTVE9QV09SRCcsXG5cdFx0YXV0b2NyZWF0ZT86IGJvb2xlYW4sXG5cdFx0bGliVGFibGVEaWN0PzogeyBuZXcoLi4uYXJndik6IFIgfSxcblx0KTogUlxuXHRnZXREaWN0RGF0YWJhc2U8UiBleHRlbmRzIFRhYmxlRGljdEJsYWNrbGlzdD4odHlwZTogJ0JMQUNLTElTVCcsXG5cdFx0YXV0b2NyZWF0ZT86IGJvb2xlYW4sXG5cdFx0bGliVGFibGVEaWN0PzogeyBuZXcoLi4uYXJndik6IFIgfSxcblx0KTogUlxuXHRnZXREaWN0RGF0YWJhc2U8UiBleHRlbmRzIEFic3RyYWN0VGFibGVEaWN0Q29yZTxhbnk+Pih0eXBlOiBzdHJpbmcsXG5cdFx0YXV0b2NyZWF0ZT86IGJvb2xlYW4sXG5cdFx0bGliVGFibGVEaWN0PzogeyBuZXcoLi4uYXJndik6IFIgfSxcblx0KTogUlxuXHRnZXREaWN0RGF0YWJhc2UodHlwZTogc3RyaW5nLCBhdXRvY3JlYXRlPzogYm9vbGVhbiwgbGliVGFibGVEaWN0Pylcblx0e1xuXHRcdGlmIChhdXRvY3JlYXRlICYmICF0aGlzLmRiW3R5cGVdKVxuXHRcdHtcblx0XHRcdGlmICh0eXBlID09IFRhYmxlRGljdFN5bm9ueW0udHlwZSlcblx0XHRcdHtcblx0XHRcdFx0bGliVGFibGVEaWN0ID0gbGliVGFibGVEaWN0IHx8IFRhYmxlRGljdFN5bm9ueW07XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmICh0eXBlID09IFRhYmxlRGljdFN0b3B3b3JkLnR5cGUpXG5cdFx0XHR7XG5cdFx0XHRcdGxpYlRhYmxlRGljdCA9IGxpYlRhYmxlRGljdCB8fCBUYWJsZURpY3RTdG9wd29yZDtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKHR5cGUgPT0gVGFibGVEaWN0QmxhY2tsaXN0LnR5cGUpXG5cdFx0XHR7XG5cdFx0XHRcdGxpYlRhYmxlRGljdCA9IGxpYlRhYmxlRGljdCB8fCBUYWJsZURpY3RTdG9wd29yZDtcblx0XHRcdH1cblx0XHRcdGVsc2Vcblx0XHRcdHtcblx0XHRcdFx0bGliVGFibGVEaWN0ID0gbGliVGFibGVEaWN0IHx8IFRhYmxlRGljdDtcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5kYlt0eXBlXSA9IG5ldyBsaWJUYWJsZURpY3QodHlwZSwgdGhpcy5vcHRpb25zKTtcblx0XHR9XG5cblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0cmV0dXJuIHRoaXMuZGJbdHlwZV07XG5cdH1cblxuXHQvKipcblx0ICog6L295YWl5YiG6K+N5qih5Z2XXG5cdCAqXG5cdCAqIEBwYXJhbSB7U3RyaW5nfEFycmF5fE9iamVjdH0gbW9kdWxlIOaooeWdl+WQjeensCjmlbDnu4Qp5oiW5qih5Z2X5a+56LGhXG5cdCAqIEByZXR1cm4ge1NlZ21lbnR9XG5cdCAqL1xuXHR1c2UobW9kOiBJU3ViT3B0aW1pemVyLCAuLi5hcmd2KVxuXHR1c2UobW9kOiBJU3ViVG9rZW5pemVyLCAuLi5hcmd2KVxuXHR1c2UobW9kOiBBcnJheTxJU3ViVG9rZW5pemVyIHwgSVN1Yk9wdGltaXplciB8IHN0cmluZz4sIC4uLmFyZ3YpXG5cdHVzZShtb2Q6IHN0cmluZywgLi4uYXJndilcblx0dXNlKG1vZCwgLi4uYXJndilcblx0dXNlKG1vZCwgLi4uYXJndilcblx0e1xuXHRcdGxldCBtZSA9IHRoaXM7XG5cblx0XHRpZiAoQXJyYXkuaXNBcnJheShtb2QpKVxuXHRcdHtcblx0XHRcdG1vZC5mb3JFYWNoKGZ1bmN0aW9uIChtKVxuXHRcdFx0e1xuXHRcdFx0XHRtZS51c2UobSk7XG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0ZWxzZVxuXHRcdHtcblx0XHRcdGlmICh0eXBlb2YgbW9kID09ICdzdHJpbmcnKVxuXHRcdFx0e1xuXHRcdFx0XHQvL2NvbnNvbGUubG9nKCdtb2R1bGUnLCBtb2QpO1xuXG5cdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0Ly9sZXQgZmlsZW5hbWUgPSBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnbW9kdWxlJywgbW9kdWxlICsgJy5qcycpO1xuXHRcdFx0XHRsZXQgZmlsZW5hbWUgPSBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnc3VibW9kJywgbW9kKTtcblxuXHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdG1vZCA9IHJlcXVpcmUoZmlsZW5hbWUpO1xuXHRcdFx0fVxuXHRcdFx0Ly8g5Yid5aeL5YyW5bm25rOo5YaM5qih5Z2XXG5cdFx0XHRsZXQgYyA9IG1vZC5pbml0KHRoaXMsIC4uLmFyZ3YpO1xuXG5cdFx0XHRpZiAodHlwZW9mIGMgIT09ICd1bmRlZmluZWQnKVxuXHRcdFx0e1xuXHRcdFx0XHRtb2QgPSBjO1xuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLm1vZHVsZXNbbW9kLnR5cGVdLnB1c2gobW9kKTtcblx0XHR9XG5cblx0XHR0aGlzLmluaXRlZCA9IHRydWU7XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdF9yZXNvbHZlRGljdEZpbGVuYW1lKG5hbWU6IHN0cmluZywgcGF0aFBsdXM6IHN0cmluZ1tdID0gW10sIGV4dFBsdXM6IHN0cmluZ1tdID0gW10pOiBzdHJpbmcgfCBzdHJpbmdbXVxuXHR7XG5cdFx0bGV0IG9wdGlvbnMgPSB7XG5cdFx0XHRwYXRoczogW1xuXHRcdFx0XHQnJyxcblx0XHRcdFx0UHJvamVjdENvbmZpZy5kaWN0X3Jvb3QsXG5cblx0XHRcdFx0Li4ucGF0aFBsdXMsXG5cdFx0XHRcdHBhdGgucmVzb2x2ZShTZWdtZW50RGljdC5ESUNUX1JPT1QsICdzZWdtZW50JyksXG5cdFx0XHRdLFxuXHRcdFx0ZXh0ZW5zaW9uczogW1xuXHRcdFx0XHQnJyxcblx0XHRcdFx0Li4uZXh0UGx1cyxcblx0XHRcdFx0Jy51dGY4Jyxcblx0XHRcdFx0Jy50eHQnLFxuXHRcdFx0XSxcblxuXHRcdFx0b25seUZpbGU6IHRydWUsXG5cdFx0fTtcblxuXHRcdGlmIChuYW1lLmluZGV4T2YoJyonKSAhPSAtMSlcblx0XHR7XG5cdFx0XHRsZXQgbHMgPSBzZWFyY2hHbG9iU3luYyhuYW1lLCBvcHRpb25zKTtcblxuXHRcdFx0aWYgKCFscyB8fCAhbHMubGVuZ3RoKVxuXHRcdFx0e1xuXHRcdFx0XHR0aHJvdyBFcnJvcihgQ2Fubm90IGZpbmQgZGljdCBnbG9iIGZpbGUgXCIke25hbWV9XCIuYCk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBscztcblx0XHR9XG5cblx0XHRsZXQgZmlsZW5hbWUgPSBzZWFyY2hGaXJzdFN5bmMobmFtZSwgb3B0aW9ucyk7XG5cblx0XHRpZiAoIWZpbGVuYW1lKVxuXHRcdHtcblx0XHRcdC8vY29uc29sZS5sb2cobmFtZSwgcGF0aFBsdXMsIGV4dFBsdXMpO1xuXG5cdFx0XHR0aHJvdyBFcnJvcihgQ2Fubm90IGZpbmQgZGljdCBmaWxlIFwiJHtuYW1lfVwiLmApO1xuXHRcdH1cblxuXHRcdHJldHVybiBmaWxlbmFtZTtcblx0fVxuXG5cdC8qKlxuXHQgKiDovb3lhaXlrZflhbjmlofku7Zcblx0ICpcblx0ICogQHBhcmFtIHtTdHJpbmd9IG5hbWUg5a2X5YW45paH5Lu25ZCNXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlIOexu+Wei1xuXHQgKiBAcGFyYW0ge0Jvb2xlYW59IGNvbnZlcnRfdG9fbG93ZXIg5piv5ZCm5YWo6YOo6L2s5o2i5Li65bCP5YaZXG5cdCAqIEByZXR1cm4ge1NlZ21lbnR9XG5cdCAqL1xuXHRsb2FkRGljdChuYW1lOiBzdHJpbmcsIHR5cGU/OiBzdHJpbmcsIGNvbnZlcnRfdG9fbG93ZXI/OiBib29sZWFuLCBza2lwRXhpc3RzPzogYm9vbGVhbilcblx0e1xuXHRcdGxldCBmaWxlbmFtZSA9IHRoaXMuX3Jlc29sdmVEaWN0RmlsZW5hbWUobmFtZSk7XG5cblx0XHRpZiAoQXJyYXkuaXNBcnJheShmaWxlbmFtZSkpXG5cdFx0e1xuXHRcdFx0bGV0IHNlbGYgPSB0aGlzO1xuXG5cdFx0XHRmaWxlbmFtZS5mb3JFYWNoKHYgPT4gdGhpcy5sb2FkRGljdCh2LCB0eXBlLCBjb252ZXJ0X3RvX2xvd2VyLCBza2lwRXhpc3RzKSk7XG5cblx0XHRcdC8vY29uc29sZS5sb2coZmlsZW5hbWUpO1xuXG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9XG5cblx0XHRpZiAoIXR5cGUpIHR5cGUgPSAnVEFCTEUnOyAgICAgLy8g6buY6K6k5Li6VEFCTEVcblxuXHRcdGNvbnN0IGRiID0gdGhpcy5nZXREaWN0RGF0YWJhc2UodHlwZSwgdHJ1ZSk7XG5cblx0XHRjb25zdCBUQUJMRSA9IHRoaXMuRElDVFt0eXBlXSA9IGRiLlRBQkxFO1xuXHRcdGNvbnN0IFRBQkxFMiA9IHRoaXMuRElDVFt0eXBlICsgJzInXSA9IGRiLlRBQkxFMjtcblxuXHRcdC8qXG5cdFx0Ly8g5Yid5aeL5YyW6K+N5YW4XG5cdFx0aWYgKCF0aGlzLkRJQ1RbdHlwZV0pIHRoaXMuRElDVFt0eXBlXSA9IHt9O1xuXHRcdGlmICghdGhpcy5ESUNUW3R5cGUgKyAnMiddKSB0aGlzLkRJQ1RbdHlwZSArICcyJ10gPSB7fTtcblx0XHRsZXQgVEFCTEUgPSB0aGlzLkRJQ1RbdHlwZV07ICAgICAgICAvLyDor43lhbjooaggICfor40nID0+IHvlsZ7mgKd9XG5cdFx0bGV0IFRBQkxFMiA9IHRoaXMuRElDVFt0eXBlICsgJzInXTsgLy8g6K+N5YW46KGoICAn6ZW/5bqmJyA9PiAn6K+NJyA9PiDlsZ7mgKdcblx0XHQqL1xuXHRcdC8vIOWvvOWFpeaVsOaNrlxuXHRcdGNvbnN0IFBPU1RBRyA9IHRoaXMuUE9TVEFHO1xuXG5cdFx0bGV0IGRhdGEgPSBMb2FkZXIuU2VnbWVudERpY3RMb2FkZXIubG9hZFN5bmMoZmlsZW5hbWUpO1xuXG5cdFx0ZGF0YS5mb3JFYWNoKGZ1bmN0aW9uIChkYXRhKVxuXHRcdHtcblx0XHRcdGlmIChjb252ZXJ0X3RvX2xvd2VyKVxuXHRcdFx0e1xuXHRcdFx0XHRkYXRhWzBdID0gZGF0YVswXS50b0xvd2VyQ2FzZSgpO1xuXHRcdFx0fVxuXG5cdFx0XHRkYi5hZGQoZGF0YSwgc2tpcEV4aXN0cyk7XG5cblx0XHRcdC8qXG5cdFx0XHRsZXQgW3csIHAsIGZdID0gZGF0YTtcblxuXHRcdFx0aWYgKHcubGVuZ3RoID09IDApXG5cdFx0XHR7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcigpXG5cdFx0XHR9XG5cblx0XHRcdFRBQkxFW3ddID0geyBwLCBmLCB9O1xuXHRcdFx0aWYgKCFUQUJMRTJbdy5sZW5ndGhdKSBUQUJMRTJbdy5sZW5ndGhdID0ge307XG5cdFx0XHRUQUJMRTJbdy5sZW5ndGhdW3ddID0gVEFCTEVbd107XG5cdFx0XHQqL1xuXHRcdH0pO1xuXG5cdFx0ZGF0YSA9IHVuZGVmaW5lZDtcblxuXHRcdHRoaXMuaW5pdGVkID0gdHJ1ZTtcblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIOWPluivjeWFuOihqFxuXHQgKlxuXHQgKiBAcGFyYW0ge1N0cmluZ30gdHlwZSDnsbvlnotcblx0ICogQHJldHVybiB7b2JqZWN0fVxuXHQgKi9cblx0Z2V0RGljdCh0eXBlOiAnU1RPUFdPUkQnKTogSURJQ1RfU1RPUFdPUkRcblx0Z2V0RGljdCh0eXBlOiAnU1lOT05ZTScpOiBJRElDVF9TWU5PTllNXG5cdGdldERpY3QodHlwZTogJ1RBQkxFJyk6IElESUNUPElXb3JkPlxuXHRnZXREaWN0KHR5cGU6ICdUQUJMRTInKTogSURJQ1QyPElXb3JkPlxuXHRnZXREaWN0KHR5cGUpOiBJRElDVFxuXHRnZXREaWN0KHR5cGUpXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5ESUNUW3R5cGVdO1xuXHR9XG5cblx0LyoqXG5cdCAqIOi9veWFpeWQjOS5ieivjeivjeWFuFxuXHQgKlxuXHQgKiBAcGFyYW0ge1N0cmluZ30gbmFtZSDlrZflhbjmlofku7blkI1cblx0ICovXG5cdGxvYWRTeW5vbnltRGljdChuYW1lOiBzdHJpbmcsIHNraXBFeGlzdHM/OiBib29sZWFuKVxuXHR7XG5cdFx0bGV0IGZpbGVuYW1lID0gdGhpcy5fcmVzb2x2ZURpY3RGaWxlbmFtZShuYW1lLCBbXG5cdFx0XHRwYXRoLnJlc29sdmUoU2VnbWVudERpY3QuRElDVF9ST09ULCAnc3lub255bScpLFxuXHRcdF0pO1xuXG5cdFx0aWYgKEFycmF5LmlzQXJyYXkoZmlsZW5hbWUpKVxuXHRcdHtcblx0XHRcdGxldCBzZWxmID0gdGhpcztcblxuXHRcdFx0ZmlsZW5hbWUuZm9yRWFjaCh2ID0+IHRoaXMubG9hZFN5bm9ueW1EaWN0KHYsIHNraXBFeGlzdHMpKTtcblxuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fVxuXG5cdFx0bGV0IHR5cGUgPSAnU1lOT05ZTSc7XG5cblx0XHRjb25zdCBkYiA9IHRoaXMuZ2V0RGljdERhdGFiYXNlKHR5cGUsIHRydWUpO1xuXG5cdFx0Y29uc3QgVEFCTEUgPSB0aGlzLkRJQ1RbdHlwZV0gPSBkYi5UQUJMRTtcblxuXHRcdC8qXG5cdFx0Ly8g5Yid5aeL5YyW6K+N5YW4XG5cdFx0aWYgKCF0aGlzLkRJQ1RbdHlwZV0pIHRoaXMuRElDVFt0eXBlXSA9IHt9O1xuXHRcdC8vIOivjeWFuOihqCAgJ+WQjOS5ieivjScgPT4gJ+agh+WHhuivjSdcblx0XHRsZXQgVEFCTEUgPSB0aGlzLkRJQ1RbdHlwZV0gYXMgSURJQ1RfU1lOT05ZTTtcblx0XHQvLyDlr7zlhaXmlbDmja5cblx0XHQqL1xuXG5cdFx0bGV0IGRhdGEgPSBMb2FkZXIuU2VnbWVudFN5bm9ueW1Mb2FkZXIubG9hZFN5bmMoZmlsZW5hbWUpO1xuXG5cdFx0ZGF0YS5mb3JFYWNoKGZ1bmN0aW9uIChibG9ja3M6IHN0cmluZ1tdKVxuXHRcdHtcblx0XHRcdGRiLmFkZChibG9ja3MsIHNraXBFeGlzdHMpO1xuXG5cdFx0XHQvKlxuXHRcdFx0bGV0IFtuMSwgbjJdID0gYmxvY2tzO1xuXG5cdFx0XHRUQUJMRVtuMV0gPSBuMjtcblx0XHRcdGlmIChUQUJMRVtuMl0gPT09IG4xKVxuXHRcdFx0e1xuXHRcdFx0XHRkZWxldGUgVEFCTEVbbjJdO1xuXHRcdFx0fVxuXHRcdFx0Ki9cblx0XHR9KTtcblxuXHRcdC8vY29uc29sZS5sb2coVEFCTEUpO1xuXG5cdFx0ZGF0YSA9IHVuZGVmaW5lZDtcblxuXHRcdHRoaXMuaW5pdGVkID0gdHJ1ZTtcblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0bG9hZEJsYWNrbGlzdERpY3QobmFtZTogc3RyaW5nKVxuXHR7XG5cdFx0bGV0IGZpbGVuYW1lID0gdGhpcy5fcmVzb2x2ZURpY3RGaWxlbmFtZShuYW1lLCBbXG5cdFx0XHRwYXRoLnJlc29sdmUoU2VnbWVudERpY3QuRElDVF9ST09ULCAnYmxhY2tsaXN0JyksXG5cdFx0XSk7XG5cblx0XHRpZiAoQXJyYXkuaXNBcnJheShmaWxlbmFtZSkpXG5cdFx0e1xuXHRcdFx0bGV0IHNlbGYgPSB0aGlzO1xuXG5cdFx0XHRmaWxlbmFtZS5mb3JFYWNoKHYgPT4gdGhpcy5sb2FkQmxhY2tsaXN0RGljdCh2KSk7XG5cblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH1cblxuXHRcdGNvbnN0IHR5cGUgPSAnQkxBQ0tMSVNUJztcblxuXHRcdGNvbnN0IGRiID0gdGhpcy5nZXREaWN0RGF0YWJhc2UodHlwZSwgdHJ1ZSk7XG5cblx0XHRjb25zdCBUQUJMRSA9IHRoaXMuRElDVFt0eXBlXSA9IGRiLlRBQkxFO1xuXG5cdFx0bGV0IGRhdGEgPSBMb2FkZXIuU2VnbWVudERpY3Rcblx0XHRcdC5yZXF1aXJlTG9hZGVyTW9kdWxlKCdsaW5lJylcblx0XHRcdC5sb2FkU3luYyhmaWxlbmFtZSwge1xuXHRcdFx0XHRmaWx0ZXIobGluZTogc3RyaW5nKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cmV0dXJuIGxpbmUudHJpbSgpO1xuXHRcdFx0XHR9LFxuXHRcdFx0fSlcblx0XHQ7XG5cblx0XHRkYXRhLmZvckVhY2godiA9PiBkYi5hZGQodikpO1xuXG5cdFx0ZGF0YSA9IHVuZGVmaW5lZDtcblxuXHRcdHRoaXMuaW5pdGVkID0gdHJ1ZTtcblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIOi9veWFpeWBnOatouespuivjeWFuFxuXHQgKlxuXHQgKiBAcGFyYW0ge1N0cmluZ30gbmFtZSDlrZflhbjmlofku7blkI1cblx0ICovXG5cdGxvYWRTdG9wd29yZERpY3QobmFtZTogc3RyaW5nKVxuXHR7XG5cdFx0bGV0IGZpbGVuYW1lID0gdGhpcy5fcmVzb2x2ZURpY3RGaWxlbmFtZShuYW1lLCBbXG5cdFx0XHRwYXRoLnJlc29sdmUoU2VnbWVudERpY3QuRElDVF9ST09ULCAnc3RvcHdvcmQnKSxcblx0XHRdKTtcblxuXHRcdGlmIChBcnJheS5pc0FycmF5KGZpbGVuYW1lKSlcblx0XHR7XG5cdFx0XHRsZXQgc2VsZiA9IHRoaXM7XG5cblx0XHRcdGZpbGVuYW1lLmZvckVhY2godiA9PiB0aGlzLmxvYWRTdG9wd29yZERpY3QodikpO1xuXG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9XG5cblx0XHRjb25zdCB0eXBlID0gJ1NUT1BXT1JEJztcblxuXHRcdGNvbnN0IGRiID0gdGhpcy5nZXREaWN0RGF0YWJhc2UodHlwZSwgdHJ1ZSk7XG5cblx0XHRjb25zdCBUQUJMRSA9IHRoaXMuRElDVFt0eXBlXSA9IGRiLlRBQkxFO1xuXG5cdFx0bGV0IGRhdGEgPSBMb2FkZXIuU2VnbWVudERpY3Rcblx0XHRcdC5yZXF1aXJlTG9hZGVyTW9kdWxlKCdsaW5lJylcblx0XHRcdC5sb2FkU3luYyhmaWxlbmFtZSwge1xuXHRcdFx0XHRmaWx0ZXIobGluZTogc3RyaW5nKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cmV0dXJuIGxpbmUudHJpbSgpO1xuXHRcdFx0XHR9LFxuXHRcdFx0fSlcblx0XHQ7XG5cblx0XHRkYXRhLmZvckVhY2godiA9PiBkYi5hZGQodikpO1xuXG5cdFx0ZGF0YSA9IHVuZGVmaW5lZDtcblxuXHRcdHRoaXMuaW5pdGVkID0gdHJ1ZTtcblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIOS9v+eUqOm7mOiupOeahOivhuWIq+aooeWdl+WSjOWtl+WFuOaWh+S7tlxuXHQgKiDlnKjkvb/nlKjpoJDoqK3lgLznmoTmg4Xms4HkuIvvvIzkuI3pnIDopoHkuLvli5Xlkbzlj6vmraTlh73mlbhcblx0ICpcblx0ICogQHJldHVybiB7U2VnbWVudH1cblx0ICovXG5cdHVzZURlZmF1bHQoLi4uYXJndilcblx0e1xuXHRcdHVzZURlZmF1bHQodGhpcywgLi4uYXJndik7XG5cblx0XHR0aGlzLmluaXRlZCA9IHRydWU7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHRcdC8qXG5cdFx0dGhpc1xuXHRcdFx0Ly8g6K+G5Yir5qih5Z2XXG5cdFx0XHQvLyDlvLrliLbliIblibLnsbvljZXor43or4bliKtcblx0XHRcdC51c2UoJ1VSTFRva2VuaXplcicpICAgICAgICAgICAgLy8gVVJM6K+G5YirXG5cdFx0XHQudXNlKCdXaWxkY2FyZFRva2VuaXplcicpICAgICAgIC8vIOmAmumFjeespu+8jOW/hemhu+WcqOagh+eCueespuWPt+ivhuWIq+S5i+WJjVxuXHRcdFx0LnVzZSgnUHVuY3R1YXRpb25Ub2tlbml6ZXInKSAgICAvLyDmoIfngrnnrKblj7for4bliKtcblx0XHRcdC51c2UoJ0ZvcmVpZ25Ub2tlbml6ZXInKSAgICAgICAgLy8g5aSW5paH5a2X56ym44CB5pWw5a2X6K+G5Yir77yM5b+F6aG75Zyo5qCH54K556ym5Y+36K+G5Yir5LmL5ZCOXG5cdFx0XHQvLyDkuK3mlofljZXor43or4bliKtcblx0XHRcdC51c2UoJ0RpY3RUb2tlbml6ZXInKSAgICAgICAgICAgLy8g6K+N5YW46K+G5YirXG5cdFx0XHQudXNlKCdDaHNOYW1lVG9rZW5pemVyJykgICAgICAgIC8vIOS6uuWQjeivhuWIq++8jOW7uuiuruWcqOivjeWFuOivhuWIq+S5i+WQjlxuXG5cdFx0XHQvLyDkvJjljJbmqKHlnZdcblx0XHRcdC51c2UoJ0VtYWlsT3B0aW1pemVyJykgICAgICAgICAgLy8g6YKu566x5Zyw5Z2A6K+G5YirXG5cdFx0XHQudXNlKCdDaHNOYW1lT3B0aW1pemVyJykgICAgICAgIC8vIOS6uuWQjeivhuWIq+S8mOWMllxuXHRcdFx0LnVzZSgnRGljdE9wdGltaXplcicpICAgICAgICAgICAvLyDor43lhbjor4bliKvkvJjljJZcblx0XHRcdC51c2UoJ0RhdGV0aW1lT3B0aW1pemVyJykgICAgICAgLy8g5pel5pyf5pe26Ze06K+G5Yir5LyY5YyWXG5cblx0XHRcdC8vIOWtl+WFuOaWh+S7tlxuXHRcdFx0Ly8ubG9hZERpY3QoJ2ppZWJhJykgPD09PSBiYWQgZmlsZVxuXG5cdFx0XHQubG9hZERpY3QoJ2RpY3Q0JylcblxuXHRcdFx0LmxvYWREaWN0KCdjaGFyJylcblxuXHRcdFx0LmxvYWREaWN0KCdwaHJhc2VzJylcblx0XHRcdC5sb2FkRGljdCgncGhyYXNlczInKVxuXG5cdFx0XHQubG9hZERpY3QoJ2RpY3QnKSAgICAgICAgICAgLy8g55uY5Y+k6K+N5YW4XG5cdFx0XHQubG9hZERpY3QoJ2RpY3QyJykgICAgICAgICAgLy8g5omp5bGV6K+N5YW477yI55So5LqO6LCD5pW05Y6f55uY5Y+k6K+N5YW477yJXG5cdFx0XHQubG9hZERpY3QoJ2RpY3QzJykgICAgICAgICAgLy8g5omp5bGV6K+N5YW477yI55So5LqO6LCD5pW05Y6f55uY5Y+k6K+N5YW477yJXG5cdFx0XHQubG9hZERpY3QoJ25hbWVzJykgICAgICAgICAgLy8g5bi46KeB5ZCN6K+N44CB5Lq65ZCNXG5cdFx0XHQubG9hZERpY3QoJ3dpbGRjYXJkJywgJ1dJTERDQVJEJywgdHJ1ZSkgICAvLyDpgJrphY3nrKZcblx0XHRcdC5sb2FkU3lub255bURpY3QoJ3N5bm9ueW0nKSAgIC8vIOWQjOS5ieivjVxuXHRcdFx0LmxvYWRTdG9wd29yZERpY3QoJ3N0b3B3b3JkJykgLy8g5YGc5q2i56ymXG5cblx0XHRcdC5sb2FkRGljdCgnbGF6eS9iYWR3b3JkJylcblx0XHRcdC5sb2FkRGljdCgnbGF6eS9kaWN0X3N5bm9ueW0nKVxuXG5cdFx0XHQubG9hZERpY3QoJ25hbWVzL2VuJylcblx0XHRcdC5sb2FkRGljdCgnbmFtZXMvanAnKVxuXHRcdFx0LmxvYWREaWN0KCdsYXp5L2luZGV4JylcblxuXHRcdDtcblxuXHRcdHRoaXMuaW5pdGVkID0gdHJ1ZTtcblxuXHRcdHJldHVybiB0aGlzO1xuXHRcdCovXG5cdH1cblxuXHQvKipcblx0ICog5q2k5Ye95pW45Y+q6ZyA5Z+36KGM5LiA5qyh77yM5Lim5LiU5LiA6Iis54uA5rOB5LiL5LiN6ZyA6KaB5omL5YuV5ZG85Y+rXG5cdCAqL1xuXHRhdXRvSW5pdChvcHRpb25zPzoge1xuXHRcdGFsbF9tb2Q/OiBib29sZWFuLFxuXHR9KVxuXHR7XG5cdFx0aWYgKCF0aGlzLmluaXRlZClcblx0XHR7XG5cdFx0XHR0aGlzLmluaXRlZCA9IHRydWU7XG5cblx0XHRcdGlmICghdGhpcy5tb2R1bGVzLnRva2VuaXplci5sZW5ndGgpXG5cdFx0XHR7XG5cdFx0XHRcdHRoaXMudXNlRGVmYXVsdChvcHRpb25zKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdGdldE9wdGlvbnNEb1NlZ21lbnQ8VCBleHRlbmRzIElPcHRpb25zRG9TZWdtZW50PihvcHRpb25zPzogVCk6IFRcblx0e1xuXHRcdHJldHVybiBPYmplY3QuYXNzaWduKHt9LFxuXHRcdFx0U2VnbWVudC5kZWZhdWx0T3B0aW9uc0RvU2VnbWVudCxcblx0XHRcdHRoaXMub3B0aW9ucy5vcHRpb25zRG9TZWdtZW50LFxuXHRcdFx0b3B0aW9ucyxcblx0XHQpO1xuXHR9XG5cblx0cHJvdGVjdGVkIF9nZXRfdGV4dCh0ZXh0OiBzdHJpbmcgfCBCdWZmZXIpOiBzdHJpbmdcblx0e1xuXHRcdHRyeVxuXHRcdHtcblx0XHRcdGlmIChCdWZmZXIuaXNCdWZmZXIodGV4dCkpXG5cdFx0XHR7XG5cdFx0XHRcdHRleHQgPSB0ZXh0LnRvU3RyaW5nKCk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGNhdGNoIChlKVxuXHRcdHt9XG5cdFx0ZmluYWxseVxuXHRcdHtcblx0XHRcdGlmICh0eXBlb2YgdGV4dCAhPSAnc3RyaW5nJylcblx0XHRcdHtcblx0XHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcihgdGV4dCBtdXN0IGlzIHN0cmluZyBvciBCdWZmZXJgKVxuXHRcdFx0fVxuXG5cdFx0XHR0ZXh0ID0gY3JsZih0ZXh0KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGV4dDtcblx0fVxuXG5cdC8qKlxuXHQgKiByZW1vdmUga2V5IGluIFRBQkxFIGJ5IEJMQUNLTElTVFxuXHQgKi9cblx0ZG9CbGFja2xpc3QoKVxuXHR7XG5cdFx0bGV0IG1lID0gdGhpcztcblxuXHRcdHRoaXMuYXV0b0luaXQodGhpcy5vcHRpb25zKTtcblxuXHRcdGNvbnN0IEJMQUNLTElTVCA9IG1lLmdldERpY3QoJ0JMQUNLTElTVCcpO1xuXHRcdGNvbnN0IFRBQkxFID0gbWUuZ2V0RGljdERhdGFiYXNlKCdUQUJMRScpO1xuXG5cdFx0T2JqZWN0LmVudHJpZXMoQkxBQ0tMSVNUKVxuXHRcdFx0LmZvckVhY2goZnVuY3Rpb24gKFtrZXksIGJvb2xdKVxuXHRcdFx0e1xuXHRcdFx0XHRib29sICYmIFRBQkxFLnJlbW92ZShrZXkpXG5cdFx0XHR9KVxuXHRcdDtcblxuXHRcdHJldHVybiB0aGlzXG5cdH1cblxuXHQvKipcblx0ICog5byA5aeL5YiG6K+NXG5cdCAqXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSB0ZXh0IOaWh+acrFxuXHQgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyDpgInpoblcblx0ICogICAtIHtCb29sZWFufSBzaW1wbGUg5piv5ZCm5LuF6L+U5Zue5Y2V6K+N5YaF5a65XG5cdCAqICAgLSB7Qm9vbGVhbn0gc3RyaXBQdW5jdHVhdGlvbiDljrvpmaTmoIfngrnnrKblj7dcblx0ICogICAtIHtCb29sZWFufSBjb252ZXJ0U3lub255bSDovazmjaLlkIzkuYnor41cblx0ICogICAtIHtCb29sZWFufSBzdHJpcFN0b3B3b3JkIOWOu+mZpOWBnOatouesplxuXHQgKiBAcmV0dXJuIHtBcnJheX1cblx0ICovXG5cdGRvU2VnbWVudCh0ZXh0OiBzdHJpbmcgfCBCdWZmZXIsIG9wdGlvbnM6IElPcHRpb25zRG9TZWdtZW50ICYge1xuXHRcdHNpbXBsZTogdHJ1ZSxcblx0fSk6IHN0cmluZ1tdXG5cdGRvU2VnbWVudCh0ZXh0OiBzdHJpbmcgfCBCdWZmZXIsIG9wdGlvbnM/OiBJT3B0aW9uc0RvU2VnbWVudCk6IElXb3JkW11cblx0ZG9TZWdtZW50KHRleHQsIG9wdGlvbnM6IElPcHRpb25zRG9TZWdtZW50ID0ge30pXG5cdHtcblx0XHRsZXQgbWUgPSB0aGlzO1xuXG5cdFx0b3B0aW9ucyA9IHRoaXMuZ2V0T3B0aW9uc0RvU2VnbWVudChvcHRpb25zKTtcblxuXHRcdHRoaXMuYXV0b0luaXQodGhpcy5vcHRpb25zKTtcblxuXHRcdGxldCB0ZXh0X2xpc3QgPSB0aGlzLl9nZXRfdGV4dCh0ZXh0KVxuXHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0LnNwbGl0KHRoaXMuU1BMSVQpXG5cdFx0O1xuXHRcdHRleHQgPSB1bmRlZmluZWQ7XG5cblx0XHQvLyDlsIbmlofmnKzmjInnhafmjaLooYznrKbliIblibLmiJDlpJrmrrXvvIzlubbpgJDkuIDliIbor41cblx0XHRsZXQgcmV0ID0gdGV4dF9saXN0LnJlZHVjZShmdW5jdGlvbiAocmV0LCBzZWN0aW9uKVxuXHRcdHtcblx0XHRcdC8vY29uc29sZS5kaXIoc2VjdGlvbik7XG5cblx0XHRcdGlmIChtZS5TUExJVF9GSUxURVIudGVzdChzZWN0aW9uKSlcblx0XHRcdHtcblx0XHRcdFx0cmV0ID0gcmV0LmNvbmNhdCh7IHc6IHNlY3Rpb24gfSk7XG5cblx0XHRcdFx0c2VjdGlvbiA9IFtdO1xuXHRcdFx0fVxuXG5cdFx0XHQvL3NlY3Rpb24gPSBzZWN0aW9uLnRyaW0oKTtcblx0XHRcdGlmIChzZWN0aW9uLmxlbmd0aCA+IDApXG5cdFx0XHR7XG5cdFx0XHRcdC8vIOWIhuivjVxuXHRcdFx0XHRsZXQgc3JldCA9IG1lLnRva2VuaXplci5zcGxpdChzZWN0aW9uLCBtZS5tb2R1bGVzLnRva2VuaXplcik7XG5cblx0XHRcdFx0Ly8g5LyY5YyWXG5cdFx0XHRcdHNyZXQgPSBtZS5vcHRpbWl6ZXIuZG9PcHRpbWl6ZShzcmV0LCBtZS5tb2R1bGVzLm9wdGltaXplcik7XG5cblx0XHRcdFx0Ly8g6L+e5o6l5YiG6K+N57uT5p6cXG5cdFx0XHRcdGlmIChzcmV0Lmxlbmd0aCA+IDApXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXQgPSByZXQuY29uY2F0KHNyZXQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiByZXQ7XG5cdFx0fSwgW10pO1xuXG5cdFx0Ly8g5Y676Zmk5qCH54K556ym5Y+3XG5cdFx0aWYgKG9wdGlvbnMuc3RyaXBQdW5jdHVhdGlvbilcblx0XHR7XG5cdFx0XHRyZXQgPSByZXQuZmlsdGVyKGZ1bmN0aW9uIChpdGVtKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gaXRlbS5wICE9PSBQT1NUQUcuRF9XO1xuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0aWYgKG9wdGlvbnMuY29udmVydFN5bm9ueW0pXG5cdFx0e1xuXHRcdFx0cmV0ID0gdGhpcy5jb252ZXJ0U3lub255bShyZXQpO1xuXHRcdH1cblxuXHRcdC8qXG5cdFx0Ly8g6L2s5o2i5ZCM5LmJ6K+NXG5cdFx0ZnVuY3Rpb24gY29udmVydFN5bm9ueW0obGlzdClcblx0XHR7XG5cdFx0XHRsZXQgY291bnQgPSAwO1xuXHRcdFx0bGV0IFRBQkxFID0gbWUuZ2V0RGljdCgnU1lOT05ZTScpO1xuXHRcdFx0bGlzdCA9IGxpc3QubWFwKGZ1bmN0aW9uIChpdGVtKVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAoaXRlbS53IGluIFRBQkxFKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Y291bnQrKztcblx0XHRcdFx0XHQvL3JldHVybiB7IHc6IFRBQkxFW2l0ZW0ud10sIHA6IGl0ZW0ucCB9O1xuXG5cdFx0XHRcdFx0aXRlbS5vdyA9IGl0ZW0udztcblx0XHRcdFx0XHRpdGVtLncgPSBUQUJMRVtpdGVtLnddO1xuXG5cdFx0XHRcdFx0cmV0dXJuIGl0ZW07XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cmV0dXJuIGl0ZW07XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdFx0cmV0dXJuIHsgY291bnQ6IGNvdW50LCBsaXN0OiBsaXN0IH07XG5cdFx0fVxuXG5cdFx0aWYgKG9wdGlvbnMuY29udmVydFN5bm9ueW0pXG5cdFx0e1xuXHRcdFx0bGV0IHJlc3VsdDtcblx0XHRcdGRvXG5cdFx0XHR7XG5cdFx0XHRcdHJlc3VsdCA9IGNvbnZlcnRTeW5vbnltKHJldCk7XG5cdFx0XHRcdHJldCA9IHJlc3VsdC5saXN0O1xuXHRcdFx0fVxuXHRcdFx0d2hpbGUgKHJlc3VsdC5jb3VudCA+IDApO1xuXHRcdH1cblx0XHQqL1xuXG5cdFx0Ly8g5Y676Zmk5YGc5q2i56ymXG5cdFx0aWYgKG9wdGlvbnMuc3RyaXBTdG9wd29yZClcblx0XHR7XG5cdFx0XHRsZXQgU1RPUFdPUkQgPSBtZS5nZXREaWN0KCdTVE9QV09SRCcpO1xuXHRcdFx0cmV0ID0gcmV0LmZpbHRlcihmdW5jdGlvbiAoaXRlbSlcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuICEoaXRlbS53IGluIFNUT1BXT1JEKTtcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdGlmIChvcHRpb25zLnN0cmlwU3BhY2UpXG5cdFx0e1xuXHRcdFx0cmV0ID0gcmV0LmZpbHRlcihmdW5jdGlvbiAoaXRlbSlcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuICEvXlxccyskL2cudGVzdChpdGVtLncpO1xuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0Ly8g5LuF6L+U5Zue5Y2V6K+N5YaF5a65XG5cdFx0aWYgKG9wdGlvbnMuc2ltcGxlKVxuXHRcdHtcblx0XHRcdHJldCA9IHJldC5tYXAoZnVuY3Rpb24gKGl0ZW0pXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiBpdGVtLnc7XG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gcmV0O1xuXHR9XG5cblx0LyoqXG5cdCAqIOi9rOaNouWQjOS5ieivjVxuXHQgKi9cblx0Y29udmVydFN5bm9ueW0ocmV0OiBJV29yZERlYnVnW10sIHNob3djb3VudDogdHJ1ZSk6IHsgY291bnQ6IG51bWJlciwgbGlzdDogSVdvcmREZWJ1Z1tdIH1cblx0Y29udmVydFN5bm9ueW0ocmV0OiBJV29yZERlYnVnW10sIHNob3djb3VudD86IGJvb2xlYW4pOiBJV29yZERlYnVnW11cblx0Y29udmVydFN5bm9ueW0ocmV0OiBJV29yZERlYnVnW10sIHNob3djb3VudD86IGJvb2xlYW4pXG5cdHtcblx0XHRjb25zdCBtZSA9IHRoaXM7XG5cdFx0bGV0IFRBQkxFID0gbWUuZ2V0RGljdCgnU1lOT05ZTScpO1xuXHRcdGxldCBUQUJMRURJQ1QgPSBtZS5nZXREaWN0KCdUQUJMRScpO1xuXG5cdFx0bGV0IHRvdGFsX2NvdW50ID0gMDtcblxuXHRcdGNvbnN0IFJBVyA9IFN5bWJvbC5mb3IoJ1JBVycpO1xuXG5cdFx0Ly8g6L2s5o2i5ZCM5LmJ6K+NXG5cdFx0ZnVuY3Rpb24gX2NvbnZlcnRTeW5vbnltKGxpc3Q6IElXb3JkRGVidWdbXSlcblx0XHR7XG5cdFx0XHRsZXQgY291bnQgPSAwO1xuXHRcdFx0bGlzdCA9IGxpc3QucmVkdWNlKGZ1bmN0aW9uIChhLCBpdGVtOiBJV29yZERlYnVnKVxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgYm9vbDogYm9vbGVhbjtcblx0XHRcdFx0bGV0IHcgPSBpdGVtLnc7XG5cdFx0XHRcdGxldCBudzogc3RyaW5nO1xuXG5cdFx0XHRcdGxldCBkZWJ1ZyA9IGRlYnVnVG9rZW4oaXRlbSk7XG5cblx0XHRcdFx0aWYgKHcgaW4gVEFCTEUpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRib29sID0gdHJ1ZTtcblx0XHRcdFx0XHRudyA9IFRBQkxFW3ddO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2UgaWYgKGRlYnVnLmF1dG9DcmVhdGUgJiYgIWRlYnVnLmNvbnZlcnRTeW5vbnltICYmICFpdGVtLm93ICYmIGl0ZW0ubSAmJiBpdGVtLm0ubGVuZ3RoKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bncgPSBpdGVtLm0ucmVkdWNlKGZ1bmN0aW9uIChhOiBzdHJpbmdbXSwgYilcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRpZiAodHlwZW9mIGIgPT0gJ3N0cmluZycpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGEucHVzaChiKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGVsc2UgaWYgKGIudyBpbiBUQUJMRSlcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0YS5wdXNoKFRBQkxFW2Iud10pO1xuXHRcdFx0XHRcdFx0XHRib29sID0gdHJ1ZTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0YS5wdXNoKGIudyk7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdHJldHVybiBhO1xuXHRcdFx0XHRcdH0sIFtdKS5qb2luKCcnKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmIChib29sKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Y291bnQrKztcblx0XHRcdFx0XHR0b3RhbF9jb3VudCsrO1xuXHRcdFx0XHRcdC8vcmV0dXJuIHsgdzogVEFCTEVbaXRlbS53XSwgcDogaXRlbS5wIH07XG5cblx0XHRcdFx0XHRsZXQgcCA9IGl0ZW0ucDtcblxuXHRcdFx0XHRcdGlmICh3IGluIFRBQkxFRElDVClcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRwID0gVEFCTEVESUNUW3ddLnAgfHwgcDtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZiAocCAmIG1lLlBPU1RBRy5CQUQpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0cCA9IHAgXiBtZS5QT1NUQUcuQkFEO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGxldCBpdGVtX25ldyA9IGRlYnVnVG9rZW4oe1xuXHRcdFx0XHRcdFx0Li4uaXRlbSxcblxuXHRcdFx0XHRcdFx0dzogbncsXG5cdFx0XHRcdFx0XHRvdzogdyxcblx0XHRcdFx0XHRcdHAsXG5cdFx0XHRcdFx0XHRvcDogaXRlbS5wLFxuXG5cdFx0XHRcdFx0XHQvL1tSQVddOiBpdGVtLFxuXG5cdFx0XHRcdFx0XHQvL3NvdXJjZTogaXRlbSxcblx0XHRcdFx0XHR9LCB7XG5cdFx0XHRcdFx0XHRjb252ZXJ0U3lub255bTogdHJ1ZSxcblx0XHRcdFx0XHRcdC8vX3NvdXJjZTogaXRlbSxcblxuXHRcdFx0XHRcdFx0LyoqXG5cdFx0XHRcdFx0XHQgKiBKU09OLnN0cmluZ2lmeVxuXHRcdFx0XHRcdFx0ICogYXZvaWQgVHlwZUVycm9yOiBDb252ZXJ0aW5nIGNpcmN1bGFyIHN0cnVjdHVyZSB0byBKU09OXG5cdFx0XHRcdFx0XHQgKi9cblx0XHRcdFx0XHRcdF9zb3VyY2U6IGRlZXBtZXJnZSh7fSwgaXRlbSkgYXMgSVdvcmREZWJ1ZyxcblxuXHRcdFx0XHRcdH0sIHRydWUpO1xuXG5cdFx0XHRcdFx0YS5wdXNoKGl0ZW1fbmV3KTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRhLnB1c2goaXRlbSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gYTtcblx0XHRcdH0sIFtdKTtcblx0XHRcdHJldHVybiB7IGNvdW50OiBjb3VudCwgbGlzdDogbGlzdCB9O1xuXHRcdH1cblxuXHRcdGxldCByZXN1bHQ6IHsgY291bnQ6IG51bWJlciwgbGlzdDogSVdvcmREZWJ1Z1tdIH07XG5cdFx0ZG9cblx0XHR7XG5cdFx0XHRyZXN1bHQgPSBfY29udmVydFN5bm9ueW0ocmV0KTtcblx0XHRcdHJldCA9IHJlc3VsdC5saXN0O1xuXHRcdH1cblx0XHR3aGlsZSAocmVzdWx0LmNvdW50ID4gMCk7XG5cblx0XHRpZiAoc2hvd2NvdW50KVxuXHRcdHtcblx0XHRcdHJldHVybiB7IGNvdW50OiB0b3RhbF9jb3VudCwgbGlzdDogcmV0IH07XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHJldDtcblx0fVxuXG5cdC8qKlxuXHQgKiDlsIbljZXor43mlbDnu4Tov57mjqXmiJDlrZfnrKbkuLJcblx0ICpcblx0ICogQHBhcmFtIHtBcnJheX0gd29yZHMg5Y2V6K+N5pWw57uEXG5cdCAqIEByZXR1cm4ge1N0cmluZ31cblx0ICovXG5cdHN0cmluZ2lmeSh3b3JkczogQXJyYXk8SVdvcmQgfCBzdHJpbmc+LCAuLi5hcmd2KTogc3RyaW5nXG5cdHtcblx0XHRyZXR1cm4gU2VnbWVudC5zdHJpbmdpZnkod29yZHMsIC4uLmFyZ3YpO1xuXHR9XG5cblx0c3RhdGljIHN0cmluZ2lmeSh3b3JkczogQXJyYXk8SVdvcmQgfCBzdHJpbmc+LCAuLi5hcmd2KTogc3RyaW5nXG5cdHtcblx0XHRyZXR1cm4gd29yZHMubWFwKGZ1bmN0aW9uIChpdGVtKVxuXHRcdHtcblx0XHRcdGlmICh0eXBlb2YgaXRlbSA9PT0gJ3N0cmluZycpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiBpdGVtO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAoJ3cnIGluIGl0ZW0pXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiBpdGVtLnc7XG5cdFx0XHR9XG5cdFx0XHRlbHNlXG5cdFx0XHR7XG5cdFx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IoYG5vdCBhIHZhbGlkIHNlZ21lbnQgcmVzdWx0IGxpc3RgKVxuXHRcdFx0fVxuXHRcdH0pLmpvaW4oJycpO1xuXHR9XG5cblx0LyoqXG5cdCAqIOagueaNruafkOS4quWNleivjeaIluivjeaAp+adpeWIhuWJsuWNleivjeaVsOe7hFxuXHQgKlxuXHQgKiBAcGFyYW0ge0FycmF5fSB3b3JkcyDljZXor43mlbDnu4Rcblx0ICogQHBhcmFtIHtOdW1iZXJ8U3RyaW5nfSBzIOeUqOS6juWIhuWJsueahOWNleivjeaIluivjeaAp1xuXHQgKiBAcmV0dXJuIHtBcnJheX1cblx0ICovXG5cdHNwbGl0KHdvcmRzOiBJV29yZFtdLCBzOiBzdHJpbmcgfCBudW1iZXIpOiBJV29yZFtdXG5cdHtcblx0XHRsZXQgcmV0ID0gW107XG5cdFx0bGV0IGxhc3RpID0gMDtcblx0XHRsZXQgaSA9IDA7XG5cdFx0bGV0IGYgPSB0eXBlb2YgcyA9PT0gJ3N0cmluZycgPyAndycgOiAncCc7XG5cblx0XHR3aGlsZSAoaSA8IHdvcmRzLmxlbmd0aClcblx0XHR7XG5cdFx0XHRpZiAod29yZHNbaV1bZl0gPT0gcylcblx0XHRcdHtcblx0XHRcdFx0aWYgKGxhc3RpIDwgaSkgcmV0LnB1c2god29yZHMuc2xpY2UobGFzdGksIGkpKTtcblx0XHRcdFx0cmV0LnB1c2god29yZHMuc2xpY2UoaSwgaSArIDEpKTtcblx0XHRcdFx0aSsrO1xuXHRcdFx0XHRsYXN0aSA9IGk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlXG5cdFx0XHR7XG5cdFx0XHRcdGkrKztcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYgKGxhc3RpIDwgd29yZHMubGVuZ3RoIC0gMSlcblx0XHR7XG5cdFx0XHRyZXQucHVzaCh3b3Jkcy5zbGljZShsYXN0aSwgd29yZHMubGVuZ3RoKSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHJldDtcblx0fVxuXG5cdC8qKlxuXHQgKiDlnKjljZXor43mlbDnu4TkuK3mn6Xmib7mn5DkuIDkuKrljZXor43miJbor43mgKfmiYDlnKjnmoTkvY3nva5cblx0ICpcblx0ICogQHBhcmFtIHtBcnJheX0gd29yZHMg5Y2V6K+N5pWw57uEXG5cdCAqIEBwYXJhbSB7TnVtYmVyfFN0cmluZ30gcyDopoHmn6Xmib7nmoTljZXor43miJbor43mgKdcblx0ICogQHBhcmFtIHtOdW1iZXJ9IGN1ciDlvIDlp4vkvY3nva5cblx0ICogQHJldHVybiB7TnVtYmVyfSDmib7kuI3liLDvvIzov5Tlm54tMVxuXHQgKi9cblx0aW5kZXhPZih3b3JkczogSVdvcmRbXSwgczogc3RyaW5nIHwgbnVtYmVyLCBjdXI/OiBudW1iZXIpXG5cdHtcblx0XHRjdXIgPSBpc05hTihjdXIpID8gMCA6IGN1cjtcblx0XHRsZXQgZiA9IHR5cGVvZiBzID09PSAnc3RyaW5nJyA/ICd3JyA6ICdwJztcblxuXHRcdHdoaWxlIChjdXIgPCB3b3Jkcy5sZW5ndGgpXG5cdFx0e1xuXHRcdFx0aWYgKHdvcmRzW2N1cl1bZl0gPT0gcykgcmV0dXJuIGN1cjtcblx0XHRcdGN1cisrO1xuXHRcdH1cblxuXHRcdHJldHVybiAtMTtcblx0fVxufVxuXG5leHBvcnQgbmFtZXNwYWNlIFNlZ21lbnRcbntcblxuXHRleHBvcnQgdHlwZSBJU1BMSVQgPSBSZWdFeHAgfCBzdHJpbmcgfCB7XG5cdFx0W1N5bWJvbC5zcGxpdF0oaW5wdXQ6IHN0cmluZywgbGltaXQ/OiBudW1iZXIpOiBzdHJpbmdbXSxcblx0fTtcblxuXHRleHBvcnQgdHlwZSBJU1BMSVRfRklMVEVSID0gUmVnRXhwIHwge1xuXHRcdHRlc3QoaW5wdXQ6IHN0cmluZyk6IGJvb2xlYW4sXG5cdH07XG5cblx0ZXhwb3J0IGludGVyZmFjZSBJRElDVDxUID0gYW55PlxuXHR7XG5cdFx0W2tleTogc3RyaW5nXTogVCxcblx0fVxuXG5cdGV4cG9ydCBpbnRlcmZhY2UgSURJQ1QyPFQgPSBhbnk+XG5cdHtcblx0XHRba2V5OiBudW1iZXJdOiBJRElDVDxUPixcblx0fVxuXG5cdGV4cG9ydCB0eXBlIElPcHRpb25zU2VnbWVudCA9IElPcHRpb25zVGFibGVEaWN0ICYge1xuXHRcdGRiPzogVGFibGVEaWN0W10sXG5cdFx0b3B0aW9uc0RvU2VnbWVudD86IElPcHRpb25zRG9TZWdtZW50LFxuXG5cdFx0YWxsX21vZD86IGJvb2xlYW4sXG5cblx0XHRtYXhDaHVua0NvdW50PzogbnVtYmVyLFxuXHR9O1xuXG5cdGV4cG9ydCB0eXBlIElESUNUX1NZTk9OWU0gPSBJRElDVDxzdHJpbmc+O1xuXHRleHBvcnQgdHlwZSBJRElDVF9TVE9QV09SRCA9IElESUNUPGJvb2xlYW4+O1xuXG5cdGV4cG9ydCBpbnRlcmZhY2UgSVdvcmRcblx0e1xuXHRcdHc6IHN0cmluZyxcblx0XHQvKipcblx0XHQgKiDoqZ7mgKdcblx0XHQgKi9cblx0XHRwPzogbnVtYmVyLFxuXHRcdC8qKlxuXHRcdCAqIOipnuaAp+WQjeeosVxuXHRcdCAqL1xuXHRcdHBzPzogc3RyaW5nLFxuXHRcdHBwPzogc3RyaW5nLFxuXHRcdC8qKlxuXHRcdCAqIOasiumHjVxuXHRcdCAqL1xuXHRcdGY/OiBudW1iZXIsXG5cdFx0LyoqXG5cdFx0ICog5byA5aeL5L2N572uXG5cdFx0ICovXG5cdFx0Yz86IG51bWJlcixcblx0XHQvKipcblx0XHQgKiDlkIjkvbXpoIXnm65cblx0XHQgKi9cblx0XHRtPzogQXJyYXk8SVdvcmQgfCBzdHJpbmc+LFxuXG5cdFx0Ly9jb252ZXJ0U3lub255bT86IGJvb2xlYW4sXG5cdFx0Ly9hdXRvQ3JlYXRlPzogYm9vbGVhbixcblxuXHRcdC8qKlxuXHRcdCAqIOS7o+ihqOWOn+eUn+WtmOWcqOaWvOWtl+WFuOWFp+eahOmgheebrlxuXHRcdCAqL1xuXHRcdHM/OiBib29sZWFuLFxuXHRcdG9zPzogYm9vbGVhbixcblx0fVxuXG5cdGV4cG9ydCBpbnRlcmZhY2UgSU9wdGlvbnNEb1NlZ21lbnRcblx0e1xuXHRcdC8qKlxuXHRcdCAqIOS4jei/lOWbnuivjeaAp1xuXHRcdCAqL1xuXHRcdHNpbXBsZT86IGJvb2xlYW4sXG5cblx0XHQvKipcblx0XHQgKiDljrvpmaTmoIfngrnnrKblj7dcblx0XHQgKi9cblx0XHRzdHJpcFB1bmN0dWF0aW9uPzogYm9vbGVhbixcblxuXHRcdC8qKlxuXHRcdCAqIOi9rOaNouWQjOS5ieivjVxuXHRcdCAqL1xuXHRcdGNvbnZlcnRTeW5vbnltPzogYm9vbGVhbixcblxuXHRcdC8qKlxuXHRcdCAqIOWOu+mZpOWBnOatouesplxuXHRcdCAqL1xuXHRcdHN0cmlwU3RvcHdvcmQ/OiBib29sZWFuLFxuXG5cdFx0c3RyaXBTcGFjZT86IGJvb2xlYW4sXG5cdH1cbn1cblxuZXhwb3J0IGltcG9ydCBJT3B0aW9uc1NlZ21lbnQgPSBTZWdtZW50LklPcHRpb25zU2VnbWVudDtcbmV4cG9ydCBpbXBvcnQgSVdvcmQgPSBTZWdtZW50LklXb3JkO1xuZXhwb3J0IGltcG9ydCBJT3B0aW9uc0RvU2VnbWVudCA9IFNlZ21lbnQuSU9wdGlvbnNEb1NlZ21lbnQ7XG5leHBvcnQgaW1wb3J0IElESUNUX1NZTk9OWU0gPSBTZWdtZW50LklESUNUX1NZTk9OWU07XG5leHBvcnQgaW1wb3J0IElESUNUX1NUT1BXT1JEID0gU2VnbWVudC5JRElDVF9TVE9QV09SRDtcblxuZXhwb3J0IGltcG9ydCBJRElDVCA9IFNlZ21lbnQuSURJQ1Q7XG5leHBvcnQgaW1wb3J0IElESUNUMiA9IFNlZ21lbnQuSURJQ1QyO1xuXG5leHBvcnQgaW1wb3J0IElTUExJVCA9IFNlZ21lbnQuSVNQTElUO1xuZXhwb3J0IGltcG9ydCBJU1BMSVRfRklMVEVSID0gU2VnbWVudC5JU1BMSVRfRklMVEVSO1xuXG5leHBvcnQgZGVmYXVsdCBTZWdtZW50O1xuIl19