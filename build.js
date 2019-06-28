"use strict";
/**
 * Created by user on 2019/6/28.
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Created by user on 2019/6/26.
 */
const lib_1 = require("novel-segment/lib");
const fs_extra_1 = require("fs-extra");
//import { resolve } from 'bluebird';
const path_1 = require("path");
const __root = __dirname;
function buildCache() {
    const CACHED_SEGMENT = createSegment();
    CACHED_SEGMENT.doSegment('');
    return fs_extra_1.outputJSON(path_1.join(__root, 'cache.json'), CACHED_SEGMENT.DICT)
        .then(() => {
        console.log('[buildCache] done');
    });
}
function createSegment() {
    return new lib_1.default({
        autoCjk: true,
        optionsDoSegment: {
            convertSynonym: true,
        },
        all_mod: true,
    });
}
buildCache();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbGQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJidWlsZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7O0FBR0g7O0dBRUc7QUFFSCwyQ0FBd0M7QUFDeEMsdUNBQXNDO0FBQ3RDLHFDQUFxQztBQUNyQywrQkFBNEI7QUFDNUIsTUFBTSxNQUFNLEdBQUcsU0FBUyxDQUFDO0FBRXpCLFNBQVMsVUFBVTtJQUVsQixNQUFNLGNBQWMsR0FBRyxhQUFhLEVBQUUsQ0FBQztJQUV2QyxjQUFjLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBRTdCLE9BQU8scUJBQVUsQ0FBQyxXQUFJLENBQUMsTUFBTSxFQUFFLFlBQVksQ0FBQyxFQUFFLGNBQWMsQ0FBQyxJQUFJLENBQUM7U0FDaEUsSUFBSSxDQUFDLEdBQUcsRUFBRTtRQUNWLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW1CLENBQUMsQ0FBQTtJQUNqQyxDQUFDLENBQUMsQ0FBQTtBQUNKLENBQUM7QUFFRCxTQUFTLGFBQWE7SUFFckIsT0FBTyxJQUFJLGFBQU8sQ0FBQztRQUNsQixPQUFPLEVBQUUsSUFBSTtRQUNiLGdCQUFnQixFQUFFO1lBQ2pCLGNBQWMsRUFBRSxJQUFJO1NBQ3BCO1FBQ0QsT0FBTyxFQUFFLElBQUk7S0FDYixDQUFDLENBQUM7QUFDSixDQUFDO0FBRUQsVUFBVSxFQUFFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgdXNlciBvbiAyMDE5LzYvMjguXG4gKi9cblxuXG4vKipcbiAqIENyZWF0ZWQgYnkgdXNlciBvbiAyMDE5LzYvMjYuXG4gKi9cblxuaW1wb3J0IFNlZ21lbnQgZnJvbSAnbm92ZWwtc2VnbWVudC9saWInO1xuaW1wb3J0IHsgb3V0cHV0SlNPTiB9IGZyb20gJ2ZzLWV4dHJhJztcbi8vaW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gJ2JsdWViaXJkJztcbmltcG9ydCB7IGpvaW4gfSBmcm9tIFwicGF0aFwiO1xuY29uc3QgX19yb290ID0gX19kaXJuYW1lO1xuXG5mdW5jdGlvbiBidWlsZENhY2hlKClcbntcblx0Y29uc3QgQ0FDSEVEX1NFR01FTlQgPSBjcmVhdGVTZWdtZW50KCk7XG5cblx0Q0FDSEVEX1NFR01FTlQuZG9TZWdtZW50KCcnKTtcblxuXHRyZXR1cm4gb3V0cHV0SlNPTihqb2luKF9fcm9vdCwgJ2NhY2hlLmpzb24nKSwgQ0FDSEVEX1NFR01FTlQuRElDVClcblx0XHQudGhlbigoKSA9PiB7XG5cdFx0XHRjb25zb2xlLmxvZygnW2J1aWxkQ2FjaGVdIGRvbmUnKVxuXHRcdH0pXG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVNlZ21lbnQoKVxue1xuXHRyZXR1cm4gbmV3IFNlZ21lbnQoe1xuXHRcdGF1dG9Dams6IHRydWUsXG5cdFx0b3B0aW9uc0RvU2VnbWVudDoge1xuXHRcdFx0Y29udmVydFN5bm9ueW06IHRydWUsXG5cdFx0fSxcblx0XHRhbGxfbW9kOiB0cnVlLFxuXHR9KTtcbn1cblxuYnVpbGRDYWNoZSgpO1xuIl19