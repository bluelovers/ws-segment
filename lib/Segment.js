/**
 * 分词器接口
 *
 * @author 老雷<leizongmin@gmail.com>
 */
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-ignore
const fs = require("fs");
// @ts-ignore
const path = require("path");
const get_1 = require("./fs/get");
const POSTAG_1 = require("./POSTAG");
const dict_1 = require("./table/dict");
const Tokenizer_1 = require("./Tokenizer");
const Optimizer_1 = require("./Optimizer");
const loader_1 = require("./loader");
const crlf_normalize_1 = require("crlf-normalize");
const segment_dict_1 = require("segment-dict");
/**
 * 创建分词器接口
 */
class Segment {
    constructor(options = {}) {
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
            optimizer: []
        };
        this.db = {};
        this.options = {};
        const self = this;
        this.options = Object.assign({}, this.options, options);
        this.tokenizer = new Tokenizer_1.default(this);
        this.optimizer = new Optimizer_1.default(this);
        if (this.options.db) {
            this.options.db.forEach(function (data) {
                self.db[data.type] = data;
            });
        }
        delete this.options.db;
    }
    getDictDatabase(type, autocreate, libTableDict) {
        if (autocreate && !this.db[type]) {
            libTableDict = libTableDict || dict_1.TableDict;
            this.db[type] = new libTableDict(type, this.options);
        }
        // @ts-ignore
        return this.db[type];
    }
    /**
     * 载入分词模块
     *
     * @param {String|Array|Object} module 模块名称(数组)或模块对象
     * @return {Segment}
     */
    use(module) {
        let me = this;
        if (Array.isArray(module)) {
            module.forEach(function (module) {
                me.use(module[i]);
            });
        }
        else {
            if (typeof module == 'string') {
                // @ts-ignore
                let filename = path.resolve(__dirname, 'module', module + '.js');
                if (!fs.existsSync(filename)) {
                    throw Error('Cannot find module "' + module + '".');
                }
                else {
                    // @ts-ignore
                    module = require(filename);
                }
            }
            // 初始化并注册模块
            module.init(this);
            this.modules[module.type].push(module);
        }
        this.inited = true;
        return this;
    }
    _resolveDictFilename(name, pathPlus = [], extPlus = []) {
        let filename = get_1.searchFirst(name, {
            paths: [
                '',
                path.resolve(__dirname, '../dicts'),
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
        });
        if (!filename) {
            throw Error('Cannot find dict file "' + filename + '".');
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
    loadSynonymDict(name) {
        let filename = this._resolveDictFilename(name, [
            path.resolve(segment_dict_1.default.DICT_ROOT, 'synonym'),
        ]);
        let type = 'SYNONYM';
        // 初始化词典
        if (!this.DICT[type])
            this.DICT[type] = {};
        // 词典表  '同义词' => '标准词'
        let TABLE = this.DICT[type];
        // 导入数据
        let data = loader_1.default.SegmentSynonymLoader.loadSync(filename);
        data.forEach(function (blocks) {
            let [n1, n2] = blocks;
            TABLE[n1] = n2;
            if (TABLE[n2] === n1) {
                delete TABLE[n2];
            }
        });
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
        let type = 'STOPWORD';
        // 初始化词典
        if (!this.DICT[type])
            this.DICT[type] = {};
        let TABLE = this.DICT[type];
        // 导入数据
        let data = loader_1.default.SegmentDict
            .requireLoaderModule('line')
            .loadSync(filename, {
            filter(line) {
                return line.trim();
            }
        });
        data.forEach(function (line) {
            line = line.trim();
            if (line) {
                TABLE[line] = true;
            }
        });
        this.inited = true;
        return this;
    }
    /**
     * 使用默认的识别模块和字典文件
     *
     * @return {Segment}
     */
    useDefault() {
        this
            // 识别模块
            // 强制分割类单词识别
            .use('URLTokenizer') // URL识别
            .use('WildcardTokenizer') // 通配符，必须在标点符号识别之前
            .use('PunctuationTokenizer') // 标点符号识别
            .use('ForeignTokenizer') // 外文字符、数字识别，必须在标点符号识别之后
            // 中文单词识别
            .use('DictTokenizer') // 词典识别
            .use('ChsNameTokenizer') // 人名识别，建议在词典识别之后
            // 优化模块
            .use('EmailOptimizer') // 邮箱地址识别
            .use('ChsNameOptimizer') // 人名识别优化
            .use('DictOptimizer') // 词典识别优化
            .use('DatetimeOptimizer') // 日期时间识别优化
            // 字典文件
            //.loadDict('jieba') <=== bad file
            .loadDict('lazy/badword')
            .loadDict('char')
            .loadDict('phrases')
            .loadDict('phrases2')
            .loadDict('dict') // 盘古词典
            .loadDict('dict2') // 扩展词典（用于调整原盘古词典）
            .loadDict('dict3') // 扩展词典（用于调整原盘古词典）
            .loadDict('names') // 常见名词、人名
            .loadDict('wildcard', 'WILDCARD', true) // 通配符
            .loadSynonymDict('synonym') // 同义词
            .loadStopwordDict('stopword') // 停止符
            .loadDict('lazy/index');
        this.inited = true;
        return this;
    }
    autoInit(throwFn) {
        if (!this.inited) {
            this.inited = true;
            if (!this.modules.tokenizer.length) {
                this.useDefault();
            }
        }
        return this;
    }
    doSegment(text, options = {}) {
        let me = this;
        options = Object.assign({}, Segment.defaultOptionsDoSegment, options);
        this.autoInit();
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
        const split_r = /([\r\n]+)/g;
        const filter_r = new RegExp('^(?:' + split_r.source + ')$', 'g');
        // 将文本按照换行符分割成多段，并逐一分词
        let ret = text.split(split_r).reduce(function (ret, section) {
            if (filter_r.test(section)) {
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
        //console.log(ret);
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
        let total_count = 0;
        // 转换同义词
        function _convertSynonym(list) {
            let count = 0;
            list = list.reduce(function (a, item) {
                let w = item.w;
                if (w in TABLE) {
                    count++;
                    total_count++;
                    //return { w: TABLE[item.w], p: item.p };
                    let p = item.p;
                    if (p & me.POSTAG.BAD) {
                        p = p ^ me.POSTAG.BAD;
                    }
                    a.push(Object.assign({}, item, { w: TABLE[w], ow: w, p, op: item.p }));
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
    stringify(words) {
        return words.map(function (item) {
            return item.w;
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
