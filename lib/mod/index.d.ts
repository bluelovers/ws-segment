import { EnumWrapper } from "ts-enum-util";
import { Optimizer, SubSModuleOptimizer, ISubOptimizer } from './Optimizer';
import { Tokenizer, SubSModuleTokenizer, ISubTokenizer } from './Tokenizer';
import { SubSModule, ISubSModule } from './mod';
export { Optimizer, SubSModuleOptimizer, ISubOptimizer };
export { Tokenizer, SubSModuleTokenizer, ISubTokenizer };
export { SubSModule, ISubSModule };
/**
 * 识别模块
 * 强制分割类单词识别
 */
export declare enum ENUM_SUBMODS {
    /**
     * URL识别
     */
    URLTokenizer = "URLTokenizer",
    /**
     * 通配符，必须在标点符号识别之前
     */
    WildcardTokenizer = "WildcardTokenizer",
    /**
     * 标点符号识别
     */
    PunctuationTokenizer = "PunctuationTokenizer",
    /**
     * 外文字符、数字识别，必须在标点符号识别之后
     */
    ForeignTokenizer = "ForeignTokenizer",
    /**
     * 词典识别
     */
    DictTokenizer = "DictTokenizer",
    /**
     * 人名识别，建议在词典识别之后
     */
    ChsNameTokenizer = "ChsNameTokenizer",
    /**
     * 邮箱地址识别
     */
    EmailOptimizer = "EmailOptimizer",
    /**
     * 人名识别优化
     */
    ChsNameOptimizer = "ChsNameOptimizer",
    /**
     * 词典识别优化
     */
    DictOptimizer = "DictOptimizer",
    /**
     * 日期时间识别优化
     */
    DatetimeOptimizer = "DatetimeOptimizer",
    /**
     * 自動處理 `里|裏|后`
     */
    ZhtSynonymOptimizer = "ZhtSynonymOptimizer",
}
export declare const ENUM_SUBMODS_NOT_DEF: ENUM_SUBMODS[];
export declare const SUBMODS_LIST: EnumWrapper<string, typeof ENUM_SUBMODS>;
/**
 * 取得列表並且保持 ENUM 順序
 * @param {boolean} all
 * @returns {ENUM_SUBMODS[]}
 */
export declare function getDefault(all?: boolean): ENUM_SUBMODS[];
export default getDefault;
