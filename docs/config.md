# title

```ts
const segment = new Segment();
```

## 段落切分

> 由於 segment 是利用對內容的前後文分析來進行分詞  
> 所以如何切割段落對於結果就會產生不同影響

|       | |
|:------|:--|
| SPLIT | `RegExp` or 具有 `.[Symbol.split](input: string, limit?: number) => string[]` 的物件 |
| SPLIT_FILTER | `RegExp` or 具有 `.test(input: string) => boolean` 的物件 |

```ts
	/**
	 * 分段
	 * `RegExp` or 具有 `.[Symbol.split](input: string, limit?: number) => string[]` 的物件
	 *
	 * @type {Segment.ISPLIT}
	 */
	SPLIT: ISPLIT = /([\r\n]+|^[　\s+]+|[　\s]+$|[　\s]{2,})/gm as ISPLIT;

	/**
	 * 分段之後 如果符合以下條件 則直接忽略分析
	 * `RegExp` or 具有 `.test(input: string) => boolean` 的物件
	 *
	 * @type {Segment.ISPLIT_FILTER}
	 */
	SPLIT_FILTER: ISPLIT_FILTER = /^([\r\n]+)$/g as ISPLIT_FILTER;
```
