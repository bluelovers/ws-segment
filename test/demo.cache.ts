/**
 * Created by user on 2018/4/15/015.
 */

import { crlf } from 'crlf-normalize';
import Segment, { POSTAG } from '../index';
import { useDefault, getDefaultModList } from '../lib';
import * as fs from "fs";
import { createSegment } from './lib';
import { debug_token } from '../lib/util'
import { getDictMain } from './lib/index';

let file: string;

//file = 'D:/Users/Documents/The Project/nodejs-test/node-novel2/dist_novel/user_out/回復術士のやり直し～即死魔法とスキルコピーの超越ヒール～/00040_第四章：回復術士は魔王を超える/00070_第七話：回復術士は卵に魔力を注ぐ.txt';

const segment = createSegment();

let db_dict = getDictMain(segment);

/**
 * 最後一個參數的數字是代表權重 數字越高 越優先
 */
db_dict
	//.add(['在這裡', POSTAG.D_F, 0])
	//.add(['人名', POSTAG.A_NR, 0])
	//.add(['地名', POSTAG.A_NS, 0])
	//.add(['机构团体', POSTAG.A_NT, 0])
	//.add(['名词', POSTAG.D_N, 0])
	//.add(['錯字', POSTAG.BAD, 0])
	.add(['l10n', POSTAG.A_NX, 0])
	.add(['i18n', POSTAG.A_NX, 0])
;

console.time(`doSegment`);

let text = `

而現在，黑暗精靈自己把豐滿的褐色臀部推進欄桿裡，露出屁股中間的小穴。
 我那對異種族愛愛，而變得更加興奮，勃起的小弟弟依舊激烈的進攻中。
黑暗精靈娘和艾米莉亞兩個的尖叫聲混合在了一起，噗呲噗呲的愛液聲音與現在的氣氛同時提升到靈一個次元。

`;

text = text.replace(/^\s+|\s+$/g, '');

if (file)
{
	text = fs.readFileSync(file).toString()
}

let ret = segment.doSegment(text);

debug_token(ret);

let output_text = segment.stringify(ret);

let changed = crlf(text.toString()) !== output_text;

if (changed)
{
	console.warn(`changed: ${changed}`);
}

fs.writeFileSync('./temp/c1.json', JSON.stringify({

	changed,

	ret,
}, null, "\t"));

fs.writeFileSync('./temp/c1.txt', output_text);

console.log("------------------\n\n");

console.log(output_text);

console.log("\n\n------------------");

console.timeEnd(`doSegment`);
