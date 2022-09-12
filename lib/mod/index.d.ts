/**
 * Created by user on 2018/4/16/016.
 */
import { ISubOptimizer, ISubOptimizerCreate, Optimizer, SubSModuleOptimizer } from './Optimizer';
import { ISubTokenizer, ISubTokenizerCreate, SubSModuleTokenizer, Tokenizer } from './Tokenizer';
import { ISubSModule, ISubSModuleCreate, ISubSModuleMethod, SubSModule } from './mod';
export { Optimizer, SubSModuleOptimizer, ISubOptimizer, ISubOptimizerCreate };
export { Tokenizer, SubSModuleTokenizer, ISubTokenizer, ISubTokenizerCreate };
export { SubSModule, ISubSModule, ISubSModuleCreate, ISubSModuleMethod };
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
    JpSimpleTokenizer = "JpSimpleTokenizer",
    /**
     * 注音
     */
    ZhuyinTokenizer = "ZhuyinTokenizer",
    /**
     * 部首
     */
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
     * 合併外文與中文的詞
     * 例如 Ｔ恤
     */
    ForeignOptimizer = "ForeignOptimizer",
    /**
     * 自動處理 `里|裏|后`
     */
    ZhtSynonymOptimizer = "ZhtSynonymOptimizer",
    AdjectiveOptimizer = "AdjectiveOptimizer"
}
/**
 * 不包含在預設模組列表內 需要手動指定
 */
export declare enum ENUM_SUBMODS_OTHER {
    /**
     * 单字切分模块
     */
    SingleTokenizer = "SingleTokenizer"
}
export type ENUM_SUBMODS_NAME = ENUM_SUBMODS | ENUM_SUBMODS_OTHER;
export declare const LIST_SUBMODS_NOT_DEF: ENUM_SUBMODS[];
export declare const SUBMODS_LIST: import("ts-enum-util").EnumWrapper<string, typeof ENUM_SUBMODS>;
export declare const SUBMODS_OTHER_LIST: import("ts-enum-util").EnumWrapper<string, typeof ENUM_SUBMODS_OTHER>;
/**
 * 取得列表並且保持 ENUM 順序
 * @param {boolean} all
 * @returns {ENUM_SUBMODS[]}
 */
export declare function getDefault(all?: boolean): ENUM_SUBMODS[];
export default getDefault;
