# 專案規範指引 Project Standard Guidelines

## 專案用語說明

本文件定義專案中特定術語的翻譯與用途，確保開發過程中的一致性。

### stopword（分隔詞）

#### 翻譯

**分隔詞**

本專案將 `stopword` 翻譯為「分隔詞」，而非傳統 NLP 的「停用詞」。

**不沿用「停用詞」的原因**：語義上不夠直覺，容易誤解為「停用什麼事情」，無法準確表達其「分隔、切割」的功能。

其他可接受的別名：`停止符`、`斷詞符`、`斷詞標記`。

#### 定義

`stopword` 在本專案中是指用於切割字串、進行簡易斷詞的字元或詞語，作為後續分詞處理的邊界標記。

#### 組成類型

| 類型 | 說明 | 範例 |
|------|------|------|
| 標點符號 | 中英文標點符號 | `，。、；：？！.,;:?!` |
| 特殊符號 | 數學符號、貨幣符號等 | `＋－×÷＝≈≡≠￥％＄` |
| 括號引號 | 各類括號與引號 | `（）〈〉『』【】「」` |
| 語義分隔詞 | 具有區分段落功能的詞語 | `一直`、`一些`、`許多`、`也就是說` |
| NLP 停用詞 | 傳統 NLP 停用詞，刪去後不影響閱讀 | `的`、`了`、`是`、`在` |

#### 用途

1. **字串切割**：將連續文字依分隔詞切斷，產生初步的斷詞片段
2. **邊界標記**：作為分詞演算法的邊界參考點
3. **段落區分**：部分語義分隔詞可標記語句的轉折或段落

#### 參考資料

- [dict:stopword](../../packages/segment-dict/dict/stopword/) - 分隔詞字典檔案
- [STOPWORD.ts](../../packages/novel-segment/lib/mod/data/STOPWORD.ts) - 分隔詞資料結構定義

## 字典結構

[`defaults/dict.ts`](../../packages/novel-segment/lib/defaults/dict.ts) 為預設會被讀取的字典。

### dict/segment（分詞字典表）

[`dict/segment`](../../packages/segment-dict/dict/segment) 目錄包含分詞字典表。

| 檔案 | 說明 |
|------|------|
| [`char.txt`](../../packages/segment-dict/dict/segment/char.txt) | 單一字元字典檔 |
| [`lazy/index.txt`](../../packages/segment-dict/dict/segment/lazy/index.txt) | 後續新增但未歸類的分詞字典，會不定期整理 |
| [`infrequent.txt`](../../packages/segment-dict/dict/segment/infrequent.txt) | 不常用詞彙/罕見詞（預設不自動載入） |
| [`dict_synonym/`](../../packages/segment-dict/dict/segment/dict_synonym) | 異體字/錯用字/相似字詞語字典，便於整理相關詞彙 |

#### 棄用的字典

- [`dict/segment/jieba`](../../packages/segment-dict/dict/segment/jieba)
- [`dict/segment/pangu/skip`](../../packages/segment-dict/dict/segment/pangu/skip)

#### 參考資料

- [`dict/segment/dict_synonym/README.md`](../../packages/segment-dict/dict/segment/dict_synonym/README.md)

### dict/stopword（分隔詞字典表）

[`dict/stopword`](../../packages/segment-dict/dict/stopword) 目錄下的字典檔為分隔詞字典表。

### dict/synonym（同義詞字典表）

[`dict/synonym`](../../packages/segment-dict/dict/synonym) 目錄下的字典檔為同義詞字典表。

| 檔案 | 用途 |
|------|------|
| [`synonym.txt`](../../packages/segment-dict/dict/synonym/synonym.txt) | 預設的同義詞字典檔 |
| [`zht.synonym.txt`](../../packages/segment-dict/dict/synonym/zht.synonym.txt) | 簡體中文轉繁體中文 |
| [`zht.common.synonym.txt`](../../packages/segment-dict/dict/synonym/zht.common.synonym.txt) | 簡體中文轉繁體中文（常用詞，需自行載入，不考慮少見用詞的錯誤轉換） |
| [`badword.synonym.txt`](../../packages/segment-dict/dict/synonym/badword.synonym.txt) | 錯字修正 |

### dict/blacklist（黑名單字典表）

[`dict/blacklist`](../../packages/segment-dict/dict/blacklist) 目錄下的字典檔為黑名單字典表。

| 檔案 | 用途 |
|------|------|
| [`blacklist.name.txt`](../../packages/segment-dict/dict/blacklist/blacklist.name.txt) | 防止分詞時錯誤判斷為名字 |
| [`blacklist.synonym.txt`](../../packages/segment-dict/dict/blacklist/blacklist.synonym.txt) | 防止同義詞轉換時被轉換 |
