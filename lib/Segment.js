/**
 * 分词器接口
 *
 * @author 老雷<leizongmin@gmail.com>
 */
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.Segment = void 0;
const path = require("path");
const get_1 = require("./fs/get");
const blacklist_1 = require("./table/blacklist");
const dict_1 = require("./table/dict");
const loader_1 = require("./loader");
const stopword_1 = require("./table/stopword");
const synonym_1 = require("./table/synonym");
const segment_dict_1 = require("segment-dict");
const project_config_1 = require("../project.config");
const core_1 = require("./segment/core");
const defaults_1 = require("./segment/defaults");
const index_1 = require("./defaults/index");
const useModules2_1 = require("./segment/methods/useModules2");
/**
 * 创建分词器接口
 */
let Segment = /** @class */ (() => {
    class Segment extends core_1.default {
        getDictDatabase(type, autocreate, libTableDict) {
            if ((autocreate || this.inited) && !this.db[type]) {
                if (type == synonym_1.default.type) {
                    libTableDict = libTableDict || synonym_1.default;
                }
                else if (type == stopword_1.TableDictStopword.type) {
                    libTableDict = libTableDict || stopword_1.TableDictStopword;
                }
                else if (type == blacklist_1.default.type || type == "BLACKLIST_FOR_OPTIMIZER" /* BLACKLIST_FOR_OPTIMIZER */ || type == "BLACKLIST_FOR_SYNONYM" /* BLACKLIST_FOR_SYNONYM */) {
                    libTableDict = libTableDict || blacklist_1.default;
                }
                else {
                    libTableDict = libTableDict || dict_1.TableDict;
                }
                this.db[type] = new libTableDict(type, this.options, {
                    TABLE: this.DICT[type],
                });
            }
            return this.db[type];
        }
        use(mod, ...argv) {
            useModules2_1.useModules(this, mod, ...argv);
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
        /**
         * 字典黑名單 在主字典內刪除此字典內有的條目
         */
        loadBlacklistDict(name) {
            return this._loadBlacklistDict(name, "BLACKLIST" /* BLACKLIST */);
        }
        /**
         * 優化器黑名單 會防止部分優化器去組合此字典內的詞
         * 例如 人名 自動組合之類
         */
        loadBlacklistOptimizerDict(name) {
            return this._loadBlacklistDict(name, "BLACKLIST_FOR_OPTIMIZER" /* BLACKLIST_FOR_OPTIMIZER */);
        }
        /**
         * 轉換黑名單 動態轉換字詞時會忽略此字典內的詞
         */
        loadBlacklistSynonymDict(name) {
            return this._loadBlacklistDict(name, "BLACKLIST_FOR_SYNONYM" /* BLACKLIST_FOR_SYNONYM */);
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
            const type = "STOPWORD" /* STOPWORD */;
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
            index_1.useDefault(this, ...argv);
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
            const BLACKLIST = me.getDictDatabase("BLACKLIST" /* BLACKLIST */);
            const TABLE = me.getDictDatabase("TABLE" /* TABLE */);
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
            const BLACKLIST = me.getDict("BLACKLIST" /* BLACKLIST */);
            const TABLE = me.getDictDatabase("TABLE" /* TABLE */);
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
    Segment.defaultOptionsDoSegment = defaults_1.defaultOptionsDoSegment;
    return Segment;
})();
exports.Segment = Segment;
exports.default = Segment;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2VnbWVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIlNlZ21lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7R0FJRztBQUVILFlBQVksQ0FBQzs7O0FBRWIsNkJBQTZCO0FBQzdCLGtDQUEyRDtBQUUzRCxpREFBbUQ7QUFFbkQsdUNBQXdFO0FBRXhFLHFDQUE4QjtBQUU5QiwrQ0FBcUQ7QUFDckQsNkNBQStDO0FBQy9DLCtDQUF1QztBQUt2QyxzREFBOEM7QUFrQjlDLHlDQUF5QztBQUd6QyxpREFBNkQ7QUFDN0QsNENBQWtFO0FBQ2xFLCtEQUEyRDtBQUUzRDs7R0FFRztBQUNIO0lBQUEsTUFBYSxPQUFRLFNBQVEsY0FBVztRQWlDdkMsZUFBZSxDQUFDLElBQVksRUFBRSxVQUFvQixFQUFFLFlBQWE7WUFFaEUsSUFBSSxDQUFDLFVBQVUsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUNqRDtnQkFDQyxJQUFJLElBQUksSUFBSSxpQkFBZ0IsQ0FBQyxJQUFJLEVBQ2pDO29CQUNDLFlBQVksR0FBRyxZQUFZLElBQUksaUJBQWdCLENBQUM7aUJBQ2hEO3FCQUNJLElBQUksSUFBSSxJQUFJLDRCQUFpQixDQUFDLElBQUksRUFDdkM7b0JBQ0MsWUFBWSxHQUFHLFlBQVksSUFBSSw0QkFBaUIsQ0FBQztpQkFDakQ7cUJBQ0ksSUFBSSxJQUFJLElBQUksbUJBQWtCLENBQUMsSUFBSSxJQUFJLElBQUksMkRBQTRDLElBQUksSUFBSSx1REFBMEMsRUFDOUk7b0JBQ0MsWUFBWSxHQUFHLFlBQVksSUFBSSxtQkFBa0IsQ0FBQztpQkFDbEQ7cUJBRUQ7b0JBQ0MsWUFBWSxHQUFHLFlBQVksSUFBSSxnQkFBUyxDQUFDO2lCQUN6QztnQkFFRCxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksWUFBWSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMs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SSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBRTVCLE9BQU8sS0FBSyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFRLENBQUE7UUFDN0MsQ0FBQzs7SUEvY00sK0JBQXVCLEdBQXNCLGtDQUF1QixDQUFDO0lBaWQ3RSxjQUFDO0tBQUE7QUFwZFksMEJBQU87QUE2ZnBCLGtCQUFlLE9BQU8sQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICog5YiG6K+N5Zmo5o6l5Y+jXG4gKlxuICogQGF1dGhvciDogIHpm7c8bGVpem9uZ21pbkBnbWFpbC5jb20+XG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgc2VhcmNoRmlyc3RTeW5jLCBzZWFyY2hHbG9iU3luYyB9IGZyb20gJy4vZnMvZ2V0JztcbmltcG9ydCBQT1NUQUcgZnJvbSAnLi9QT1NUQUcnO1xuaW1wb3J0IFRhYmxlRGljdEJsYWNrbGlzdCBmcm9tICcuL3RhYmxlL2JsYWNrbGlzdCc7XG5pbXBvcnQgQWJzdHJhY3RUYWJsZURpY3RDb3JlIGZyb20gJy4vdGFibGUvY29yZSc7XG5pbXBvcnQgeyBJT3B0aW9ucyBhcyBJT3B0aW9uc1RhYmxlRGljdCwgVGFibGVEaWN0IH0gZnJvbSAnLi90YWJsZS9kaWN0JztcblxuaW1wb3J0IExvYWRlciBmcm9tICcuL2xvYWRlcic7XG5pbXBvcnQgeyBjcmxmIH0gZnJvbSAnY3JsZi1ub3JtYWxpemUnO1xuaW1wb3J0IHsgVGFibGVEaWN0U3RvcHdvcmQgfSBmcm9tICcuL3RhYmxlL3N0b3B3b3JkJztcbmltcG9ydCBUYWJsZURpY3RTeW5vbnltIGZyb20gJy4vdGFibGUvc3lub255bSc7XG5pbXBvcnQgU2VnbWVudERpY3QgZnJvbSAnc2VnbWVudC1kaWN0JztcbmltcG9ydCB7IElTdWJPcHRpbWl6ZXIsIElTdWJUb2tlbml6ZXIsIE9wdGltaXplciwgVG9rZW5pemVyIH0gZnJvbSAnLi9tb2QnO1xuaW1wb3J0IHsgZGVidWdUb2tlbiB9IGZyb20gJy4vdXRpbC9kZWJ1Zyc7XG5pbXBvcnQgeyBJV29yZERlYnVnIH0gZnJvbSAnLi91dGlsL2luZGV4JztcblxuaW1wb3J0IFByb2plY3RDb25maWcgZnJvbSAnLi4vcHJvamVjdC5jb25maWcnO1xuXG5pbXBvcnQgZGVlcG1lcmdlIGZyb20gJ2RlZXBtZXJnZS1wbHVzL2NvcmUnO1xuaW1wb3J0IHsgRW51bURpY3REYXRhYmFzZSB9IGZyb20gJy4vY29uc3QnO1xuaW1wb3J0IHsgRU5VTV9TVUJNT0RTLCBFTlVNX1NVQk1PRFNfTkFNRSwgRU5VTV9TVUJNT0RTX09USEVSIH0gZnJvbSAnLi9tb2QvaW5kZXgnO1xuXG5pbXBvcnQge1xuXHRJRElDVCxcblx0SURJQ1QyLFxuXHRJRElDVF9CTEFDS0xJU1QsXG5cdElESUNUX1NUT1BXT1JELFxuXHRJRElDVF9TWU5PTllNLFxuXHRJT3B0aW9uc0RvU2VnbWVudCxcblx0SU9wdGlvbnNTZWdtZW50LFxuXHRJU1BMSVQsXG5cdElTUExJVF9GSUxURVIsXG5cdElXb3JkLFxufSBmcm9tICcuL3NlZ21lbnQvdHlwZXMnO1xuaW1wb3J0IFNlZ21lbnRDb3JlIGZyb20gJy4vc2VnbWVudC9jb3JlJztcbmltcG9ydCB7IF9pc0lnbm9yZU1vZHVsZXMgfSBmcm9tICcuL3NlZ21lbnQvbWV0aG9kcy91c2VNb2R1bGVzJztcbmltcG9ydCB7IElUU092ZXJ3cml0ZSB9IGZyb20gJ3RzLXR5cGUnO1xuaW1wb3J0IHsgZGVmYXVsdE9wdGlvbnNEb1NlZ21lbnQgfSBmcm9tICcuL3NlZ21lbnQvZGVmYXVsdHMnO1xuaW1wb3J0IHsgSVVzZURlZmF1bHRPcHRpb25zLCB1c2VEZWZhdWx0IH0gZnJvbSAnLi9kZWZhdWx0cy9pbmRleCc7XG5pbXBvcnQgeyB1c2VNb2R1bGVzIH0gZnJvbSAnLi9zZWdtZW50L21ldGhvZHMvdXNlTW9kdWxlczInO1xuXG4vKipcbiAqIOWIm+W7uuWIhuivjeWZqOaOpeWPo1xuICovXG5leHBvcnQgY2xhc3MgU2VnbWVudCBleHRlbmRzIFNlZ21lbnRDb3JlXG57XG5cblx0c3RhdGljIGRlZmF1bHRPcHRpb25zRG9TZWdtZW50OiBJT3B0aW9uc0RvU2VnbWVudCA9IGRlZmF1bHRPcHRpb25zRG9TZWdtZW50O1xuXG5cdGdldERpY3REYXRhYmFzZTxSIGV4dGVuZHMgVGFibGVEaWN0U3lub255bT4odHlwZTogRW51bURpY3REYXRhYmFzZS5TWU5PTllNLFxuXHRcdGF1dG9jcmVhdGU/OiBib29sZWFuLFxuXHRcdGxpYlRhYmxlRGljdD86IHsgbmV3KC4uLmFyZ3YpOiBSIH0sXG5cdCk6IFJcblx0Z2V0RGljdERhdGFiYXNlPFIgZXh0ZW5kcyBUYWJsZURpY3Q+KHR5cGU6IEVudW1EaWN0RGF0YWJhc2UuVEFCTEUsXG5cdFx0YXV0b2NyZWF0ZT86IGJvb2xlYW4sXG5cdFx0bGliVGFibGVEaWN0PzogeyBuZXcoLi4uYXJndik6IFIgfSxcblx0KTogUlxuXHRnZXREaWN0RGF0YWJhc2U8UiBleHRlbmRzIFRhYmxlRGljdFN0b3B3b3JkPih0eXBlOiBFbnVtRGljdERhdGFiYXNlLlNUT1BXT1JELFxuXHRcdGF1dG9jcmVhdGU/OiBib29sZWFuLFxuXHRcdGxpYlRhYmxlRGljdD86IHsgbmV3KC4uLmFyZ3YpOiBSIH0sXG5cdCk6IFJcblx0Z2V0RGljdERhdGFiYXNlPFIgZXh0ZW5kcyBUYWJsZURpY3RCbGFja2xpc3Q+KHR5cGU6IEVudW1EaWN0RGF0YWJhc2UuQkxBQ0tMSVNULFxuXHRcdGF1dG9jcmVhdGU/OiBib29sZWFuLFxuXHRcdGxpYlRhYmxlRGljdD86IHsgbmV3KC4uLmFyZ3YpOiBSIH0sXG5cdCk6IFJcblx0Z2V0RGljdERhdGFiYXNlPFIgZXh0ZW5kcyBUYWJsZURpY3RCbGFja2xpc3Q+KHR5cGU6IEVudW1EaWN0RGF0YWJhc2UuQkxBQ0tMSVNUX0ZPUl9PUFRJTUlaRVIsXG5cdFx0YXV0b2NyZWF0ZT86IGJvb2xlYW4sXG5cdFx0bGliVGFibGVEaWN0PzogeyBuZXcoLi4uYXJndik6IFIgfSxcblx0KTogUlxuXHRnZXREaWN0RGF0YWJhc2U8UiBleHRlbmRzIFRhYmxlRGljdEJsYWNrbGlzdD4odHlwZTogRW51bURpY3REYXRhYmFzZS5CTEFDS0xJU1RfRk9SX1NZTk9OWU0sXG5cdFx0YXV0b2NyZWF0ZT86IGJvb2xlYW4sXG5cdFx0bGliVGFibGVEaWN0PzogeyBuZXcoLi4uYXJndik6IFIgfSxcblx0KTogUlxuXHRnZXREaWN0RGF0YWJhc2U8UiBleHRlbmRzIEFic3RyYWN0VGFibGVEaWN0Q29yZTxhbnk+Pih0eXBlOiBzdHJpbmcgfCBFbnVtRGljdERhdGFiYXNlLFxuXHRcdGF1dG9jcmVhdGU/OiBib29sZWFuLFxuXHRcdGxpYlRhYmxlRGljdD86IHsgbmV3KC4uLmFyZ3YpOiBSIH0sXG5cdCk6IFJcblx0Z2V0RGljdERhdGFiYXNlKHR5cGU6IHN0cmluZywgYXV0b2NyZWF0ZT86IGJvb2xlYW4sIGxpYlRhYmxlRGljdD8pXG5cdHtcblx0XHRpZiAoKGF1dG9jcmVhdGUgfHwgdGhpcy5pbml0ZWQpICYmICF0aGlzLmRiW3R5cGVdKVxuXHRcdHtcblx0XHRcdGlmICh0eXBlID09IFRhYmxlRGljdFN5bm9ueW0udHlwZSlcblx0XHRcdHtcblx0XHRcdFx0bGliVGFibGVEaWN0ID0gbGliVGFibGVEaWN0IHx8IFRhYmxlRGljdFN5bm9ueW07XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmICh0eXBlID09IFRhYmxlRGljdFN0b3B3b3JkLnR5cGUpXG5cdFx0XHR7XG5cdFx0XHRcdGxpYlRhYmxlRGljdCA9IGxpYlRhYmxlRGljdCB8fCBUYWJsZURpY3RTdG9wd29yZDtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKHR5cGUgPT0gVGFibGVEaWN0QmxhY2tsaXN0LnR5cGUgfHwgdHlwZSA9PSBFbnVtRGljdERhdGFiYXNlLkJMQUNLTElTVF9GT1JfT1BUSU1JWkVSIHx8IHR5cGUgPT0gRW51bURpY3REYXRhYmFzZS5CTEFDS0xJU1RfRk9SX1NZTk9OWU0pXG5cdFx0XHR7XG5cdFx0XHRcdGxpYlRhYmxlRGljdCA9IGxpYlRhYmxlRGljdCB8fCBUYWJsZURpY3RCbGFja2xpc3Q7XG5cdFx0XHR9XG5cdFx0XHRlbHNlXG5cdFx0XHR7XG5cdFx0XHRcdGxpYlRhYmxlRGljdCA9IGxpYlRhYmxlRGljdCB8fCBUYWJsZURpY3Q7XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMuZGJbdHlwZV0gPSBuZXcgbGliVGFibGVEaWN0KHR5cGUsIHRoaXMub3B0aW9ucywge1xuXHRcdFx0XHRUQUJMRTogdGhpcy5ESUNUW3R5cGVdLFxuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXMuZGJbdHlwZV07XG5cdH1cblxuXHQvKipcblx0ICog6L295YWl5YiG6K+N5qih5Z2XXG5cdCAqXG5cdCAqIEBwYXJhbSB7U3RyaW5nfEFycmF5fE9iamVjdH0gbW9kdWxlIOaooeWdl+WQjeensCjmlbDnu4Qp5oiW5qih5Z2X5a+56LGhXG5cdCAqIEByZXR1cm4ge1NlZ21lbnR9XG5cdCAqL1xuXHR1c2UobW9kOiBJU3ViT3B0aW1pemVyLCAuLi5hcmd2KVxuXHR1c2UobW9kOiBJU3ViVG9rZW5pemVyLCAuLi5hcmd2KVxuXHR1c2UobW9kOiBBcnJheTxJU3ViVG9rZW5pemVyIHwgSVN1Yk9wdGltaXplciB8IHN0cmluZz4sIC4uLmFyZ3YpXG5cdHVzZShtb2Q6IHN0cmluZywgLi4uYXJndilcblx0dXNlKG1vZCwgLi4uYXJndilcblx0dXNlKG1vZCwgLi4uYXJndilcblx0e1xuXHRcdHVzZU1vZHVsZXModGhpcywgbW9kLCAuLi5hcmd2KTtcblxuXHRcdHRoaXMuaW5pdGVkID0gdHJ1ZTtcblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0X3Jlc29sdmVEaWN0RmlsZW5hbWUobmFtZTogc3RyaW5nLCBwYXRoUGx1czogc3RyaW5nW10gPSBbXSwgZXh0UGx1czogc3RyaW5nW10gPSBbXSk6IHN0cmluZyB8IHN0cmluZ1tdXG5cdHtcblx0XHRsZXQgb3B0aW9ucyA9IHtcblx0XHRcdHBhdGhzOiBbXG5cdFx0XHRcdCcnLFxuXHRcdFx0XHRQcm9qZWN0Q29uZmlnLmRpY3Rfcm9vdCxcblxuXHRcdFx0XHQuLi5wYXRoUGx1cyxcblx0XHRcdFx0cGF0aC5yZXNvbHZlKFNlZ21lbnREaWN0LkRJQ1RfUk9PVCwgJ3NlZ21lbnQnKSxcblx0XHRcdF0sXG5cdFx0XHRleHRlbnNpb25zOiBbXG5cdFx0XHRcdCcnLFxuXHRcdFx0XHQuLi5leHRQbHVzLFxuXHRcdFx0XHQnLnV0ZjgnLFxuXHRcdFx0XHQnLnR4dCcsXG5cdFx0XHRdLFxuXG5cdFx0XHRvbmx5RmlsZTogdHJ1ZSxcblx0XHR9O1xuXG5cdFx0aWYgKG5hbWUuaW5kZXhPZignKicpICE9IC0xKVxuXHRcdHtcblx0XHRcdGxldCBscyA9IHNlYXJjaEdsb2JTeW5jKG5hbWUsIG9wdGlvbnMpO1xuXG5cdFx0XHRpZiAoIWxzIHx8ICFscy5sZW5ndGgpXG5cdFx0XHR7XG5cdFx0XHRcdHRocm93IEVycm9yKGBDYW5ub3QgZmluZCBkaWN0IGdsb2IgZmlsZSBcIiR7bmFtZX1cIi5gKTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIGxzO1xuXHRcdH1cblxuXHRcdGxldCBmaWxlbmFtZSA9IHNlYXJjaEZpcnN0U3luYyhuYW1lLCBvcHRpb25zKTtcblxuXHRcdGlmICghZmlsZW5hbWUpXG5cdFx0e1xuXHRcdFx0Ly9jb25zb2xlLmxvZyhuYW1lLCBwYXRoUGx1cywgZXh0UGx1cyk7XG5cblx0XHRcdHRocm93IEVycm9yKGBDYW5ub3QgZmluZCBkaWN0IGZpbGUgXCIke25hbWV9XCIuYCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGZpbGVuYW1lO1xuXHR9XG5cblx0LyoqXG5cdCAqIOi9veWFpeWtl+WFuOaWh+S7tlxuXHQgKlxuXHQgKiBAcGFyYW0ge1N0cmluZ30gbmFtZSDlrZflhbjmlofku7blkI1cblx0ICogQHBhcmFtIHtTdHJpbmd9IHR5cGUg57G75Z6LXG5cdCAqIEBwYXJhbSB7Qm9vbGVhbn0gY29udmVydF90b19sb3dlciDmmK/lkKblhajpg6jovazmjaLkuLrlsI/lhplcblx0ICogQHJldHVybiB7U2VnbWVudH1cblx0ICovXG5cdGxvYWREaWN0KG5hbWU6IHN0cmluZywgdHlwZT86IHN0cmluZywgY29udmVydF90b19sb3dlcj86IGJvb2xlYW4sIHNraXBFeGlzdHM/OiBib29sZWFuKVxuXHR7XG5cdFx0bGV0IGZpbGVuYW1lID0gdGhpcy5fcmVzb2x2ZURpY3RGaWxlbmFtZShuYW1lKTtcblxuXHRcdGlmIChBcnJheS5pc0FycmF5KGZpbGVuYW1lKSlcblx0XHR7XG5cdFx0XHRsZXQgc2VsZiA9IHRoaXM7XG5cblx0XHRcdGZpbGVuYW1lLmZvckVhY2godiA9PiB0aGlzLmxvYWREaWN0KHYsIHR5cGUsIGNvbnZlcnRfdG9fbG93ZXIsIHNraXBFeGlzdHMpKTtcblxuXHRcdFx0Ly9jb25zb2xlLmxvZyhmaWxlbmFtZSk7XG5cblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH1cblxuXHRcdGlmICghdHlwZSkgdHlwZSA9ICdUQUJMRSc7ICAgICAvLyDpu5jorqTkuLpUQUJMRVxuXG5cdFx0Y29uc3QgZGIgPSB0aGlzLmdldERpY3REYXRhYmFzZSh0eXBlLCB0cnVlKTtcblxuXHRcdGNvbnN0IFRBQkxFID0gdGhpcy5ESUNUW3R5cGVdID0gZGIuVEFCTEU7XG5cdFx0Y29uc3QgVEFCTEUyID0gdGhpcy5ESUNUW3R5cGUgKyAnMiddID0gZGIuVEFCTEUyO1xuXG5cdFx0Lypcblx0XHQvLyDliJ3lp4vljJbor43lhbhcblx0XHRpZiAoIXRoaXMuRElDVFt0eXBlXSkgdGhpcy5ESUNUW3R5cGVdID0ge307XG5cdFx0aWYgKCF0aGlzLkRJQ1RbdHlwZSArICcyJ10pIHRoaXMuRElDVFt0eXBlICsgJzInXSA9IHt9O1xuXHRcdGxldCBUQUJMRSA9IHRoaXMuRElDVFt0eXBlXTsgICAgICAgIC8vIOivjeWFuOihqCAgJ+ivjScgPT4ge+WxnuaAp31cblx0XHRsZXQgVEFCTEUyID0gdGhpcy5ESUNUW3R5cGUgKyAnMiddOyAvLyDor43lhbjooaggICfplb/luqYnID0+ICfor40nID0+IOWxnuaAp1xuXHRcdCovXG5cdFx0Ly8g5a+85YWl5pWw5o2uXG5cdFx0Y29uc3QgUE9TVEFHID0gdGhpcy5QT1NUQUc7XG5cblx0XHRsZXQgZGF0YSA9IExvYWRlci5TZWdtZW50RGljdExvYWRlci5sb2FkU3luYyhmaWxlbmFtZSk7XG5cblx0XHRkYXRhLmZvckVhY2goZnVuY3Rpb24gKGRhdGEpXG5cdFx0e1xuXHRcdFx0aWYgKGNvbnZlcnRfdG9fbG93ZXIpXG5cdFx0XHR7XG5cdFx0XHRcdGRhdGFbMF0gPSBkYXRhWzBdLnRvTG93ZXJDYXNlKCk7XG5cdFx0XHR9XG5cblx0XHRcdGRiLmFkZChkYXRhLCBza2lwRXhpc3RzKTtcblxuXHRcdFx0Lypcblx0XHRcdGxldCBbdywgcCwgZl0gPSBkYXRhO1xuXG5cdFx0XHRpZiAody5sZW5ndGggPT0gMClcblx0XHRcdHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKClcblx0XHRcdH1cblxuXHRcdFx0VEFCTEVbd10gPSB7IHAsIGYsIH07XG5cdFx0XHRpZiAoIVRBQkxFMlt3Lmxlbmd0aF0pIFRBQkxFMlt3Lmxlbmd0aF0gPSB7fTtcblx0XHRcdFRBQkxFMlt3Lmxlbmd0aF1bd10gPSBUQUJMRVt3XTtcblx0XHRcdCovXG5cdFx0fSk7XG5cblx0XHRkYXRhID0gdW5kZWZpbmVkO1xuXG5cdFx0dGhpcy5pbml0ZWQgPSB0cnVlO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICog6L295YWl5ZCM5LmJ6K+N6K+N5YW4XG5cdCAqXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIOWtl+WFuOaWh+S7tuWQjVxuXHQgKi9cblx0bG9hZFN5bm9ueW1EaWN0KG5hbWU6IHN0cmluZywgc2tpcEV4aXN0cz86IGJvb2xlYW4pXG5cdHtcblx0XHRsZXQgZmlsZW5hbWUgPSB0aGlzLl9yZXNvbHZlRGljdEZpbGVuYW1lKG5hbWUsIFtcblx0XHRcdHBhdGgucmVzb2x2ZShTZWdtZW50RGljdC5ESUNUX1JPT1QsICdzeW5vbnltJyksXG5cdFx0XSk7XG5cblx0XHRpZiAoQXJyYXkuaXNBcnJheShmaWxlbmFtZSkpXG5cdFx0e1xuXHRcdFx0bGV0IHNlbGYgPSB0aGlzO1xuXG5cdFx0XHRmaWxlbmFtZS5mb3JFYWNoKHYgPT4gdGhpcy5sb2FkU3lub255bURpY3Qodiwgc2tpcEV4aXN0cykpO1xuXG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9XG5cblx0XHRsZXQgdHlwZSA9ICdTWU5PTllNJztcblxuXHRcdGNvbnN0IGRiID0gdGhpcy5nZXREaWN0RGF0YWJhc2UodHlwZSwgdHJ1ZSk7XG5cblx0XHRjb25zdCBUQUJMRSA9IHRoaXMuRElDVFt0eXBlXSA9IGRiLlRBQkxFO1xuXG5cdFx0Lypcblx0XHQvLyDliJ3lp4vljJbor43lhbhcblx0XHRpZiAoIXRoaXMuRElDVFt0eXBlXSkgdGhpcy5ESUNUW3R5cGVdID0ge307XG5cdFx0Ly8g6K+N5YW46KGoICAn5ZCM5LmJ6K+NJyA9PiAn5qCH5YeG6K+NJ1xuXHRcdGxldCBUQUJMRSA9IHRoaXMuRElDVFt0eXBlXSBhcyBJRElDVF9TWU5PTllNO1xuXHRcdC8vIOWvvOWFpeaVsOaNrlxuXHRcdCovXG5cblx0XHRsZXQgZGF0YSA9IExvYWRlci5TZWdtZW50U3lub255bUxvYWRlci5sb2FkU3luYyhmaWxlbmFtZSk7XG5cblx0XHRkYXRhLmZvckVhY2goZnVuY3Rpb24gKGJsb2Nrczogc3RyaW5nW10pXG5cdFx0e1xuXHRcdFx0ZGIuYWRkKGJsb2Nrcywgc2tpcEV4aXN0cyk7XG5cblx0XHRcdC8qXG5cdFx0XHRsZXQgW24xLCBuMl0gPSBibG9ja3M7XG5cblx0XHRcdFRBQkxFW24xXSA9IG4yO1xuXHRcdFx0aWYgKFRBQkxFW24yXSA9PT0gbjEpXG5cdFx0XHR7XG5cdFx0XHRcdGRlbGV0ZSBUQUJMRVtuMl07XG5cdFx0XHR9XG5cdFx0XHQqL1xuXHRcdH0pO1xuXG5cdFx0Ly9jb25zb2xlLmxvZyhUQUJMRSk7XG5cblx0XHRkYXRhID0gdW5kZWZpbmVkO1xuXG5cdFx0dGhpcy5pbml0ZWQgPSB0cnVlO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHRwcm90ZWN0ZWQgX2xvYWRCbGFja2xpc3REaWN0KG5hbWU6IHN0cmluZywgdHlwZTogRW51bURpY3REYXRhYmFzZSlcblx0e1xuXHRcdGxldCBmaWxlbmFtZSA9IHRoaXMuX3Jlc29sdmVEaWN0RmlsZW5hbWUobmFtZSwgW1xuXHRcdFx0cGF0aC5yZXNvbHZlKFNlZ21lbnREaWN0LkRJQ1RfUk9PVCwgJ2JsYWNrbGlzdCcpLFxuXHRcdF0pO1xuXG5cdFx0aWYgKEFycmF5LmlzQXJyYXkoZmlsZW5hbWUpKVxuXHRcdHtcblx0XHRcdGxldCBzZWxmID0gdGhpcztcblxuXHRcdFx0ZmlsZW5hbWUuZm9yRWFjaCh2ID0+IHRoaXMuX2xvYWRCbGFja2xpc3REaWN0KHYsIHR5cGUpKTtcblxuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fVxuXG5cdFx0Y29uc3QgZGIgPSB0aGlzLmdldERpY3REYXRhYmFzZSh0eXBlLCB0cnVlKTtcblxuXHRcdGNvbnN0IFRBQkxFID0gdGhpcy5ESUNUW3R5cGVdID0gZGIuVEFCTEU7XG5cblx0XHRsZXQgZGF0YSA9IExvYWRlci5TZWdtZW50RGljdFxuXHRcdFx0LnJlcXVpcmVMb2FkZXJNb2R1bGUoJ2xpbmUnKVxuXHRcdFx0LmxvYWRTeW5jKGZpbGVuYW1lLCB7XG5cdFx0XHRcdGZpbHRlcihsaW5lOiBzdHJpbmcpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXR1cm4gbGluZS50cmltKCk7XG5cdFx0XHRcdH0sXG5cdFx0XHR9KVxuXHRcdDtcblxuXHRcdGRhdGEuZm9yRWFjaCh2ID0+IGRiLmFkZCh2KSk7XG5cblx0XHRkYXRhID0gdW5kZWZpbmVkO1xuXG5cdFx0dGhpcy5pbml0ZWQgPSB0cnVlO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICog5a2X5YW46buR5ZCN5ZauIOWcqOS4u+Wtl+WFuOWFp+WIqumZpOatpOWtl+WFuOWFp+acieeahOaineebrlxuXHQgKi9cblx0bG9hZEJsYWNrbGlzdERpY3QobmFtZTogc3RyaW5nKVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX2xvYWRCbGFja2xpc3REaWN0KG5hbWUsIEVudW1EaWN0RGF0YWJhc2UuQkxBQ0tMSVNUKVxuXHR9XG5cblx0LyoqXG5cdCAqIOWEquWMluWZqOm7keWQjeWWriDmnIPpmLLmraLpg6jliIblhKrljJblmajljrvntYTlkIjmraTlrZflhbjlhafnmoToqZ5cblx0ICog5L6L5aaCIOS6uuWQjSDoh6rli5XntYTlkIjkuYvpoZ5cblx0ICovXG5cdGxvYWRCbGFja2xpc3RPcHRpbWl6ZXJEaWN0KG5hbWU6IHN0cmluZylcblx0e1xuXHRcdHJldHVybiB0aGlzLl9sb2FkQmxhY2tsaXN0RGljdChuYW1lLCBFbnVtRGljdERhdGFiYXNlLkJMQUNLTElTVF9GT1JfT1BUSU1JWkVSKVxuXHR9XG5cblx0LyoqXG5cdCAqIOi9ieaPm+m7keWQjeWWriDli5XmhYvovYnmj5vlrZfoqZ7mmYLmnIPlv73nlaXmraTlrZflhbjlhafnmoToqZ5cblx0ICovXG5cdGxvYWRCbGFja2xpc3RTeW5vbnltRGljdChuYW1lOiBzdHJpbmcpXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fbG9hZEJsYWNrbGlzdERpY3QobmFtZSwgRW51bURpY3REYXRhYmFzZS5CTEFDS0xJU1RfRk9SX1NZTk9OWU0pXG5cdH1cblxuXHQvKipcblx0ICog6L295YWl5YGc5q2i56ym6K+N5YW4XG5cdCAqXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIOWtl+WFuOaWh+S7tuWQjVxuXHQgKi9cblx0bG9hZFN0b3B3b3JkRGljdChuYW1lOiBzdHJpbmcpXG5cdHtcblx0XHRsZXQgZmlsZW5hbWUgPSB0aGlzLl9yZXNvbHZlRGljdEZpbGVuYW1lKG5hbWUsIFtcblx0XHRcdHBhdGgucmVzb2x2ZShTZWdtZW50RGljdC5ESUNUX1JPT1QsICdzdG9wd29yZCcpLFxuXHRcdF0pO1xuXG5cdFx0aWYgKEFycmF5LmlzQXJyYXkoZmlsZW5hbWUpKVxuXHRcdHtcblx0XHRcdGxldCBzZWxmID0gdGhpcztcblxuXHRcdFx0ZmlsZW5hbWUuZm9yRWFjaCh2ID0+IHRoaXMubG9hZFN0b3B3b3JkRGljdCh2KSk7XG5cblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH1cblxuXHRcdGNvbnN0IHR5cGUgPSBFbnVtRGljdERhdGFiYXNlLlNUT1BXT1JEO1xuXG5cdFx0Y29uc3QgZGIgPSB0aGlzLmdldERpY3REYXRhYmFzZSh0eXBlLCB0cnVlKTtcblxuXHRcdGNvbnN0IFRBQkxFID0gdGhpcy5ESUNUW3R5cGVdID0gZGIuVEFCTEU7XG5cblx0XHRsZXQgZGF0YSA9IExvYWRlci5TZWdtZW50RGljdFxuXHRcdFx0LnJlcXVpcmVMb2FkZXJNb2R1bGUoJ2xpbmUnKVxuXHRcdFx0LmxvYWRTeW5jKGZpbGVuYW1lLCB7XG5cdFx0XHRcdGZpbHRlcihsaW5lOiBzdHJpbmcpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXR1cm4gbGluZS50cmltKCk7XG5cdFx0XHRcdH0sXG5cdFx0XHR9KVxuXHRcdDtcblxuXHRcdGRhdGEuZm9yRWFjaCh2ID0+IGRiLmFkZCh2KSk7XG5cblx0XHRkYXRhID0gdW5kZWZpbmVkO1xuXG5cdFx0dGhpcy5pbml0ZWQgPSB0cnVlO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICog5L2/55So6buY6K6k55qE6K+G5Yir5qih5Z2X5ZKM5a2X5YW45paH5Lu2XG5cdCAqIOWcqOS9v+eUqOmgkOioreWAvOeahOaDheazgeS4i++8jOS4jemcgOimgeS4u+WLleWRvOWPq+atpOWHveaVuFxuXHQgKlxuXHQgKiBAcmV0dXJuIHtTZWdtZW50fVxuXHQgKi9cblx0dXNlRGVmYXVsdChvcHRpb25zPzogSVVzZURlZmF1bHRPcHRpb25zLCAuLi5hcmd2KVxuXHR1c2VEZWZhdWx0KC4uLmFyZ3YpXG5cdHtcblx0XHR1c2VEZWZhdWx0KHRoaXMsIC4uLmFyZ3YpO1xuXG5cdFx0dGhpcy5pbml0ZWQgPSB0cnVlO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICog5q2k5Ye95pW45Y+q6ZyA5Z+36KGM5LiA5qyh77yM5Lim5LiU5LiA6Iis54uA5rOB5LiL5LiN6ZyA6KaB5omL5YuV5ZG85Y+rXG5cdCAqL1xuXHRhdXRvSW5pdChvcHRpb25zPzogSVVzZURlZmF1bHRPcHRpb25zKVxuXHR7XG5cdFx0aWYgKCF0aGlzLmluaXRlZClcblx0XHR7XG5cdFx0XHR0aGlzLmluaXRlZCA9IHRydWU7XG5cblx0XHRcdGlmICghdGhpcy5tb2R1bGVzLnRva2VuaXplci5sZW5ndGgpXG5cdFx0XHR7XG5cdFx0XHRcdHRoaXMudXNlRGVmYXVsdChvcHRpb25zKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdGFkZEJsYWNrbGlzdCh3b3JkOiBzdHJpbmcsIHJlbW92ZT86IGJvb2xlYW4pXG5cdHtcblx0XHRsZXQgbWUgPSB0aGlzO1xuXG5cdFx0dGhpcy5hdXRvSW5pdCh0aGlzLm9wdGlvbnMpO1xuXG5cdFx0Y29uc3QgQkxBQ0tMSVNUID0gbWUuZ2V0RGljdERhdGFiYXNlKEVudW1EaWN0RGF0YWJhc2UuQkxBQ0tMSVNUKTtcblx0XHRjb25zdCBUQUJMRSA9IG1lLmdldERpY3REYXRhYmFzZShFbnVtRGljdERhdGFiYXNlLlRBQkxFKTtcblxuXHRcdGxldCBib29sID0gIXJlbW92ZTtcblxuXHRcdGlmIChib29sKVxuXHRcdHtcblx0XHRcdEJMQUNLTElTVC5hZGQod29yZCk7XG5cdFx0XHRUQUJMRS5yZW1vdmUod29yZCk7XG5cdFx0fVxuXHRcdGVsc2Vcblx0XHR7XG5cdFx0XHRCTEFDS0xJU1QucmVtb3ZlKHdvcmQpXG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXNcblx0fVxuXG5cdC8qKlxuXHQgKiByZW1vdmUga2V5IGluIFRBQkxFIGJ5IEJMQUNLTElTVFxuXHQgKi9cblx0ZG9CbGFja2xpc3QoKVxuXHR7XG5cdFx0bGV0IG1lID0gdGhpcztcblxuXHRcdHRoaXMuYXV0b0luaXQodGhpcy5vcHRpb25zKTtcblxuXHRcdGNvbnN0IEJMQUNLTElTVCA9IG1lLmdldERpY3QoRW51bURpY3REYXRhYmFzZS5CTEFDS0xJU1QpO1xuXHRcdGNvbnN0IFRBQkxFID0gbWUuZ2V0RGljdERhdGFiYXNlKEVudW1EaWN0RGF0YWJhc2UuVEFCTEUpO1xuXG5cdFx0T2JqZWN0LmVudHJpZXMoQkxBQ0tMSVNUKVxuXHRcdFx0LmZvckVhY2goZnVuY3Rpb24gKFtrZXksIGJvb2xdKVxuXHRcdFx0e1xuXHRcdFx0XHRib29sICYmIFRBQkxFLnJlbW92ZShrZXkpXG5cdFx0XHR9KVxuXHRcdDtcblxuXHRcdHJldHVybiB0aGlzXG5cdH1cblxuXHQvKipcblx0ICog5byA5aeL5YiG6K+NXG5cdCAqXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSB0ZXh0IOaWh+acrFxuXHQgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyDpgInpoblcblx0ICogICAtIHtCb29sZWFufSBzaW1wbGUg5piv5ZCm5LuF6L+U5Zue5Y2V6K+N5YaF5a65XG5cdCAqICAgLSB7Qm9vbGVhbn0gc3RyaXBQdW5jdHVhdGlvbiDljrvpmaTmoIfngrnnrKblj7dcblx0ICogICAtIHtCb29sZWFufSBjb252ZXJ0U3lub255bSDovazmjaLlkIzkuYnor41cblx0ICogICAtIHtCb29sZWFufSBzdHJpcFN0b3B3b3JkIOWOu+mZpOWBnOatouesplxuXHQgKiBAcmV0dXJuIHtBcnJheX1cblx0ICovXG5cdGRvU2VnbWVudCh0ZXh0OiBzdHJpbmcgfCBCdWZmZXIsIG9wdGlvbnM6IElUU092ZXJ3cml0ZTxJT3B0aW9uc0RvU2VnbWVudCwge1xuXHRcdHNpbXBsZTogdHJ1ZSxcblx0fT4pOiBzdHJpbmdbXVxuXHRkb1NlZ21lbnQodGV4dDogc3RyaW5nIHwgQnVmZmVyLCBvcHRpb25zPzogSU9wdGlvbnNEb1NlZ21lbnQpOiBJV29yZFtdXG5cdGRvU2VnbWVudCh0ZXh0LCBvcHRpb25zOiBJT3B0aW9uc0RvU2VnbWVudCA9IHt9KVxuXHR7XG5cdFx0dGhpcy5hdXRvSW5pdCh0aGlzLm9wdGlvbnMpO1xuXG5cdFx0cmV0dXJuIHN1cGVyLmRvU2VnbWVudCh0ZXh0LCBvcHRpb25zKSBhcyBhbnlcblx0fVxuXG59XG5cbmV4cG9ydCBkZWNsYXJlIG5hbWVzcGFjZSBTZWdtZW50XG57XG5cdGV4cG9ydCB7XG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdElESUNULFxuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRJRElDVDIsXG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdElESUNUX0JMQUNLTElTVCxcblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0SURJQ1RfU1RPUFdPUkQsXG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdElESUNUX1NZTk9OWU0sXG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdElPcHRpb25zRG9TZWdtZW50LFxuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRJT3B0aW9uc1NlZ21lbnQsXG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdElTUExJVCxcblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0SVNQTElUX0ZJTFRFUixcblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0SVdvcmQsXG5cdH1cbn1cblxuZXhwb3J0IHtcblx0SURJQ1QsXG5cdElESUNUMixcblx0SURJQ1RfQkxBQ0tMSVNULFxuXHRJRElDVF9TVE9QV09SRCxcblx0SURJQ1RfU1lOT05ZTSxcblx0SU9wdGlvbnNEb1NlZ21lbnQsXG5cdElPcHRpb25zU2VnbWVudCxcblx0SVNQTElULFxuXHRJU1BMSVRfRklMVEVSLFxuXHRJV29yZCxcbn1cblxuZXhwb3J0IGRlZmF1bHQgU2VnbWVudDtcbiJdfQ==