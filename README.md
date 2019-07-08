# README

   cli & lazy version for novel-segment 修正常見簡轉繁時難以處理的字詞

## usage

```
npm install -g novel-segment-cli
npx novel-segment-cli --file input.txt --outDir output_dir
npx novel-segment-cli --glob *.txt --outDir output_dir
```

> npx novel-segment-cli --help

```
file
  --file, -f    處理的檔案，可同時處理多個檔案                           [array]
  --glob, -g                                                             [array]
  --mapSeries   按照順序並且每次只處理一個檔案                         [boolean]
  --createDir   允許當目標資料夾不存在時自動建立                       [boolean]
  --outDir, -o  將處理後的結果儲存到目標資料夾                          [string]

text
  --text, -t  處理的文字，可搭配其他 cli 程式一起使用

Options:
  --overwrite                                                          [boolean]
  --useGlobalCache                                                     [boolean]
  --convertToZhTw   是否在轉換後轉為繁體                               [boolean]
  --crlf            轉換換行符號                                       [boolean]
  --version         Show version number                                [boolean]
  --help            Show help                                          [boolean]
```

## install

```
yarn add novel-segment-cli
npm install novel-segment-cli
```

## demo

[API](index.d.ts)

[demo.ts](test/demo.ts)
```ts
import { textSegment, stringify, fileSegment, processText, processFile, ISegmentOptions } from 'novel-segment-cli';
import { console } from 'novel-segment-cli/lib/util';
import jsdiff = require('diff');

(async () =>
{
	let input = `

「这里是···什么地方？」
「好了，这样最后的班会结束了」
「喂，灰斗，接下来干什么？」

`;


	let ls = await textSegment(input);

	//console.dir(ls);

	console.gray(`------------------`);

	let out = stringify(ls);

	console.dir(out);

	console.log(diff_log(input, out));

	console.gray(`------------------`);

	let text = await processText(input);

	console.dir(text);

})();

function diff_log(src_text: string, new_text: string): string
{
	let diff = jsdiff.diffChars(src_text, new_text);

	let diff_arr = diff
		.reduce(function (a, part)
		{
			let color = part.added ? 'green' :
				part.removed ? 'red' : 'grey';

			let t = console[color].chalk(part.value);

			a.push(t);

			return a;
		}, [])
	;

	return diff_arr.join('');
}
```

![image](readme/image.png)

```
「这裡是···什麼地方？」
「好了，这样最後的班会结束了」
「喂，灰斗，接下来幹什麼？」
```
