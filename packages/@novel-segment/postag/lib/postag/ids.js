"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POSTAG = void 0;
/**
 * 詞性標記列舉
 * Part of Speech (POS) Tag Enumeration
 *
 * 定義斷詞系統中使用的詞性標記類型。
 * 使用位元旗標 (Bit Flags) 設計，支援多詞性組合。
 * 每個詞性使用獨立的位元位置，可透過位元運算進行組合與判斷。
 *
 * Defines part-of-speech tag types used in the segmentation system.
 * Uses bit flags design, supporting multiple POS combinations.
 * Each POS uses an independent bit position, allowing combination and judgment through bitwise operations.
 *
 * @module @novel-segment/postag
 */
var POSTAG;
(function (POSTAG) {
    /**
     * 錯字
     * Bad Character
     *
     * 標記為錯誤或無法識別的字元。
     * Marks erroneous or unrecognizable characters.
     */
    POSTAG[POSTAG["BAD"] = 2147483648] = "BAD";
    /**
     * 形容詞 / 形語素
     * Adjective / Adjective Morpheme
     *
     * 用於修飾名詞，表示性質、狀態或特徵的詞。
     * Words used to modify nouns, expressing properties, states, or characteristics.
     */
    POSTAG[POSTAG["D_A"] = 1073741824] = "D_A";
    /**
     * 區別詞 / 區別語素
     * Distinguishing Word / Distinguishing Morpheme
     *
     * 用於區分事物類別或屬性的詞。
     * Words used to distinguish categories or attributes of things.
     */
    POSTAG[POSTAG["D_B"] = 536870912] = "D_B";
    /**
     * 連詞 / 連語素
     * Conjunction / Conjunction Morpheme
     *
     * 用於連接詞、短語或句子的詞。
     * Words used to connect words, phrases, or sentences.
     */
    POSTAG[POSTAG["D_C"] = 268435456] = "D_C";
    // ---
    /**
     * 副詞 / 副語素
     * Adverb / Adverb Morpheme
     *
     * 用於修飾動詞、形容詞或其他副詞的詞。
     * Words used to modify verbs, adjectives, or other adverbs.
     */
    POSTAG[POSTAG["D_D"] = 134217728] = "D_D";
    /**
     * 嘆詞 / 嘆語素
     * Interjection / Interjection Morpheme
     *
     * 表示情感、語氣或呼喚的詞。
     * Words expressing emotions, tones, or calls.
     */
    POSTAG[POSTAG["D_E"] = 67108864] = "D_E";
    /**
     * 方位詞 / 方位語素
     * Locality Word / Locality Morpheme
     *
     * 表示方向、位置關係的詞。
     * Words indicating direction or positional relationships.
     */
    POSTAG[POSTAG["D_F"] = 33554432] = "D_F";
    /**
     * 成語
     * Idiom
     *
     * 固定的四字或多年習用語。
     * Fixed four-character or multi-year idiomatic expressions.
     */
    POSTAG[POSTAG["D_I"] = 16777216] = "D_I";
    // ---
    /**
     * 習語
     * Idiomatic Phrase
     *
     * 類似成語或者曖昧無法分明的用語。
     * Phrases similar to idioms or ambiguous expressions that are hard to classify.
     */
    POSTAG[POSTAG["D_L"] = 8388608] = "D_L";
    /**
     * 數詞 / 數語素
     * Numeral / Numeral Morpheme
     *
     * 可以與其他數詞或者量詞合併的詞。
     * Words that can be combined with other numerals or quantifiers.
     */
    POSTAG[POSTAG["A_M"] = 4194304] = "A_M";
    /**
     * 數量詞
     * Numeral-Quantifier Compound
     *
     * 數詞與量詞的組合。
     * Combination of numeral and quantifier.
     */
    POSTAG[POSTAG["D_MQ"] = 2097152] = "D_MQ";
    /**
     * 名詞 / 名語素
     * Noun / Noun Morpheme
     *
     * 表示人、事物、地點或抽象概念的詞。
     * Words representing people, things, places, or abstract concepts.
     */
    POSTAG[POSTAG["D_N"] = 1048576] = "D_N";
    // ---
    /**
     * 擬聲詞
     * Onomatopoeia
     *
     * 模仿聲音的詞。
     * Words that imitate sounds.
     */
    POSTAG[POSTAG["D_O"] = 524288] = "D_O";
    /**
     * 介詞
     * Preposition
     *
     * 用於表示詞語之間關係的詞。
     * Words used to indicate relationships between words.
     */
    POSTAG[POSTAG["D_P"] = 262144] = "D_P";
    /**
     * 量詞 / 量語素
     * Quantifier / Quantifier Morpheme
     *
     * 可以與數詞合併的詞。
     * Words that can be combined with numerals.
     */
    POSTAG[POSTAG["A_Q"] = 131072] = "A_Q";
    /**
     * 代詞 / 代語素
     * Pronoun / Pronoun Morpheme
     *
     * 代替名詞或其他詞類的詞。
     * Words that replace nouns or other word classes.
     */
    POSTAG[POSTAG["D_R"] = 65536] = "D_R";
    // ---
    /**
     * 處所詞
     * Location Word
     *
     * 表示處所、地點的詞。
     * Words indicating places or locations.
     */
    POSTAG[POSTAG["D_S"] = 32768] = "D_S";
    /**
     * 時間詞
     * Time Word
     *
     * 表示時間概念的詞。
     * Words indicating time concepts.
     */
    POSTAG[POSTAG["D_T"] = 16384] = "D_T";
    /**
     * 助詞 / 助語素
     * Particle / Particle Morpheme
     *
     * 表示語法關係或語氣的虛詞。
     * Function words indicating grammatical relationships or tones.
     */
    POSTAG[POSTAG["D_U"] = 8192] = "D_U";
    /**
     * 動詞 / 動語素
     * Verb / Verb Morpheme
     *
     * 表示動作、行為或狀態的詞。
     * Words indicating actions, behaviors, or states.
     */
    POSTAG[POSTAG["D_V"] = 4096] = "D_V";
    // ---
    /**
     * 標點符號
     * Punctuation
     *
     * 各種標點符號。
     * Various punctuation marks.
     */
    POSTAG[POSTAG["D_W"] = 2048] = "D_W";
    /**
     * 非語素字
     * Non-morpheme Character
     *
     * 不構成獨立語素的字。
     * Characters that do not constitute independent morphemes.
     */
    POSTAG[POSTAG["D_X"] = 1024] = "D_X";
    /**
     * 語氣詞 / 語氣語素
     * Modal Particle / Modal Particle Morpheme
     *
     * 表示語氣或情感的虛詞。
     * Function words indicating tone or emotion.
     */
    POSTAG[POSTAG["D_Y"] = 512] = "D_Y";
    /**
     * 狀態詞
     * Status Word
     *
     * 表示狀態的詞。
     * Words indicating states.
     */
    POSTAG[POSTAG["D_Z"] = 256] = "D_Z";
    // ---
    /**
     * 人名
     * Person Name
     *
     * 人物姓名。
     * Names of people.
     */
    POSTAG[POSTAG["A_NR"] = 128] = "A_NR";
    /**
     * 地名
     * Place Name
     *
     * 地理位置名稱。
     * Names of geographical locations.
     */
    POSTAG[POSTAG["A_NS"] = 64] = "A_NS";
    /**
     * 機構團體
     * Organization Name
     *
     * 組織、機構、團體名稱。
     * Names of organizations, institutions, or groups.
     */
    POSTAG[POSTAG["A_NT"] = 32] = "A_NT";
    /**
     * 外文字符
     * Foreign Character
     *
     * 非中文的外文字元。
     * Non-Chinese foreign characters.
     */
    POSTAG[POSTAG["A_NX"] = 16] = "A_NX";
    // ---
    /**
     * 其他專名
     * Other Proper Noun
     *
     * 不屬於上述類別的專有名詞。
     * Proper nouns not belonging to the above categories.
     */
    POSTAG[POSTAG["A_NZ"] = 8] = "A_NZ";
    /**
     * 前接成分
     * Prefix
     *
     * 詞的前綴成分。
     * Prefix component of words.
     */
    POSTAG[POSTAG["D_ZH"] = 4] = "D_ZH";
    /**
     * 後接成分
     * Suffix
     *
     * 詞的後綴成分。
     * Suffix component of words.
     */
    POSTAG[POSTAG["D_K"] = 2] = "D_K";
    /**
     * 網址、郵箱地址
     * URL / Email Address
     *
     * 網路相關的地址格式。
     * Internet-related address formats.
     */
    POSTAG[POSTAG["URL"] = 1] = "URL";
    /**
     * 未知詞性
     * Unknown POS
     *
     * 無法確定詞性的詞。
     * Words with undeterminable part of speech.
     */
    POSTAG[POSTAG["UNK"] = 0] = "UNK";
})(POSTAG || (exports.POSTAG = POSTAG = {}));
exports.default = POSTAG;
//# sourceMappingURL=ids.js.map