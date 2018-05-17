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

file = 'D:/Users/Documents/The Project/nodejs-test/node-novel2/dist_novel/user_out/豚公爵に転生したから、今度は君に好きと言いたい/Ⅱ　風の神童は帰還する/６２豚　敲響地獄之鐘吧，鳴響起始之鐘吧.txt';

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
;

console.time(`doSegment`);

let text = `

「王室騎士（Royal Knight）！！！即便要用生命交換也有守住卡莉娜王女啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊」



`;

if (file)
{
	text = fs.readFileSync(file).toString()
}

let ret = segment.doSegment(text);

debug_token(ret);

let changed = crlf(text.toString()) !== segment.stringify(ret);

if (changed)
{
	console.warn(`changed: ${changed}`);
}

fs.writeFileSync('./temp/c1.json', JSON.stringify({

	changed,

	ret,
}, null, "\t"));

fs.writeFileSync('./temp/c1.txt', segment.stringify(ret));

console.timeEnd(`doSegment`);
