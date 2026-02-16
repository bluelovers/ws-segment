# segment-dict

## 字典結構

[`defaults/dict.ts`](../../novel-segment/lib/defaults/dict.ts) 為預設會被讀取的字典。

### dict/segment（分詞字典表）

[`dict/segment`](./segment) 目錄包含分詞字典表。

| 檔案 | 說明 |
|------|------|
| [`char.txt`](./segment/char.txt) | 單一字元字典檔 |
| [`lazy/index.txt`](./segment/lazy/index.txt) | 後續新增但未歸類的分詞字典，會不定期整理 |
| [`infrequent.txt`](./segment/infrequent.txt) | 不常用詞彙/罕見詞（預設不自動載入） |
| [`dict_synonym/`](./segment/dict_synonym) | 異體字/錯用字/相似字詞語字典，便於整理相關詞彙 |

#### 棄用的字典

- [`dict/segment/jieba`](./segment/jieba)
- [`dict/segment/pangu/skip`](./segment/pangu/skip)

#### 參考資料

- [`dict/segment/dict_synonym/README.md`](./segment/dict_synonym/README.md)

### dict/stopword（分隔詞字典表）

[`dict/stopword`](./stopword) 目錄下的字典檔為分隔詞字典表。

### dict/synonym（同義詞字典表）

[`dict/synonym`](./synonym) 目錄下的字典檔為同義詞字典表。

| 檔案 | 用途 |
|------|------|
| [`synonym.txt`](./synonym/synonym.txt) | 預設的同義詞字典檔 |
| [`zht.synonym.txt`](./synonym/zht.synonym.txt) | 簡體中文轉繁體中文 |
| [`zht.common.synonym.txt`](./synonym/zht.common.synonym.txt) | 簡體中文轉繁體中文（常用詞，需自行載入，不考慮少見用詞的錯誤轉換） |
| [`badword.synonym.txt`](./synonym/badword.synonym.txt) | 錯字修正 |

### dict/blacklist（黑名單字典表）

[`dict/blacklist`](./blacklist) 目錄下的字典檔為黑名單字典表。

| 檔案 | 用途 |
|------|------|
| [`blacklist.name.txt`](./blacklist/blacklist.name.txt) | 防止分詞時錯誤判斷為名字 |
| [`blacklist.synonym.txt`](./blacklist/blacklist.synonym.txt) | 防止同義詞轉換時被轉換 |
