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
	//.add(['場', 0x120000, 4000])
;

console.time(`doSegment`);

let text = `

因這絕無僅有的農閒期而能出動人外出干活

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
