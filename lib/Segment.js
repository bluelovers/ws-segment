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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2VnbWVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIlNlZ21lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7R0FJRztBQUVILFlBQVksQ0FBQzs7QUFJYixhQUFhO0FBQ2IsNkJBQTZCO0FBQzdCLGtDQUEyRDtBQUMzRCxtQ0FBcUM7QUFDckMscUNBQThCO0FBQzlCLGlEQUFtRDtBQUVuRCx1Q0FBdUY7QUFFdkYscUNBQThCO0FBQzlCLG1EQUEwQztBQUMxQywrQ0FBcUQ7QUFDckQsNkNBQStDO0FBRS9DLCtDQUF1QztBQUN2QywrQkFBOEY7QUFDOUYsd0NBQTBDO0FBRzFDLHNEQUE4QztBQUU5Qyw0Q0FBNEM7QUFFNUM7O0dBRUc7QUFDSCxNQUFhLE9BQU87SUFpRW5CLFlBQVksVUFBMkIsRUFBRTtRQTVEekM7Ozs7Ozs7OztXQVNHO1FBQ0gsVUFBSyxHQUFXLHdDQUFrRCxDQUFDO1FBRW5FOzs7OztXQUtHO1FBQ0gsaUJBQVksR0FBa0IsY0FBK0IsQ0FBQztRQUU5RDs7O1dBR0c7UUFDSCxXQUFNLEdBQUcsZ0JBQU0sQ0FBQztRQUNoQjs7O1dBR0c7UUFDSCxTQUFJLEdBS0EsRUFBRSxDQUFDO1FBQ1AsWUFBTyxHQUFHO1lBQ1Q7O2VBRUc7WUFDSCxTQUFTLEVBQUUsRUFBRTtZQUNiOztlQUVHO1lBQ0gsU0FBUyxFQUFFLEVBQUU7U0FJYixDQUFDO1FBS0YsT0FBRSxHQUVFLEVBQUUsQ0FBQztRQUVQLFlBQU8sR0FBb0IsRUFBRSxDQUFDO1FBTTdCLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQztRQUVsQixJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFFeEQsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLGVBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNyQyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksZUFBUyxD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Q0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUM1QjtZQUNDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7U0FDM0M7UUFFRCxPQUFPLEdBQUcsQ0FBQztJQUNaLENBQUM7SUFFRDs7Ozs7OztPQU9HO0lBQ0gsT0FBTyxDQUFDLEtBQWMsRUFBRSxDQUFrQixFQUFFLEdBQVk7UUFFdkQsR0FBRyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7UUFDM0IsSUFBSSxDQUFDLEdBQUcsT0FBTyxDQUFDLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztRQUUxQyxPQUFPLEdBQUcsR0FBRyxLQUFLLENBQUMsTUFBTSxFQUN6QjtZQUNDLElBQUksS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7Z0JBQUUsT0FBTyxHQUFHLENBQUM7WUFDbkMsR0FBRyxFQUFFLENBQUM7U0FDTjtRQUVELE9BQU8sQ0FBQyxDQUFDLENBQUM7SUFDWCxDQUFDOztBQXQ3Qk0sK0JBQXVCLEdBQXNCLEVBQUUsQ0FBQztBQUh4RCwwQkEwN0JDO0FBNEdELGtCQUFlLE9BQU8sQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICog5YiG6K+N5Zmo5o6l5Y+jXG4gKlxuICogQGF1dGhvciDogIHpm7c8bGVpem9uZ21pbkBnbWFpbC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG4vLyBAdHMtaWdub3JlXG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG4vLyBAdHMtaWdub3JlXG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgc2VhcmNoRmlyc3RTeW5jLCBzZWFyY2hHbG9iU3luYyB9IGZyb20gJy4vZnMvZ2V0JztcbmltcG9ydCB7IHVzZURlZmF1bHQgfSBmcm9tICcuL2luZGV4JztcbmltcG9ydCBQT1NUQUcgZnJvbSAnLi9QT1NUQUcnO1xuaW1wb3J0IFRhYmxlRGljdEJsYWNrbGlzdCBmcm9tICcuL3RhYmxlL2JsYWNrbGlzdCc7XG5pbXBvcnQgQWJzdHJhY3RUYWJsZURpY3RDb3JlIGZyb20gJy4vdGFibGUvY29yZSc7XG5pbXBvcnQgeyBUYWJsZURpY3QsIElPcHRpb25zIGFzIElPcHRpb25zVGFibGVEaWN0LCBJVGFibGVEaWN0Um93IH0gZnJvbSAnLi90YWJsZS9kaWN0JztcblxuaW1wb3J0IExvYWRlciBmcm9tICcuL2xvYWRlcic7XG5pbXBvcnQgeyBjcmxmLCBMRiB9IGZyb20gJ2NybGYtbm9ybWFsaXplJztcbmltcG9ydCB7IFRhYmxlRGljdFN0b3B3b3JkIH0gZnJvbSAnLi90YWJsZS9zdG9wd29yZCc7XG5pbXBvcnQgVGFibGVEaWN0U3lub255bSBmcm9tICcuL3RhYmxlL3N5bm9ueW0nO1xuaW1wb3J0IHsgZGVidWcsIElXb3JkRGVidWdJbmZvIH0gZnJvbSAnLi91dGlsJztcbmltcG9ydCBTZWdtZW50RGljdCBmcm9tICdzZWdtZW50LWRpY3QnO1xuaW1wb3J0IGdldERlZmF1bHRNb2RMaXN0LCB7IE9wdGltaXplciwgSVN1Yk9wdGltaXplciwgVG9rZW5pemVyLCBJU3ViVG9rZW5pemVyIH0gZnJvbSAnLi9tb2QnO1xuaW1wb3J0IHsgZGVidWdUb2tlbiB9IGZyb20gJy4vdXRpbC9kZWJ1Zyc7XG5pbXBvcnQgeyBJV29yZERlYnVnIH0gZnJvbSAnLi91dGlsL2luZGV4JztcblxuaW1wb3J0IFByb2plY3RDb25maWcgZnJvbSAnLi4vcHJvamVjdC5jb25maWcnO1xuXG5pbXBvcnQgKiBhcyBkZWVwbWVyZ2UgZnJvbSAnZGVlcG1lcmdlLXBsdXMnO1xuXG4vKipcbiAqIOWIm+W7uuWIhuivjeWZqOaOpeWPo1xuICovXG5leHBvcnQgY2xhc3MgU2VnbWVudFxue1xuXG5cdHN0YXRpYyBkZWZhdWx0T3B0aW9uc0RvU2VnbWVudDogSU9wdGlvbnNEb1NlZ21lbnQgPSB7fTtcblxuXHQvKipcblx0ICog5YiG5q61XG5cdCAqXG5cdCAqIOeUseaWvCBzZWdtZW50IOaYr+WIqeeUqOWwjeWFp+WuueeahOWJjeW+jOaWh+WIhuaekOS+humAsuihjOWIhuipnlxuXHQgKiDmiYDku6XlpoLkvZXliIflibLmrrXokL3lsI3mlrzntZDmnpzlsLHmnIPnlKLnlJ/kuI3lkIzlvbHpn79cblx0ICpcblx0ICogYFJlZ0V4cGAgb3Ig5YW35pyJIGAuW1N5bWJvbC5zcGxpdF0oaW5wdXQ6IHN0cmluZywgbGltaXQ/OiBudW1iZXIpID0+IHN0cmluZ1tdYCDnmoTnianku7Zcblx0ICpcblx0ICogQHR5cGUge1NlZ21lbnQuSVNQTElUfVxuXHQgKi9cblx0U1BMSVQ6IElTUExJVCA9IC8oW1xcclxcbl0rfF5b44CAXFxzK10rfFvjgIBcXHNdKyR8W+OAgFxcc117Mix9KS9nbSBhcyBJU1BMSVQ7XG5cblx0LyoqXG5cdCAqIOWIhuauteS5i+W+jCDlpoLmnpznrKblkIjku6XkuIvmop3ku7Yg5YmH55u05o6l5b+955Wl5YiG5p6QXG5cdCAqIGBSZWdFeHBgIG9yIOWFt+aciSBgLnRlc3QoaW5wdXQ6IHN0cmluZykgPT4gYm9vbGVhbmAg55qE54mp5Lu2XG5cdCAqXG5cdCAqIEB0eXBlIHtTZWdtZW50LklTUExJVF9GSUxURVJ9XG5cdCAqL1xuXHRTUExJVF9GSUxURVI6IElTUExJVF9GSUxURVIgPSAvXihbXFxyXFxuXSspJC9nIGFzIElTUExJVF9GSUxURVI7XG5cblx0LyoqXG5cdCAqIOivjeaAp1xuXHQgKiBAdHlwZSB7UE9TVEFHfVxuXHQgKi9cblx0UE9TVEFHID0gUE9TVEFHO1xuXHQvKipcblx0ICog6K+N5YW46KGoXG5cdCAqIEB0eXBlIHt7fX1cblx0ICovXG5cdERJQ1Q6IHtcblx0XHRTVE9QV09SRD86IElESUNUX1NUT1BXT1JELFxuXHRcdFNZTk9OWU0/OiBJRElDVF9TWU5PTllNLFxuXG5cdFx0W2tleTogc3RyaW5nXTogSURJQ1QsXG5cdH0gPSB7fTtcblx0bW9kdWxlcyA9IHtcblx0XHQvKipcblx0XHQgKiDliIbor43mqKHlnZdcblx0XHQgKi9cblx0XHR0b2tlbml6ZXI6IFtdLFxuXHRcdC8qKlxuXHRcdCAqIOS8mOWMluaooeWdl1xuXHRcdCAqL1xuXHRcdG9wdGltaXplcjogW10sXG5cdH0gYXMge1xuXHRcdHRva2VuaXplcjogSVN1YlRva2VuaXplcltdLFxuXHRcdG9wdGltaXplcjogSVN1Yk9wdGltaXplcltdLFxuXHR9O1xuXG5cdHRva2VuaXplcjogVG9rZW5pemVyO1xuXHRvcHRpbWl6ZXI6IE9wdGltaXplcjtcblxuXHRkYjoge1xuXHRcdFtrZXk6IHN0cmluZ106IFRhYmxlRGljdCxcblx0fSA9IHt9O1xuXG5cdG9wdGlvbnM6IElPcHRpb25zU2VnbWVudCA9IHt9O1xuXG5cdGluaXRlZD86IGJvb2xlYW47XG5cblx0Y29uc3RydWN0b3Iob3B0aW9uczogSU9wdGlvbnNTZWdtZW50ID0ge30pXG5cdHtcblx0XHRjb25zdCBzZWxmID0gdGhpcztcblxuXHRcdHRoaXMub3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMub3B0aW9ucywgb3B0aW9ucyk7XG5cblx0XHR0aGlzLnRva2VuaXplciA9IG5ldyBUb2tlbml6ZXIodGhpcyk7XG5cdFx0dGhpcy5vcHRpbWl6ZXIgPSBuZXcgT3B0aW1pemVyKHRoaXMpO1xuXG5cdFx0aWYgKHRoaXMub3B0aW9ucy5kYilcblx0XHR7XG5cdFx0XHR0aGlzLm9wdGlvbnMuZGIuZm9yRWFjaChmdW5jdGlvbiAoZGF0YSlcblx0XHRcdHtcblx0XHRcdFx0c2VsZi5kYltkYXRhLnR5cGVdID0gZGF0YTtcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdGRlbGV0ZSB0aGlzLm9wdGlvbnMuZGI7XG5cdH1cblxuXHRnZXREaWN0RGF0YWJhc2U8UiBleHRlbmRzIFRhYmxlRGljdFN5bm9ueW0+KHR5cGU6ICdTWU5PTllNJyxcblx0XHRhdXRvY3JlYXRlPzogYm9vbGVhbixcblx0XHRsaWJUYWJsZURpY3Q/OiB7IG5ldyguLi5hcmd2KTogUiB9LFxuXHQpOiBSXG5cdGdldERpY3REYXRhYmFzZTxSIGV4dGVuZHMgVGFibGVEaWN0Pih0eXBlOiAnVEFCTEUnLCBhdXRvY3JlYXRlPzogYm9vbGVhbiwgbGliVGFibGVEaWN0PzogeyBuZXcoLi4uYXJndik6IFIgfSk6IFJcblx0Z2V0RGljdERhdGFiYXNlPFIgZXh0ZW5kcyBUYWJsZURpY3RTdG9wd29yZD4odHlwZTogJ1NUT1BXT1JEJyxcblx0XHRhdXRvY3JlYXRlPzogYm9vbGVhbixcblx0XHRsaWJUYWJsZURpY3Q/OiB7IG5ldyguLi5hcmd2KTogUiB9LFxuXHQpOiBSXG5cdGdldERpY3REYXRhYmFzZTxSIGV4dGVuZHMgVGFibGVEaWN0QmxhY2tsaXN0Pih0eXBlOiAnQkxBQ0tMSVNUJyxcblx0XHRhdXRvY3JlYXRlPzogYm9vbGVhbixcblx0XHRsaWJUYWJsZURpY3Q/OiB7IG5ldyguLi5hcmd2KTogUiB9LFxuXHQpOiBSXG5cdGdldERpY3REYXRhYmFzZTxSIGV4dGVuZHMgQWJzdHJhY3RUYWJsZURpY3RDb3JlPGFueT4+KHR5cGU6IHN0cmluZyxcblx0XHRhdXRvY3JlYXRlPzogYm9vbGVhbixcblx0XHRsaWJUYWJsZURpY3Q/OiB7IG5ldyguLi5hcmd2KTogUiB9LFxuXHQpOiBSXG5cdGdldERpY3REYXRhYmFzZSh0eXBlOiBzdHJpbmcsIGF1dG9jcmVhdGU/OiBib29sZWFuLCBsaWJUYWJsZURpY3Q/KVxuXHR7XG5cdFx0aWYgKGF1dG9jcmVhdGUgJiYgIXRoaXMuZGJbdHlwZV0pXG5cdFx0e1xuXHRcdFx0aWYgKHR5cGUgPT0gVGFibGVEaWN0U3lub255bS50eXBlKVxuXHRcdFx0e1xuXHRcdFx0XHRsaWJUYWJsZURpY3QgPSBsaWJUYWJsZURpY3QgfHwgVGFibGVEaWN0U3lub255bTtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKHR5cGUgPT0gVGFibGVEaWN0U3RvcHdvcmQudHlwZSlcblx0XHRcdHtcblx0XHRcdFx0bGliVGFibGVEaWN0ID0gbGliVGFibGVEaWN0IHx8IFRhYmxlRGljdFN0b3B3b3JkO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAodHlwZSA9PSBUYWJsZURpY3RCbGFja2xpc3QudHlwZSlcblx0XHRcdHtcblx0XHRcdFx0bGliVGFibGVEaWN0ID0gbGliVGFibGVEaWN0IHx8IFRhYmxlRGljdFN0b3B3b3JkO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZVxuXHRcdFx0e1xuXHRcdFx0XHRsaWJUYWJsZURpY3QgPSBsaWJUYWJsZURpY3QgfHwgVGFibGVEaWN0O1xuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLmRiW3R5cGVdID0gbmV3IGxpYlRhYmxlRGljdCh0eXBlLCB0aGlzLm9wdGlvbnMsIHtcblx0XHRcdFx0VEFCTEU6IHRoaXMuRElDVFt0eXBlXSxcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRyZXR1cm4gdGhpcy5kYlt0eXBlXTtcblx0fVxuXG5cdC8qKlxuXHQgKiDovb3lhaXliIbor43mqKHlnZdcblx0ICpcblx0ICogQHBhcmFtIHtTdHJpbmd8QXJyYXl8T2JqZWN0fSBtb2R1bGUg5qih5Z2X5ZCN56ewKOaVsOe7hCnmiJbmqKHlnZflr7nosaFcblx0ICogQHJldHVybiB7U2VnbWVudH1cblx0ICovXG5cdHVzZShtb2Q6IElTdWJPcHRpbWl6ZXIsIC4uLmFyZ3YpXG5cdHVzZShtb2Q6IElTdWJUb2tlbml6ZXIsIC4uLmFyZ3YpXG5cdHVzZShtb2Q6IEFycmF5PElTdWJUb2tlbml6ZXIgfCBJU3ViT3B0aW1pemVyIHwgc3RyaW5nPiwgLi4uYXJndilcblx0dXNlKG1vZDogc3RyaW5nLCAuLi5hcmd2KVxuXHR1c2UobW9kLCAuLi5hcmd2KVxuXHR1c2UobW9kLCAuLi5hcmd2KVxuXHR7XG5cdFx0bGV0IG1lID0gdGhpcztcblxuXHRcdGlmIChBcnJheS5pc0FycmF5KG1vZCkpXG5cdFx0e1xuXHRcdFx0bW9kLmZvckVhY2goZnVuY3Rpb24gKG0pXG5cdFx0XHR7XG5cdFx0XHRcdG1lLnVzZShtKTtcblx0XHRcdH0pO1xuXHRcdH1cblx0XHRlbHNlXG5cdFx0e1xuXHRcdFx0aWYgKHR5cGVvZiBtb2QgPT0gJ3N0cmluZycpXG5cdFx0XHR7XG5cdFx0XHRcdC8vY29uc29sZS5sb2coJ21vZHVsZScsIG1vZCk7XG5cblx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHQvL2xldCBmaWxlbmFtZSA9IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdtb2R1bGUnLCBtb2R1bGUgKyAnLmpzJyk7XG5cdFx0XHRcdGxldCBmaWxlbmFtZSA9IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdzdWJtb2QnLCBtb2QpO1xuXG5cdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0bW9kID0gcmVxdWlyZShmaWxlbmFtZSk7XG5cdFx0XHR9XG5cdFx0XHQvLyDliJ3lp4vljJblubbms6jlhozmqKHlnZdcblx0XHRcdGxldCBjID0gbW9kLmluaXQodGhpcywgLi4uYXJndik7XG5cblx0XHRcdGlmICh0eXBlb2YgYyAhPT0gJ3VuZGVmaW5lZCcpXG5cdFx0XHR7XG5cdFx0XHRcdG1vZCA9IGM7XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMubW9kdWxlc1ttb2QudHlwZV0ucHVzaChtb2QpO1xuXHRcdH1cblxuXHRcdHRoaXMuaW5pdGVkID0gdHJ1ZTtcblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0X3Jlc29sdmVEaWN0RmlsZW5hbWUobmFtZTogc3RyaW5nLCBwYXRoUGx1czogc3RyaW5nW10gPSBbXSwgZXh0UGx1czogc3RyaW5nW10gPSBbXSk6IHN0cmluZyB8IHN0cmluZ1tdXG5cdHtcblx0XHRsZXQgb3B0aW9ucyA9IHtcblx0XHRcdHBhdGhzOiBbXG5cdFx0XHRcdCcnLFxuXHRcdFx0XHRQcm9qZWN0Q29uZmlnLmRpY3Rfcm9vdCxcblxuXHRcdFx0XHQuLi5wYXRoUGx1cyxcblx0XHRcdFx0cGF0aC5yZXNvbHZlKFNlZ21lbnREaWN0LkRJQ1RfUk9PVCwgJ3NlZ21lbnQnKSxcblx0XHRcdF0sXG5cdFx0XHRleHRlbnNpb25zOiBbXG5cdFx0XHRcdCcnLFxuXHRcdFx0XHQuLi5leHRQbHVzLFxuXHRcdFx0XHQnLnV0ZjgnLFxuXHRcdFx0XHQnLnR4dCcsXG5cdFx0XHRdLFxuXG5cdFx0XHRvbmx5RmlsZTogdHJ1ZSxcblx0XHR9O1xuXG5cdFx0aWYgKG5hbWUuaW5kZXhPZignKicpICE9IC0xKVxuXHRcdHtcblx0XHRcdGxldCBscyA9IHNlYXJjaEdsb2JTeW5jKG5hbWUsIG9wdGlvbnMpO1xuXG5cdFx0XHRpZiAoIWxzIHx8ICFscy5sZW5ndGgpXG5cdFx0XHR7XG5cdFx0XHRcdHRocm93IEVycm9yKGBDYW5ub3QgZmluZCBkaWN0IGdsb2IgZmlsZSBcIiR7bmFtZX1cIi5gKTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIGxzO1xuXHRcdH1cblxuXHRcdGxldCBmaWxlbmFtZSA9IHNlYXJjaEZpcnN0U3luYyhuYW1lLCBvcHRpb25zKTtcblxuXHRcdGlmICghZmlsZW5hbWUpXG5cdFx0e1xuXHRcdFx0Ly9jb25zb2xlLmxvZyhuYW1lLCBwYXRoUGx1cywgZXh0UGx1cyk7XG5cblx0XHRcdHRocm93IEVycm9yKGBDYW5ub3QgZmluZCBkaWN0IGZpbGUgXCIke25hbWV9XCIuYCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGZpbGVuYW1lO1xuXHR9XG5cblx0LyoqXG5cdCAqIOi9veWFpeWtl+WFuOaWh+S7tlxuXHQgKlxuXHQgKiBAcGFyYW0ge1N0cmluZ30gbmFtZSDlrZflhbjmlofku7blkI1cblx0ICogQHBhcmFtIHtTdHJpbmd9IHR5cGUg57G75Z6LXG5cdCAqIEBwYXJhbSB7Qm9vbGVhbn0gY29udmVydF90b19sb3dlciDmmK/lkKblhajpg6jovazmjaLkuLrlsI/lhplcblx0ICogQHJldHVybiB7U2VnbWVudH1cblx0ICovXG5cdGxvYWREaWN0KG5hbWU6IHN0cmluZywgdHlwZT86IHN0cmluZywgY29udmVydF90b19sb3dlcj86IGJvb2xlYW4sIHNraXBFeGlzdHM/OiBib29sZWFuKVxuXHR7XG5cdFx0bGV0IGZpbGVuYW1lID0gdGhpcy5fcmVzb2x2ZURpY3RGaWxlbmFtZShuYW1lKTtcblxuXHRcdGlmIChBcnJheS5pc0FycmF5KGZpbGVuYW1lKSlcblx0XHR7XG5cdFx0XHRsZXQgc2VsZiA9IHRoaXM7XG5cblx0XHRcdGZpbGVuYW1lLmZvckVhY2godiA9PiB0aGlzLmxvYWREaWN0KHYsIHR5cGUsIGNvbnZlcnRfdG9fbG93ZXIsIHNraXBFeGlzdHMpKTtcblxuXHRcdFx0Ly9jb25zb2xlLmxvZyhmaWxlbmFtZSk7XG5cblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH1cblxuXHRcdGlmICghdHlwZSkgdHlwZSA9ICdUQUJMRSc7ICAgICAvLyDpu5jorqTkuLpUQUJMRVxuXG5cdFx0Y29uc3QgZGIgPSB0aGlzLmdldERpY3REYXRhYmFzZSh0eXBlLCB0cnVlKTtcblxuXHRcdGNvbnN0IFRBQkxFID0gdGhpcy5ESUNUW3R5cGVdID0gZGIuVEFCTEU7XG5cdFx0Y29uc3QgVEFCTEUyID0gdGhpcy5ESUNUW3R5cGUgKyAnMiddID0gZGIuVEFCTEUyO1xuXG5cdFx0Lypcblx0XHQvLyDliJ3lp4vljJbor43lhbhcblx0XHRpZiAoIXRoaXMuRElDVFt0eXBlXSkgdGhpcy5ESUNUW3R5cGVdID0ge307XG5cdFx0aWYgKCF0aGlzLkRJQ1RbdHlwZSArICcyJ10pIHRoaXMuRElDVFt0eXBlICsgJzInXSA9IHt9O1xuXHRcdGxldCBUQUJMRSA9IHRoaXMuRElDVFt0eXBlXTsgICAgICAgIC8vIOivjeWFuOihqCAgJ+ivjScgPT4ge+WxnuaAp31cblx0XHRsZXQgVEFCTEUyID0gdGhpcy5ESUNUW3R5cGUgKyAnMiddOyAvLyDor43lhbjooaggICfplb/luqYnID0+ICfor40nID0+IOWxnuaAp1xuXHRcdCovXG5cdFx0Ly8g5a+85YWl5pWw5o2uXG5cdFx0Y29uc3QgUE9TVEFHID0gdGhpcy5QT1NUQUc7XG5cblx0XHRsZXQgZGF0YSA9IExvYWRlci5TZWdtZW50RGljdExvYWRlci5sb2FkU3luYyhmaWxlbmFtZSk7XG5cblx0XHRkYXRhLmZvckVhY2goZnVuY3Rpb24gKGRhdGEpXG5cdFx0e1xuXHRcdFx0aWYgKGNvbnZlcnRfdG9fbG93ZXIpXG5cdFx0XHR7XG5cdFx0XHRcdGRhdGFbMF0gPSBkYXRhWzBdLnRvTG93ZXJDYXNlKCk7XG5cdFx0XHR9XG5cblx0XHRcdGRiLmFkZChkYXRhLCBza2lwRXhpc3RzKTtcblxuXHRcdFx0Lypcblx0XHRcdGxldCBbdywgcCwgZl0gPSBkYXRhO1xuXG5cdFx0XHRpZiAody5sZW5ndGggPT0gMClcblx0XHRcdHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKClcblx0XHRcdH1cblxuXHRcdFx0VEFCTEVbd10gPSB7IHAsIGYsIH07XG5cdFx0XHRpZiAoIVRBQkxFMlt3Lmxlbmd0aF0pIFRBQkxFMlt3Lmxlbmd0aF0gPSB7fTtcblx0XHRcdFRBQkxFMlt3Lmxlbmd0aF1bd10gPSBUQUJMRVt3XTtcblx0XHRcdCovXG5cdFx0fSk7XG5cblx0XHRkYXRhID0gdW5kZWZpbmVkO1xuXG5cdFx0dGhpcy5pbml0ZWQgPSB0cnVlO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICog5Y+W6K+N5YW46KGoXG5cdCAqXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlIOexu+Wei1xuXHQgKiBAcmV0dXJuIHtvYmplY3R9XG5cdCAqL1xuXHRnZXREaWN0KHR5cGU6ICdTVE9QV09SRCcpOiBJRElDVF9TVE9QV09SRFxuXHRnZXREaWN0KHR5cGU6ICdTWU5PTllNJyk6IElESUNUX1NZTk9OWU1cblx0Z2V0RGljdCh0eXBlOiAnVEFCTEUnKTogSURJQ1Q8SVdvcmQ+XG5cdGdldERpY3QodHlwZTogJ1RBQkxFMicpOiBJRElDVDI8SVdvcmQ+XG5cdGdldERpY3QodHlwZSk6IElESUNUXG5cdGdldERpY3QodHlwZSlcblx0e1xuXHRcdHJldHVybiB0aGlzLkRJQ1RbdHlwZV07XG5cdH1cblxuXHQvKipcblx0ICog6L295YWl5ZCM5LmJ6K+N6K+N5YW4XG5cdCAqXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIOWtl+WFuOaWh+S7tuWQjVxuXHQgKi9cblx0bG9hZFN5bm9ueW1EaWN0KG5hbWU6IHN0cmluZywgc2tpcEV4aXN0cz86IGJvb2xlYW4pXG5cdHtcblx0XHRsZXQgZmlsZW5hbWUgPSB0aGlzLl9yZXNvbHZlRGljdEZpbGVuYW1lKG5hbWUsIFtcblx0XHRcdHBhdGgucmVzb2x2ZShTZWdtZW50RGljdC5ESUNUX1JPT1QsICdzeW5vbnltJyksXG5cdFx0XSk7XG5cblx0XHRpZiAoQXJyYXkuaXNBcnJheShmaWxlbmFtZSkpXG5cdFx0e1xuXHRcdFx0bGV0IHNlbGYgPSB0aGlzO1xuXG5cdFx0XHRmaWxlbmFtZS5mb3JFYWNoKHYgPT4gdGhpcy5sb2FkU3lub255bURpY3Qodiwgc2tpcEV4aXN0cykpO1xuXG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9XG5cblx0XHRsZXQgdHlwZSA9ICdTWU5PTllNJztcblxuXHRcdGNvbnN0IGRiID0gdGhpcy5nZXREaWN0RGF0YWJhc2UodHlwZSwgdHJ1ZSk7XG5cblx0XHRjb25zdCBUQUJMRSA9IHRoaXMuRElDVFt0eXBlXSA9IGRiLlRBQkxFO1xuXG5cdFx0Lypcblx0XHQvLyDliJ3lp4vljJbor43lhbhcblx0XHRpZiAoIXRoaXMuRElDVFt0eXBlXSkgdGhpcy5ESUNUW3R5cGVdID0ge307XG5cdFx0Ly8g6K+N5YW46KGoICAn5ZCM5LmJ6K+NJyA9PiAn5qCH5YeG6K+NJ1xuXHRcdGxldCBUQUJMRSA9IHRoaXMuRElDVFt0eXBlXSBhcyBJRElDVF9TWU5PTllNO1xuXHRcdC8vIOWvvOWFpeaVsOaNrlxuXHRcdCovXG5cblx0XHRsZXQgZGF0YSA9IExvYWRlci5TZWdtZW50U3lub255bUxvYWRlci5sb2FkU3luYyhmaWxlbmFtZSk7XG5cblx0XHRkYXRhLmZvckVhY2goZnVuY3Rpb24gKGJsb2Nrczogc3RyaW5nW10pXG5cdFx0e1xuXHRcdFx0ZGIuYWRkKGJsb2Nrcywgc2tpcEV4aXN0cyk7XG5cblx0XHRcdC8qXG5cdFx0XHRsZXQgW24xLCBuMl0gPSBibG9ja3M7XG5cblx0XHRcdFRBQkxFW24xXSA9IG4yO1xuXHRcdFx0aWYgKFRBQkxFW24yXSA9PT0gbjEpXG5cdFx0XHR7XG5cdFx0XHRcdGRlbGV0ZSBUQUJMRVtuMl07XG5cdFx0XHR9XG5cdFx0XHQqL1xuXHRcdH0pO1xuXG5cdFx0Ly9jb25zb2xlLmxvZyhUQUJMRSk7XG5cblx0XHRkYXRhID0gdW5kZWZpbmVkO1xuXG5cdFx0dGhpcy5pbml0ZWQgPSB0cnVlO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHRsb2FkQmxhY2tsaXN0RGljdChuYW1lOiBzdHJpbmcpXG5cdHtcblx0XHRsZXQgZmlsZW5hbWUgPSB0aGlzLl9yZXNvbHZlRGljdEZpbGVuYW1lKG5hbWUsIFtcblx0XHRcdHBhdGgucmVzb2x2ZShTZWdtZW50RGljdC5ESUNUX1JPT1QsICdibGFja2xpc3QnKSxcblx0XHRdKTtcblxuXHRcdGlmIChBcnJheS5pc0FycmF5KGZpbGVuYW1lKSlcblx0XHR7XG5cdFx0XHRsZXQgc2VsZiA9IHRoaXM7XG5cblx0XHRcdGZpbGVuYW1lLmZvckVhY2godiA9PiB0aGlzLmxvYWRCbGFja2xpc3REaWN0KHYpKTtcblxuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fVxuXG5cdFx0Y29uc3QgdHlwZSA9ICdCTEFDS0xJU1QnO1xuXG5cdFx0Y29uc3QgZGIgPSB0aGlzLmdldERpY3REYXRhYmFzZSh0eXBlLCB0cnVlKTtcblxuXHRcdGNvbnN0IFRBQkxFID0gdGhpcy5ESUNUW3R5cGVdID0gZGIuVEFCTEU7XG5cblx0XHRsZXQgZGF0YSA9IExvYWRlci5TZWdtZW50RGljdFxuXHRcdFx0LnJlcXVpcmVMb2FkZXJNb2R1bGUoJ2xpbmUnKVxuXHRcdFx0LmxvYWRTeW5jKGZpbGVuYW1lLCB7XG5cdFx0XHRcdGZpbHRlcihsaW5lOiBzdHJpbmcpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXR1cm4gbGluZS50cmltKCk7XG5cdFx0XHRcdH0sXG5cdFx0XHR9KVxuXHRcdDtcblxuXHRcdGRhdGEuZm9yRWFjaCh2ID0+IGRiLmFkZCh2KSk7XG5cblx0XHRkYXRhID0gdW5kZWZpbmVkO1xuXG5cdFx0dGhpcy5pbml0ZWQgPSB0cnVlO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICog6L295YWl5YGc5q2i56ym6K+N5YW4XG5cdCAqXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIOWtl+WFuOaWh+S7tuWQjVxuXHQgKi9cblx0bG9hZFN0b3B3b3JkRGljdChuYW1lOiBzdHJpbmcpXG5cdHtcblx0XHRsZXQgZmlsZW5hbWUgPSB0aGlzLl9yZXNvbHZlRGljdEZpbGVuYW1lKG5hbWUsIFtcblx0XHRcdHBhdGgucmVzb2x2ZShTZWdtZW50RGljdC5ESUNUX1JPT1QsICdzdG9wd29yZCcpLFxuXHRcdF0pO1xuXG5cdFx0aWYgKEFycmF5LmlzQXJyYXkoZmlsZW5hbWUpKVxuXHRcdHtcblx0XHRcdGxldCBzZWxmID0gdGhpcztcblxuXHRcdFx0ZmlsZW5hbWUuZm9yRWFjaCh2ID0+IHRoaXMubG9hZFN0b3B3b3JkRGljdCh2KSk7XG5cblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH1cblxuXHRcdGNvbnN0IHR5cGUgPSAnU1RPUFdPUkQnO1xuXG5cdFx0Y29uc3QgZGIgPSB0aGlzLmdldERpY3REYXRhYmFzZSh0eXBlLCB0cnVlKTtcblxuXHRcdGNvbnN0IFRBQkxFID0gdGhpcy5ESUNUW3R5cGVdID0gZGIuVEFCTEU7XG5cblx0XHRsZXQgZGF0YSA9IExvYWRlci5TZWdtZW50RGljdFxuXHRcdFx0LnJlcXVpcmVMb2FkZXJNb2R1bGUoJ2xpbmUnKVxuXHRcdFx0LmxvYWRTeW5jKGZpbGVuYW1lLCB7XG5cdFx0XHRcdGZpbHRlcihsaW5lOiBzdHJpbmcpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXR1cm4gbGluZS50cmltKCk7XG5cdFx0XHRcdH0sXG5cdFx0XHR9KVxuXHRcdDtcblxuXHRcdGRhdGEuZm9yRWFjaCh2ID0+IGRiLmFkZCh2KSk7XG5cblx0XHRkYXRhID0gdW5kZWZpbmVkO1xuXG5cdFx0dGhpcy5pbml0ZWQgPSB0cnVlO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICog5L2/55So6buY6K6k55qE6K+G5Yir5qih5Z2X5ZKM5a2X5YW45paH5Lu2XG5cdCAqIOWcqOS9v+eUqOmgkOioreWAvOeahOaDheazgeS4i++8jOS4jemcgOimgeS4u+WLleWRvOWPq+atpOWHveaVuFxuXHQgKlxuXHQgKiBAcmV0dXJuIHtTZWdtZW50fVxuXHQgKi9cblx0dXNlRGVmYXVsdCguLi5hcmd2KVxuXHR7XG5cdFx0dXNlRGVmYXVsdCh0aGlzLCAuLi5hcmd2KTtcblxuXHRcdHRoaXMuaW5pdGVkID0gdHJ1ZTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdFx0Lypcblx0XHR0aGlzXG5cdFx0XHQvLyDor4bliKvmqKHlnZdcblx0XHRcdC8vIOW8uuWItuWIhuWJsuexu+WNleivjeivhuWIq1xuXHRcdFx0LnVzZSgnVVJMVG9rZW5pemVyJykgICAgICAgICAgICAvLyBVUkzor4bliKtcblx0XHRcdC51c2UoJ1dpbGRjYXJkVG9rZW5pemVyJykgICAgICAgLy8g6YCa6YWN56ym77yM5b+F6aG75Zyo5qCH54K556ym5Y+36K+G5Yir5LmL5YmNXG5cdFx0XHQudXNlKCdQdW5jdHVhdGlvblRva2VuaXplcicpICAgIC8vIOagh+eCueespuWPt+ivhuWIq1xuXHRcdFx0LnVzZSgnRm9yZWlnblRva2VuaXplcicpICAgICAgICAvLyDlpJbmloflrZfnrKbjgIHmlbDlrZfor4bliKvvvIzlv4XpobvlnKjmoIfngrnnrKblj7for4bliKvkuYvlkI5cblx0XHRcdC8vIOS4reaWh+WNleivjeivhuWIq1xuXHRcdFx0LnVzZSgnRGljdFRva2VuaXplcicpICAgICAgICAgICAvLyDor43lhbjor4bliKtcblx0XHRcdC51c2UoJ0Noc05hbWVUb2tlbml6ZXInKSAgICAgICAgLy8g5Lq65ZCN6K+G5Yir77yM5bu66K6u5Zyo6K+N5YW46K+G5Yir5LmL5ZCOXG5cblx0XHRcdC8vIOS8mOWMluaooeWdl1xuXHRcdFx0LnVzZSgnRW1haWxPcHRpbWl6ZXInKSAgICAgICAgICAvLyDpgq7nrrHlnLDlnYDor4bliKtcblx0XHRcdC51c2UoJ0Noc05hbWVPcHRpbWl6ZXInKSAgICAgICAgLy8g5Lq65ZCN6K+G5Yir5LyY5YyWXG5cdFx0XHQudXNlKCdEaWN0T3B0aW1pemVyJykgICAgICAgICAgIC8vIOivjeWFuOivhuWIq+S8mOWMllxuXHRcdFx0LnVzZSgnRGF0ZXRpbWVPcHRpbWl6ZXInKSAgICAgICAvLyDml6XmnJ/ml7bpl7Tor4bliKvkvJjljJZcblxuXHRcdFx0Ly8g5a2X5YW45paH5Lu2XG5cdFx0XHQvLy5sb2FkRGljdCgnamllYmEnKSA8PT09IGJhZCBmaWxlXG5cblx0XHRcdC5sb2FkRGljdCgnZGljdDQnKVxuXG5cdFx0XHQubG9hZERpY3QoJ2NoYXInKVxuXG5cdFx0XHQubG9hZERpY3QoJ3BocmFzZXMnKVxuXHRcdFx0LmxvYWREaWN0KCdwaHJhc2VzMicpXG5cblx0XHRcdC5sb2FkRGljdCgnZGljdCcpICAgICAgICAgICAvLyDnm5jlj6Tor43lhbhcblx0XHRcdC5sb2FkRGljdCgnZGljdDInKSAgICAgICAgICAvLyDmianlsZXor43lhbjvvIjnlKjkuo7osIPmlbTljp/nm5jlj6Tor43lhbjvvIlcblx0XHRcdC5sb2FkRGljdCgnZGljdDMnKSAgICAgICAgICAvLyDmianlsZXor43lhbjvvIjnlKjkuo7osIPmlbTljp/nm5jlj6Tor43lhbjvvIlcblx0XHRcdC5sb2FkRGljdCgnbmFtZXMnKSAgICAgICAgICAvLyDluLjop4HlkI3or43jgIHkurrlkI1cblx0XHRcdC5sb2FkRGljdCgnd2lsZGNhcmQnLCAnV0lMRENBUkQnLCB0cnVlKSAgIC8vIOmAmumFjeesplxuXHRcdFx0LmxvYWRTeW5vbnltRGljdCgnc3lub255bScpICAgLy8g5ZCM5LmJ6K+NXG5cdFx0XHQubG9hZFN0b3B3b3JkRGljdCgnc3RvcHdvcmQnKSAvLyDlgZzmraLnrKZcblxuXHRcdFx0LmxvYWREaWN0KCdsYXp5L2JhZHdvcmQnKVxuXHRcdFx0LmxvYWREaWN0KCdsYXp5L2RpY3Rfc3lub255bScpXG5cblx0XHRcdC5sb2FkRGljdCgnbmFtZXMvZW4nKVxuXHRcdFx0LmxvYWREaWN0KCduYW1lcy9qcCcpXG5cdFx0XHQubG9hZERpY3QoJ2xhenkvaW5kZXgnKVxuXG5cdFx0O1xuXG5cdFx0dGhpcy5pbml0ZWQgPSB0cnVlO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdFx0Ki9cblx0fVxuXG5cdC8qKlxuXHQgKiDmraTlh73mlbjlj6rpnIDln7fooYzkuIDmrKHvvIzkuKbkuJTkuIDoiKzni4Dms4HkuIvkuI3pnIDopoHmiYvli5Xlkbzlj6tcblx0ICovXG5cdGF1dG9Jbml0KG9wdGlvbnM/OiB7XG5cdFx0YWxsX21vZD86IGJvb2xlYW4sXG5cdH0pXG5cdHtcblx0XHRpZiAoIXRoaXMuaW5pdGVkKVxuXHRcdHtcblx0XHRcdHRoaXMuaW5pdGVkID0gdHJ1ZTtcblxuXHRcdFx0aWYgKCF0aGlzLm1vZHVsZXMudG9rZW5pemVyLmxlbmd0aClcblx0XHRcdHtcblx0XHRcdFx0dGhpcy51c2VEZWZhdWx0KG9wdGlvbnMpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0Z2V0T3B0aW9uc0RvU2VnbWVudDxUIGV4dGVuZHMgSU9wdGlvbnNEb1NlZ21lbnQ+KG9wdGlvbnM/OiBUKTogVFxuXHR7XG5cdFx0cmV0dXJuIE9iamVjdC5hc3NpZ24oe30sXG5cdFx0XHRTZWdtZW50LmRlZmF1bHRPcHRpb25zRG9TZWdtZW50LFxuXHRcdFx0dGhpcy5vcHRpb25zLm9wdGlvbnNEb1NlZ21lbnQsXG5cdFx0XHRvcHRpb25zLFxuXHRcdCk7XG5cdH1cblxuXHRwcm90ZWN0ZWQgX2dldF90ZXh0KHRleHQ6IHN0cmluZyB8IEJ1ZmZlcik6IHN0cmluZ1xuXHR7XG5cdFx0dHJ5XG5cdFx0e1xuXHRcdFx0aWYgKEJ1ZmZlci5pc0J1ZmZlcih0ZXh0KSlcblx0XHRcdHtcblx0XHRcdFx0dGV4dCA9IHRleHQudG9TdHJpbmcoKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0Y2F0Y2ggKGUpXG5cdFx0e31cblx0XHRmaW5hbGx5XG5cdFx0e1xuXHRcdFx0aWYgKHR5cGVvZiB0ZXh0ICE9ICdzdHJpbmcnKVxuXHRcdFx0e1xuXHRcdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKGB0ZXh0IG11c3QgaXMgc3RyaW5nIG9yIEJ1ZmZlcmApXG5cdFx0XHR9XG5cblx0XHRcdHRleHQgPSBjcmxmKHRleHQpO1xuXHRcdH1cblxuXHRcdHJldHVybiB0ZXh0O1xuXHR9XG5cblx0LyoqXG5cdCAqIHJlbW92ZSBrZXkgaW4gVEFCTEUgYnkgQkxBQ0tMSVNUXG5cdCAqL1xuXHRkb0JsYWNrbGlzdCgpXG5cdHtcblx0XHRsZXQgbWUgPSB0aGlzO1xuXG5cdFx0dGhpcy5hdXRvSW5pdCh0aGlzLm9wdGlvbnMpO1xuXG5cdFx0Y29uc3QgQkxBQ0tMSVNUID0gbWUuZ2V0RGljdCgnQkxBQ0tMSVNUJyk7XG5cdFx0Y29uc3QgVEFCTEUgPSBtZS5nZXREaWN0RGF0YWJhc2UoJ1RBQkxFJyk7XG5cblx0XHRPYmplY3QuZW50cmllcyhCTEFDS0xJU1QpXG5cdFx0XHQuZm9yRWFjaChmdW5jdGlvbiAoW2tleSwgYm9vbF0pXG5cdFx0XHR7XG5cdFx0XHRcdGJvb2wgJiYgVEFCTEUucmVtb3ZlKGtleSlcblx0XHRcdH0pXG5cdFx0O1xuXG5cdFx0cmV0dXJuIHRoaXNcblx0fVxuXG5cdC8qKlxuXHQgKiDlvIDlp4vliIbor41cblx0ICpcblx0ICogQHBhcmFtIHtTdHJpbmd9IHRleHQg5paH5pysXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIOmAiemhuVxuXHQgKiAgIC0ge0Jvb2xlYW59IHNpbXBsZSDmmK/lkKbku4Xov5Tlm57ljZXor43lhoXlrrlcblx0ICogICAtIHtCb29sZWFufSBzdHJpcFB1bmN0dWF0aW9uIOWOu+mZpOagh+eCueespuWPt1xuXHQgKiAgIC0ge0Jvb2xlYW59IGNvbnZlcnRTeW5vbnltIOi9rOaNouWQjOS5ieivjVxuXHQgKiAgIC0ge0Jvb2xlYW59IHN0cmlwU3RvcHdvcmQg5Y676Zmk5YGc5q2i56ymXG5cdCAqIEByZXR1cm4ge0FycmF5fVxuXHQgKi9cblx0ZG9TZWdtZW50KHRleHQ6IHN0cmluZyB8IEJ1ZmZlciwgb3B0aW9uczogSU9wdGlvbnNEb1NlZ21lbnQgJiB7XG5cdFx0c2ltcGxlOiB0cnVlLFxuXHR9KTogc3RyaW5nW11cblx0ZG9TZWdtZW50KHRleHQ6IHN0cmluZyB8IEJ1ZmZlciwgb3B0aW9ucz86IElPcHRpb25zRG9TZWdtZW50KTogSVdvcmRbXVxuXHRkb1NlZ21lbnQodGV4dCwgb3B0aW9uczogSU9wdGlvbnNEb1NlZ21lbnQgPSB7fSlcblx0e1xuXHRcdGxldCBtZSA9IHRoaXM7XG5cblx0XHRvcHRpb25zID0gdGhpcy5nZXRPcHRpb25zRG9TZWdtZW50KG9wdGlvbnMpO1xuXG5cdFx0Ly9jb25zb2xlLmRpcihvcHRpb25zKTtcblxuXHRcdHRoaXMuYXV0b0luaXQodGhpcy5vcHRpb25zKTtcblxuXHRcdGxldCB0ZXh0X2xpc3QgPSB0aGlzLl9nZXRfdGV4dCh0ZXh0KVxuXHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0LnNwbGl0KHRoaXMuU1BMSVQpXG5cdFx0O1xuXHRcdHRleHQgPSB1bmRlZmluZWQ7XG5cblx0XHQvLyDlsIbmlofmnKzmjInnhafmjaLooYznrKbliIblibLmiJDlpJrmrrXvvIzlubbpgJDkuIDliIbor41cblx0XHRsZXQgcmV0ID0gdGV4dF9saXN0LnJlZHVjZShmdW5jdGlvbiAocmV0LCBzZWN0aW9uKVxuXHRcdHtcblx0XHRcdC8vY29uc29sZS5kaXIoc2VjdGlvbik7XG5cblx0XHRcdGlmIChtZS5TUExJVF9GSUxURVIudGVzdChzZWN0aW9uKSlcblx0XHRcdHtcblx0XHRcdFx0cmV0ID0gcmV0LmNvbmNhdCh7IHc6IHNlY3Rpb24gfSk7XG5cblx0XHRcdFx0c2VjdGlvbiA9IFtdO1xuXHRcdFx0fVxuXG5cdFx0XHQvL3NlY3Rpb24gPSBzZWN0aW9uLnRyaW0oKTtcblx0XHRcdGlmIChzZWN0aW9uLmxlbmd0aCA+IDApXG5cdFx0XHR7XG5cdFx0XHRcdC8vIOWIhuivjVxuXHRcdFx0XHRsZXQgc3JldCA9IG1lLnRva2VuaXplci5zcGxpdChzZWN0aW9uLCBtZS5tb2R1bGVzLnRva2VuaXplcik7XG5cblx0XHRcdFx0Ly8g5LyY5YyWXG5cdFx0XHRcdHNyZXQgPSBtZS5vcHRpbWl6ZXIuZG9PcHRpbWl6ZShzcmV0LCBtZS5tb2R1bGVzLm9wdGltaXplcik7XG5cblx0XHRcdFx0Ly8g6L+e5o6l5YiG6K+N57uT5p6cXG5cdFx0XHRcdGlmIChzcmV0Lmxlbmd0aCA+IDApXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXQgPSByZXQuY29uY2F0KHNyZXQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiByZXQ7XG5cdFx0fSwgW10pO1xuXG5cdFx0Ly8g5Y676Zmk5qCH54K556ym5Y+3XG5cdFx0aWYgKG9wdGlvbnMuc3RyaXBQdW5jdHVhdGlvbilcblx0XHR7XG5cdFx0XHRyZXQgPSByZXQuZmlsdGVyKGZ1bmN0aW9uIChpdGVtKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gaXRlbS5wICE9PSBQT1NUQUcuRF9XO1xuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0aWYgKG9wdGlvbnMuY29udmVydFN5bm9ueW0pXG5cdFx0e1xuXHRcdFx0cmV0ID0gdGhpcy5jb252ZXJ0U3lub255bShyZXQpO1xuXHRcdH1cblxuXHRcdC8qXG5cdFx0Ly8g6L2s5o2i5ZCM5LmJ6K+NXG5cdFx0ZnVuY3Rpb24gY29udmVydFN5bm9ueW0obGlzdClcblx0XHR7XG5cdFx0XHRsZXQgY291bnQgPSAwO1xuXHRcdFx0bGV0IFRBQkxFID0gbWUuZ2V0RGljdCgnU1lOT05ZTScpO1xuXHRcdFx0bGlzdCA9IGxpc3QubWFwKGZ1bmN0aW9uIChpdGVtKVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAoaXRlbS53IGluIFRBQkxFKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Y291bnQrKztcblx0XHRcdFx0XHQvL3JldHVybiB7IHc6IFRBQkxFW2l0ZW0ud10sIHA6IGl0ZW0ucCB9O1xuXG5cdFx0XHRcdFx0aXRlbS5vdyA9IGl0ZW0udztcblx0XHRcdFx0XHRpdGVtLncgPSBUQUJMRVtpdGVtLnddO1xuXG5cdFx0XHRcdFx0cmV0dXJuIGl0ZW07XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cmV0dXJuIGl0ZW07XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdFx0cmV0dXJuIHsgY291bnQ6IGNvdW50LCBsaXN0OiBsaXN0IH07XG5cdFx0fVxuXG5cdFx0aWYgKG9wdGlvbnMuY29udmVydFN5bm9ueW0pXG5cdFx0e1xuXHRcdFx0bGV0IHJlc3VsdDtcblx0XHRcdGRvXG5cdFx0XHR7XG5cdFx0XHRcdHJlc3VsdCA9IGNvbnZlcnRTeW5vbnltKHJldCk7XG5cdFx0XHRcdHJldCA9IHJlc3VsdC5saXN0O1xuXHRcdFx0fVxuXHRcdFx0d2hpbGUgKHJlc3VsdC5jb3VudCA+IDApO1xuXHRcdH1cblx0XHQqL1xuXG5cdFx0Ly8g5Y676Zmk5YGc5q2i56ymXG5cdFx0aWYgKG9wdGlvbnMuc3RyaXBTdG9wd29yZClcblx0XHR7XG5cdFx0XHRsZXQgU1RPUFdPUkQgPSBtZS5nZXREaWN0KCdTVE9QV09SRCcpO1xuXHRcdFx0cmV0ID0gcmV0LmZpbHRlcihmdW5jdGlvbiAoaXRlbSlcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuICEoaXRlbS53IGluIFNUT1BXT1JEKTtcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdGlmIChvcHRpb25zLnN0cmlwU3BhY2UpXG5cdFx0e1xuXHRcdFx0cmV0ID0gcmV0LmZpbHRlcihmdW5jdGlvbiAoaXRlbSlcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuICEvXlxccyskL2cudGVzdChpdGVtLncpO1xuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0Ly8g5LuF6L+U5Zue5Y2V6K+N5YaF5a65XG5cdFx0aWYgKG9wdGlvbnMuc2ltcGxlKVxuXHRcdHtcblx0XHRcdHJldCA9IHJldC5tYXAoZnVuY3Rpb24gKGl0ZW0pXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiBpdGVtLnc7XG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gcmV0O1xuXHR9XG5cblx0LyoqXG5cdCAqIOi9rOaNouWQjOS5ieivjVxuXHQgKi9cblx0Y29udmVydFN5bm9ueW0ocmV0OiBJV29yZERlYnVnW10sIHNob3djb3VudDogdHJ1ZSk6IHsgY291bnQ6IG51bWJlciwgbGlzdDogSVdvcmREZWJ1Z1tdIH1cblx0Y29udmVydFN5bm9ueW0ocmV0OiBJV29yZERlYnVnW10sIHNob3djb3VudD86IGJvb2xlYW4pOiBJV29yZERlYnVnW11cblx0Y29udmVydFN5bm9ueW0ocmV0OiBJV29yZERlYnVnW10sIHNob3djb3VudD86IGJvb2xlYW4pXG5cdHtcblx0XHRjb25zdCBtZSA9IHRoaXM7XG5cdFx0bGV0IFRBQkxFID0gbWUuZ2V0RGljdCgnU1lOT05ZTScpO1xuXHRcdGxldCBUQUJMRURJQ1QgPSBtZS5nZXREaWN0KCdUQUJMRScpO1xuXG5cdFx0bGV0IHRvdGFsX2NvdW50ID0gMDtcblxuXHRcdC8vY29uc3QgUkFXID0gU3ltYm9sLmZvcignUkFXJyk7XG5cblx0XHQvLyDovazmjaLlkIzkuYnor41cblx0XHRmdW5jdGlvbiBfY29udmVydFN5bm9ueW0obGlzdDogSVdvcmREZWJ1Z1tdKVxuXHRcdHtcblx0XHRcdGxldCBjb3VudCA9IDA7XG5cdFx0XHRsaXN0ID0gbGlzdC5yZWR1Y2UoZnVuY3Rpb24gKGEsIGl0ZW06IElXb3JkRGVidWcpXG5cdFx0XHR7XG5cdFx0XHRcdGxldCBib29sOiBib29sZWFuO1xuXHRcdFx0XHRsZXQgdyA9IGl0ZW0udztcblx0XHRcdFx0bGV0IG53OiBzdHJpbmc7XG5cblx0XHRcdFx0bGV0IGRlYnVnID0gZGVidWdUb2tlbihpdGVtKTtcblxuXHRcdFx0XHRpZiAodyBpbiBUQUJMRSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGJvb2wgPSB0cnVlO1xuXHRcdFx0XHRcdG53ID0gVEFCTEVbd107XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSBpZiAoZGVidWcuYXV0b0NyZWF0ZSAmJiAhZGVidWcuY29udmVydFN5bm9ueW0gJiYgIWl0ZW0ub3cgJiYgaXRlbS5tICYmIGl0ZW0ubS5sZW5ndGgpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRudyA9IGl0ZW0ubS5yZWR1Y2UoZnVuY3Rpb24gKGE6IHN0cmluZ1tdLCBiKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGlmICh0eXBlb2YgYiA9PSAnc3RyaW5nJylcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0YS5wdXNoKGIpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0ZWxzZSBpZiAoYi53IGluIFRBQkxFKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRhLnB1c2goVEFCTEVbYi53XSk7XG5cdFx0XHRcdFx0XHRcdGJvb2wgPSB0cnVlO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRhLnB1c2goYi53KTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0cmV0dXJuIGE7XG5cdFx0XHRcdFx0fSwgW10pLmpvaW4oJycpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKGJvb2wpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRjb3VudCsrO1xuXHRcdFx0XHRcdHRvdGFsX2NvdW50Kys7XG5cdFx0XHRcdFx0Ly9yZXR1cm4geyB3OiBUQUJMRVtpdGVtLnddLCBwOiBpdGVtLnAgfTtcblxuXHRcdFx0XHRcdGxldCBwID0gaXRlbS5wO1xuXG5cdFx0XHRcdFx0aWYgKHcgaW4gVEFCTEVESUNUKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHAgPSBUQUJMRURJQ1Rbd10ucCB8fCBwO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmIChwICYgbWUuUE9TVEFHLkJBRClcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRwID0gcCBeIG1lLlBPU1RBRy5CQUQ7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0bGV0IGl0ZW1fbmV3ID0gZGVidWdUb2tlbih7XG5cdFx0XHRcdFx0XHQuLi5pdGVtLFxuXG5cdFx0XHRcdFx0XHR3OiBudyxcblx0XHRcdFx0XHRcdG93OiB3LFxuXHRcdFx0XHRcdFx0cCxcblx0XHRcdFx0XHRcdG9wOiBpdGVtLnAsXG5cblx0XHRcdFx0XHRcdC8vW1JBV106IGl0ZW0sXG5cblx0XHRcdFx0XHRcdC8vc291cmNlOiBpdGVtLFxuXHRcdFx0XHRcdH0sIHtcblx0XHRcdFx0XHRcdGNvbnZlcnRTeW5vbnltOiB0cnVlLFxuXHRcdFx0XHRcdFx0Ly9fc291cmNlOiBpdGVtLFxuXG5cdFx0XHRcdFx0XHQvKipcblx0XHRcdFx0XHRcdCAqIEpTT04uc3RyaW5naWZ5XG5cdFx0XHRcdFx0XHQgKiBhdm9pZCBUeXBlRXJyb3I6IENvbnZlcnRpbmcgY2lyY3VsYXIgc3RydWN0dXJlIHRvIEpTT05cblx0XHRcdFx0XHRcdCAqL1xuXHRcdFx0XHRcdFx0X3NvdXJjZTogZGVlcG1lcmdlKHt9LCBpdGVtKSBhcyBJV29yZERlYnVnLFxuXG5cdFx0XHRcdFx0fSwgdHJ1ZSk7XG5cblx0XHRcdFx0XHRhLnB1c2goaXRlbV9uZXcpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGEucHVzaChpdGVtKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiBhO1xuXHRcdFx0fSwgW10pO1xuXHRcdFx0cmV0dXJuIHsgY291bnQ6IGNvdW50LCBsaXN0OiBsaXN0IH07XG5cdFx0fVxuXG5cdFx0bGV0IHJlc3VsdDogeyBjb3VudDogbnVtYmVyLCBsaXN0OiBJV29yZERlYnVnW10gfTtcblx0XHRkb1xuXHRcdHtcblx0XHRcdHJlc3VsdCA9IF9jb252ZXJ0U3lub255bShyZXQpO1xuXHRcdFx0cmV0ID0gcmVzdWx0Lmxpc3Q7XG5cdFx0fVxuXHRcdHdoaWxlIChyZXN1bHQuY291bnQgPiAwKTtcblxuXHRcdGlmIChzaG93Y291bnQpXG5cdFx0e1xuXHRcdFx0cmV0dXJuIHsgY291bnQ6IHRvdGFsX2NvdW50LCBsaXN0OiByZXQgfTtcblx0XHR9XG5cblx0XHRyZXR1cm4gcmV0O1xuXHR9XG5cblx0LyoqXG5cdCAqIOWwhuWNleivjeaVsOe7hOi/nuaOpeaIkOWtl+espuS4slxuXHQgKlxuXHQgKiBAcGFyYW0ge0FycmF5fSB3b3JkcyDljZXor43mlbDnu4Rcblx0ICogQHJldHVybiB7U3RyaW5nfVxuXHQgKi9cblx0c3RyaW5naWZ5KHdvcmRzOiBBcnJheTxJV29yZCB8IHN0cmluZz4sIC4uLmFyZ3YpOiBzdHJpbmdcblx0e1xuXHRcdHJldHVybiBTZWdtZW50LnN0cmluZ2lmeSh3b3JkcywgLi4uYXJndik7XG5cdH1cblxuXHRzdGF0aWMgc3RyaW5naWZ5KHdvcmRzOiBBcnJheTxJV29yZCB8IHN0cmluZz4sIC4uLmFyZ3YpOiBzdHJpbmdcblx0e1xuXHRcdHJldHVybiB3b3Jkcy5tYXAoZnVuY3Rpb24gKGl0ZW0pXG5cdFx0e1xuXHRcdFx0aWYgKHR5cGVvZiBpdGVtID09PSAnc3RyaW5nJylcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIGl0ZW07XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmICgndycgaW4gaXRlbSlcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIGl0ZW0udztcblx0XHRcdH1cblx0XHRcdGVsc2Vcblx0XHRcdHtcblx0XHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcihgbm90IGEgdmFsaWQgc2VnbWVudCByZXN1bHQgbGlzdGApXG5cdFx0XHR9XG5cdFx0fSkuam9pbignJyk7XG5cdH1cblxuXHQvKipcblx0ICog5qC55o2u5p+Q5Liq5Y2V6K+N5oiW6K+N5oCn5p2l5YiG5Ymy5Y2V6K+N5pWw57uEXG5cdCAqXG5cdCAqIEBwYXJhbSB7QXJyYXl9IHdvcmRzIOWNleivjeaVsOe7hFxuXHQgKiBAcGFyYW0ge051bWJlcnxTdHJpbmd9IHMg55So5LqO5YiG5Ymy55qE5Y2V6K+N5oiW6K+N5oCnXG5cdCAqIEByZXR1cm4ge0FycmF5fVxuXHQgKi9cblx0c3BsaXQod29yZHM6IElXb3JkW10sIHM6IHN0cmluZyB8IG51bWJlcik6IElXb3JkW11cblx0e1xuXHRcdGxldCByZXQgPSBbXTtcblx0XHRsZXQgbGFzdGkgPSAwO1xuXHRcdGxldCBpID0gMDtcblx0XHRsZXQgZiA9IHR5cGVvZiBzID09PSAnc3RyaW5nJyA/ICd3JyA6ICdwJztcblxuXHRcdHdoaWxlIChpIDwgd29yZHMubGVuZ3RoKVxuXHRcdHtcblx0XHRcdGlmICh3b3Jkc1tpXVtmXSA9PSBzKVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAobGFzdGkgPCBpKSByZXQucHVzaCh3b3Jkcy5zbGljZShsYXN0aSwgaSkpO1xuXHRcdFx0XHRyZXQucHVzaCh3b3Jkcy5zbGljZShpLCBpICsgMSkpO1xuXHRcdFx0XHRpKys7XG5cdFx0XHRcdGxhc3RpID0gaTtcblx0XHRcdH1cblx0XHRcdGVsc2Vcblx0XHRcdHtcblx0XHRcdFx0aSsrO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAobGFzdGkgPCB3b3Jkcy5sZW5ndGggLSAxKVxuXHRcdHtcblx0XHRcdHJldC5wdXNoKHdvcmRzLnNsaWNlKGxhc3RpLCB3b3Jkcy5sZW5ndGgpKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gcmV0O1xuXHR9XG5cblx0LyoqXG5cdCAqIOWcqOWNleivjeaVsOe7hOS4reafpeaJvuafkOS4gOS4quWNleivjeaIluivjeaAp+aJgOWcqOeahOS9jee9rlxuXHQgKlxuXHQgKiBAcGFyYW0ge0FycmF5fSB3b3JkcyDljZXor43mlbDnu4Rcblx0ICogQHBhcmFtIHtOdW1iZXJ8U3RyaW5nfSBzIOimgeafpeaJvueahOWNleivjeaIluivjeaAp1xuXHQgKiBAcGFyYW0ge051bWJlcn0gY3VyIOW8gOWni+S9jee9rlxuXHQgKiBAcmV0dXJuIHtOdW1iZXJ9IOaJvuS4jeWIsO+8jOi/lOWbni0xXG5cdCAqL1xuXHRpbmRleE9mKHdvcmRzOiBJV29yZFtdLCBzOiBzdHJpbmcgfCBudW1iZXIsIGN1cj86IG51bWJlcilcblx0e1xuXHRcdGN1ciA9IGlzTmFOKGN1cikgPyAwIDogY3VyO1xuXHRcdGxldCBmID0gdHlwZW9mIHMgPT09ICdzdHJpbmcnID8gJ3cnIDogJ3AnO1xuXG5cdFx0d2hpbGUgKGN1ciA8IHdvcmRzLmxlbmd0aClcblx0XHR7XG5cdFx0XHRpZiAod29yZHNbY3VyXVtmXSA9PSBzKSByZXR1cm4gY3VyO1xuXHRcdFx0Y3VyKys7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIC0xO1xuXHR9XG59XG5cbmV4cG9ydCBuYW1lc3BhY2UgU2VnbWVudFxue1xuXG5cdGV4cG9ydCB0eXBlIElTUExJVCA9IFJlZ0V4cCB8IHN0cmluZyB8IHtcblx0XHRbU3ltYm9sLnNwbGl0XShpbnB1dDogc3RyaW5nLCBsaW1pdD86IG51bWJlcik6IHN0cmluZ1tdLFxuXHR9O1xuXG5cdGV4cG9ydCB0eXBlIElTUExJVF9GSUxURVIgPSBSZWdFeHAgfCB7XG5cdFx0dGVzdChpbnB1dDogc3RyaW5nKTogYm9vbGVhbixcblx0fTtcblxuXHRleHBvcnQgaW50ZXJmYWNlIElESUNUPFQgPSBhbnk+XG5cdHtcblx0XHRba2V5OiBzdHJpbmddOiBULFxuXHR9XG5cblx0ZXhwb3J0IGludGVyZmFjZSBJRElDVDI8VCA9IGFueT5cblx0e1xuXHRcdFtrZXk6IG51bWJlcl06IElESUNUPFQ+LFxuXHR9XG5cblx0ZXhwb3J0IHR5cGUgSU9wdGlvbnNTZWdtZW50ID0gSU9wdGlvbnNUYWJsZURpY3QgJiB7XG5cdFx0ZGI/OiBUYWJsZURpY3RbXSxcblx0XHRvcHRpb25zRG9TZWdtZW50PzogSU9wdGlvbnNEb1NlZ21lbnQsXG5cblx0XHRhbGxfbW9kPzogYm9vbGVhbixcblxuXHRcdG1heENodW5rQ291bnQ/OiBudW1iZXIsXG5cdH07XG5cblx0ZXhwb3J0IHR5cGUgSURJQ1RfU1lOT05ZTSA9IElESUNUPHN0cmluZz47XG5cdGV4cG9ydCB0eXBlIElESUNUX1NUT1BXT1JEID0gSURJQ1Q8Ym9vbGVhbj47XG5cblx0ZXhwb3J0IGludGVyZmFjZSBJV29yZFxuXHR7XG5cdFx0dzogc3RyaW5nLFxuXHRcdC8qKlxuXHRcdCAqIOipnuaAp1xuXHRcdCAqL1xuXHRcdHA/OiBudW1iZXIsXG5cdFx0LyoqXG5cdFx0ICog6Kme5oCn5ZCN56ixXG5cdFx0ICovXG5cdFx0cHM/OiBzdHJpbmcsXG5cdFx0cHA/OiBzdHJpbmcsXG5cdFx0LyoqXG5cdFx0ICog5qyK6YeNXG5cdFx0ICovXG5cdFx0Zj86IG51bWJlcixcblx0XHQvKipcblx0XHQgKiDlvIDlp4vkvY3nva5cblx0XHQgKi9cblx0XHRjPzogbnVtYmVyLFxuXHRcdC8qKlxuXHRcdCAqIOWQiOS9temgheebrlxuXHRcdCAqL1xuXHRcdG0/OiBBcnJheTxJV29yZCB8IHN0cmluZz4sXG5cblx0XHQvL2NvbnZlcnRTeW5vbnltPzogYm9vbGVhbixcblx0XHQvL2F1dG9DcmVhdGU/OiBib29sZWFuLFxuXG5cdFx0LyoqXG5cdFx0ICog5Luj6KGo5Y6f55Sf5a2Y5Zyo5pa85a2X5YW45YWn55qE6aCF55uuXG5cdFx0ICovXG5cdFx0cz86IGJvb2xlYW4sXG5cdFx0b3M/OiBib29sZWFuLFxuXHR9XG5cblx0ZXhwb3J0IGludGVyZmFjZSBJT3B0aW9uc0RvU2VnbWVudFxuXHR7XG5cdFx0LyoqXG5cdFx0ICog5LiN6L+U5Zue6K+N5oCnXG5cdFx0ICovXG5cdFx0c2ltcGxlPzogYm9vbGVhbixcblxuXHRcdC8qKlxuXHRcdCAqIOWOu+mZpOagh+eCueespuWPt1xuXHRcdCAqL1xuXHRcdHN0cmlwUHVuY3R1YXRpb24/OiBib29sZWFuLFxuXG5cdFx0LyoqXG5cdFx0ICog6L2s5o2i5ZCM5LmJ6K+NXG5cdFx0ICovXG5cdFx0Y29udmVydFN5bm9ueW0/OiBib29sZWFuLFxuXG5cdFx0LyoqXG5cdFx0ICog5Y676Zmk5YGc5q2i56ymXG5cdFx0ICovXG5cdFx0c3RyaXBTdG9wd29yZD86IGJvb2xlYW4sXG5cblx0XHRzdHJpcFNwYWNlPzogYm9vbGVhbixcblx0fVxufVxuXG5leHBvcnQgaW1wb3J0IElPcHRpb25zU2VnbWVudCA9IFNlZ21lbnQuSU9wdGlvbnNTZWdtZW50O1xuZXhwb3J0IGltcG9ydCBJV29yZCA9IFNlZ21lbnQuSVdvcmQ7XG5leHBvcnQgaW1wb3J0IElPcHRpb25zRG9TZWdtZW50ID0gU2VnbWVudC5JT3B0aW9uc0RvU2VnbWVudDtcbmV4cG9ydCBpbXBvcnQgSURJQ1RfU1lOT05ZTSA9IFNlZ21lbnQuSURJQ1RfU1lOT05ZTTtcbmV4cG9ydCBpbXBvcnQgSURJQ1RfU1RPUFdPUkQgPSBTZWdtZW50LklESUNUX1NUT1BXT1JEO1xuXG5leHBvcnQgaW1wb3J0IElESUNUID0gU2VnbWVudC5JRElDVDtcbmV4cG9ydCBpbXBvcnQgSURJQ1QyID0gU2VnbWVudC5JRElDVDI7XG5cbmV4cG9ydCBpbXBvcnQgSVNQTElUID0gU2VnbWVudC5JU1BMSVQ7XG5leHBvcnQgaW1wb3J0IElTUExJVF9GSUxURVIgPSBTZWdtZW50LklTUExJVF9GSUxURVI7XG5cbmV4cG9ydCBkZWZhdWx0IFNlZ21lbnQ7XG4iXX0=