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
export declare enum POSTAG {
    /**
     * 錯字
     * Bad Character
     *
     * 標記為錯誤或無法識別的字元。
     * Marks erroneous or unrecognizable characters.
     */
    BAD = 2147483648,
    /**
     * 形容詞 / 形語素
     * Adjective / Adjective Morpheme
     *
     * 用於修飾名詞，表示性質、狀態或特徵的詞。
     * Words used to modify nouns, expressing properties, states, or characteristics.
     */
    D_A = 1073741824,
    /**
     * 區別詞 / 區別語素
     * Distinguishing Word / Distinguishing Morpheme
     *
     * 用於區分事物類別或屬性的詞。
     * Words used to distinguish categories or attributes of things.
     */
    D_B = 536870912,
    /**
     * 連詞 / 連語素
     * Conjunction / Conjunction Morpheme
     *
     * 用於連接詞、短語或句子的詞。
     * Words used to connect words, phrases, or sentences.
     */
    D_C = 268435456,
    /**
     * 副詞 / 副語素
     * Adverb / Adverb Morpheme
     *
     * 用於修飾動詞、形容詞或其他副詞的詞。
     * Words used to modify verbs, adjectives, or other adverbs.
     */
    D_D = 134217728,
    /**
     * 嘆詞 / 嘆語素
     * Interjection / Interjection Morpheme
     *
     * 表示情感、語氣或呼喚的詞。
     * Words expressing emotions, tones, or calls.
     */
    D_E = 67108864,
    /**
     * 方位詞 / 方位語素
     * Locality Word / Locality Morpheme
     *
     * 表示方向、位置關係的詞。
     * Words indicating direction or positional relationships.
     */
    D_F = 33554432,
    /**
     * 成語
     * Idiom
     *
     * 固定的四字或多年習用語。
     * Fixed four-character or multi-year idiomatic expressions.
     */
    D_I = 16777216,
    /**
     * 習語
     * Idiomatic Phrase
     *
     * 類似成語或者曖昧無法分明的用語。
     * Phrases similar to idioms or ambiguous expressions that are hard to classify.
     */
    D_L = 8388608,
    /**
     * 數詞 / 數語素
     * Numeral / Numeral Morpheme
     *
     * 可以與其他數詞或者量詞合併的詞。
     * Words that can be combined with other numerals or quantifiers.
     */
    A_M = 4194304,
    /**
     * 數量詞
     * Numeral-Quantifier Compound
     *
     * 數詞與量詞的組合。
     * Combination of numeral and quantifier.
     */
    D_MQ = 2097152,
    /**
     * 名詞 / 名語素
     * Noun / Noun Morpheme
     *
     * 表示人、事物、地點或抽象概念的詞。
     * Words representing people, things, places, or abstract concepts.
     */
    D_N = 1048576,
    /**
     * 擬聲詞
     * Onomatopoeia
     *
     * 模仿聲音的詞。
     * Words that imitate sounds.
     */
    D_O = 524288,
    /**
     * 介詞
     * Preposition
     *
     * 用於表示詞語之間關係的詞。
     * Words used to indicate relationships between words.
     */
    D_P = 262144,
    /**
     * 量詞 / 量語素
     * Quantifier / Quantifier Morpheme
     *
     * 可以與數詞合併的詞。
     * Words that can be combined with numerals.
     */
    A_Q = 131072,
    /**
     * 代詞 / 代語素
     * Pronoun / Pronoun Morpheme
     *
     * 代替名詞或其他詞類的詞。
     * Words that replace nouns or other word classes.
     */
    D_R = 65536,
    /**
     * 處所詞
     * Location Word
     *
     * 表示處所、地點的詞。
     * Words indicating places or locations.
     */
    D_S = 32768,
    /**
     * 時間詞
     * Time Word
     *
     * 表示時間概念的詞。
     * Words indicating time concepts.
     */
    D_T = 16384,
    /**
     * 助詞 / 助語素
     * Particle / Particle Morpheme
     *
     * 表示語法關係或語氣的虛詞。
     * Function words indicating grammatical relationships or tones.
     */
    D_U = 8192,
    /**
     * 動詞 / 動語素
     * Verb / Verb Morpheme
     *
     * 表示動作、行為或狀態的詞。
     * Words indicating actions, behaviors, or states.
     */
    D_V = 4096,
    /**
     * 標點符號
     * Punctuation
     *
     * 各種標點符號。
     * Various punctuation marks.
     */
    D_W = 2048,
    /**
     * 非語素字
     * Non-morpheme Character
     *
     * 不構成獨立語素的字。
     * Characters that do not constitute independent morphemes.
     */
    D_X = 1024,
    /**
     * 語氣詞 / 語氣語素
     * Modal Particle / Modal Particle Morpheme
     *
     * 表示語氣或情感的虛詞。
     * Function words indicating tone or emotion.
     */
    D_Y = 512,
    /**
     * 狀態詞
     * Status Word
     *
     * 表示狀態的詞。
     * Words indicating states.
     */
    D_Z = 256,
    /**
     * 人名
     * Person Name
     *
     * 人物姓名。
     * Names of people.
     */
    A_NR = 128,
    /**
     * 地名
     * Place Name
     *
     * 地理位置名稱。
     * Names of geographical locations.
     */
    A_NS = 64,
    /**
     * 機構團體
     * Organization Name
     *
     * 組織、機構、團體名稱。
     * Names of organizations, institutions, or groups.
     */
    A_NT = 32,
    /**
     * 外文字符
     * Foreign Character
     *
     * 非中文的外文字元。
     * Non-Chinese foreign characters.
     */
    A_NX = 16,
    /**
     * 其他專名
     * Other Proper Noun
     *
     * 不屬於上述類別的專有名詞。
     * Proper nouns not belonging to the above categories.
     */
    A_NZ = 8,
    /**
     * 前接成分
     * Prefix
     *
     * 詞的前綴成分。
     * Prefix component of words.
     */
    D_ZH = 4,
    /**
     * 後接成分
     * Suffix
     *
     * 詞的後綴成分。
     * Suffix component of words.
     */
    D_K = 2,
    /**
     * 網址、郵箱地址
     * URL / Email Address
     *
     * 網路相關的地址格式。
     * Internet-related address formats.
     */
    URL = 1,
    /**
     * 未知詞性
     * Unknown POS
     *
     * 無法確定詞性的詞。
     * Words with undeterminable part of speech.
     */
    UNK = 0
}
export default POSTAG;
