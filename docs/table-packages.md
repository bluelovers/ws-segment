# @novel-segment/table-* 套件文檔
# @novel-segment/table-* Packages Documentation

## 概述 / Overview

`@novel-segment/table-*` 是一系列用於 `novel-segment` 中文分詞庫的字典表格模組。這些模組提供了不同類型的詞典儲存結構，支援詞語的新增、刪除、查詢與序列化操作。

The `@novel-segment/table-*` packages are a series of dictionary table modules for the `novel-segment` Chinese word segmentation library. These modules provide different types of dictionary storage structures, supporting word addition, deletion, lookup, and serialization operations.

## 套件列表 / Package List

| 套件名稱 Package Name | 說明 Description |
|----------------------|------------------|
| `@novel-segment/table-core-abstract` | 核心抽象類別，定義字典表格的基礎介面與共用方法 |
| `@novel-segment/table-line` | 行式字典表格，適用於只需判斷是否存在的場景 |
| `@novel-segment/table-dict` | 主要字典表格，儲存詞性與詞頻資訊 |
| `@novel-segment/table-blacklist` | 黑名單表格，用於過濾敏感詞 |
| `@novel-segment/table-stopword` | 停用詞表格，用於過濾常見無意義詞 |
| `@novel-segment/table-synonym-pangu` | 盤古同義詞表格（已廢棄），一對一對應格式 |
| `@novel-segment/table-synonym` | 同義詞表格，支援一對多對應 |

## 類別繼承關係 / Class Inheritance Hierarchy

```
AbstractTableDictCore<T>          # 核心抽象類別 / Core abstract class
├── TableDict                     # 主要字典表格 / Main dictionary table
│   └── 儲存 ITableDictRow { p, f, s }
│
├── TableDictLine                 # 行式字典表格 / Line-based dictionary table
│   ├── TableDictBlacklist        # 黑名單表格 / Blacklist table
│   └── TableDictStopword         # 停用詞表格 / Stopword table
│
└── TableDictSynonymPanGu         # 盤古同義詞表格（已廢棄）/ Pangu synonym table (deprecated)
    └── TableDictSynonym          # 同義詞表格 / Synonym table
```

## 核心類別說明 / Core Class Descriptions

### AbstractTableDictCore<T>

所有字典表格的基礎抽象類別，提供共用的儲存結構與操作方法。

Base abstract class for all dictionary tables, providing shared storage structures and operations.

**主要屬性 / Main Properties:**

| 屬性 Property | 類型 Type | 說明 Description |
|--------------|-----------|------------------|
| `TABLE` | `IDICT<T>` | 主字典表格，以詞語為鍵 / Main dictionary table with words as keys |
| `TABLE2` | `IDICT2<T>` | 二維字典表格，以長度為第一層鍵 / Two-dimensional table with length as first-level key |
| `type` | `string` | 表格類型識別碼 / Table type identifier |
| `options` | `IOptions` | 表格選項 / Table options |

**主要方法 / Main Methods:**

| 方法 Method | 說明 Description |
|------------|------------------|
| `exists(data)` | 檢查詞語是否存在 / Check if word exists |
| `add(data)` | 新增詞語（抽象方法）/ Add word (abstract) |
| `remove(data)` | 移除詞語 / Remove word |
| `json()` | 匯出為 JSON 物件 / Export as JSON object |
| `stringify()` | 序列化為字串 / Serialize to string |
| `size()` | 取得詞語數量 / Get word count |

### TableDict

主要字典表格實作，儲存詞語的詞性 (POS) 與詞頻 (frequency) 資訊。

Main dictionary table implementation, storing part of speech (POS) and frequency information for words.

**ITableDictRow 結構 / ITableDictRow Structure:**

```typescript
interface ITableDictRow {
  p: number;  // 詞性 (Part of Speech) - 位元遮罩表示
  f: number;  // 詞頻 (Frequency)
  s?: boolean; // 同步標記 (Sync Flag)
}
```

**特色功能 / Key Features:**

- 支援 `autoCjk` 選項，自動建立簡繁轉換變體
- 二維索引結構，按詞語長度分組以優化查詢效能

**使用範例 / Usage Example:**

```typescript
import { TableDict } from '@novel-segment/table-dict';

const dict = new TableDict('', { autoCjk: true });

// 新增詞語：詞語, 詞性, 詞頻
dict.add(['台灣', 0x400000, 100]);

// 查詢詞語
const entry = dict.exists('台灣');
console.log(entry); // { p: 4194304, f: 100, s: true }

// 序列化輸出
console.log(dict.stringify());
```

### TableDictLine

行式字典表格抽象類別，每個詞語對應布林值，適用於只需判斷是否存在的場景。

Abstract line-based dictionary table class, each word corresponds to a boolean value, suitable for scenarios where only existence checking is needed.

**使用範例 / Usage Example:**

```typescript
import { TableDictLine } from '@novel-segment/table-line';

// 注意：TableDictLine 是抽象類別，需透過子類別使用
// Note: TableDictLine is abstract, use through subclasses

// 使用 TableDictStopword
import { TableDictStopword } from '@novel-segment/table-stopword';

const stopwordTable = new TableDictStopword();
stopwordTable.add(['的', '是', '在', '了']);

console.log(stopwordTable.exists('的')); // true
console.log(stopwordTable.exists('電腦')); // null
```

