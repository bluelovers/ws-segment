/**
 * Created by user on 2018/4/15/015.
 */

import Segment, { POSTAG } from '../index';
import { useDefault, getDefaultModList } from '../lib';
import * as fs from "fs";
import { createSegment } from './lib';
import { debug_token } from '../lib/util'

const segment = createSegment();

console.time(`doSegment`);

let text = `如果有万一，之后发生了什么事，也不用负责。`;

let ret = segment.doSegment(text);

debug_token(ret);

fs.writeFileSync('./temp/c1.json', JSON.stringify({
	ret,
}, null, "\t"));

console.timeEnd(`doSegment`);
