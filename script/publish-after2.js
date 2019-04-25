"use strict";
/**
 * Created by user on 2018/7/24/024.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const project_config_1 = require("../project.config");
/// <reference types="cross-spawn" />
const index = require("../index");
(async () => {
    let crossSpawn;
    // @ts-ignore
    crossSpawn = await Promise.resolve().then(() => require('cross-spawn-extra'));
    let gitroot;
    // @ts-ignore
    gitroot = await Promise.resolve().then(() => require('git-root2'));
    // @ts-ignore
    gitroot = gitroot(__dirname);
    if (!gitroot || path.relative(gitroot, project_config_1.default.project_root)) {
        console.warn(`no git exists`);
        return;
    }
    let options = {
        cwd: path.join(project_config_1.default.project_root, 'test'),
        stdio: 'inherit',
    };
    let msg = `novel-segment@${index.versions['novel-segment']}, segment-dict@${index.versions['segment-dict']}, cjk-conv@${index.versions['cjk-conv']}, regexp-cjk@${index.versions['regexp-cjk']}`;
    await crossSpawn('git', [
        'commit',
        '-a',
        '-m',
        msg,
    ], options);
})().catch(e => console.error(e));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVibGlzaC1hZnRlcjIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJwdWJsaXNoLWFmdGVyMi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7O0FBRUgsNkJBQThCO0FBQzlCLHNEQUE4QztBQUk5QyxxQ0FBcUM7QUFFckMsa0NBQW1DO0FBRW5DLENBQUMsS0FBSyxJQUFJLEVBQUU7SUFFWCxJQUFJLFVBQTZCLENBQUM7SUFDbEMsYUFBYTtJQUNiLFVBQVUsR0FBRywyQ0FBYSxtQkFBbUIsRUFBQyxDQUFDO0lBRS9DLElBQUksT0FBZSxDQUFDO0lBRXBCLGFBQWE7SUFDYixPQUFPLEdBQUcsMkNBQWEsV0FBVyxFQUFDLENBQUM7SUFDcEMsYUFBYTtJQUNiLE9BQU8sR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7SUFFN0IsSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSx3QkFBYSxDQUFDLFlBQVksQ0FBQyxFQUNsRTtRQUNDLE9BQU8sQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDOUIsT0FBTztLQUNQO0lBRUQsSUFBSSxPQUFPLEdBQUc7UUFDYixHQUFHLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyx3QkFBYSxDQUFDLFlBQVksRUFBRSxNQUFNLENBQUM7UUFDbEQsS0FBSyxFQUFFLFNBQVM7S0FDaEIsQ0FBQztJQUVGLElBQUksR0FBRyxHQUFHLGlCQUFpQixLQUFLLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxrQkFBa0IsS0FBSyxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsY0FBYyxLQUFLLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsS0FBSyxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDO0lBRWpNLE1BQU0sVUFBVSxDQUFDLEtBQUssRUFBRTtRQUN2QixRQUFRO1FBQ1IsSUFBSTtRQUNKLElBQUk7UUFDSixHQUFHO0tBQ0gsRUFBRSxPQUFPLENBQUMsQ0FBQztBQUViLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDcmVhdGVkIGJ5IHVzZXIgb24gMjAxOC83LzI0LzAyNC5cbiAqL1xuXG5pbXBvcnQgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcbmltcG9ydCBQcm9qZWN0Q29uZmlnIGZyb20gJy4uL3Byb2plY3QuY29uZmlnJztcbi8vIEB0cy1pZ25vcmVcbmltcG9ydCBQYWNrYWdlSnNvbiA9IHJlcXVpcmUoJy4uL3BhY2thZ2UuanNvbicpO1xuaW1wb3J0IENyb3NzU3Bhd24gPSByZXF1aXJlKCdjcm9zcy1zcGF3bi1leHRyYScpO1xuLy8vIDxyZWZlcmVuY2UgdHlwZXM9XCJjcm9zcy1zcGF3blwiIC8+XG5cbmltcG9ydCBpbmRleCA9IHJlcXVpcmUoJy4uL2luZGV4Jyk7XG5cbihhc3luYyAoKSA9Plxue1xuXHRsZXQgY3Jvc3NTcGF3bjogdHlwZW9mIENyb3NzU3Bhd247XG5cdC8vIEB0cy1pZ25vcmVcblx0Y3Jvc3NTcGF3biA9IGF3YWl0IGltcG9ydCgnY3Jvc3Mtc3Bhd24tZXh0cmEnKTtcblxuXHRsZXQgZ2l0cm9vdDogc3RyaW5nO1xuXG5cdC8vIEB0cy1pZ25vcmVcblx0Z2l0cm9vdCA9IGF3YWl0IGltcG9ydCgnZ2l0LXJvb3QyJyk7XG5cdC8vIEB0cy1pZ25vcmVcblx0Z2l0cm9vdCA9IGdpdHJvb3QoX19kaXJuYW1lKTtcblxuXHRpZiAoIWdpdHJvb3QgfHwgcGF0aC5yZWxhdGl2ZShnaXRyb290LCBQcm9qZWN0Q29uZmlnLnByb2plY3Rfcm9vdCkpXG5cdHtcblx0XHRjb25zb2xlLndhcm4oYG5vIGdpdCBleGlzdHNgKTtcblx0XHRyZXR1cm47XG5cdH1cblxuXHRsZXQgb3B0aW9ucyA9IHtcblx0XHRjd2Q6IHBhdGguam9pbihQcm9qZWN0Q29uZmlnLnByb2plY3Rfcm9vdCwgJ3Rlc3QnKSxcblx0XHRzdGRpbzogJ2luaGVyaXQnLFxuXHR9O1xuXG5cdGxldCBtc2cgPSBgbm92ZWwtc2VnbWVudEAke2luZGV4LnZlcnNpb25zWydub3ZlbC1zZWdtZW50J119LCBzZWdtZW50LWRpY3RAJHtpbmRleC52ZXJzaW9uc1snc2VnbWVudC1kaWN0J119LCBjamstY29udkAke2luZGV4LnZlcnNpb25zWydjamstY29udiddfSwgcmVnZXhwLWNqa0Ake2luZGV4LnZlcnNpb25zWydyZWdleHAtY2prJ119YDtcblxuXHRhd2FpdCBjcm9zc1NwYXduKCdnaXQnLCBbXG5cdFx0J2NvbW1pdCcsXG5cdFx0Jy1hJyxcblx0XHQnLW0nLFxuXHRcdG1zZyxcblx0XSwgb3B0aW9ucyk7XG5cbn0pKCkuY2F0Y2goZSA9PiBjb25zb2xlLmVycm9yKGUpKTtcbiJdfQ==