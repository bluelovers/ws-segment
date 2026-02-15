# 異體字字典目錄
# Variant Character Dictionary Directory

此資料夾雖然名為 `dict_synonym` 但實際上並非為同義詞字典，實際上屬於一般分詞用字典。
但與其他資料夾檔案不同的是，每個檔案內都是收集具有異體字/錯用字/相似字的詞語，使其易於整理。

Although this folder is named `dict_synonym`, it is not actually a synonym dictionary but rather a general segmentation dictionary.
The difference from other folder files is that each file collects words with variant characters/misspelled characters/similar characters for easier organization.

## 資料處理流程 / Data Processing Flow

藉由 [`test/sort.ts`](../../../test/sort.ts) 來將字典設定過濾提取出來。
提取出的字典會暫存於 [`test/temp/one.txt`](../../../test/temp/one.txt)。

Use [`test/sort.ts`](../../../test/sort.ts) to filter and extract dictionary settings.
The extracted dictionary is temporarily stored in [`test/temp/one.txt`](../../../test/temp/one.txt).

## 使用範例 / Usage Example

例如，「胡鬍须鬚糊」都被收集於 [`鬍鬚.txt`](鬍鬚.txt)。

For example, "胡鬍须鬚糊" are all collected in [`鬍鬚.txt`](鬍鬚.txt).

## 索引 / Index

**需要注意的是，部分關鍵字可能同時分散於不同字典檔案內。**

**Note that some keywords may be scattered across different dictionary files.**

| 字典檔名 Dictionary File | 主要關鍵字 Main Keywords | 其他備註 Other Notes |
|---------------------------|--------------------------|----------------------|
| [`鬍鬚.txt`](鬍鬚.txt) | 胡鬍须鬚糊 | 鬍鬚 有時可互換，例如：络腮鬍, 络腮鬚 / 鬍鬚 are sometimes interchangeable, e.g., 络腮鬍, 络腮鬚 |
| [`担擔檐簷.txt`](担擔檐簷.txt) | 担擔檐簷 | |
| [`捶搥錘鎚椎槌.txt`](捶搥錘鎚椎槌.txt) | 捶搥錘鎚椎槌 | |
| [`了.txt`](了.txt) | 了 | |
| [`播.txt`](播.txt) | 播拨 | |
