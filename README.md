# segment-dict

## dict

* [dict](dict)

## demo

```ts
import { requireLoader, requireLoaderModule, getDictPath } from 'segment-dict';

requireLoader('jieba')('../dict/nodejieba/user.dict.utf8')
	.then(function (dict)
	{
		console.log(dict);
	})
;

requireLoaderModule('segment').load(getDictPath('segment', 'dict.txt'))
	.then(function (dict)
	{
		console.log(dict);
	})
;
```

## links

* [node-segment](https://github.com/bluelovers/node-segment)

---

* [中文詞彙的意義與詞意](http://cwn.ling.sinica.edu.tw/query1.htm)
* http://cdict.info/
* http://www.kwuntung.net/synonym/
* [萌典](https://www.moedict.tw)

---

* http://opencc.byvoid.com/

---

* [search:jieba](https://www.npmjs.com/search?q=jieba)
* [search:nlp chinese](https://www.npmjs.com/search?q=nlp%20chinese)
* [keywords:中文分词](https://www.npmjs.com/search?q=keywords:%E4%B8%AD%E6%96%87%E5%88%86%E8%AF%8D)
* [keywords:分词](https://www.npmjs.com/search?q=keywords:%E5%88%86%E8%AF%8D)

### zh

* [segmentit](https://www.npmjs.com/package/segmentit)
* [node-opencc](https://github.com/compulim/node-opencc)
* [OpenCC](https://github.com/BYVoid/OpenCC)
* [hanzi](https://www.npmjs.com/package/hanzi)
* [jieba-js](https://github.com/bluelovers/jieba-js)
* [nodescws](https://github.com/dotSlashLu/nodescws)

### jp

* [rakutenma](https://www.npmjs.com/package/rakutenma)
