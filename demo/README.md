# title

```ts
const segment = new Segment();
```

## 如何將目前已加入的字典匯出

```ts
// 用來確保字典的確已載入
segment.autoInit()

// 字典類型
let type = 'TABLE';

let db_dict = segment.getDictDatabase(type)
fs.writeFileSync('./exported.table.dict.txt', db_dict.stringify())
```

## 段落切分

> 由於 segment 是利用對內容的前後文分析來進行分詞  
> 所以如何切割段落對於結果就會產生不同影響

|       | |
|:------|:--|
| `SPLIT` | `RegExp` or 具有 `.[Symbol.split](input: string, limit?: number) => string[]` 的物件 |
| `SPLIT_FILTER` | `RegExp` or 具有 `.test(input: string) => boolean` 的物件 |

```ts
	/**
	 * 分段
	 * `RegExp` or 具有 `.[Symbol.split](input: string, limit?: number) => string[]` 的物件
	 *
	 * @type {Segment.ISPLIT}
	 */
	segment.SPLIT: ISPLIT = /([\r\n]+|^[　\s+]+|[　\s]+$|[　\s]{2,})/gm as ISPLIT;

	/**
	 * 分段之後 如果符合以下條件 則直接忽略分析
	 * `RegExp` or 具有 `.test(input: string) => boolean` 的物件
	 *
	 * @type {Segment.ISPLIT_FILTER}
	 */
	segment.SPLIT_FILTER: ISPLIT_FILTER = /^([\r\n]+)$/g as ISPLIT_FILTER;
```

## dictionary

> 以下方法會載入字典 `name`

`name` 可以為

* 字典檔案絕對/相對路徑
* 字典檔名(可以忽略副檔名)

當只輸入檔名時  
會呼叫 `_resolveDictFilename(name: string, pathPlus?: string[], extPlus?: string[]): string;`  
依照以下順序搜尋第一個符合的檔案

1. 目前 `cwd` 的相對路徑
2. novel-segment 模組底下的 [`novel-segment/dicts`](https://github.com/bluelovers/node-segment/tree/master/dicts)
3. 如果是呼叫 `loadSynonymDict` 時 會額外搜尋 [`segment-dict/dict/synonym`](https://github.com/bluelovers/node-segment-dict/tree/master/dict/synonym)
4. 如果是呼叫 `loadStopwordDict` 時 會額外搜尋 [`segment-dict/dict/stopword`](https://github.com/bluelovers/node-segment-dict/tree/master/dict/stopword)
5. `segment-dict` 模組底下的 [`segment-dict/dict/segment`](https://github.com/bluelovers/node-segment-dict/tree/master/dict/segment)

副檔名為以下順序

1. `''` => 無 也就是與 `name` 同名的檔案
2. `.utf8`
3. `.txt`

```ts
    /**
     * 载入字典文件
     *
     * @param {String} name 字典文件名
     * @param {String} type 类型
     * @param {Boolean} convert_to_lower 是否全部转换为小写
     * @return {Segment}
     */
    loadDict(name: string, type?: string, convert_to_lower?: boolean, skipExists?: boolean): this;
    /**
     * 载入同义词词典
     *
     * @param {String} name 字典文件名
     */
    loadSynonymDict(name: string, skipExists?: boolean): this;
    /**
     * 载入停止符词典
     *
     * @param {String} name 字典文件名
     */
    loadStopwordDict(name: string): this;
```

