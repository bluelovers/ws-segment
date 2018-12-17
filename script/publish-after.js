"use strict";
/**
 * Created by user on 2018/7/24/024.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const project_config_1 = require("../project.config");
// @ts-ignore
const PackageJson = require("../package.json");
/// <reference types="cross-spawn" />
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
        cwd: project_config_1.default.project_root,
        stdio: 'inherit',
    };
    let msg = `npm publish ${PackageJson.version}`;
    await crossSpawn('git', [
        'commit',
        '-a',
        '-m',
        msg,
    ], options);
    await new Promise(function (done) {
        setTimeout(done, 500);
    });
    await crossSpawn('git', [
        'tag',
        '-a',
        PackageJson.version,
        '-m',
        msg,
    ], options);
})().catch(e => console.error(e));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVibGlzaC1hZnRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInB1Ymxpc2gtYWZ0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztHQUVHOztBQUVILDZCQUE2QjtBQUM3QixzREFBOEM7QUFDOUMsYUFBYTtBQUNiLCtDQUErQztBQUUvQyxxQ0FBcUM7QUFFckMsQ0FBQyxLQUFLLElBQUksRUFBRTtJQUVYLElBQUksVUFBNkIsQ0FBQztJQUNsQyxhQUFhO0lBQ2IsVUFBVSxHQUFHLDJDQUFhLG1CQUFtQixFQUFDLENBQUM7SUFFL0MsSUFBSSxPQUFlLENBQUM7SUFFcEIsYUFBYTtJQUNiLE9BQU8sR0FBRywyQ0FBYSxXQUFXLEVBQUMsQ0FBQztJQUNwQyxhQUFhO0lBQ2IsT0FBTyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUU3QixJQUFJLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLHdCQUFhLENBQUMsWUFBWSxDQUFDLEVBQ2xFO1FBQ0MsT0FBTyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUM5QixPQUFPO0tBQ1A7SUFFRCxJQUFJLE9BQU8sR0FBRztRQUNiLEdBQUcsRUFBRSx3QkFBYSxDQUFDLFlBQVk7UUFDL0IsS0FBSyxFQUFFLFNBQVM7S0FDaEIsQ0FBQztJQUVGLElBQUksR0FBRyxHQUFHLGVBQWUsV0FBVyxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBRS9DLE1BQU0sVUFBVSxDQUFDLEtBQUssRUFBRTtRQUN2QixRQUFRO1FBQ1IsSUFBSTtRQUNKLElBQUk7UUFDSixHQUFHO0tBQ0gsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUVaLE1BQU0sSUFBSSxPQUFPLENBQUMsVUFBVSxJQUFJO1FBRS9CLFVBQVUsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDdkIsQ0FBQyxDQUFDLENBQUM7SUFFSCxNQUFNLFVBQVUsQ0FBQyxLQUFLLEVBQUU7UUFDdkIsS0FBSztRQUNMLElBQUk7UUFDSixXQUFXLENBQUMsT0FBTztRQUNuQixJQUFJO1FBQ0osR0FBRztLQUNILEVBQUUsT0FBTyxDQUFDLENBQUM7QUFFYixDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTgvNy8yNC8wMjQuXG4gKi9cblxuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCBQcm9qZWN0Q29uZmlnIGZyb20gJy4uL3Byb2plY3QuY29uZmlnJztcbi8vIEB0cy1pZ25vcmVcbmltcG9ydCAqIGFzIFBhY2thZ2VKc29uIGZyb20gJy4uL3BhY2thZ2UuanNvbic7XG5pbXBvcnQgQ3Jvc3NTcGF3biA9IHJlcXVpcmUoJ2Nyb3NzLXNwYXduLWV4dHJhJyk7XG4vLy8gPHJlZmVyZW5jZSB0eXBlcz1cImNyb3NzLXNwYXduXCIgLz5cblxuKGFzeW5jICgpID0+XG57XG5cdGxldCBjcm9zc1NwYXduOiB0eXBlb2YgQ3Jvc3NTcGF3bjtcblx0Ly8gQHRzLWlnbm9yZVxuXHRjcm9zc1NwYXduID0gYXdhaXQgaW1wb3J0KCdjcm9zcy1zcGF3bi1leHRyYScpO1xuXG5cdGxldCBnaXRyb290OiBzdHJpbmc7XG5cblx0Ly8gQHRzLWlnbm9yZVxuXHRnaXRyb290ID0gYXdhaXQgaW1wb3J0KCdnaXQtcm9vdDInKTtcblx0Ly8gQHRzLWlnbm9yZVxuXHRnaXRyb290ID0gZ2l0cm9vdChfX2Rpcm5hbWUpO1xuXG5cdGlmICghZ2l0cm9vdCB8fCBwYXRoLnJlbGF0aXZlKGdpdHJvb3QsIFByb2plY3RDb25maWcucHJvamVjdF9yb290KSlcblx0e1xuXHRcdGNvbnNvbGUud2Fybihgbm8gZ2l0IGV4aXN0c2ApO1xuXHRcdHJldHVybjtcblx0fVxuXG5cdGxldCBvcHRpb25zID0ge1xuXHRcdGN3ZDogUHJvamVjdENvbmZpZy5wcm9qZWN0X3Jvb3QsXG5cdFx0c3RkaW86ICdpbmhlcml0Jyxcblx0fTtcblxuXHRsZXQgbXNnID0gYG5wbSBwdWJsaXNoICR7UGFja2FnZUpzb24udmVyc2lvbn1gO1xuXG5cdGF3YWl0IGNyb3NzU3Bhd24oJ2dpdCcsIFtcblx0XHQnY29tbWl0Jyxcblx0XHQnLWEnLFxuXHRcdCctbScsXG5cdFx0bXNnLFxuXHRdLCBvcHRpb25zKTtcblxuXHRhd2FpdCBuZXcgUHJvbWlzZShmdW5jdGlvbiAoZG9uZSlcblx0e1xuXHRcdHNldFRpbWVvdXQoZG9uZSwgNTAwKTtcblx0fSk7XG5cblx0YXdhaXQgY3Jvc3NTcGF3bignZ2l0JywgW1xuXHRcdCd0YWcnLFxuXHRcdCctYScsXG5cdFx0UGFja2FnZUpzb24udmVyc2lvbixcblx0XHQnLW0nLFxuXHRcdG1zZyxcblx0XSwgb3B0aW9ucyk7XG5cbn0pKCkuY2F0Y2goZSA9PiBjb25zb2xlLmVycm9yKGUpKTtcbiJdfQ==