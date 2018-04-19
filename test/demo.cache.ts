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

let text = `主人公はラルフ＝エステーソン。転生者。
昔（転生前の子供の頃）から無駄に頭が良く、更に無駄に耳が良かった（地獄耳）。
常人なら唆される『世界の管理者』の策略を逆に利用して『チート』をお土産に異世界へと転生し赤ん坊から始める事に。
没落貴族の地位で１５年間を平穏（？）に過ごし、１５歳で王立魔法学院に入学して…２ヵ月後に飛び級で卒業した。
どうやら『歴代最速』記録だったらしい。
その後、冒険者となってダラダラして過ごし、偶然娼館で出会った娼婦（ヒロイン）を身請けして嫁にしてイチャイチャエロエロして過ごす事に。
※嫁（ヒロイン）は元娼婦なので処女厨には受け入れられない経歴です。
※基本的にエロエロするのは嫁だけです。基本的には。
※なんか問題があったみたいなのでタイトル変更しました。
※凄く今更ですが『カクヨム』にも同作品を投降済みです。
◇◇２０１８年１月１０日　カドカワＢＯＯＫＳ様より書籍化しました◇◇`;

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
