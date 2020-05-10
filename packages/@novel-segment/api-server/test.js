"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("novel-segment/lib/segment/core");
const useModules2_1 = require("novel-segment/lib/segment/methods/useModules2");
const mod_1 = require("novel-segment/lib/mod");
//import { parse } from 'qs';
const url_1 = require("url");
let CACHED_SEGMENT;
function createSegment() {
    return new core_1.default({
        autoCjk: true,
        optionsDoSegment: {
            convertSynonym: true,
        },
        all_mod: true,
    });
}
function getSegment() {
    const DICT = require('./cache.json');
    CACHED_SEGMENT = createSegment();
    useModules2_1.useModules(CACHED_SEGMENT, mod_1.default(CACHED_SEGMENT.options.all_mod));
    CACHED_SEGMENT.DICT = DICT;
    CACHED_SEGMENT.inited = true;
    return CACHED_SEGMENT;
}
exports.getSegment = getSegment;
//console.dir(getSegment().doSegment('韓國明文禁止遊戲代練 即日起代練遊戲獲利者將處以兩年以下有期徒刑'));
console.dir(url_1.parse("/?input=%E5%8E%BB%E9%99%A4%E5%81%9C%E6%AD%A2%E7%AC%A6&input=%E5%8E%BB%E9%99%A4%E5%81%9C%E6%AD%A2%E7%AC%A6&debug=true", true));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx5REFBcUQ7QUFDckQsK0VBQTJFO0FBQzNFLCtDQUFzRDtBQUN0RCw2QkFBNkI7QUFDN0IsNkJBQTRCO0FBRTVCLElBQUksY0FBdUIsQ0FBQztBQUU1QixTQUFTLGFBQWE7SUFFckIsT0FBTyxJQUFJLGNBQU8sQ0FBQztRQUNsQixPQUFPLEVBQUUsSUFBSTtRQUNiLGdCQUFnQixFQUFFO1lBQ2pCLGNBQWMsRUFBRSxJQUFJO1NBQ3BCO1FBQ0QsT0FBTyxFQUFFLElBQUk7S0FDYixDQUFDLENBQUM7QUFDSixDQUFDO0FBRUQsU0FBZ0IsVUFBVTtJQUV6QixNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7SUFFckMsY0FBYyxHQUFHLGFBQWEsRUFBRSxDQUFDO0lBRWpDLHdCQUFVLENBQUMsY0FBcUIsRUFBRSxhQUFpQixDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztJQUVyRixjQUFjLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztJQUMzQixjQUFjLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztJQUU3QixPQUFPLGNBQWMsQ0FBQTtBQUN0QixDQUFDO0FBWkQsZ0NBWUM7QUFFRCwwRUFBMEU7QUFJMUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFLLENBQUMsc0hBQXNILEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBTZWdtZW50IGZyb20gJ25vdmVsLXNlZ21lbnQvbGliL3NlZ21lbnQvY29yZSc7XG5pbXBvcnQgeyB1c2VNb2R1bGVzIH0gZnJvbSAnbm92ZWwtc2VnbWVudC9saWIvc2VnbWVudC9tZXRob2RzL3VzZU1vZHVsZXMyJztcbmltcG9ydCBnZXREZWZhdWx0TW9kTGlzdCBmcm9tICdub3ZlbC1zZWdtZW50L2xpYi9tb2QnO1xuLy9pbXBvcnQgeyBwYXJzZSB9IGZyb20gJ3FzJztcbmltcG9ydCB7IHBhcnNlIH0gZnJvbSAndXJsJztcblxubGV0IENBQ0hFRF9TRUdNRU5UOiBTZWdtZW50O1xuXG5mdW5jdGlvbiBjcmVhdGVTZWdtZW50KClcbntcblx0cmV0dXJuIG5ldyBTZWdtZW50KHtcblx0XHRhdXRvQ2prOiB0cnVlLFxuXHRcdG9wdGlvbnNEb1NlZ21lbnQ6IHtcblx0XHRcdGNvbnZlcnRTeW5vbnltOiB0cnVlLFxuXHRcdH0sXG5cdFx0YWxsX21vZDogdHJ1ZSxcblx0fSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRTZWdtZW50KClcbntcblx0Y29uc3QgRElDVCA9IHJlcXVpcmUoJy4vY2FjaGUuanNvbicpO1xuXG5cdENBQ0hFRF9TRUdNRU5UID0gY3JlYXRlU2VnbWVudCgpO1xuXG5cdHVzZU1vZHVsZXMoQ0FDSEVEX1NFR01FTlQgYXMgYW55LCBnZXREZWZhdWx0TW9kTGlzdChDQUNIRURfU0VHTUVOVC5vcHRpb25zLmFsbF9tb2QpKTtcblxuXHRDQUNIRURfU0VHTUVOVC5ESUNUID0gRElDVDtcblx0Q0FDSEVEX1NFR01FTlQuaW5pdGVkID0gdHJ1ZTtcblxuXHRyZXR1cm4gQ0FDSEVEX1NFR01FTlRcbn1cblxuLy9jb25zb2xlLmRpcihnZXRTZWdtZW50KCkuZG9TZWdtZW50KCfpn5PlnIvmmI7mlofnpoHmraLpgYrmiLLku6Pnt7Qg5Y2z5pel6LW35Luj57e06YGK5oiy542y5Yip6ICF5bCH6JmV5Lul5YWp5bm05Lul5LiL5pyJ5pyf5b6S5YiRJykpO1xuXG5cblxuY29uc29sZS5kaXIocGFyc2UoXCIvP2lucHV0PSVFNSU4RSVCQiVFOSU5OSVBNCVFNSU4MSU5QyVFNiVBRCVBMiVFNyVBQyVBNiZpbnB1dD0lRTUlOEUlQkIlRTklOTklQTQlRTUlODElOUMlRTYlQUQlQTIlRTclQUMlQTYmZGVidWc9dHJ1ZVwiLCB0cnVlKSk7XG4iXX0=