### TableDictBlacklist

黑名單表格，繼承自 `TableDictLine`，用於儲存需要被過濾或排除的詞語。

Blacklist table, inherits from `TableDictLine`, used to store words that need to be filtered or excluded.

**使用範例 / Usage Example:**

```typescript
import { TableDictBlacklist } from '@novel-segment/table-blacklist';

const blacklist = new TableDictBlacklist();
blacklist.add(['敏感詞', '不當用語']);

if (blacklist.exists('敏感詞')) {
  console.log('此詞語在黑名單中 / This word is in the blacklist');
}
```

### TableDictStopword

停用詞表格，繼承自 `TableDictLine`，用於儲存需要在文字處理中過濾的常見詞語。

Stopword table, inherits from `TableDictLine`, used to store common words that need to be filtered during text processing.

**使用範例 / Usage Example:**

```typescript
import { TableDictStopword } from '@novel-segment/table-stopword';

const stopwordTable = new TableDictStopword();
stopwordTable.add(['的', '是', '在', '了', '和', '與']);

// 在分詞過程中過濾停用詞
// Filter stopwords during segmentation
const words = ['我', '的', '書', '在', '桌子', '上'];
const filtered = words.filter(w => !stopwordTable.exists(w));
console.log(filtered); // ['我', '書', '桌子', '上']
```

### TableDictSynonymPanGu (已廢棄 / Deprecated)

盤古同義詞表格，實作一對一的同義詞對應。格式為 `[錯字, 正字]`。

Pangu synonym table, implementing one-to-one synonym mapping. Format is `[wrong_word, correct_word]`.

> **注意 / Note:** 此類別已標記為廢棄，建議使用 `TableDictSynonym`。
> This class is marked as deprecated, recommend using `TableDictSynonym`.

### TableDictSynonym

同義詞表格，支援一對多的同義詞對應。格式為 `[正字, 變體1, 變體2, ...]`。

Synonym table, supporting one-to-many synonym mapping. Format is `[correct_word, variant1, variant2, ...]`.

**與原版 node-segment 的差異 / Differences from Original node-segment:**

| 項目 Item | 原版 node-segment | TableDictSynonym |
|-----------|------------------|------------------|
| 對應關係 Mapping | 一對一 One-to-one | 一對多 One-to-many |
| 順序 Order | 錯字, 正字 | 正字, 錯字, ... |
| 功能 Function | 錯字校正 | 錯字校正 + 同義詞 |

**使用範例 / Usage Example:**

```typescript
import { TableDictSynonym } from '@novel-segment/table-synonym';

const synonymTable = new TableDictSynonym();

// 正字為「臺灣」，對應到多個變體
// Correct word is "臺灣", mapping to multiple variants
synonymTable.add(['臺灣', '台灣', '台湾']);

// 查詢變體對應的正字
// Query the correct word for a variant
console.log(synonymTable.exists('台灣')); // '臺灣'
console.log(synonymTable.exists('台湾')); // '臺灣'
```

## 介面定義 / Interface Definitions

### IOptions

```typescript
interface IOptions {
  autoCjk?: boolean;  // 自動轉換中日韓字元 / Auto-convert CJK characters
}
```

### IDICT<T>

```typescript
interface IDICT<T = any> {
  [key: string]: T;
}
```

### IDICT2<T>

```typescript
interface IDICT2<T = any> {
  [key: number]: IDICT<T>;  // 以詞語長度為鍵 / Keyed by word length
}
```

### IOptionsTableDictSynonym

```typescript
interface IOptionsTableDictSynonym extends IOptions {
  skipExists?: boolean;      // 若詞語已存在則跳過 / Skip if word exists
  forceOverwrite?: boolean;  // 強制覆寫已存在的對應 / Force overwrite existing mappings
}
```

## 安裝與使用 / Installation and Usage

### 安裝 / Install

```bash
# 安裝所有表格套件 / Install all table packages
pnpm add @novel-segment/table-core-abstract
pnpm add @novel-segment/table-line
pnpm add @novel-segment/table-dict
pnpm add @novel-segment/table-blacklist
pnpm add @novel-segment/table-stopword
pnpm add @novel-segment/table-synonym
```

### 基本使用 / Basic Usage

```typescript
import { TableDict } from '@novel-segment/table-dict';
import { TableDictStopword } from '@novel-segment/table-stopword';
import { TableDictBlacklist } from '@novel-segment/table-blacklist';
import { TableDictSynonym } from '@novel-segment/table-synonym';

// 建立字典表格實例 / Create dictionary table instances
const dict = new TableDict('', { autoCjk: true });
const stopword = new TableDictStopword();
const blacklist = new TableDictBlacklist();
const synonym = new TableDictSynonym();

// 新增詞語 / Add words
dict.add(['程式設計', 0x400000, 50]);
stopword.add(['的', '是']);
blacklist.add(['敏感詞']);
synonym.add(['程式設計', '程序设计', '编程']);

// 查詢 / Query
console.log(dict.exists('程式設計'));
console.log(stopword.exists('的'));
console.log(blacklist.exists('敏感詞'));
console.log(synonym.exists('编程'));  // 返回 '程式設計'
```

## 授權 / License

MIT License
