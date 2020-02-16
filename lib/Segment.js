/**
 * 分词器接口
 *
 * @author 老雷<leizongmin@gmail.com>
 */
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2VnbWVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIlNlZ21lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7R0FJRztBQUVILFlBQVksQ0FBQzs7QUFFYiw2QkFBNkI7QUFDN0Isa0NBQTJEO0FBRTNELGlEQUFtRDtBQUVuRCx1Q0FBd0U7QUFFeEUscUNBQThCO0FBRTlCLCtDQUFxRDtBQUNyRCw2Q0FBK0M7QUFDL0MsK0NBQXVDO0FBS3ZDLHNEQUE4QztBQWtCOUMseUNBQXlDO0FBR3pDLGlEQUE2RDtBQUM3RCw0Q0FBa0U7QUFDbEUsK0RBQTJEO0FBRTNEOztHQUVHO0FBQ0g7SUFBQSxNQUFhLE9BQVEsU0FBUSxjQUFXO1FBaUN2QyxlQUFlLENBQUMsSUFBWSxFQUFFLFVBQW9CLEVBQUUsWUFBYTtZQUVoRSxJQUFJLENBQUMsVUFBVSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQ2pEO2dCQUNDLElBQUksSUFBSSxJQUFJLGlCQUFnQixDQUFDLElBQUksRUFDakM7b0JBQ0MsWUFBWSxHQUFHLFlBQVksSUFBSSxpQkFBZ0IsQ0FBQztpQkFDaEQ7cUJBQ0ksSUFBSSxJQUFJLElBQUksNEJBQWlCLENBQUMsSUFBSSxFQUN2QztvQkFDQyxZQUFZLEdBQUcsWUFBWSxJQUFJLDRCQUFpQixDQUFDO2lCQUNqRDtxQkFDSSxJQUFJLElBQUksSUFBSSxtQkFBa0IsQ0FBQyxJQUFJLElBQUksSUFBSSwyREFBNEMsSUFBSSxJQUFJLHVEQUEwQyxFQUM5STtvQkFDQyxZQUFZLEdBQUcsWUFBWSxJQUFJLG1CQUFrQixDQUFDO2lCQUNsRDtxQkFFRDtvQkFDQyxZQUFZLEdBQUcsWUFBWSxJQUFJLGdCQUFTLENBQUM7aUJBQ3pDO2dCQUVELElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxZQUFZLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxP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LENBQUMsT0FBTyxDQUFDLENBQUM7WUFFNUIsT0FBTyxLQUFLLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxPQUFPLENBQVEsQ0FBQTtRQUM3QyxDQUFDOztJQS9jTSwrQkFBdUIsR0FBc0Isa0NBQXVCLENBQUM7SUFpZDdFLGNBQUM7S0FBQTtBQXBkWSwwQkFBTztBQTZmcEIsa0JBQWUsT0FBTyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiDliIbor43lmajmjqXlj6NcbiAqXG4gKiBAYXV0aG9yIOiAgembtzxsZWl6b25nbWluQGdtYWlsLmNvbT5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBzZWFyY2hGaXJzdFN5bmMsIHNlYXJjaEdsb2JTeW5jIH0gZnJvbSAnLi9mcy9nZXQnO1xuaW1wb3J0IFBPU1RBRyBmcm9tICcuL1BPU1RBRyc7XG5pbXBvcnQgVGFibGVEaWN0QmxhY2tsaXN0IGZyb20gJy4vdGFibGUvYmxhY2tsaXN0JztcbmltcG9ydCBBYnN0cmFjdFRhYmxlRGljdENvcmUgZnJvbSAnLi90YWJsZS9jb3JlJztcbmltcG9ydCB7IElPcHRpb25zIGFzIElPcHRpb25zVGFibGVEaWN0LCBUYWJsZURpY3QgfSBmcm9tICcuL3RhYmxlL2RpY3QnO1xuXG5pbXBvcnQgTG9hZGVyIGZyb20gJy4vbG9hZGVyJztcbmltcG9ydCB7IGNybGYgfSBmcm9tICdjcmxmLW5vcm1hbGl6ZSc7XG5pbXBvcnQgeyBUYWJsZURpY3RTdG9wd29yZCB9IGZyb20gJy4vdGFibGUvc3RvcHdvcmQnO1xuaW1wb3J0IFRhYmxlRGljdFN5bm9ueW0gZnJvbSAnLi90YWJsZS9zeW5vbnltJztcbmltcG9ydCBTZWdtZW50RGljdCBmcm9tICdzZWdtZW50LWRpY3QnO1xuaW1wb3J0IHsgSVN1Yk9wdGltaXplciwgSVN1YlRva2VuaXplciwgT3B0aW1pemVyLCBUb2tlbml6ZXIgfSBmcm9tICcuL21vZCc7XG5pbXBvcnQgeyBkZWJ1Z1Rva2VuIH0gZnJvbSAnLi91dGlsL2RlYnVnJztcbmltcG9ydCB7IElXb3JkRGVidWcgfSBmcm9tICcuL3V0aWwvaW5kZXgnO1xuXG5pbXBvcnQgUHJvamVjdENvbmZpZyBmcm9tICcuLi9wcm9qZWN0LmNvbmZpZyc7XG5cbmltcG9ydCBkZWVwbWVyZ2UgZnJvbSAnZGVlcG1lcmdlLXBsdXMvY29yZSc7XG5pbXBvcnQgeyBFbnVtRGljdERhdGFiYXNlIH0gZnJvbSAnLi9jb25zdCc7XG5pbXBvcnQgeyBFTlVNX1NVQk1PRFMsIEVOVU1fU1VCTU9EU19OQU1FLCBFTlVNX1NVQk1PRFNfT1RIRVIgfSBmcm9tICcuL21vZC9pbmRleCc7XG5cbmltcG9ydCB7XG5cdElESUNULFxuXHRJRElDVDIsXG5cdElESUNUX0JMQUNLTElTVCxcblx0SURJQ1RfU1RPUFdPUkQsXG5cdElESUNUX1NZTk9OWU0sXG5cdElPcHRpb25zRG9TZWdtZW50LFxuXHRJT3B0aW9uc1NlZ21lbnQsXG5cdElTUExJVCxcblx0SVNQTElUX0ZJTFRFUixcblx0SVdvcmQsXG59IGZyb20gJy4vc2VnbWVudC90eXBlcyc7XG5pbXBvcnQgU2VnbWVudENvcmUgZnJvbSAnLi9zZWdtZW50L2NvcmUnO1xuaW1wb3J0IHsgX2lzSWdub3JlTW9kdWxlcyB9IGZyb20gJy4vc2VnbWVudC9tZXRob2RzL3VzZU1vZHVsZXMnO1xuaW1wb3J0IHsgSVRTT3ZlcndyaXRlIH0gZnJvbSAndHMtdHlwZSc7XG5pbXBvcnQgeyBkZWZhdWx0T3B0aW9uc0RvU2VnbWVudCB9IGZyb20gJy4vc2VnbWVudC9kZWZhdWx0cyc7XG5pbXBvcnQgeyBJVXNlRGVmYXVsdE9wdGlvbnMsIHVzZURlZmF1bHQgfSBmcm9tICcuL2RlZmF1bHRzL2luZGV4JztcbmltcG9ydCB7IHVzZU1vZHVsZXMgfSBmcm9tICcuL3NlZ21lbnQvbWV0aG9kcy91c2VNb2R1bGVzMic7XG5cbi8qKlxuICog5Yib5bu65YiG6K+N5Zmo5o6l5Y+jXG4gKi9cbmV4cG9ydCBjbGFzcyBTZWdtZW50IGV4dGVuZHMgU2VnbWVudENvcmVcbntcblxuXHRzdGF0aWMgZGVmYXVsdE9wdGlvbnNEb1NlZ21lbnQ6IElPcHRpb25zRG9TZWdtZW50ID0gZGVmYXVsdE9wdGlvbnNEb1NlZ21lbnQ7XG5cblx0Z2V0RGljdERhdGFiYXNlPFIgZXh0ZW5kcyBUYWJsZURpY3RTeW5vbnltPih0eXBlOiBFbnVtRGljdERhdGFiYXNlLlNZTk9OWU0sXG5cdFx0YXV0b2NyZWF0ZT86IGJvb2xlYW4sXG5cdFx0bGliVGFibGVEaWN0PzogeyBuZXcoLi4uYXJndik6IFIgfSxcblx0KTogUlxuXHRnZXREaWN0RGF0YWJhc2U8UiBleHRlbmRzIFRhYmxlRGljdD4odHlwZTogRW51bURpY3REYXRhYmFzZS5UQUJMRSxcblx0XHRhdXRvY3JlYXRlPzogYm9vbGVhbixcblx0XHRsaWJUYWJsZURpY3Q/OiB7IG5ldyguLi5hcmd2KTogUiB9LFxuXHQpOiBSXG5cdGdldERpY3REYXRhYmFzZTxSIGV4dGVuZHMgVGFibGVEaWN0U3RvcHdvcmQ+KHR5cGU6IEVudW1EaWN0RGF0YWJhc2UuU1RPUFdPUkQsXG5cdFx0YXV0b2NyZWF0ZT86IGJvb2xlYW4sXG5cdFx0bGliVGFibGVEaWN0PzogeyBuZXcoLi4uYXJndik6IFIgfSxcblx0KTogUlxuXHRnZXREaWN0RGF0YWJhc2U8UiBleHRlbmRzIFRhYmxlRGljdEJsYWNrbGlzdD4odHlwZTogRW51bURpY3REYXRhYmFzZS5CTEFDS0xJU1QsXG5cdFx0YXV0b2NyZWF0ZT86IGJvb2xlYW4sXG5cdFx0bGliVGFibGVEaWN0PzogeyBuZXcoLi4uYXJndik6IFIgfSxcblx0KTogUlxuXHRnZXREaWN0RGF0YWJhc2U8UiBleHRlbmRzIFRhYmxlRGljdEJsYWNrbGlzdD4odHlwZTogRW51bURpY3REYXRhYmFzZS5CTEFDS0xJU1RfRk9SX09QVElNSVpFUixcblx0XHRhdXRvY3JlYXRlPzogYm9vbGVhbixcblx0XHRsaWJUYWJsZURpY3Q/OiB7IG5ldyguLi5hcmd2KTogUiB9LFxuXHQpOiBSXG5cdGdldERpY3REYXRhYmFzZTxSIGV4dGVuZHMgVGFibGVEaWN0QmxhY2tsaXN0Pih0eXBlOiBFbnVtRGljdERhdGFiYXNlLkJMQUNLTElTVF9GT1JfU1lOT05ZTSxcblx0XHRhdXRvY3JlYXRlPzogYm9vbGVhbixcblx0XHRsaWJUYWJsZURpY3Q/OiB7IG5ldyguLi5hcmd2KTogUiB9LFxuXHQpOiBSXG5cdGdldERpY3REYXRhYmFzZTxSIGV4dGVuZHMgQWJzdHJhY3RUYWJsZURpY3RDb3JlPGFueT4+KHR5cGU6IHN0cmluZyB8IEVudW1EaWN0RGF0YWJhc2UsXG5cdFx0YXV0b2NyZWF0ZT86IGJvb2xlYW4sXG5cdFx0bGliVGFibGVEaWN0PzogeyBuZXcoLi4uYXJndik6IFIgfSxcblx0KTogUlxuXHRnZXREaWN0RGF0YWJhc2UodHlwZTogc3RyaW5nLCBhdXRvY3JlYXRlPzogYm9vbGVhbiwgbGliVGFibGVEaWN0Pylcblx0e1xuXHRcdGlmICgoYXV0b2NyZWF0ZSB8fCB0aGlzLmluaXRlZCkgJiYgIXRoaXMuZGJbdHlwZV0pXG5cdFx0e1xuXHRcdFx0aWYgKHR5cGUgPT0gVGFibGVEaWN0U3lub255bS50eXBlKVxuXHRcdFx0e1xuXHRcdFx0XHRsaWJUYWJsZURpY3QgPSBsaWJUYWJsZURpY3QgfHwgVGFibGVEaWN0U3lub255bTtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKHR5cGUgPT0gVGFibGVEaWN0U3RvcHdvcmQudHlwZSlcblx0XHRcdHtcblx0XHRcdFx0bGliVGFibGVEaWN0ID0gbGliVGFibGVEaWN0IHx8IFRhYmxlRGljdFN0b3B3b3JkO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAodHlwZSA9PSBUYWJsZURpY3RCbGFja2xpc3QudHlwZSB8fCB0eXBlID09IEVudW1EaWN0RGF0YWJhc2UuQkxBQ0tMSVNUX0ZPUl9PUFRJTUlaRVIgfHwgdHlwZSA9PSBFbnVtRGljdERhdGFiYXNlLkJMQUNLTElTVF9GT1JfU1lOT05ZTSlcblx0XHRcdHtcblx0XHRcdFx0bGliVGFibGVEaWN0ID0gbGliVGFibGVEaWN0IHx8IFRhYmxlRGljdEJsYWNrbGlzdDtcblx0XHRcdH1cblx0XHRcdGVsc2Vcblx0XHRcdHtcblx0XHRcdFx0bGliVGFibGVEaWN0ID0gbGliVGFibGVEaWN0IHx8IFRhYmxlRGljdDtcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5kYlt0eXBlXSA9IG5ldyBsaWJUYWJsZURpY3QodHlwZSwgdGhpcy5vcHRpb25zLCB7XG5cdFx0XHRcdFRBQkxFOiB0aGlzLkRJQ1RbdHlwZV0sXG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcy5kYlt0eXBlXTtcblx0fVxuXG5cdC8qKlxuXHQgKiDovb3lhaXliIbor43mqKHlnZdcblx0ICpcblx0ICogQHBhcmFtIHtTdHJpbmd8QXJyYXl8T2JqZWN0fSBtb2R1bGUg5qih5Z2X5ZCN56ewKOaVsOe7hCnmiJbmqKHlnZflr7nosaFcblx0ICogQHJldHVybiB7U2VnbWVudH1cblx0ICovXG5cdHVzZShtb2Q6IElTdWJPcHRpbWl6ZXIsIC4uLmFyZ3YpXG5cdHVzZShtb2Q6IElTdWJUb2tlbml6ZXIsIC4uLmFyZ3YpXG5cdHVzZShtb2Q6IEFycmF5PElTdWJUb2tlbml6ZXIgfCBJU3ViT3B0aW1pemVyIHwgc3RyaW5nPiwgLi4uYXJndilcblx0dXNlKG1vZDogc3RyaW5nLCAuLi5hcmd2KVxuXHR1c2UobW9kLCAuLi5hcmd2KVxuXHR1c2UobW9kLCAuLi5hcmd2KVxuXHR7XG5cdFx0dXNlTW9kdWxlcyh0aGlzLCBtb2QsIC4uLmFyZ3YpO1xuXG5cdFx0dGhpcy5pbml0ZWQgPSB0cnVlO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHRfcmVzb2x2ZURpY3RGaWxlbmFtZShuYW1lOiBzdHJpbmcsIHBhdGhQbHVzOiBzdHJpbmdbXSA9IFtdLCBleHRQbHVzOiBzdHJpbmdbXSA9IFtdKTogc3RyaW5nIHwgc3RyaW5nW11cblx0e1xuXHRcdGxldCBvcHRpb25zID0ge1xuXHRcdFx0cGF0aHM6IFtcblx0XHRcdFx0JycsXG5cdFx0XHRcdFByb2plY3RDb25maWcuZGljdF9yb290LFxuXG5cdFx0XHRcdC4uLnBhdGhQbHVzLFxuXHRcdFx0XHRwYXRoLnJlc29sdmUoU2VnbWVudERpY3QuRElDVF9ST09ULCAnc2VnbWVudCcpLFxuXHRcdFx0XSxcblx0XHRcdGV4dGVuc2lvbnM6IFtcblx0XHRcdFx0JycsXG5cdFx0XHRcdC4uLmV4dFBsdXMsXG5cdFx0XHRcdCcudXRmOCcsXG5cdFx0XHRcdCcudHh0Jyxcblx0XHRcdF0sXG5cblx0XHRcdG9ubHlGaWxlOiB0cnVlLFxuXHRcdH07XG5cblx0XHRpZiAobmFtZS5pbmRleE9mKCcqJykgIT0gLTEpXG5cdFx0e1xuXHRcdFx0bGV0IGxzID0gc2VhcmNoR2xvYlN5bmMobmFtZSwgb3B0aW9ucyk7XG5cblx0XHRcdGlmICghbHMgfHwgIWxzLmxlbmd0aClcblx0XHRcdHtcblx0XHRcdFx0dGhyb3cgRXJyb3IoYENhbm5vdCBmaW5kIGRpY3QgZ2xvYiBmaWxlIFwiJHtuYW1lfVwiLmApO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gbHM7XG5cdFx0fVxuXG5cdFx0bGV0IGZpbGVuYW1lID0gc2VhcmNoRmlyc3RTeW5jKG5hbWUsIG9wdGlvbnMpO1xuXG5cdFx0aWYgKCFmaWxlbmFtZSlcblx0XHR7XG5cdFx0XHQvL2NvbnNvbGUubG9nKG5hbWUsIHBhdGhQbHVzLCBleHRQbHVzKTtcblxuXHRcdFx0dGhyb3cgRXJyb3IoYENhbm5vdCBmaW5kIGRpY3QgZmlsZSBcIiR7bmFtZX1cIi5gKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gZmlsZW5hbWU7XG5cdH1cblxuXHQvKipcblx0ICog6L295YWl5a2X5YW45paH5Lu2XG5cdCAqXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIOWtl+WFuOaWh+S7tuWQjVxuXHQgKiBAcGFyYW0ge1N0cmluZ30gdHlwZSDnsbvlnotcblx0ICogQHBhcmFtIHtCb29sZWFufSBjb252ZXJ0X3RvX2xvd2VyIOaYr+WQpuWFqOmDqOi9rOaNouS4uuWwj+WGmVxuXHQgKiBAcmV0dXJuIHtTZWdtZW50fVxuXHQgKi9cblx0bG9hZERpY3QobmFtZTogc3RyaW5nLCB0eXBlPzogc3RyaW5nLCBjb252ZXJ0X3RvX2xvd2VyPzogYm9vbGVhbiwgc2tpcEV4aXN0cz86IGJvb2xlYW4pXG5cdHtcblx0XHRsZXQgZmlsZW5hbWUgPSB0aGlzLl9yZXNvbHZlRGljdEZpbGVuYW1lKG5hbWUpO1xuXG5cdFx0aWYgKEFycmF5LmlzQXJyYXkoZmlsZW5hbWUpKVxuXHRcdHtcblx0XHRcdGxldCBzZWxmID0gdGhpcztcblxuXHRcdFx0ZmlsZW5hbWUuZm9yRWFjaCh2ID0+IHRoaXMubG9hZERpY3QodiwgdHlwZSwgY29udmVydF90b19sb3dlciwgc2tpcEV4aXN0cykpO1xuXG5cdFx0XHQvL2NvbnNvbGUubG9nKGZpbGVuYW1lKTtcblxuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fVxuXG5cdFx0aWYgKCF0eXBlKSB0eXBlID0gJ1RBQkxFJzsgICAgIC8vIOm7mOiupOS4ulRBQkxFXG5cblx0XHRjb25zdCBkYiA9IHRoaXMuZ2V0RGljdERhdGFiYXNlKHR5cGUsIHRydWUpO1xuXG5cdFx0Y29uc3QgVEFCTEUgPSB0aGlzLkRJQ1RbdHlwZV0gPSBkYi5UQUJMRTtcblx0XHRjb25zdCBUQUJMRTIgPSB0aGlzLkRJQ1RbdHlwZSArICcyJ10gPSBkYi5UQUJMRTI7XG5cblx0XHQvKlxuXHRcdC8vIOWIneWni+WMluivjeWFuFxuXHRcdGlmICghdGhpcy5ESUNUW3R5cGVdKSB0aGlzLkRJQ1RbdHlwZV0gPSB7fTtcblx0XHRpZiAoIXRoaXMuRElDVFt0eXBlICsgJzInXSkgdGhpcy5ESUNUW3R5cGUgKyAnMiddID0ge307XG5cdFx0bGV0IFRBQkxFID0gdGhpcy5ESUNUW3R5cGVdOyAgICAgICAgLy8g6K+N5YW46KGoICAn6K+NJyA9PiB75bGe5oCnfVxuXHRcdGxldCBUQUJMRTIgPSB0aGlzLkRJQ1RbdHlwZSArICcyJ107IC8vIOivjeWFuOihqCAgJ+mVv+W6picgPT4gJ+ivjScgPT4g5bGe5oCnXG5cdFx0Ki9cblx0XHQvLyDlr7zlhaXmlbDmja5cblx0XHRjb25zdCBQT1NUQUcgPSB0aGlzLlBPU1RBRztcblxuXHRcdGxldCBkYXRhID0gTG9hZGVyLlNlZ21lbnREaWN0TG9hZGVyLmxvYWRTeW5jKGZpbGVuYW1lKTtcblxuXHRcdGRhdGEuZm9yRWFjaChmdW5jdGlvbiAoZGF0YSlcblx0XHR7XG5cdFx0XHRpZiAoY29udmVydF90b19sb3dlcilcblx0XHRcdHtcblx0XHRcdFx0ZGF0YVswXSA9IGRhdGFbMF0udG9Mb3dlckNhc2UoKTtcblx0XHRcdH1cblxuXHRcdFx0ZGIuYWRkKGRhdGEsIHNraXBFeGlzdHMpO1xuXG5cdFx0XHQvKlxuXHRcdFx0bGV0IFt3LCBwLCBmXSA9IGRhdGE7XG5cblx0XHRcdGlmICh3Lmxlbmd0aCA9PSAwKVxuXHRcdFx0e1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoKVxuXHRcdFx0fVxuXG5cdFx0XHRUQUJMRVt3XSA9IHsgcCwgZiwgfTtcblx0XHRcdGlmICghVEFCTEUyW3cubGVuZ3RoXSkgVEFCTEUyW3cubGVuZ3RoXSA9IHt9O1xuXHRcdFx0VEFCTEUyW3cubGVuZ3RoXVt3XSA9IFRBQkxFW3ddO1xuXHRcdFx0Ki9cblx0XHR9KTtcblxuXHRcdGRhdGEgPSB1bmRlZmluZWQ7XG5cblx0XHR0aGlzLmluaXRlZCA9IHRydWU7XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiDovb3lhaXlkIzkuYnor43or43lhbhcblx0ICpcblx0ICogQHBhcmFtIHtTdHJpbmd9IG5hbWUg5a2X5YW45paH5Lu25ZCNXG5cdCAqL1xuXHRsb2FkU3lub255bURpY3QobmFtZTogc3RyaW5nLCBza2lwRXhpc3RzPzogYm9vbGVhbilcblx0e1xuXHRcdGxldCBmaWxlbmFtZSA9IHRoaXMuX3Jlc29sdmVEaWN0RmlsZW5hbWUobmFtZSwgW1xuXHRcdFx0cGF0aC5yZXNvbHZlKFNlZ21lbnREaWN0LkRJQ1RfUk9PVCwgJ3N5bm9ueW0nKSxcblx0XHRdKTtcblxuXHRcdGlmIChBcnJheS5pc0FycmF5KGZpbGVuYW1lKSlcblx0XHR7XG5cdFx0XHRsZXQgc2VsZiA9IHRoaXM7XG5cblx0XHRcdGZpbGVuYW1lLmZvckVhY2godiA9PiB0aGlzLmxvYWRTeW5vbnltRGljdCh2LCBza2lwRXhpc3RzKSk7XG5cblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH1cblxuXHRcdGxldCB0eXBlID0gJ1NZTk9OWU0nO1xuXG5cdFx0Y29uc3QgZGIgPSB0aGlzLmdldERpY3REYXRhYmFzZSh0eXBlLCB0cnVlKTtcblxuXHRcdGNvbnN0IFRBQkxFID0gdGhpcy5ESUNUW3R5cGVdID0gZGIuVEFCTEU7XG5cblx0XHQvKlxuXHRcdC8vIOWIneWni+WMluivjeWFuFxuXHRcdGlmICghdGhpcy5ESUNUW3R5cGVdKSB0aGlzLkRJQ1RbdHlwZV0gPSB7fTtcblx0XHQvLyDor43lhbjooaggICflkIzkuYnor40nID0+ICfmoIflh4bor40nXG5cdFx0bGV0IFRBQkxFID0gdGhpcy5ESUNUW3R5cGVdIGFzIElESUNUX1NZTk9OWU07XG5cdFx0Ly8g5a+85YWl5pWw5o2uXG5cdFx0Ki9cblxuXHRcdGxldCBkYXRhID0gTG9hZGVyLlNlZ21lbnRTeW5vbnltTG9hZGVyLmxvYWRTeW5jKGZpbGVuYW1lKTtcblxuXHRcdGRhdGEuZm9yRWFjaChmdW5jdGlvbiAoYmxvY2tzOiBzdHJpbmdbXSlcblx0XHR7XG5cdFx0XHRkYi5hZGQoYmxvY2tzLCBza2lwRXhpc3RzKTtcblxuXHRcdFx0Lypcblx0XHRcdGxldCBbbjEsIG4yXSA9IGJsb2NrcztcblxuXHRcdFx0VEFCTEVbbjFdID0gbjI7XG5cdFx0XHRpZiAoVEFCTEVbbjJdID09PSBuMSlcblx0XHRcdHtcblx0XHRcdFx0ZGVsZXRlIFRBQkxFW24yXTtcblx0XHRcdH1cblx0XHRcdCovXG5cdFx0fSk7XG5cblx0XHQvL2NvbnNvbGUubG9nKFRBQkxFKTtcblxuXHRcdGRhdGEgPSB1bmRlZmluZWQ7XG5cblx0XHR0aGlzLmluaXRlZCA9IHRydWU7XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdHByb3RlY3RlZCBfbG9hZEJsYWNrbGlzdERpY3QobmFtZTogc3RyaW5nLCB0eXBlOiBFbnVtRGljdERhdGFiYXNlKVxuXHR7XG5cdFx0bGV0IGZpbGVuYW1lID0gdGhpcy5fcmVzb2x2ZURpY3RGaWxlbmFtZShuYW1lLCBbXG5cdFx0XHRwYXRoLnJlc29sdmUoU2VnbWVudERpY3QuRElDVF9ST09ULCAnYmxhY2tsaXN0JyksXG5cdFx0XSk7XG5cblx0XHRpZiAoQXJyYXkuaXNBcnJheShmaWxlbmFtZSkpXG5cdFx0e1xuXHRcdFx0bGV0IHNlbGYgPSB0aGlzO1xuXG5cdFx0XHRmaWxlbmFtZS5mb3JFYWNoKHYgPT4gdGhpcy5fbG9hZEJsYWNrbGlzdERpY3QodiwgdHlwZSkpO1xuXG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9XG5cblx0XHRjb25zdCBkYiA9IHRoaXMuZ2V0RGljdERhdGFiYXNlKHR5cGUsIHRydWUpO1xuXG5cdFx0Y29uc3QgVEFCTEUgPSB0aGlzLkRJQ1RbdHlwZV0gPSBkYi5UQUJMRTtcblxuXHRcdGxldCBkYXRhID0gTG9hZGVyLlNlZ21lbnREaWN0XG5cdFx0XHQucmVxdWlyZUxvYWRlck1vZHVsZSgnbGluZScpXG5cdFx0XHQubG9hZFN5bmMoZmlsZW5hbWUsIHtcblx0XHRcdFx0ZmlsdGVyKGxpbmU6IHN0cmluZylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHJldHVybiBsaW5lLnRyaW0oKTtcblx0XHRcdFx0fSxcblx0XHRcdH0pXG5cdFx0O1xuXG5cdFx0ZGF0YS5mb3JFYWNoKHYgPT4gZGIuYWRkKHYpKTtcblxuXHRcdGRhdGEgPSB1bmRlZmluZWQ7XG5cblx0XHR0aGlzLmluaXRlZCA9IHRydWU7XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiDlrZflhbjpu5HlkI3llq4g5Zyo5Li75a2X5YW45YWn5Yiq6Zmk5q2k5a2X5YW45YWn5pyJ55qE5qKd55uuXG5cdCAqL1xuXHRsb2FkQmxhY2tsaXN0RGljdChuYW1lOiBzdHJpbmcpXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fbG9hZEJsYWNrbGlzdERpY3QobmFtZSwgRW51bURpY3REYXRhYmFzZS5CTEFDS0xJU1QpXG5cdH1cblxuXHQvKipcblx0ICog5YSq5YyW5Zmo6buR5ZCN5ZauIOacg+mYsuatoumDqOWIhuWEquWMluWZqOWOu+e1hOWQiOatpOWtl+WFuOWFp+eahOipnlxuXHQgKiDkvovlpoIg5Lq65ZCNIOiHquWLlee1hOWQiOS5i+mhnlxuXHQgKi9cblx0bG9hZEJsYWNrbGlzdE9wdGltaXplckRpY3QobmFtZTogc3RyaW5nKVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX2xvYWRCbGFja2xpc3REaWN0KG5hbWUsIEVudW1EaWN0RGF0YWJhc2UuQkxBQ0tMSVNUX0ZPUl9PUFRJTUlaRVIpXG5cdH1cblxuXHQvKipcblx0ICog6L2J5o+b6buR5ZCN5ZauIOWLleaFi+i9ieaPm+Wtl+ipnuaZguacg+W/veeVpeatpOWtl+WFuOWFp+eahOipnlxuXHQgKi9cblx0bG9hZEJsYWNrbGlzdFN5bm9ueW1EaWN0KG5hbWU6IHN0cmluZylcblx0e1xuXHRcdHJldHVybiB0aGlzLl9sb2FkQmxhY2tsaXN0RGljdChuYW1lLCBFbnVtRGljdERhdGFiYXNlLkJMQUNLTElTVF9GT1JfU1lOT05ZTSlcblx0fVxuXG5cdC8qKlxuXHQgKiDovb3lhaXlgZzmraLnrKbor43lhbhcblx0ICpcblx0ICogQHBhcmFtIHtTdHJpbmd9IG5hbWUg5a2X5YW45paH5Lu25ZCNXG5cdCAqL1xuXHRsb2FkU3RvcHdvcmREaWN0KG5hbWU6IHN0cmluZylcblx0e1xuXHRcdGxldCBmaWxlbmFtZSA9IHRoaXMuX3Jlc29sdmVEaWN0RmlsZW5hbWUobmFtZSwgW1xuXHRcdFx0cGF0aC5yZXNvbHZlKFNlZ21lbnREaWN0LkRJQ1RfUk9PVCwgJ3N0b3B3b3JkJyksXG5cdFx0XSk7XG5cblx0XHRpZiAoQXJyYXkuaXNBcnJheShmaWxlbmFtZSkpXG5cdFx0e1xuXHRcdFx0bGV0IHNlbGYgPSB0aGlzO1xuXG5cdFx0XHRmaWxlbmFtZS5mb3JFYWNoKHYgPT4gdGhpcy5sb2FkU3RvcHdvcmREaWN0KHYpKTtcblxuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fVxuXG5cdFx0Y29uc3QgdHlwZSA9IEVudW1EaWN0RGF0YWJhc2UuU1RPUFdPUkQ7XG5cblx0XHRjb25zdCBkYiA9IHRoaXMuZ2V0RGljdERhdGFiYXNlKHR5cGUsIHRydWUpO1xuXG5cdFx0Y29uc3QgVEFCTEUgPSB0aGlzLkRJQ1RbdHlwZV0gPSBkYi5UQUJMRTtcblxuXHRcdGxldCBkYXRhID0gTG9hZGVyLlNlZ21lbnREaWN0XG5cdFx0XHQucmVxdWlyZUxvYWRlck1vZHVsZSgnbGluZScpXG5cdFx0XHQubG9hZFN5bmMoZmlsZW5hbWUsIHtcblx0XHRcdFx0ZmlsdGVyKGxpbmU6IHN0cmluZylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHJldHVybiBsaW5lLnRyaW0oKTtcblx0XHRcdFx0fSxcblx0XHRcdH0pXG5cdFx0O1xuXG5cdFx0ZGF0YS5mb3JFYWNoKHYgPT4gZGIuYWRkKHYpKTtcblxuXHRcdGRhdGEgPSB1bmRlZmluZWQ7XG5cblx0XHR0aGlzLmluaXRlZCA9IHRydWU7XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiDkvb/nlKjpu5jorqTnmoTor4bliKvmqKHlnZflkozlrZflhbjmlofku7Zcblx0ICog5Zyo5L2/55So6aCQ6Kit5YC855qE5oOF5rOB5LiL77yM5LiN6ZyA6KaB5Li75YuV5ZG85Y+r5q2k5Ye95pW4XG5cdCAqXG5cdCAqIEByZXR1cm4ge1NlZ21lbnR9XG5cdCAqL1xuXHR1c2VEZWZhdWx0KG9wdGlvbnM/OiBJVXNlRGVmYXVsdE9wdGlvbnMsIC4uLmFyZ3YpXG5cdHVzZURlZmF1bHQoLi4uYXJndilcblx0e1xuXHRcdHVzZURlZmF1bHQodGhpcywgLi4uYXJndik7XG5cblx0XHR0aGlzLmluaXRlZCA9IHRydWU7XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiDmraTlh73mlbjlj6rpnIDln7fooYzkuIDmrKHvvIzkuKbkuJTkuIDoiKzni4Dms4HkuIvkuI3pnIDopoHmiYvli5Xlkbzlj6tcblx0ICovXG5cdGF1dG9Jbml0KG9wdGlvbnM/OiBJVXNlRGVmYXVsdE9wdGlvbnMpXG5cdHtcblx0XHRpZiAoIXRoaXMuaW5pdGVkKVxuXHRcdHtcblx0XHRcdHRoaXMuaW5pdGVkID0gdHJ1ZTtcblxuXHRcdFx0aWYgKCF0aGlzLm1vZHVsZXMudG9rZW5pemVyLmxlbmd0aClcblx0XHRcdHtcblx0XHRcdFx0dGhpcy51c2VEZWZhdWx0KG9wdGlvbnMpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0YWRkQmxhY2tsaXN0KHdvcmQ6IHN0cmluZywgcmVtb3ZlPzogYm9vbGVhbilcblx0e1xuXHRcdGxldCBtZSA9IHRoaXM7XG5cblx0XHR0aGlzLmF1dG9Jbml0KHRoaXMub3B0aW9ucyk7XG5cblx0XHRjb25zdCBCTEFDS0xJU1QgPSBtZS5nZXREaWN0RGF0YWJhc2UoRW51bURpY3REYXRhYmFzZS5CTEFDS0xJU1QpO1xuXHRcdGNvbnN0IFRBQkxFID0gbWUuZ2V0RGljdERhdGFiYXNlKEVudW1EaWN0RGF0YWJhc2UuVEFCTEUpO1xuXG5cdFx0bGV0IGJvb2wgPSAhcmVtb3ZlO1xuXG5cdFx0aWYgKGJvb2wpXG5cdFx0e1xuXHRcdFx0QkxBQ0tMSVNULmFkZCh3b3JkKTtcblx0XHRcdFRBQkxFLnJlbW92ZSh3b3JkKTtcblx0XHR9XG5cdFx0ZWxzZVxuXHRcdHtcblx0XHRcdEJMQUNLTElTVC5yZW1vdmUod29yZClcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpc1xuXHR9XG5cblx0LyoqXG5cdCAqIHJlbW92ZSBrZXkgaW4gVEFCTEUgYnkgQkxBQ0tMSVNUXG5cdCAqL1xuXHRkb0JsYWNrbGlzdCgpXG5cdHtcblx0XHRsZXQgbWUgPSB0aGlzO1xuXG5cdFx0dGhpcy5hdXRvSW5pdCh0aGlzLm9wdGlvbnMpO1xuXG5cdFx0Y29uc3QgQkxBQ0tMSVNUID0gbWUuZ2V0RGljdChFbnVtRGljdERhdGFiYXNlLkJMQUNLTElTVCk7XG5cdFx0Y29uc3QgVEFCTEUgPSBtZS5nZXREaWN0RGF0YWJhc2UoRW51bURpY3REYXRhYmFzZS5UQUJMRSk7XG5cblx0XHRPYmplY3QuZW50cmllcyhCTEFDS0xJU1QpXG5cdFx0XHQuZm9yRWFjaChmdW5jdGlvbiAoW2tleSwgYm9vbF0pXG5cdFx0XHR7XG5cdFx0XHRcdGJvb2wgJiYgVEFCTEUucmVtb3ZlKGtleSlcblx0XHRcdH0pXG5cdFx0O1xuXG5cdFx0cmV0dXJuIHRoaXNcblx0fVxuXG5cdC8qKlxuXHQgKiDlvIDlp4vliIbor41cblx0ICpcblx0ICogQHBhcmFtIHtTdHJpbmd9IHRleHQg5paH5pysXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIOmAiemhuVxuXHQgKiAgIC0ge0Jvb2xlYW59IHNpbXBsZSDmmK/lkKbku4Xov5Tlm57ljZXor43lhoXlrrlcblx0ICogICAtIHtCb29sZWFufSBzdHJpcFB1bmN0dWF0aW9uIOWOu+mZpOagh+eCueespuWPt1xuXHQgKiAgIC0ge0Jvb2xlYW59IGNvbnZlcnRTeW5vbnltIOi9rOaNouWQjOS5ieivjVxuXHQgKiAgIC0ge0Jvb2xlYW59IHN0cmlwU3RvcHdvcmQg5Y676Zmk5YGc5q2i56ymXG5cdCAqIEByZXR1cm4ge0FycmF5fVxuXHQgKi9cblx0ZG9TZWdtZW50KHRleHQ6IHN0cmluZyB8IEJ1ZmZlciwgb3B0aW9uczogSVRTT3ZlcndyaXRlPElPcHRpb25zRG9TZWdtZW50LCB7XG5cdFx0c2ltcGxlOiB0cnVlLFxuXHR9Pik6IHN0cmluZ1tdXG5cdGRvU2VnbWVudCh0ZXh0OiBzdHJpbmcgfCBCdWZmZXIsIG9wdGlvbnM/OiBJT3B0aW9uc0RvU2VnbWVudCk6IElXb3JkW11cblx0ZG9TZWdtZW50KHRleHQsIG9wdGlvbnM6IElPcHRpb25zRG9TZWdtZW50ID0ge30pXG5cdHtcblx0XHR0aGlzLmF1dG9Jbml0KHRoaXMub3B0aW9ucyk7XG5cblx0XHRyZXR1cm4gc3VwZXIuZG9TZWdtZW50KHRleHQsIG9wdGlvbnMpIGFzIGFueVxuXHR9XG5cbn1cblxuZXhwb3J0IGRlY2xhcmUgbmFtZXNwYWNlIFNlZ21lbnRcbntcblx0ZXhwb3J0IHtcblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0SURJQ1QsXG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdElESUNUMixcblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0SURJQ1RfQkxBQ0tMSVNULFxuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRJRElDVF9TVE9QV09SRCxcblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0SURJQ1RfU1lOT05ZTSxcblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0SU9wdGlvbnNEb1NlZ21lbnQsXG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdElPcHRpb25zU2VnbWVudCxcblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0SVNQTElULFxuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRJU1BMSVRfRklMVEVSLFxuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRJV29yZCxcblx0fVxufVxuXG5leHBvcnQge1xuXHRJRElDVCxcblx0SURJQ1QyLFxuXHRJRElDVF9CTEFDS0xJU1QsXG5cdElESUNUX1NUT1BXT1JELFxuXHRJRElDVF9TWU5PTllNLFxuXHRJT3B0aW9uc0RvU2VnbWVudCxcblx0SU9wdGlvbnNTZWdtZW50LFxuXHRJU1BMSVQsXG5cdElTUExJVF9GSUxURVIsXG5cdElXb3JkLFxufVxuXG5leHBvcnQgZGVmYXVsdCBTZWdtZW50O1xuIl19