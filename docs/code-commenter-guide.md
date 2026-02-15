# 程式碼註解規範說明 / Code Comment Guidelines

本文檔說明 `@novel-segment` 相關套件的程式碼註解規範，採用雙語註解（繁體中文與英文）格式。

This document describes the code comment guidelines for `@novel-segment` related packages, using bilingual comment format (Traditional Chinese and English).

## 註解格式規範 / Comment Format Guidelines

### 1. 模組級別註解 / Module-level Comments

每個 TypeScript 檔案開頭應包含模組說明：

```typescript
/**
 * 模組名稱
 * Module Name
 *
 * 模組的詳細說明。
 * Detailed description of the module.
 *
 * @module @novel-segment/package-name
 */
```

### 2. 介面與類型註解 / Interface and Type Comments

```typescript
/**
 * 介面名稱
 * Interface Name
 *
 * 介面的詳細說明。
 * Detailed description of the interface.
 */
export interface IExample {
    /**
     * 屬性說明
     * Property Description
     *
     * 屬性的詳細說明。
     * Detailed description of the property.
     */
    property: string;
}
```

### 3. 函數註解 / Function Comments

```typescript
/**
 * 函數名稱
 * Function Name
 *
 * 函數的詳細說明，解釋「為什麼」而非僅解釋「做了什麼」。
 * Detailed description of the function, explaining "why" not just "what".
 *
 * @param {Type} paramName - 參數說明 / Parameter description
 * @returns {Type} 返回值說明 / Return value description
 * @throws {Error} 可能拋出的異常 / Possible exceptions
 */
export function exampleFunction(paramName: Type): ReturnType {
    // ...
}
```

### 4. 列舉註解 / Enum Comments

```typescript
export enum ExampleEnum {
    /**
     * 成員說明
     * Member Description
     *
     * 成員的詳細說明。
     * Detailed description of the member.
     */
    MEMBER = 'value',
}
```

### 5. 行內註解 / Inline Comments

```typescript
// 簡短說明 / Brief description
const variable = value;

// 較長的說明可以分兩行
// Longer description can be split into two lines
const anotherVariable = anotherValue;
```

## 已註解的套件 / Annotated Packages

### @novel-segment/assert

斷言工具模組，提供用於測試斷詞結果的延遲匹配功能。

Assertion utility module, providing lazy match functionality for testing word segmentation results.

**主要功能 / Main Features:**
- `lazyMatch()` - 延遲有序匹配 / Lazy ordered match
- `lazyMatch002()` - 延遲多選匹配 / Lazy multi-choice match
- `lazyMatchSynonym001()` - 延遲同義詞匹配 / Lazy synonym match
- `lazyMatchSynonym001Not()` - 延遲同義詞反向匹配 / Lazy synonym negative match
- `lazyMatchNot()` - 延遲反向匹配 / Lazy negative match

### @novel-segment/pretty-diff

美化差異比較模組，提供斷詞結果的視覺化差異比較功能。

Pretty diff module, providing visual diff comparison functionality for segmentation results.

**主要功能 / Main Features:**
- `printPrettyDiff()` - 列印美化差異比較結果 / Print pretty diff result
- `diff_log()` - 產生差異日誌字串 / Generate diff log string

### @novel-segment/stringify

字串化模組，提供將斷詞結果轉換為字串的功能。

Stringify module, providing functionality to convert segmentation results to strings.

**主要功能 / Main Features:**
- `stringify()` - 將詞詞陣列連接成字串 / Join word array into string
- `stringifyList()` - 將詞詞陣列轉換為字串陣列 / Convert word array to string array

### @novel-segment/types

類型定義模組，定義斷詞系統中使用的核心類型與介面。

Type definitions module, defining core types and interfaces used in the segmentation system.

**主要類型 / Main Types:**
- `IWord` - 詞詞物件介面 / Word object interface
- `EnumDictDatabase` - 字典資料庫類型列舉 / Dictionary database type enumeration
- `ArrayTwoOrMore<T>` - 包含兩個或更多元素的陣列類型 / Array type with two or more elements

### @novel-segment/postag

詞性標記模組，提供中文斷詞系統的詞性標記定義與轉換功能。

POS tag module, providing POS tag definitions and conversion functionality for Chinese segmentation system.

**主要功能 / Main Features:**
- `POSTAG` - 詞性標記列舉 / POS tag enumeration
- `enName()` - 英文詞性名稱轉換器 / English POS name translator
- `chsName()` - 簡體中文詞性名稱轉換器 / Simplified Chinese POS name translator
- `zhName()` - 繁體中文詞性名稱轉換器 / Traditional Chinese POS name translator

**詞性標記類型 / POS Tag Types:**

| 標記 | 繁體中文 | English |
|------|----------|---------|
| D_A | 形容詞 | Adjective |
| D_N | 名詞 | Noun |
| D_V | 動詞 | Verb |
| D_D | 副詞 | Adverb |
| A_NR | 人名 | Person Name |
| A_NS | 地名 | Place Name |
| A_NT | 機構團體 | Organization Name |
| ... | ... | ... |

## 註解原則 / Comment Principles

1. **雙語並行 / Bilingual Parallel**
   - 繁體中文在前，英文在後
   - Traditional Chinese first, English second

2. **解釋原因 / Explain Why**
   - 說明「為什麼這樣做」而非僅解釋「做了什麼」
   - Explain "why" not just "what"

3. **完整說明 / Complete Description**
   - 包含參數、返回值、可能的副作用或異常
   - Include parameters, return values, possible side effects or exceptions

4. **保留原始格式 / Preserve Original Format**
   - 不改變任何現有的程式碼格式（縮排、換行、空格等）
   - Do not change any existing code formatting (indentation, line breaks, spaces, etc.)

5. **專有名詞標註 / Technical Terms Annotation**
   - 對於重點名詞、特殊名詞或可能產生歧義的用語，應在繁體中文後標註英文對照
   - For key terms, special terms, or potentially ambiguous terms, annotate with English equivalent after Traditional Chinese

## 相關文件 / Related Documentation

- [Loader Packages](./loader-packages.md)
- [Table Packages](./table-packages.md)
- [Util Sort Packages](./util-sort-packages.md)
